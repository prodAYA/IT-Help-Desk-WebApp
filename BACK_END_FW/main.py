from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import psycopg
import bcrypt
import os
from dotenv import load_dotenv
import asyncio

if os.name == "nt":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

load_dotenv()

app = FastAPI()


class AdminCreate(BaseModel):
    admin_code: str
    password: str


@app.post("/admins")
async def create_admin(admin: AdminCreate):
    hashed_password = bcrypt.hashpw(admin.password.encode(), bcrypt.gensalt())

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
                "INSERT INTO admins (admin_code, password_hash) VALUES (%s, %s)",
                (admin.admin_code, hashed_password.decode())
            )
        await conn.commit()

    return {"message": "Admin created successfully"}