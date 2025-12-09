from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_
from app.database import get_db
from app import models, schemas
from app.auth import create_access_token
from app.auth import get_current_admin 
from datetime import datetime, timedelta, timezone # ADD timezone here

router = APIRouter(prefix="/admin", tags=["Admin"])


# ====================================================
# UTILITY FUNCTIONS 
# ====================================================

def assign_credit_limit(farmer: models.Farmer) -> float:
    """Calculates and assigns credit limit based on land_holding."""
    land = farmer.land_holding or 0.0
    if land < 2:
        credit = 50000.0
    elif 2 <= land < 5:
        credit = 120000.0
    elif 5 <= land < 10:
        credit = 200000.0
    else: # land >= 10
        credit = 400000.0
    
    farmer.credit_limit = credit
    # Set Baseline for Risk Scoring
    if not farmer.original_credit_limit or farmer.original_credit_limit == 0.0:
        farmer.original_credit_limit = credit 
    return credit

def clear_blacklist(farmer: models.Farmer):
    farmer.is_blacklisted = False
    farmer.blacklist_reason = None
    farmer.blacklist_expiry_date = None
def unblacklist_if_expired(db: Session, farmer: models.Farmer):
    """If blacklist expiry passed, clear blacklist."""
    if farmer and farmer.is_blacklisted and farmer.blacklist_expiry_date:
        if datetime.utcnow().replace(tzinfo=timezone.utc) >= farmer.blacklist_expiry_date:
            clear_blacklist(farmer)
            db.commit()
            db.refresh(farmer)


def set_blacklist_with_duration(farmer: models.Farmer, months: int = 3, reason: str = None):
    """Set blacklist with expiry (approx months*30 days)."""
    farmer.is_blacklisted = True
    farmer.blacklist_reason = reason or "Blacklisted due to policy"
    farmer.blacklist_expiry_date = datetime.now(timezone.utc) + timedelta(days=months * 30)


def calculate_risk_score(profile: models.FarmerRiskProfile):
    score = 0.0

    # Land title verified – 20%
    score += 20 if profile.land_title_verified else 0

    # Irrigation type – 20%
    if profile.irrigation_type:
        it = profile.irrigation_type.lower()
        if it in ["canal", "tubewell"]:
            score += 20
        elif it == "rainfed":
            score += 10

    # Location risk – 10%
    if profile.location_risk:
        loc_map = {"low": 10, "medium": 6, "high": 2}
        score += loc_map.get(profile.location_risk.lower(), 0)

    # Distance to market (0–1 normalized) – 10%
    if profile.distance_to_market is not None:
        score += profile.distance_to_market * 10

    # Crop history (0–1 normalized) – 20%
    if profile.crop_history is not None:
        score += profile.crop_history * 20

    # Estimated land value – 20%
    if profile.estimated_land_value:
        max_land_value = 1_000_000  # normalize
        score += min(profile.estimated_land_value / max_land_value * 20, 20)

    # Cap at 100
    profile.risk_score = round(min(score, 100), 2)
    profile.is_risk_scored = True

    if profile.risk_score < 40:
        profile.risk_label = "Low"
    elif profile.risk_score < 70:
        profile.risk_label = "Medium"
    else:
        profile.risk_label = "High"

def update_credit_limit(farmer: models.Farmer, profile: models.FarmerRiskProfile):
    base_limit = farmer.original_credit_limit
    risk = profile.risk_score

    # LOW RISK → increase 10%
    if risk < 40:
        new_limit = base_limit * 1.10

    # MEDIUM RISK → stay same
    elif risk < 70:
        new_limit = base_limit

    # HIGH RISK → reduce 50%
    else:
        new_limit = base_limit * 0.50

    farmer.credit_limit = round(new_limit)



def auto_blacklist_overdue_farmer(db: Session, farmer_id: int, grace_period_days: int = 15, blacklist_months: int = 3):
    """
    Auto-blacklist a farmer if any installment is overdue beyond grace period.
    Blacklist duration is fixed (default 3 months). 
    """
    farmer = db.query(models.Farmer).filter(models.Farmer.id == farmer_id).first()
    if not farmer:
        return

    now = datetime.utcnow().replace(tzinfo=timezone.utc)

    # Check for installments overdue beyond grace period
    overdue_threshold = now - timedelta(days=grace_period_days)
    overdue_installment = db.query(models.Installment).filter(
        models.Installment.farmer_id == farmer_id,
        models.Installment.status == "PENDING",
        models.Installment.due_date < overdue_threshold
    ).first()

    # If any installment past grace period, apply 3-month blacklist
    if overdue_installment and not farmer.is_blacklisted:
        farmer.is_blacklisted = True
        farmer.blacklist_reason = f"Overdue installment beyond {grace_period_days}-day grace period."
        farmer.blacklist_expiry_date = now + timedelta(days=blacklist_months * 30)  # Approx 3 months
        db.commit()
        db.refresh(farmer)



# ====================================================
# ADMIN ROUTES
# ====================================================

@router.post("/login", response_model=schemas.Token)
def login_admin(credentials: schemas.AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(models.Admin).filter(models.Admin.username == credentials.username).first()
    
    if not admin or admin.password != credentials.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")
    
    access_token = create_access_token(data={"sub": admin.username, "role": "admin"})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": "admin",
        "username": admin.username
    }

@router.get("/me", response_model=schemas.AdminResponse)
def get_admin_profile(current_admin: models.Admin = Depends(get_current_admin)):
    """Get current admin's profile information."""
    return current_admin

# --- FARMER MANAGEMENT ---
