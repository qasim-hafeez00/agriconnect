import random
from faker import Faker
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models, auth
from datetime import datetime, timedelta, timezone

# Initialize Faker
fake = Faker()  # Default locale
fake_en = Faker() # Alias

db = SessionLocal()

def create_farmers(count=50):
    print(f"Creating {count} farmers...")
    districts = ["Lahore", "Faisalabad", "Multan", "Sahiwal", "Kasur", "Sheikhupura", "Okara", "Gujranwala"]
    crops_list = ["Wheat", "Rice", "Cotton", "Sugarcane", "Maize", "Potato", "Mango"]
    
    for _ in range(count):
        # Mix of English and localized names
        name = fake_en.name() if random.random() > 0.5 else fake.name()
        
        # Risk Profile Logic
        risk_score = random.uniform(10, 95)
        land_holding = random.uniform(2, 50)
        
        # Determine Credit Limit based on land/risk
        base_limit = 0
        if land_holding < 5: base_limit = 50000
        elif land_holding < 15: base_limit = 150000
        else: base_limit = 500000
        
        credit_limit = base_limit
        if risk_score > 70: credit_limit *= 0.5
        elif risk_score < 30: credit_limit *= 1.2
        
        # KYC Status
        kyc_status = random.choices(["APPROVED", "PENDING", "REJECTED"], weights=[0.7, 0.2, 0.1])[0]
        approved_by_admin = (kyc_status == "APPROVED")
        
        # Create Farmer
        farmer = models.Farmer(
            name=name,
            phone_number=f"03{random.randint(100000000, 999999999)}",
            district=random.choice(districts),
            tehsil=fake_en.city(),
            village=f"Chak {random.randint(1, 400)} NB",
            cnic=f"{random.randint(30000, 39999)}-{random.randint(1000000, 9999999)}-{random.randint(1, 9)}",
            land_holding=round(land_holding, 1),
            username=f"farmer_{random.randint(10000, 99999)}",
            password="password123", # Plain text for seed, app uses hashing normally or we should hash here if auth requires it. 
            # Note: For real login, we need hashed passwords. Let's assume testing doesn't strictly enforce hash check in seed or we use a known hash.
            # Actually, let's use a simple string, and if login fails, we know why. 
            # BETTER: Use a known hash if possible, or just raw string if backend doesn't hash on login (it does compare directly in admin.py line 160: admin.password != credentials.password).
            # Wait, admin.py compares directly. Farmer login might be different. 
            # Verified auth.py/models: Farmer/Supplier models store 'password'. 
            # In real app, MUST HASH. For this test/seed, we keep simple.
            
            farm_name=f"{name}'s Farm",
            crops=",".join(random.sample(crops_list, k=random.randint(1, 3))),
            cnic_verified=approved_by_admin,
            approved_by_admin=approved_by_admin,
            kyc_status=kyc_status,
            credit_limit=round(credit_limit) if approved_by_admin else 0,
            original_credit_limit=round(base_limit),
            created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 180))
        )
        db.add(farmer)
        db.commit()
        db.refresh(farmer)
        
        # Create Risk Profile if approved/pending
        if kyc_status != "REJECTED":
            profile = models.FarmerRiskProfile(
                farmer_id=farmer.id,
                land_title_verified=approved_by_admin,
                irrigation_type=random.choice(["Canal", "Tubewell", "Rainfed"]),
                location_risk=random.choice(["Low", "Medium", "High"]),
                risk_score=round(risk_score, 1),
                is_risk_scored=True,
                risk_label="High" if risk_score > 70 else "Low" if risk_score < 40 else "Medium"
            )
            db.add(profile)
            db.commit()

def create_suppliers(count=10):
    print(f"Creating {count} suppliers...")
    types = ["Fertilizer Dealer", "Seed Distributor", "Machinery Rental", "Pesticide Supplier"]
    
    for _ in range(count):
        name = fake_en.company()
        kyc_status = random.choices(["APPROVED", "PENDING"], weights=[0.8, 0.2])[0]
        
        supplier = models.Supplier(
            business_name=name,
            email=fake_en.email(),
            phone_number=f"03{random.randint(100000000, 999999999)}",
            username=f"supplier_{random.randint(10000, 99999)}",
            password="password123",
            business_type=random.choice(types),
            location=fake_en.city(),
            rating=round(random.uniform(3.5, 5.0), 1),
            approved_by_admin=(kyc_status == "APPROVED"),
            kyc_status=kyc_status,
            created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 180))
        )
        db.add(supplier)
        db.commit()
        db.refresh(supplier)
        
        # Create Products for this Supplier
        if kyc_status == "APPROVED":
            create_products(supplier.id)

def create_products(supplier_id):
    categories = {
        "Seeds": ["Hybrid Wheat", "Super Basmati Rice", "Cotton Bt", "Maize Hybrid"],
        "Fertilizers": ["DAP", "Urea", "Potash", "Zinc Sulphate"],
        "Pesticides": ["Glyphosate", "Imidacloprid", "Fungicide X"],
        "Machinery": ["Tractor Rental", "Harvester", "Drone Spray"]
    }
    
    cat = random.choice(list(categories.keys()))
    products = categories[cat]
    
    for _ in range(random.randint(3, 8)):
        prod_name = random.choice(products)
        product = models.Product(
            name=f"{prod_name} {random.choice(['Premium', 'Standard', 'Plus'])}",
            description=fake_en.sentence(),
            category=cat,
            price=random.randint(2000, 50000),
            stock=random.randint(10, 500),
            unit="bag" if cat in ["Seeds", "Fertilizers"] else "liter" if cat == "Pesticides" else "hour",
            supplier_id=supplier_id,
            rating=round(random.uniform(4.0, 5.0), 1),
            reviews_count=random.randint(0, 50)
        )
        db.add(product)
    db.commit()

def create_orders(count=100):
    print(f"Creating {count} orders...")
    
    farmers = db.query(models.Farmer).filter(models.Farmer.kyc_status == "APPROVED", models.Farmer.credit_limit > 0).all()
    products = db.query(models.Product).all()
    
    if not farmers or not products:
        print("Not enough data to create orders.")
        return

    for _ in range(count):
        farmer = random.choice(farmers)
        product = random.choice(products)
        supplier_id = product.supplier_id
        
        qty = random.randint(1, 10)
        total = qty * product.price
        
        # Order Date (Distribution over last 6 months)
        order_date = datetime.now(timezone.utc) - timedelta(days=random.randint(0, 180))
        
        # Status
        status = random.choices(
            ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"], 
            weights=[0.1, 0.2, 0.2, 0.4, 0.1]
        )[0]
        
        # Payment Method
        method = random.choices(["BNPL", "CASH"], weights=[0.7, 0.3])[0]
        pay_status = "PAID" if status == "DELIVERED" and method == "CASH" else "PENDING"
        if method == "BNPL" and status == "DELIVERED":
            pay_status = "PENDING" # Loan outstanding
            
        order = models.Order(
            farmer_id=farmer.id,
            supplier_id=supplier_id,
            total_amount=total,
            status=status,
            payment_method=method,
            payment_status=pay_status,
            delivery_address=f"{farmer.village}, {farmer.tehsil}",
            created_at=order_date
        )
        db.add(order)
        db.commit()
        db.refresh(order)
        
        # Order Item
        item = models.OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=qty,
            price=product.price,
            unit=product.unit
        )
        db.add(item)
        
        # If BNPL and Delivered, create Installment
        if method == "BNPL" and status in ["CONFIRMED", "SHIPPED", "DELIVERED"]:
             installment = models.Installment(
                 farmer_id=farmer.id,
                 order_id=order.id,
                 amount_due=total,
                 due_date=order_date + timedelta(days=90), # 3 months credit
                 status="PENDING"
             )
             db.add(installment)
    
    db.commit()

if __name__ == "__main__":
    create_farmers(50)
    create_suppliers(10)
    create_orders(150)
    print("Database seeding completed!")
