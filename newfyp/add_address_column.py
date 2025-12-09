"""
Add missing address column to farmers and suppliers tables
"""
from app.database import SessionLocal, engine
from sqlalchemy import text

def add_address_columns():
    try:
        with engine.connect() as conn:
            # Add address column to farmers table
            conn.execute(text("ALTER TABLE farmers ADD COLUMN IF NOT EXISTS address VARCHAR"))
            conn.commit()
            print("✅ Added address column to farmers table")
            
            # Add address column to suppliers table  
            conn.execute(text("ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS address VARCHAR"))
            conn.commit()
            print("✅ Added address column to suppliers table")
            
        print("\n✅ Database migration completed successfully!")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    add_address_columns()
