"""
Script to create an admin user if it doesn't exist
"""
from app.database import SessionLocal
from app import models

def create_admin():
    db = SessionLocal()
    
    try:
        # Check if admin exists
        admin = db.query(models.Admin).filter(models.Admin.username == "admin").first()
        
        if admin:
            print("✓ Admin user already exists!")
            print(f"  Username: {admin.username}")
            print(f"  Email: {admin.email}")
        else:
            # Create admin user
            new_admin = models.Admin(
                username="admin",
                password="adminpassword",  # In production, this should be hashed!
                email="admin@agriconnect.com"
            )
            db.add(new_admin)
            db.commit()
            db.refresh(new_admin)
            print("✅ Admin user created successfully!")
            print(f"  Username: {new_admin.username}")
            print(f"  Password: adminpassword")
            print(f"  Email: {new_admin.email}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
