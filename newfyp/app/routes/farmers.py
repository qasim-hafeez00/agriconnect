from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import create_access_token, get_current_farmer
from sqlalchemy.orm import load_only

router = APIRouter(prefix="/farmers", tags=["Farmers"])

# Signup
@router.post("/signup", response_model=schemas.FarmerResponse)
def register_farmer(farmer: schemas.FarmerSignup, db: Session = Depends(get_db)):
    existing_farmer = db.query(models.Farmer).filter(
        (models.Farmer.username == farmer.username) | 
        (models.Farmer.cnic == farmer.cnic)
    ).first()
    if existing_farmer:
        raise HTTPException(status_code=400, detail="Username or CNIC already registered")

    new_farmer = models.Farmer(
        name=farmer.name,
        phone_number=farmer.phone_number,
        district=farmer.district,
        tehsil=farmer.tehsil,
        village=farmer.village,
        cnic=farmer.cnic,
        land_holding=farmer.land_holding,
        username=farmer.username,
        password=farmer.password,
    )

    db.add(new_farmer)
    db.commit()
    db.refresh(new_farmer)
    return new_farmer

# Login
@router.post("/login", response_model=schemas.Token)
def login_farmer(credentials: schemas.FarmerLogin, db: Session = Depends(get_db)):
    farmer = db.query(models.Farmer).filter(models.Farmer.username == credentials.username).first()

    if not farmer or farmer.password != credentials.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not farmer.approved_by_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account pending admin approval")
        
    if farmer.is_blacklisted:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is blacklisted and cannot access the system"
        )

    # Generate Token
    access_token = create_access_token(data={"sub": farmer.username, "role": "farmer"})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": "farmer",
        "username": farmer.username
    }

@router.get("/me", response_model=schemas.FarmerResponse)
def get_me(current_farmer: models.Farmer = Depends(get_current_farmer)):
    return current_farmer

@router.get("/credit-limit", response_model=schemas.FarmerCreditLimit) 
def view_credit_limit(
    current_farmer: models.Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """View the farmer's current and original credit limits."""
    return {
        "current_credit_limit": current_farmer.credit_limit,
        "original_credit_limit": current_farmer.original_credit_limit
    }

@router.get("/installments", response_model=list[schemas.InstallmentResponse])
def view_installments(
    current_farmer: models.Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """View all pending and paid installments for the farmer."""
    installments = db.query(models.Installment).filter(
        models.Installment.farmer_id == current_farmer.id
    ).all()
    return installments

@router.get("/transactions", response_model=list[schemas.TransactionResponse])
def view_transactions(
    current_farmer: models.Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """View transaction history for the farmer (wallet)."""
    transactions = db.query(models.Transaction).filter(
        models.Transaction.farmer_id == current_farmer.id
    ).order_by(models.Transaction.timestamp.desc()).all()
    return transactions

@router.get("/dashboard-stats")
def get_dashboard_stats(
    current_farmer: models.Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Get comprehensive dashboard statistics for the farmer."""
    # Calculate total debt from unpaid orders (BNPL only)
    total_bnpl_orders = db.query(models.Order).filter(
        models.Order.farmer_id == current_farmer.id,
        models.Order.payment_method == "BNPL",
        models.Order.payment_status != "PAID"
    ).all()
    
    total_debt = sum(order.total_amount for order in total_bnpl_orders)
    
    # Count total orders
    total_orders = db.query(models.Order).filter(
        models.Order.farmer_id == current_farmer.id
    ).count()
    
    # Count pending installments
    pending_installments = db.query(models.Installment).filter(
        models.Installment.farmer_id == current_farmer.id,
        models.Installment.status == "PENDING"
    ).count()
    
    # Get risk profile if exists
    risk_profile = db.query(models.FarmerRiskProfile).filter(
        models.FarmerRiskProfile.farmer_id == current_farmer.id
    ).first()
    
    risk_score = None
    risk_label = None
    if risk_profile and risk_profile.is_risk_scored:
        risk_score = risk_profile.risk_score
        risk_label = risk_profile.risk_label
    
    # Calculate available credit
    available_credit = current_farmer.credit_limit
    credit_used_percentage = (total_debt / current_farmer.credit_limit * 100) if current_farmer.credit_limit > 0 else 0
    
    return {
        "available_credit": available_credit,
        "credit_limit": current_farmer.credit_limit,
        "total_debt": total_debt,
        "credit_used_percentage": round(credit_used_percentage, 2),
        "farm_size": current_farmer.land_holding,
        "risk_score": risk_score,
        "risk_label": risk_label,
        "total_orders": total_orders,
        "pending_installments": pending_installments
    }
