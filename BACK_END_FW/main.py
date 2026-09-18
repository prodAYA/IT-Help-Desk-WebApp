from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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

class AdminCreate(BaseModel):
    admin_code: str = Field(min_length=3, max_length=10)
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

    except ValidationError as e:
        for error in e.errors():
        
            if error["type"] == "string_too_short":
                raise HTTPException(status_code=400, detail="Admin code or password is too short")
            
            else:
                raise HTTPException(status_code=400, detail="Admin code or password is too long")

    except psycopg.errors.UniqueViolation:
        raise HTTPException(status_code=409, detail="Admin code already exists")

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail="Something went wrong while creating the admin")