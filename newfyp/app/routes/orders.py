from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import models, schemas
from app.auth import get_current_active_user

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=schemas.OrderResponse)
def create_order(
    order: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.Farmer = Depends(get_current_active_user)
):
    # 1. Calculate Total & Verify Stock
    total_amount = 0.0
    order_items = []
    
    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
        
        # Deduct Stock
        product.stock -= item.quantity
        
        # Calculate Price
        item_total = product.price * item.quantity
        total_amount += item_total
        
        # Create Order Item Object (to be added later)
        order_items.append({
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price": product.price,
            "unit": product.unit
        })

    # 2. Check Credit Limit (if BNPL)
    if order.payment_method == "BNPL":
        if current_user.credit_limit < total_amount:
            raise HTTPException(status_code=400, detail="Insufficient credit limit")
        
        # Deduct Credit
        current_user.credit_limit -= total_amount

    # 3. Create Order
    new_order = models.Order(
        farmer_id=current_user.id,
        supplier_id=order.supplier_id,
        total_amount=total_amount,
        status="PENDING",
        payment_method=order.payment_method,
        payment_status="PENDING",
        delivery_address=order.delivery_address,
        notes=order.notes
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # 4. Create Order Items
    for item_data in order_items:
        new_item = models.OrderItem(
            order_id=new_order.id,
            **item_data
        )
        db.add(new_item)
    
    db.commit()
    
    return new_order

@router.get("/", response_model=List[schemas.OrderResponse])
def get_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.Farmer = Depends(get_current_active_user) # Or Supplier
):
    # TODO: Filter by role (Farmer sees their orders, Supplier sees theirs)
    # For now assuming Farmer
    orders = db.query(models.Order).filter(models.Order.farmer_id == current_user.id).offset(skip).limit(limit).all()
    return orders
