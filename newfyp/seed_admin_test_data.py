from app.database import SessionLocal, engine
from app import models
from datetime import datetime, timedelta, timezone

def seed_admin_test_data():
    db = SessionLocal()
    print("Seeding Admin Test Data...")
    
    try:
        # --------------------------------------------------------
        # 1. PENDING FARMERS (For KYC Testing)
        # --------------------------------------------------------
        pending_farmers = [
            ("pending_ali", "Ali Raza", "03001000001", "Lahore"),
            ("pending_bano", "Bano Begum", "03001000002", "Multan"),
            ("pending_chohan", "Chohan Singh", "03001000003", "Sialkot"),
        ]
        
        for username, name, phone, district in pending_farmers:
            if not db.query(models.Farmer).filter(models.Farmer.username == username).first():
                farmer = models.Farmer(
                    username=username,
                    password="password123",
                    name=name,
                    phone_number=phone,
                    district=district,
                    kyc_status="PENDING",     # <--- Key for Admin Dashboard
                    approved_by_admin=False,
                    farm_name=f"{name}'s Farm",
                    created_at=datetime.now(timezone.utc)
                )
                db.add(farmer)
                print(f"  + Created pending farmer: {name}")

        # --------------------------------------------------------
        # 2. REJECTED FARMER
        # --------------------------------------------------------
        if not db.query(models.Farmer).filter(models.Farmer.username == "rejected_user").first():
            farmer = models.Farmer(
                username="rejected_user",
                password="password123",
                name="Sadiq Rejected",
                phone_number="03009999999",
                district="Kasur",
                kyc_status="REJECTED",
                kyc_rejection_reason="Invalid CNIC document uploaded.",
                approved_by_admin=False,
                created_at=datetime.now(timezone.utc) - timedelta(days=5)
            )
            db.add(farmer)
            print("  + Created rejected farmer: Sadiq Rejected")

        # --------------------------------------------------------
        # 3. BLACKLISTED FARMER
        # --------------------------------------------------------
        if not db.query(models.Farmer).filter(models.Farmer.username == "blacklisted_user").first():
            farmer = models.Farmer(
                username="blacklisted_user",
                password="password123",
                name="Gul Khan (Blacklisted)",
                phone_number="03008888888",
                district="Jhang",
                kyc_status="APPROVED",
                approved_by_admin=True,
                is_blacklisted=True,
                blacklist_reason="Repeated default on payments.",
                blacklist_expiry_date=datetime.now(timezone.utc) + timedelta(days=90),
                created_at=datetime.now(timezone.utc) - timedelta(days=60)
            )
            db.add(farmer)
            print("  + Created blacklisted farmer: Gul Khan")

        # --------------------------------------------------------
        # 4. PENDING SUPPLIERS
        # --------------------------------------------------------
        pending_suppliers = [
            ("pending_supp1", "Agro Tech Supplies", "03211111111"),
            ("pending_supp2", "Best Seeds Corp", "03212222222"),
        ]
        
        for username, biz_name, phone in pending_suppliers:
            if not db.query(models.Supplier).filter(models.Supplier.username == username).first():
                supplier = models.Supplier(
                    username=username,
                    password="password123",
                    business_name=biz_name,
                    phone_number=phone,
                    kyc_status="PENDING",
                    approved_by_admin=False,
                    created_at=datetime.now(timezone.utc)
                )
                db.add(supplier)
                print(f"  + Created pending supplier: {biz_name}")

        # --------------------------------------------------------
        # 5. HIGH RISK FARMER (Risk Score > 70)
        # --------------------------------------------------------
        high_risk_username = "high_risk_user"
        high_risk_farmer = db.query(models.Farmer).filter(models.Farmer.username == high_risk_username).first()
        
        if not high_risk_farmer:
            high_risk_farmer = models.Farmer(
                username=high_risk_username,
                password="password123",
                name="High Risk Harry",
                phone_number="03007777777",
                district="Muzaffargarh",
                kyc_status="APPROVED",
                approved_by_admin=True,
                credit_limit=100000.0,
                original_credit_limit=200000.0, # Limit reduced due to risk
                created_at=datetime.now(timezone.utc) - timedelta(days=20)
            )
            db.add(high_risk_farmer)
            db.commit() # Commit to get ID
            db.refresh(high_risk_farmer)
            print("  + Created High Risk Farmer base")
            
            # Create Risk Profile
            profile = models.FarmerRiskProfile(
                farmer_id=high_risk_farmer.id,
                risk_score=85.5,
                risk_label="High",
                is_risk_scored=True,
                crop_history=0.2, # Poor history
                credit_score_external=450 # Fake field if existing, here just illustrative logic
            )
            db.add(profile)
            print("  + assigned High Risk Profile (Score: 85.5)")

        db.commit()
        print("\n[SUCCESS] Admin Test Data Seeded!")

    except Exception as e:
        print(f"\n[ERROR] {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin_test_data()
