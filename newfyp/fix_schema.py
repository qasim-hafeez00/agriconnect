
import psycopg2
from psycopg2 import sql
import os

# Connection parameters matched from app/database.py
DB_URL = "postgresql://postgres:123456@localhost:5432/bnpl"

def fix_database():
    try:
        print("Connecting to database...")
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        
        # SUPPLIERS TABLE COLUMNS TO ADD
        columns = [
            ("owner_name", "VARCHAR"),
            ("cnic", "VARCHAR"),
            ("business_type", "VARCHAR"),
            ("location", "VARCHAR"),
            ("address", "VARCHAR"),
            ("kyc_status", "VARCHAR DEFAULT 'PENDING'"),
            ("kyc_documents", "VARCHAR"),
            ("kyc_rejection_reason", "VARCHAR"),
            ("kyc_reviewed_at", "TIMESTAMP WITH TIME ZONE"),
            ("kyc_reviewed_by", "INTEGER"),
            ("cnic_verified", "BOOLEAN DEFAULT FALSE"),
            ("approved_by_admin", "BOOLEAN DEFAULT FALSE"),
        ]

        print("--- Updating 'suppliers' table ---")
        for col, dtype in columns:
            try:
                # Using specific exception handling to catch duplicate column errors or just use IF NOT EXISTS logic
                # Postgres 9.6+ supports IF NOT EXISTS
                cur.execute(sql.SQL("ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS {} {};").format(
                    sql.Identifier(col), sql.SQL(dtype)
                ))
                conn.commit()
                print(f"Checked/Added: {col}")
            except Exception as e:
                print(f"Skipping {col} (Error: {e})")
                conn.rollback()

        conn.close()
        print("\nDatabase schema verified and updated successfully.")
        print("Note: If 'kyc_status' was missing, it has been added with default 'PENDING'.")

    except Exception as e:
        print(f"\nCRITICAL ERROR: {e}")
        print("Make sure PostgreSQL is running and credentials are correct.")

if __name__ == "__main__":
    fix_database()
