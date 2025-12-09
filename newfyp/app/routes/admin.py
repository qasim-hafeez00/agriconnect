from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_, text
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
    print(f"[ADMIN LOGIN] Received login attempt - username: {credentials.username}")
    admin = db.query(models.Admin).filter(models.Admin.username == credentials.username).first()
    
    if not admin:
        print(f"[ADMIN LOGIN] Admin not found: {credentials.username}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")
    
    if admin.password != credentials.password:
        print(f"[ADMIN LOGIN] Password mismatch for: {credentials.username}")
        print(f"[ADMIN LOGIN] Expected: {admin.password}, Got: {credentials.password}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")
    
    print(f"[ADMIN LOGIN] Login successful for: {admin.username}")
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
@router.get("/farmers", response_model=list[schemas.FarmerResponse])
def get_farmers(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin) 
):

    return db.query(models.Farmer).all()


@router.put("/approve-farmer/{farmer_id}", response_model=schemas.FarmerResponse)
def approve_farmer(
    farmer_id: int,
    update_data: schemas.AdminApprovalUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin) 
):

    farmer = db.query(models.Farmer).filter(models.Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    # ------------------------------
    #  BASIC FIELDS
    # ------------------------------
    if update_data.cnic_verified is not None:
        farmer.cnic_verified = update_data.cnic_verified

    farmer.approved_by_admin = update_data.approved_by_admin
    farmer.admin_comment = update_data.admin_comment

    # ===================================================
    #  ONLY IF FARMER IS APPROVED
    # ===================================================
    if farmer.approved_by_admin:

        # -------------------------------------------
        # 1️⃣ Assign BASE credit limit (existing logic)
        # -------------------------------------------
        assign_credit_limit(farmer)   # sets credit_limit + original_credit_limit

        # -------------------------------------------
        # 2️⃣ Fetch or create FarmerRiskProfile
        # -------------------------------------------
        risk_profile = (
            db.query(models.FarmerRiskProfile)
            .filter(models.FarmerRiskProfile.farmer_id == farmer.id)
            .first()
        )

        if not risk_profile:
            risk_profile = models.FarmerRiskProfile(farmer_id=farmer.id)
            db.add(risk_profile)

        # -------------------------------------------
        # 3️⃣ Update risk profile fields from admin
        # -------------------------------------------
        if update_data.land_title_verified is not None:
            risk_profile.land_title_verified = update_data.land_title_verified
        if update_data.irrigation_type is not None:
            risk_profile.irrigation_type = update_data.irrigation_type
        if update_data.location_risk is not None:
            risk_profile.location_risk = update_data.location_risk
        if update_data.distance_to_market is not None:
            risk_profile.distance_to_market = update_data.distance_to_market
        if update_data.crop_history is not None:
            risk_profile.crop_history = update_data.crop_history
        if update_data.estimated_land_value is not None:
            risk_profile.estimated_land_value = update_data.estimated_land_value

        # -------------------------------------------
        # 4️⃣ Calculate risk score
        # -------------------------------------------
        calculate_risk_score(risk_profile)  # sets risk_score + is_risk_scored

        # -------------------------------------------
        # 5️⃣ Update credit limit based on risk score
        # -------------------------------------------
        update_credit_limit(farmer, risk_profile)

        db.commit()
        db.refresh(risk_profile)

    # ===================================================
    db.commit()
    db.refresh(farmer)
    return farmer


@router.put("/recalculate-credit/{farmer_id}", response_model=schemas.FarmerResponse)
def recalculate_credit(farmer_id: int, db: Session = Depends(get_db),current_user = Depends(get_current_admin) 
):

    farmer = db.query(models.Farmer).filter(models.Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    # Always assign base credit limit from land holding
    assign_credit_limit(farmer)  # sets credit_limit + original_credit_limit

    # Ensure a risk profile exists
    risk_profile = db.query(models.FarmerRiskProfile).filter(
        models.FarmerRiskProfile.farmer_id == farmer.id
    ).first()

    if not risk_profile:
        raise HTTPException(status_code=400, detail="Farmer risk profile not found")

    # Update credit limit based on risk score
    update_credit_limit(farmer, risk_profile)

    db.commit()
    db.refresh(farmer)
    return farmer


@router.put("/blacklist-farmer/{farmer_id}", response_model=schemas.FarmerResponse)
def blacklist_farmer_manual(farmer_id: int, db: Session = Depends(get_db),current_user = Depends(get_current_admin) 
):

    farmer = db.query(models.Farmer).filter(models.Farmer.id == farmer_id).first()
    if not farmer: raise HTTPException(status_code=404, detail="Farmer not found")
    set_blacklist_with_duration(farmer, months=3, reason="Manual blacklist by admin")
    db.commit()
    db.refresh(farmer)
    return farmer

@router.put("/unblacklist-farmer/{farmer_id}", response_model=schemas.FarmerResponse)
def unblacklist_farmer_manual(farmer_id: int, db: Session = Depends(get_db),current_user = Depends(get_current_admin) 
):

    farmer = db.query(models.Farmer).filter(models.Farmer.id == farmer_id).first()
    if not farmer: raise HTTPException(status_code=404, detail="Farmer not found")
    clear_blacklist(farmer)
    db.commit()
    db.refresh(farmer)
    return farmer

@router.put("/check-blacklist/{farmer_id}", response_model=schemas.FarmerResponse)
def check_blacklist(farmer_id: int, db: Session = Depends(get_db),current_user = Depends(get_current_admin) 
):

    """
    Manually trigger auto-blacklist check for a farmer.
    """
    auto_blacklist_overdue_farmer(db, farmer_id)
    farmer = db.query(models.Farmer).filter(models.Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return farmer

# --- SUPPLIER MANAGEMENT ---
@router.get("/suppliers", response_model=list[schemas.SupplierResponse])
def get_suppliers(db: Session = Depends(get_db),current_user = Depends(get_current_admin) 
):

    return db.query(models.Supplier).all()

@router.put("/approve-supplier/{supplier_id}", response_model=schemas.SupplierResponse)
def approve_supplier(supplier_id: int, update_data: schemas.AdminApprovalUpdateS, db: Session = Depends(get_db),current_user = Depends(get_current_admin) 
):

    supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if not supplier: raise HTTPException(status_code=404, detail="Supplier not found")
    supplier.approved_by_admin = update_data.approved_by_admin
    supplier.admin_comment = update_data.admin_comment
    db.commit()
    db.refresh(supplier)
    return supplier




# --- VIEWING / REPORTING ---
@router.get("/transactions", response_model=list[schemas.TransactionResponse])
def view_transactions(farmer_id: int | None = None, db: Session = Depends(get_db),current_user = Depends(get_current_admin) 
):

    """View transactions ledger. Global or filtered by farmer_id."""
    q = db.query(models.Transaction)
    if farmer_id:
        q = q.filter(models.Transaction.farmer_id == farmer_id)
    return q.order_by(desc(models.Transaction.timestamp)).all()




@router.get("/report/dashboard")
def admin_dashboard(db: Session = Depends(get_db),current_user = Depends(get_current_admin) 
):

    
    # Farmer Stats
    total_farmers = db.query(models.Farmer).count()
    approved_farmers = db.query(models.Farmer).filter(models.Farmer.approved_by_admin == True).count()
    blacklisted_farmers = db.query(models.Farmer).filter(models.Farmer.is_blacklisted == True).count()
    pending_approvals_farmers = db.query(models.Farmer).filter(models.Farmer.approved_by_admin == False).count()
    
    # Supplier Stats
    total_suppliers = db.query(models.Supplier).count()
    active_suppliers = db.query(models.Supplier).filter(models.Supplier.approved_by_admin == True).count()
    pending_approvals_suppliers = db.query(models.Supplier).filter(models.Supplier.approved_by_admin == False).count()

    # Order Stats
    total_orders = db.query(models.Order).count()
    
    # Revenue Stats (Sum of total amount of all orders)
    # Using python sum for simplicity if func.sum is not imported, or improved calculation later
    orders = db.query(models.Order).all()
    total_revenue = sum(order.total_amount for order in orders) if orders else 0

    return {
        "farmers": {
            "total": total_farmers,
            "active": approved_farmers,
            "blacklisted": blacklisted_farmers,
            "pending_kyc": pending_approvals_farmers
        },
        "suppliers": {
            "total": total_suppliers,
            "active": active_suppliers,
            "pending_kyc": pending_approvals_suppliers
        },
        "orders": {
            "total": total_orders,
            "revenue": total_revenue
        }
    }

# ====================================================
# NEW COMPREHENSIVE ADMIN ENDPOINTS
# ====================================================

@router.get("/dashboard/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """Comprehensive dashboard statistics."""
    # KYC stats
    pending_farmers_kyc = db.query(models.Farmer).filter(models.Farmer.kyc_status == "PENDING").count()
    pending_suppliers_kyc = db.query(models.Supplier).filter(models.Supplier.kyc_status == "PENDING").count()
    
    approved_farmers = db.query(models.Farmer).filter(models.Farmer.kyc_status == "APPROVED").count()
    rejected_farmers = db.query(models.Farmer).filter(models.Farmer.kyc_status == "REJECTED").count()
    
    approved_suppliers = db.query(models.Supplier).filter(models.Supplier.kyc_status == "APPROVED").count()
    rejected_suppliers = db.query(models.Supplier).filter(models.Supplier.kyc_status == "REJECTED").count()
    
    return {
        "pending_reviews": pending_farmers_kyc + pending_suppliers_kyc,
        "approved": approved_farmers + approved_suppliers,
        "rejected": rejected_farmers + rejected_suppliers,
        "total_farmers": db.query(models.Farmer).count(),
        "total_suppliers": db.query(models.Supplier).count(),
        "total_orders": db.query(models.Order).count()
    }

# KYC VERIFICATION ENDPOINTS
@router.get("/kyc/pending")
def get_pending_kyc(
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """Get all pending KYC submissions."""
    farmers = db.query(models.Farmer).filter(models.Farmer.kyc_status == "PENDING").all()
    suppliers = db.query(models.Supplier).filter(models.Supplier.kyc_status == "PENDING").all()
    
    return {
        "farmers": farmers,
        "suppliers": suppliers
    }

@router.get("/kyc/approved")
def get_approved_kyc(
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """Get all approved KYC submissions."""
    farmers = db.query(models.Farmer).filter(models.Farmer.kyc_status == "APPROVED").all()
    suppliers = db.query(models.Supplier).filter(models.Supplier.kyc_status == "APPROVED").all()
    
    return {
        "farmers": farmers,
        "suppliers": suppliers
    }

@router.get("/kyc/rejected")
def get_rejected_kyc(
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """Get all rejected KYC submissions."""
    farmers = db.query(models.Farmer).filter(models.Farmer.kyc_status == "REJECTED").all()
    suppliers = db.query(models.Supplier).filter(models.Supplier.kyc_status == "REJECTED").all()
    
    return {
        "farmers": farmers,
        "suppliers": suppliers
    }

@router.put("/kyc/farmer/{farmer_id}/approve")
def approve_farmer_kyc(
    farmer_id: int,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """Approve farmer KYC."""
    farmer = db.query(models.Farmer).filter(models.Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    
    farmer.kyc_status = "APPROVED"
    farmer.kyc_reviewed_at = datetime.now(timezone.utc)
    farmer.kyc_reviewed_by = current_admin.id
    farmer.approved_by_admin = True
    
    # Assign credit limit
    assign_credit_limit(farmer)
    
    db.commit()
    db.refresh(farmer)
    return farmer

@router.put("/kyc/farmer/{farmer_id}/reject")
def reject_farmer_kyc(
    farmer_id: int,
    reason: str,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """Reject farmer KYC."""
    farmer = db.query(models.Farmer).filter(models.Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    
    farmer.kyc_status = "REJECTED"
    farmer.kyc_rejection_reason = reason
    farmer.kyc_reviewed_at = datetime.now(timezone.utc)
    farmer.kyc_reviewed_by = current_admin.id
    
    db.commit()
    db.refresh(farmer)
    return farmer

@router.put("/kyc/supplier/{supplier_id}/approve")
def approve_supplier_kyc(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """Approve supplier KYC."""
    supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    supplier.kyc_status = "APPROVED"
    supplier.kyc_reviewed_at = datetime.now(timezone.utc)
    supplier.kyc_reviewed_by = current_admin.id
    supplier.approved_by_admin = True
    
    db.commit()
    db.refresh(supplier)
    return supplier

@router.put("/kyc/supplier/{supplier_id}/reject")
def reject_supplier_kyc(
    supplier_id: int,
    reason: str,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """Reject supplier KYC."""
    supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    supplier.kyc_status = "REJECTED"
    supplier.kyc_rejection_reason = reason
    supplier.kyc_reviewed_at = datetime.now(timezone.utc)
    supplier.kyc_reviewed_by = current_admin.id
    
    db.commit()
    db.refresh(supplier)
    return supplier

# FARMERS DETAILED MANAGEMENT
@router.get("/farmers/{farmer_id}")
def get_farmer_details(
    farmer_id: int,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """Get detailed farmer information."""
    farmer = db.query(models.Farmer).filter(models.Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    
    # Get orders
    orders = db.query(models.Order).filter(models.Order.farmer_id == farmer_id).all()
    
    # Get risk profile
    risk_profile = db.query(models.FarmerRiskProfile).filter(
        models.FarmerRiskProfile.farmer_id == farmer_id
    ).first()
    
    return {
        "farmer": farmer,
        "orders": orders,
        "risk_profile": risk_profile,
        "total_orders": len(orders),
        "total_spent": sum(order.total_amount for order in orders)
    }

@router.put("/farmers/{farmer_id}/credit-limit")
def update_farmer_credit_limit(
    farmer_id: int,
    new_limit: float,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """Update farmer's credit limit."""
    farmer = db.query(models.Farmer).filter(models.Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    
    farmer.credit_limit = new_limit
    db.commit()
    db.refresh(farmer)
    return farmer

# RISK MANAGEMENT
@router.get("/risk/portfolio")
def get_risk_portfolio(
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """Get portfolio risk metrics."""
    # Get all farmers with BNPL orders
    all_bnpl_orders = db.query(models.Order).filter(
        models.Order.payment_method == "BNPL",
        models.Order.payment_status != "PAID"
    ).all()
    
    total_outstanding = sum(order.total_amount for order in all_bnpl_orders)
    
    # Get high-risk farmers
    high_risk_profiles = db.query(models.FarmerRiskProfile).filter(
        models.FarmerRiskProfile.risk_score >= 70
    ).all()
    
    high_risk_count = len(high_risk_profiles)
    
    # Calculate average risk score
    all_profiles = db.query(models.FarmerRiskProfile).filter(
        models.FarmerRiskProfile.is_risk_scored == True
    ).all()
    
    avg_risk_score = sum(p.risk_score for p in all_profiles) / len(all_profiles) if all_profiles else 0
    
    # Portfolio at risk (sum of outstanding debt from high-risk farmers)
    high_risk_farmer_ids = [p.farmer_id for p in high_risk_profiles]
    portfolio_at_risk = sum(
        order.total_amount for order in all_bnpl_orders 
        if order.farmer_id in high_risk_farmer_ids
    )
    
    return {
        "total_outstanding": total_outstanding,
        "portfolio_at_risk": portfolio_at_risk,
        "avg_risk_score": round(avg_risk_score, 2),
        "high_risk_farmers_count": high_risk_count
    }

# ANALYTICS
@router.get("/analytics/user-growth")
def get_user_growth(
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """Get user registration trend for last 6 months."""
    from datetime import timedelta
    
    # Get date 6 months ago
    six_months_ago = datetime.now() - timedelta(days=180)
    
    # Group by month
    farmers_by_month = db.query(
        func.date_trunc('month', models.Farmer.created_at).label('month'),
        func.count(models.Farmer.id).label('count')
    ).filter(
        models.Farmer.created_at >= six_months_ago
    ).group_by('month').order_by('month').all()
    
    suppliers_by_month = db.query(
        func.date_trunc('month', models.Supplier.created_at).label('month'),
        func.count(models.Supplier.id).label('count')
    ).filter(
        models.Supplier.created_at >= six_months_ago
    ).group_by('month').order_by('month').all()
    
    return {
        "farmers": [{"month": str(m.month), "count": m.count} for m in farmers_by_month],
        "suppliers": [{"month": str(m.month), "count": m.count} for m in suppliers_by_month]
    }

@router.get("/analytics/category-distribution")
def get_category_distribution(
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """Get order distribution by product category."""
    # Get all products and their categories
    categories = db.query(
        models.Product.category,
        func.count(models.Product.id).label('product_count')
    ).group_by(models.Product.category).all()
    
    return [{"category": c.category, "count": c.product_count} for c in categories]

@router.get("/analytics/regional-performance")
def get_regional_performance(
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """Get performance metrics by region."""
    # Group farmers by district
    districts = db.query(
        models.Farmer.district,
        func.count(models.Farmer.id).label('farmer_count')
    ).group_by(models.Farmer.district).all()
    
    return [{"district": d.district, "farmer_count": d.farmer_count} for d in districts if d.district]

# SYSTEM HEALTH
@router.get("/system/health")
def get_system_health(
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """Get system health metrics."""
    # Database is functional if we can query stats below
    db_status = "healthy"
    
    # Get active users (farmers + suppliers)
    active_farmers = db.query(models.Farmer).filter(models.Farmer.approved_by_admin == True).count()
    active_suppliers = db.query(models.Supplier).filter(models.Supplier.approved_by_admin == True).count()
    
    return {
        "database_status": db_status,
        "active_users": active_farmers + active_suppliers,
        "total_orders": db.query(models.Order).count(),
        "system_uptime": "99.9%"  # Placeholder
    }
