from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.auth import get_current_farmer
from typing import List
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/insurance", tags=["Insurance"])

@router.get("/plans")
def get_insurance_plans(db: Session = Depends(get_db)):
    """Get all available insurance plans."""
    plans = db.query(models.InsurancePlan).filter(models.InsurancePlan.is_active == True).all()
    return plans

@router.get("/my-policies")
def get_my_policies(
    current_farmer: models.Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Get all insurance policies for the current farmer."""
    policies = db.query(models.InsurancePolicy).filter(
        models.InsurancePolicy.farmer_id == current_farmer.id
    ).all()
    return policies

@router.post("/apply/{plan_id}")
def apply_for_insurance(
    plan_id: int,
    current_farmer: models.Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Apply for an insurance plan."""
    # Check if plan exists
    plan = db.query(models.InsurancePlan).filter(models.InsurancePlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Insurance plan not found")
    
    # Check if farmer already has active policy for this plan
    existing_policy = db.query(models.InsurancePolicy).filter(
        models.InsurancePolicy.farmer_id == current_farmer.id,
        models.InsurancePolicy.plan_id == plan_id,
        models.InsurancePolicy.status == "ACTIVE"
    ).first()
    
    if existing_policy:
        raise HTTPException(status_code=400, detail="You already have an active policy for this plan")
    
    # Generate policy number
    policy_number = f"POL-{datetime.now().year}-{random.randint(1000, 9999)}"
    
    # Calculate dates based on premium period
    start_date = datetime.now()
    if plan.premium_period == "season":
        end_date = start_date + timedelta(days=180)  # ~6 months
    elif plan.premium_period == "year":
        end_date = start_date + timedelta(days=365)
    else:  # month
        end_date = start_date + timedelta(days=30)
    
    # Create new policy
    new_policy = models.InsurancePolicy(
        farmer_id=current_farmer.id,
        plan_id=plan_id,
        policy_number=policy_number,
        start_date=start_date,
        end_date=end_date,
        status="ACTIVE",
        premium_paid=plan.premium_amount,
        next_payment_date=end_date
    )
    
    db.add(new_policy)
    db.commit()
    db.refresh(new_policy)
    
    return new_policy

@router.post("/claim/{policy_id}")
def file_claim(
    policy_id: int,
    claim_amount: float,
    current_farmer: models.Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """File an insurance claim."""
    # Get policy
    policy = db.query(models.InsurancePolicy).filter(
        models.InsurancePolicy.id == policy_id,
        models.InsurancePolicy.farmer_id == current_farmer.id
    ).first()
    
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    if policy.status != "ACTIVE":
        raise HTTPException(status_code=400, detail="Policy is not active")
    
    if policy.claim_status == "PENDING":
        raise HTTPException(status_code=400, detail="You already have a pending claim for this policy")
    
    # Update policy with claim
    policy.claim_amount = claim_amount
    policy.claim_status = "PENDING"
    policy.claim_date = datetime.now()
    
    db.commit()
    db.refresh(policy)
    
    return policy

