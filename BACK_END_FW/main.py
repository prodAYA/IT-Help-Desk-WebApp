from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, ValidationError
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
        message = "Invalid input"

    return JSONResponse(status_code=400, content={"detail": message})

class AdminCreate(BaseModel):
    admin_code: str = Field(min_length=3, max_length=20)
    password: str = Field(min_length=8, max_length=100)

class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    employee_code: str = Field(min_length=3, max_length=20)
    password: str = Field(min_length=8, max_length=100)


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