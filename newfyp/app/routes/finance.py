from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app import models, schemas
from app.auth import get_current_active_user

router = APIRouter(prefix="/finance", tags=["Finance"])

@router.post("/installments/generate/{order_id}")
def generate_installments(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.Farmer = Depends(get_current_active_user)
):
    # 1. Get Order
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if order.payment_method != "BNPL":
        raise HTTPException(status_code=400, detail="Order is not BNPL")
        
    # Check if installments already exist
    existing = db.query(models.Installment).filter(models.Installment.order_id == order_id).first()
    if existing:
        return {"message": "Installments already generated"}

    # 2. Logic: Split into 4 equal installments over 4 months (Example)
    total = order.total_amount
    installment_amount = total / 4
    
    installments = []
    for i in range(1, 5):
        due_date = datetime.now() + timedelta(days=30 * i)
        new_installment = models.Installment(
            farmer_id=current_user.id,
            order_id=order_id,
            amount_due=installment_amount,
            due_date=due_date,
            status="PENDING"
        )
        db.add(new_installment)
        installments.append(new_installment)
        
    db.commit()
    return {"message": "Installments generated successfully", "count": len(installments)}

@router.get("/installments", response_model=List[schemas.InstallmentResponse])
def get_my_installments(
    db: Session = Depends(get_db),
    current_user: models.Farmer = Depends(get_current_active_user)
):
    return db.query(models.Installment).filter(models.Installment.farmer_id == current_user.id).all()

@router.post("/pay", response_model=schemas.TransactionResponse)
def make_payment(
    payment: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.Farmer = Depends(get_current_active_user)
):
    # 1. Verify Installment
    if payment.installment_id:
        installment = db.query(models.Installment).filter(models.Installment.id == payment.installment_id).first()
        if not installment:
            raise HTTPException(status_code=404, detail="Installment not found")
        
        if installment.status == "PAID":
            raise HTTPException(status_code=400, detail="Installment already paid")
            
        # Update Installment
        if payment.amount >= installment.amount_due:
            installment.status = "PAID"
            installment.paid_date = datetime.now()
            
            # Restore Credit Limit
            current_user.credit_limit += installment.amount_due
        else:
            # Partial payment logic (optional, keeping simple for now)
            pass
            
    # 2. Record Transaction
    new_transaction = models.Transaction(
        farmer_id=current_user.id,
        installment_id=payment.installment_id,
        type=payment.type,
        amount=payment.amount,
        notes=payment.notes
    )
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    
    return new_transaction
