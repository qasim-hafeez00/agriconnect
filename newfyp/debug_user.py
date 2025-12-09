from app.database import SessionLocal
from app import models

def check_users():
    db = SessionLocal()
    try:
        print(f"DB URL: {db.bind.url}")
        
        print("--- Checking All Farmers ---")
        farmers = db.query(models.Farmer).all()
        print(f"Total Farmers: {len(farmers)}")
        for f in farmers:
            print(f" - {f.username} (ID: {f.id})")

        print("--- Checking Specific Farmer ---")
        farmer = db.query(models.Farmer).filter(models.Farmer.username == "ahmed_khan").first()
        if farmer:
            print(f"Found Farmer: {farmer.username}")
            print(f"Password: {farmer.password}")
            print(f"Approved: {farmer.approved_by_admin}")
        else:
            print("Farmer 'ahmed_khan' NOT FOUND")

        print("\n--- Checking Suppliers ---")
        supplier = db.query(models.Supplier).filter(models.Supplier.username == "fatima_agro").first()
        if supplier:
            print(f"Found Supplier: {supplier.username}")
            print(f"Password: {supplier.password}")
            print(f"Approved: {supplier.approved_by_admin}")
        else:
            print("Supplier 'fatima_agro' NOT FOUND")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_users()
