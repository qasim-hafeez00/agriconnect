from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app import models, schemas
from app.auth import create_access_token, get_current_supplier

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])

@router.post("/signup", response_model=schemas.SupplierResponse)
def register_supplier(supplier: schemas.SupplierSignup, db: Session = Depends(get_db)):
    # Check if username or email or cnic already exists
    existing = db.query(models.Supplier).filter(
        (models.Supplier.username == supplier.username) | 
        (models.Supplier.email == supplier.email) |
        (models.Supplier.cnic == supplier.cnic)
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Username, Email, or CNIC already registered")

    new_supplier = models.Supplier(
        business_name=supplier.business_name,
        owner_name=supplier.owner_name,
        cnic=supplier.cnic,
        email=supplier.email,
        phone_number=supplier.phone_number,
        address=supplier.address,
        location=supplier.location,
        business_type=supplier.business_type,
        username=supplier.username,
        password=supplier.password
    )
    db.add(new_supplier)
    db.commit()
    db.refresh(new_supplier)
    return new_supplier

@router.post("/login", response_model=schemas.Token)
def login_supplier(credentials: schemas.SupplierLogin, db: Session = Depends(get_db)):
    supplier = db.query(models.Supplier).filter(models.Supplier.username == credentials.username).first()

    if not supplier or supplier.password != credentials.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not supplier.approved_by_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account pending admin approval")

    access_token = create_access_token(data={"sub": supplier.username, "role": "supplier"})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": "supplier",
        "username": supplier.username
    }

@router.get("/me", response_model=schemas.SupplierResponse)
def get_me(current_supplier: models.Supplier = Depends(get_current_supplier)):
    return current_supplier

@router.get("/dashboard-stats")
def get_dashboard_stats(
    current_supplier: models.Supplier = Depends(get_current_supplier),
    db: Session = Depends(get_db)
):
    """Get comprehensive dashboard statistics for the supplier."""
    # Total products
    total_products = db.query(models.Product).filter(
        models.Product.supplier_id == current_supplier.id
    ).count()
    
    # Products in stock vs out of stock
    products_in_stock = db.query(models.Product).filter(
        models.Product.supplier_id == current_supplier.id,
        models.Product.stock > 0
    ).count()
    
    products_out_of_stock = total_products - products_in_stock
    
    # Orders
    all_orders = db.query(models.Order).filter(
        models.Order.supplier_id == current_supplier.id
    ).all()
    
    total_orders = len(all_orders)
    pending_orders = len([o for o in all_orders if o.status == "PENDING"])
    
    # Revenue
    total_revenue = sum(order.total_amount for order in all_orders)
    
    # Recent orders (last 5)
    recent_orders = db.query(models.Order).filter(
        models.Order.supplier_id == current_supplier.id
    ).order_by(models.Order.created_at.desc()).limit(5).all()
    
    # Average rating (placeholder - would need reviews table)
    average_rating = 4.5  # TODO: Calculate from actual reviews
    
    return {
        "total_products": total_products,
        "products_in_stock": products_in_stock,
        "products_out_of_stock": products_out_of_stock,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "total_revenue": total_revenue,
        "average_rating": average_rating,
        "recent_orders": [
            {
                "id": order.id,
                "farmer_id": order.farmer_id,
                "total_amount": order.total_amount,
                "status": order.status,
                "payment_method": order.payment_method,
                "created_at": order.created_at.isoformat()
            }
            for order in recent_orders
        ]
    }

@router.get("/products", response_model=list[schemas.ProductResponse])
def get_my_products(
    db: Session = Depends(get_db),
    current_supplier: models.Supplier = Depends(get_current_supplier)
):
    """Get all products for the current logged-in supplier."""
    return db.query(models.Product).filter(models.Product.supplier_id == current_supplier.id).all()

@router.get("/products/stats")
def get_product_stats(
    current_supplier: models.Supplier = Depends(get_current_supplier),
    db: Session = Depends(get_db)
):
    """Get product statistics for the supplier."""
    all_products = db.query(models.Product).filter(
        models.Product.supplier_id == current_supplier.id
    ).all()
    
    total_products = len(all_products)
    in_stock = len([p for p in all_products if p.stock > 0])
    out_of_stock = total_products - in_stock
    
    # High rated products (rating >= 4.0)
    high_rated = len([p for p in all_products if p.rating and p.rating >= 4.0])
    
    return {
        "total_products": total_products,
        "in_stock": in_stock,
        "out_of_stock": out_of_stock,
        "high_rated": high_rated
    }

@router.post("/products", response_model=schemas.ProductResponse)
def create_product(
    product: schemas.ProductCreate,
    current_supplier: models.Supplier = Depends(get_current_supplier),
    db: Session = Depends(get_db)
):
    """Create a new product."""
    new_product = models.Product(
        **product.dict(),
        supplier_id=current_supplier.id
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.put("/products/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: int,
    product_update: schemas.ProductCreate,
    current_supplier: models.Supplier = Depends(get_current_supplier),
    db: Session = Depends(get_db)
):
    """Update a product."""
    product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.supplier_id == current_supplier.id
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product_update.dict().items():
        setattr(product, key, value)
    
    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    current_supplier: models.Supplier = Depends(get_current_supplier),
    db: Session = Depends(get_db)
):
    """Delete a product."""
    product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.supplier_id == current_supplier.id
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}

@router.get("/orders")
def get_supplier_orders(
    status: str = None,
    current_supplier: models.Supplier = Depends(get_current_supplier),
    db: Session = Depends(get_db)
):
    """Get all orders for the supplier with optional status filter."""
    query = db.query(models.Order).filter(
        models.Order.supplier_id == current_supplier.id
    )
    
    if status:
        query = query.filter(models.Order.status == status.upper())
    
    orders = query.order_by(models.Order.created_at.desc()).all()
    return orders

@router.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status: str,
    current_supplier: models.Supplier = Depends(get_current_supplier),
    db: Session = Depends(get_db)
):
    """Update order status."""
    order = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.supplier_id == current_supplier.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Validate status
    valid_statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
    if status.upper() not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    order.status = status.upper()
    db.commit()
    db.refresh(order)
    return order

@router.get("/finance/balance")
def get_balance(
    current_supplier: models.Supplier = Depends(get_current_supplier),
    db: Session = Depends(get_db)
):
    """Get supplier's available balance from completed orders."""
    # Calculate total revenue from delivered orders
    delivered_orders = db.query(models.Order).filter(
        models.Order.supplier_id == current_supplier.id,
        models.Order.status == "DELIVERED",
        models.Order.payment_status == "PAID"
    ).all()
    
    total_revenue = sum(order.total_amount for order in delivered_orders)
    
    # Assuming 10% platform fee
    platform_fee = total_revenue * 0.10
    available_balance = total_revenue - platform_fee
    
    return {
        "total_revenue": total_revenue,
        "platform_fee": platform_fee,
        "available_balance": available_balance,
        "pending_orders_value": sum(
            order.total_amount for order in db.query(models.Order).filter(
                models.Order.supplier_id == current_supplier.id,
                models.Order.status.in_(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"])
            ).all()
        )
    }

@router.get("/analytics/overview")
def get_analytics_overview(
    current_supplier: models.Supplier = Depends(get_current_supplier),
    db: Session = Depends(get_db)
):
    """Get analytics overview including revenue, orders, and top products."""
    all_orders = db.query(models.Order).filter(
        models.Order.supplier_id == current_supplier.id
    ).all()
    
    total_revenue = sum(order.total_amount for order in all_orders)
    total_orders = len(all_orders)
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
    
    # Top products by revenue (would need order_items table for accuracy)
    products = db.query(models.Product).filter(
        models.Product.supplier_id == current_supplier.id
    ).order_by(models.Product.rating.desc()).limit(5).all()
    
    # Revenue Trend (Last 6 months)
    from datetime import datetime, timedelta
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    
    revenue_trend = db.query(
        func.date_trunc('month', models.Order.created_at).label('month'),
        func.sum(models.Order.total_amount).label('revenue')
    ).filter(
        models.Order.supplier_id == current_supplier.id,
        models.Order.created_at >= six_months_ago,
        models.Order.payment_status == 'PAID'  # Only count paid orders
    ).group_by('month').order_by('month').all()
    
    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "avg_order_value": avg_order_value,
        "revenue_trend": [
            {"month": str(m.month), "revenue": m.revenue or 0} for m in revenue_trend
        ],
        "top_products": [
            {
                "id": p.id,
                "name": p.name,
                "rating": p.rating,
                "stock": p.stock
            }
            for p in products
        ]
    }


