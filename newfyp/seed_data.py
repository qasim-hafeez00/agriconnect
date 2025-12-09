from app.database import engine, SessionLocal
from app import models
from datetime import datetime, timezone

# Create all tables
print("Creating database tables...")
models.Base.metadata.create_all(bind=engine)
print("[OK] Tables created successfully!")

# Seed data
print("\nSeeding data...")
db = SessionLocal()

try:
    # 1. Create Admin
    existing_admin = db.query(models.Admin).filter(models.Admin.username == "admin").first()
    if not existing_admin:
        admin = models.Admin(
            username="admin",
            password="adminpassword",
            email="admin@agriconnect.com"
        )
        db.add(admin)
        print("[OK] Admin created")
    else:
        print("[INFO] Admin already exists")

    # 2. Create Suppliers
    if not db.query(models.Supplier).filter(models.Supplier.username == "ali_fertilizers").first():
        supplier1 = models.Supplier(
            username="ali_fertilizers",
            password="password123",
            business_name="Ali Fertilizers",
            email="ali@fertilizers.com",
            phone_number="03001234567",
            location="Main Market, Lahore",
            business_type="Fertilizers",
            approved_by_admin=True
        )
        db.add(supplier1)
    
    if not db.query(models.Supplier).filter(models.Supplier.username == "punjab_tractors").first():
        supplier2 = models.Supplier(
            username="punjab_tractors",
            password="password123",
            business_name="Punjab Tractors",
            email="info@punjabtractors.com",
            phone_number="03009876543",
            location="GT Road, Gujranwala",
            business_type="Machinery",
            approved_by_admin=True
        )
        db.add(supplier2)
    
    db.commit()
    # Need to query them back to get IDs for products
    supplier1 = db.query(models.Supplier).filter(models.Supplier.username == "ali_fertilizers").first()
    supplier2 = db.query(models.Supplier).filter(models.Supplier.username == "punjab_tractors").first()
    print("[OK] Suppliers synced")

    # 3. Create Farmers
    if not db.query(models.Farmer).filter(models.Farmer.username == "ahmed_khan").first():
        farmer1 = models.Farmer(
            username="ahmed_khan",
            password="password123",
            name="Ahmed Khan",
            phone_number="03001111111",
            district="Lahore",
            tehsil="Raiwind",
            village="Chak 45",
            cnic="35202-1234567-8",
            land_holding=10.5,
            credit_limit=500000,
            original_credit_limit=500000,
            approved_by_admin=True,
            cnic_verified=True,
            farm_name="Khan Farms",
            crops="Wheat, Rice, Cotton"
        )
        db.add(farmer1)
    
    if not db.query(models.Farmer).filter(models.Farmer.username == "fatima_bibi").first():
        farmer2 = models.Farmer(
            username="fatima_bibi",
            password="password123",
            name="Fatima Bibi",
            phone_number="03002222222",
            district="Faisalabad",
            tehsil="Sammundri",
            village="Chak 67",
            cnic="37405-9876543-2",
            land_holding=7.0,
            credit_limit=350000,
            original_credit_limit=350000,
            approved_by_admin=True,
            cnic_verified=True,
            farm_name="Fatima Agriculture",
            crops="Sugarcane, Maize"
        )
        db.add(farmer2)

    db.commit()
    print("[OK] Farmers synced")

    # 4. Create Products
    # Check if products exist for supplier1 (simple check)
    if db.query(models.Product).filter(models.Product.supplier_id == supplier1.id).count() == 0:
        product1 = models.Product(
            name="DAP Fertilizer",
            description="Di-Ammonium Phosphate - Premium quality fertilizer for all crops",
            price=8500.0,
            category="Fertilizers",
            stock=1000,
            unit="50kg bag",
            supplier_id=supplier1.id,
            images="https://via.placeholder.com/400x300?text=DAP+Fertilizer"
        )
        
        product2 = models.Product(
            name="Urea Fertilizer",
            description="High nitrogen content urea for maximum crop yield",
            price=3500.0,
            category="Fertilizers",
            stock=1500,
            unit="50kg bag",
            supplier_id=supplier1.id,
            images="https://via.placeholder.com/400x300?text=Urea+Fertilizer"
        )
        
        product3 = models.Product(
            name="Wheat Seeds (Certified)",
            description="Certified wheat seeds - High yield variety",
            price=4500.0,
            category="Seeds",
            stock=500,
            unit="40kg bag",
            supplier_id=supplier1.id,
            images="https://via.placeholder.com/400x300?text=Wheat+Seeds"
        )
        
        product4 = models.Product(
            name="Millat Tractor MF-240",
            description="50HP tractor with modern features",
            price=1500000.0,
            category="Machinery",
            stock=5,
            unit="unit",
            supplier_id=supplier2.id,
            images="https://via.placeholder.com/400x300?text=Millat+Tractor"
        )
        
        db.add_all([product1, product2, product3, product4])
        db.commit()
        print("[OK] Products created")
    else:
        print("[INFO] Products already exist")


    print("\n[SUCCESS] Database seeded successfully!")
    print("\nTest Accounts:")
    print("  Farmer: ahmed_khan / password123")
    print("  Supplier: ali_fertilizers / password123")
    print("  Admin: admin / adminpassword")

except Exception as e:
    print(f"\n[ERROR] Error: {e}")
    db.rollback()
finally:
    db.close()
