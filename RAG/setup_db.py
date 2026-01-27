import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def setup_database():
    """Execute the SQL setup script to create tables and functions"""
    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD")
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Read and execute SQL file
        with open('setup_database.sql', 'r') as f:
            sql_script = f.read()
        
        cursor.execute(sql_script)
        print("✓ Database setup completed successfully!")
        print("✓ pgvector extension enabled")
        print("✓ documents table created")
        print("✓ Vector similarity search function created")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"✗ Error setting up database: {str(e)}")
        raise

if __name__ == "__main__":
    setup_database()
