import asyncio
import os
from dotenv import load_dotenv
import psycopg

load_dotenv()

async def test_connection():
    conn = await psycopg.AsyncConnection.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT")
    )
    print("Connected successfully!")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(test_connection(), loop_factory=asyncio.SelectorEventLoop)