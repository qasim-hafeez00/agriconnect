from app.database import SessionLocal
from app.models import Farmer

db = SessionLocal()
farmer = db.query(Farmer).filter(Farmer.username == 'ahmed_khan').first()

if farmer:
    print(f"✓ Found farmer: {farmer.name}")
    print(f"  Username: {farmer.username}")
    print(f"  Password: {farmer.password}")
    print(f"  Approved: {farmer.approved_by_admin}")
    print(f"  Credit Limit: {farmer.credit_limit}")
else:
    print("✗ Farmer 'ahmed_khan' not found in database!")
    print("\nAll farmers in database:")
    all_farmers = db.query(Farmer).all()
    for f in all_farmers:
        print(f"  - {f.username} ({f.name})")

db.close()
