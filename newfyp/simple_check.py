from app.database import SessionLocal
from app import models

def count_users():
    db = SessionLocal()
    try:
        farmer_count = db.query(models.Farmer).count()
        supplier_count = db.query(models.Supplier).count()
        print(f"Farmers: {farmer_count}")
        print(f"Suppliers: {supplier_count}")
        
        if farmer_count > 0:
            f = db.query(models.Farmer).first()
            print(f"Sample Farmer: {f.username} / {f.password}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    count_users()
