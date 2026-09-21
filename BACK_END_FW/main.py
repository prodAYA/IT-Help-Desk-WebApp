from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, ValidationError, model_validator
from datetime import datetime, timedelta, timezone
import jwt
import secrets
import psycopg
import bcrypt
import os
from dotenv import load_dotenv
import asyncio

if os.name == "nt":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

#JWT TOKEN HELPERS

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=30)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, os.getenv("SECRET_KEY"), algorithm="HS256")
    return encoded_jwt

async def create_refresh_token(conn, employee_code=None, admin_code=None):
    token = secrets.token_hex(32)
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)

    async with conn.cursor() as cur:

        await cur.execute(
            "DELETE FROM refresh_tokens WHERE employee_code = %s OR admin_code = %s",
            (employee_code, admin_code)
        )
        await cur.execute(
            "INSERT INTO refresh_tokens (employee_code, admin_code, token, expires_at) VALUES (%s, %s, %s, %s)",
            (employee_code, admin_code, token, expires_at)
        )
    await conn.commit()

    return token

#Custom Exception Handler for Validation Errors

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):

    error = exc.errors()[0] 
    field_name = error["loc"][-1]
    error_type = error["type"]

    if error_type == "string_too_short":
        message = f"{field_name} is too short"
    elif error_type == "string_too_long":
        message = f"{field_name} is too long"
    else:
        message = "Invalid Input(s)"

    return JSONResponse(status_code=400, content={"detail": message})

class AdminCreate(BaseModel):
    admin_code: str = Field(min_length=3, max_length=20)
    password: str = Field(min_length=8, max_length=100)
    password_confirm: str = Field(min_length=8, max_length=100)

    @model_validator(mode="after")
    def check_passwords_match(self):
        if self.password != self.password_confirm:
            raise ValueError("Passwords do not match")
        return self

class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    employee_code: str = Field(min_length=3, max_length=20)
    password: str = Field(min_length=8, max_length=100)
    password_confirm: str = Field(min_length=8, max_length=100)

    @model_validator(mode="after")
    def check_passwords_match(self):
        if self.password != self.password_confirm:
            raise ValueError("Passwords do not match")
        return self

class UserLogin(BaseModel):
    employee_code: str = Field(...)
    password: str = Field(...)

class AdminLogin(BaseModel):
    admin_code: str = Field(...)
    password: str = Field(...)

class refreshToken(BaseModel):
    refresh_token: str = Field(...)


#Create a new admin endpoint

@app.post("/admins")
async def create_admin(admin: AdminCreate):

    try:

        conn = await psycopg.AsyncConnection.connect(
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT")
        )

        async with conn:
            async with conn.cursor() as cur:

                hashed_password = bcrypt.hashpw(admin.password.encode(), bcrypt.gensalt())

                await cur.execute(
                    "INSERT INTO admins (admin_code, password_hash) VALUES (%s, %s)",
                    (admin.admin_code, hashed_password.decode())
                )

            await conn.commit()

        return {"message": "Admin created successfully"}

    except psycopg.errors.UniqueViolation:
        raise HTTPException(status_code=409, detail="Admin code already exists")

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail="Something went wrong while creating the admin")


#Create a new user endpoint

@app.post("/users")
async def create_user(user: UserCreate):

    try:

        conn = await psycopg.AsyncConnection.connect(
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT")
        )

        async with conn:
            async with conn.cursor() as cur:

                hashed_password = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt())

                await cur.execute(
                    "INSERT INTO users (employee_code, name, password_hash) VALUES (%s, %s, %s)",
                    (user.employee_code, user.name, hashed_password.decode())
                )

            await conn.commit()

        return {"message": "User created successfully"}

    except psycopg.errors.UniqueViolation:
        raise HTTPException(status_code=409, detail="Employee code already exists")

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail="Something went wrong while creating the user")


#Check User login credential endpoint

@app.post("/user_login")
async def user_login(user_login: UserLogin):
    try:
        conn = await psycopg.AsyncConnection.connect(
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT")
        )

        async with conn:
            async with conn.cursor() as cur:

                await cur.execute(
                    "SELECT password_hash FROM users WHERE employee_code = %s",
                    (user_login.employee_code,)
                )

                result = await cur.fetchone()

                if result is None:
                    raise HTTPException(status_code=401, detail="Invalid employee code or password 1")

                stored_password_hash = result[0]

                if not bcrypt.checkpw(user_login.password.encode(), stored_password_hash.encode()):
                    raise HTTPException(status_code=401, detail="Invalid employee code or password 2")

            access_token = create_access_token({"employee_code": user_login.employee_code, "role": "USER"})
            refresh_token = await create_refresh_token(conn, employee_code=user_login.employee_code)

        return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "Bearer"}

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail="Something went wrong during login")


#Check Admin Login credentials endpoint

@app.post("/admin_login")
async def admin_login(admin_login: AdminLogin):
    try:
        conn = await psycopg.AsyncConnection.connect(
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT")
        )

        async with conn:
            async with conn.cursor() as cur:

                await cur.execute(
                    "SELECT password_hash FROM admins WHERE admin_code = %s",
                    (admin_login.admin_code,)
                )

                result = await cur.fetchone()

                if result is None:
                    raise HTTPException(status_code=401, detail="Invalid admin code or password 1")

                stored_password_hash = result[0]

                if not bcrypt.checkpw(admin_login.password.encode(), stored_password_hash.encode()):
                    raise HTTPException(status_code=401, detail="Invalid admin code or password 2")
                
            access_token = create_access_token({"admin_code": admin_login.admin_code, "role": "ADMIN"})
            refresh_token = await create_refresh_token(conn, admin_code = admin_login.admin_code)

        return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "Bearer"}

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail="Something went wrong during login")

# Logout/Automatic Token Clear Endpoint
@app.post("/logout")
async def logout(logout_request: refreshToken):
    try:
        conn = await psycopg.AsyncConnection.connect(
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT")
        )

        async with conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "DELETE FROM refresh_tokens WHERE token = %s",
                    (logout_request.refresh_token,)
                )
            await conn.commit()

        return {"message": "Logged out successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail="Something went wrong during logout")