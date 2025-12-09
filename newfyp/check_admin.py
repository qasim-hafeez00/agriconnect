from app.database import SessionLocal
from app.models import Admin

db = SessionLocal()
admin = db.query(Admin).filter(Admin.username == 'admin').first()

if admin:
    print(f"✓ Found admin: {admin.username}")
    print(f"  Password: {admin.password}")
    print(f"  Email: {admin.email}")
else:
    print("✗ Admin 'admin' not found in database!")
    print("\nAll admins in database:")
    all_admins = db.query(Admin).all()
    for a in all_admins:
        print(f"  - {a.username}")

db.close()
