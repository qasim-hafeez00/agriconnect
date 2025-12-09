from app.database import SessionLocal
from app import models

def seed_insurance_plans():
    db = SessionLocal()
    
    try:
        # Check if plans already exist
        existing = db.query(models.InsurancePlan).first()
        if existing:
            print("Insurance plans already exist!")
            return
        
        plans = [
            models.InsurancePlan(
                title="Crop Yield Protection",
                provider="Takaful Pakistan",
                coverage_amount=500000.0,
                premium_amount=5000.0,
                premium_period="season",
                description="Protects against yield loss due to drought, flood, or pests.",
                icon="grass",
                color="indus-green",
                features="Drought coverage,Flood protection,Pest infestation,Fire damage",
                is_active=True
            ),
            models.InsurancePlan(
                title="Livestock Insurance",
                provider="EFU General",
                coverage_amount=200000.0,
                premium_amount=2000.0,
                premium_period="year",
                description="Comprehensive coverage for cattle and livestock health and theft.",
                icon="pets",
                color="trust-blue",
                features="Accidental death,Disease coverage,Theft protection,Medical expenses",
                is_active=True
            ),
            models.InsurancePlan(
                title="Equipment Shield",
                provider="Jubilee Insurance",
                coverage_amount=1000000.0,
                premium_amount=8000.0,
                premium_period="year",
                description="Covers tractors, harvesters, and other machinery against damage.",
                icon="agriculture",
                color="primary",
                features="Mechanical breakdown,Accidental damage,Theft,Third-party liability",
                is_active=True
            ),
        ]
        
        for plan in plans:
            db.add(plan)
        
        db.commit()
        print(f"✓ Seeded {len(plans)} insurance plans!")
        
    finally:
        db.close()

if __name__ == "__main__":
    seed_insurance_plans()
