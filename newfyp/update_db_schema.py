import os
import sys
from sqlalchemy import create_engine, inspect, text
from app.database import Base, engine # Assuming these are available 

def update_schema():
    print("Connecting to database...")
    inspector = inspect(engine)
    
    # ---------------------------------------------------------
    # 1. Update FARMERS table
    # ---------------------------------------------------------
    if 'farmers' in inspector.get_table_names():
        print("Checking 'farmers' table...")
        columns = [c['name'] for c in inspector.get_columns('farmers')]
        
        updates = [
            ("farm_name", "VARCHAR"),
            ("crops", "VARCHAR"),
            ("avatar", "VARCHAR"),
            ("address", "VARCHAR"),
            ("cnic_verified", "BOOLEAN DEFAULT FALSE"),
            ("approved_by_admin", "BOOLEAN DEFAULT FALSE"),
            ("admin_comment", "VARCHAR"),
            ("kyc_status", "VARCHAR DEFAULT 'PENDING'"),
            ("kyc_documents", "VARCHAR"),
            ("kyc_rejection_reason", "VARCHAR"),
            ("kyc_reviewed_at", "TIMESTAMP WITH TIME ZONE"),
            ("kyc_reviewed_by", "INTEGER"),
            ("credit_limit", "FLOAT DEFAULT 0.0"),
            ("original_credit_limit", "FLOAT DEFAULT 0.0"),
            ("is_blacklisted", "BOOLEAN DEFAULT FALSE"),
            ("blacklist_reason", "VARCHAR"),
            ("blacklist_expiry_date", "TIMESTAMP WITH TIME ZONE"),
        ]
        
        with engine.connect() as conn:
            for col_name, col_type in updates:
                if col_name not in columns:
                    print(f"  + Adding column: {col_name} ({col_type})")
                    try:
                        conn.execute(text(f"ALTER TABLE farmers ADD COLUMN {col_name} {col_type}"))
                        conn.commit()
                    except Exception as e:
                        print(f"    ! Error adding {col_name}: {e}")
                        conn.rollback()
                else:
                    print(f"  - Column {col_name} already exists.")
    else:
        print("x Table 'farmers' not found!")

    # ---------------------------------------------------------
    # 2. Update SUPPLIERS table
    # ---------------------------------------------------------
    if 'suppliers' in inspector.get_table_names():
        print("\nChecking 'suppliers' table...")
        columns = [c['name'] for c in inspector.get_columns('suppliers')]
        
        updates = [
            ("business_type", "VARCHAR"),
            ("location", "VARCHAR"),
            ("avatar", "VARCHAR"),
            ("rating", "FLOAT DEFAULT 0.0"),
            ("approved_by_admin", "BOOLEAN DEFAULT FALSE"),
            ("admin_comment", "VARCHAR"),
            ("kyc_status", "VARCHAR DEFAULT 'PENDING'"),
            ("kyc_documents", "VARCHAR"),
            ("kyc_rejection_reason", "VARCHAR"),
            ("kyc_reviewed_at", "TIMESTAMP WITH TIME ZONE"),
            ("kyc_reviewed_by", "INTEGER"),
        ]
        
        with engine.connect() as conn:
            for col_name, col_type in updates:
                if col_name not in columns:
                    print(f"  + Adding column: {col_name} ({col_type})")
                    try:
                        conn.execute(text(f"ALTER TABLE suppliers ADD COLUMN {col_name} {col_type}"))
                        conn.commit()
                    except Exception as e:
                        print(f"    ! Error adding {col_name}: {e}")
                        conn.rollback()
                else:
                    print(f"  - Column {col_name} already exists.")
    else:
        print("x Table 'suppliers' not found!")
        
    print("\nSchema update complete.")

if __name__ == "__main__":
    update_schema()
