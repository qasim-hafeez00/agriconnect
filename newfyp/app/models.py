from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone_number = Column(String)
    district = Column(String)
    tehsil = Column(String)
    village = Column(String)
    cnic = Column(String, unique=True, index=True)
    land_holding = Column(Float)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    
    # New Fields for Frontend Integration
    farm_name = Column(String, nullable=True)
    crops = Column(String, nullable=True) # Stored as comma-separated string
    avatar = Column(String, nullable=True)
    address = Column(String, nullable=True)
    
    # Verification
    cnic_verified = Column(Boolean, default=False)
    approved_by_admin = Column(Boolean, default=False)
    admin_comment = Column(String, nullable=True, default=None)
    
    # KYC Verification
    kyc_status = Column(String, default="PENDING")  # PENDING, APPROVED, REJECTED
    kyc_documents = Column(String, nullable=True)  # JSON string of document URLs
    kyc_rejection_reason = Column(String, nullable=True)
    kyc_reviewed_at = Column(DateTime(timezone=True), nullable=True)
    kyc_reviewed_by = Column(Integer, nullable=True)

    # CREDIT & RISK SCORING
    credit_limit = Column(Float, default=0.0) # Current Limit (fluctuates)
    original_credit_limit = Column(Float, default=0.0) # Baseline (for calculation)
    
    # BLACKLIST STATUS
    is_blacklisted = Column(Boolean, default=False)
    blacklist_reason = Column(String, nullable=True, default=None)
    blacklist_expiry_date = Column(DateTime(timezone=True), nullable=True, default=None)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    business_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone_number = Column(String)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    address = Column(String, nullable=True)

    # New Fields for Frontend Integration
    owner_name = Column(String, nullable=True)
    cnic = Column(String, unique=True, index=True, nullable=True)
    business_type = Column(String, nullable=True)
    location = Column(String, nullable=True)
    avatar = Column(String, nullable=True)
    rating = Column(Float, default=0.0)

    approved_by_admin = Column(Boolean, default=False)
    admin_comment = Column(String, nullable=True)
    
    # KYC Verification
    kyc_status = Column(String, default="PENDING")  # PENDING, APPROVED, REJECTED
    kyc_documents = Column(String, nullable=True)  # JSON string of document URLs
    kyc_rejection_reason = Column(String, nullable=True)
    kyc_reviewed_at = Column(DateTime(timezone=True), nullable=True)
    kyc_reviewed_by = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Admin(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String) 
    email = Column(String, unique=True, index=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Installment(Base):
    __tablename__ = "installments"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True) # Link to Order
    
    amount_due = Column(Float)
    due_date = Column(DateTime(timezone=True))
    paid_date = Column(DateTime(timezone=True), nullable=True) # New: Tracks exact payment time
    
    status = Column(String, default="PENDING") # "PENDING", "PAID", "LATE", "OVERDUE"
    
    # Fees
    late_fee = Column(Float, default=0.0)
    penalty_fee = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    installment_id = Column(Integer, ForeignKey("installments.id"), nullable=True)

    type = Column(String)  # "PURCHASE", "INSTALLMENT_PAYMENT", "REFUND", "PENALTY"
    amount = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(String, nullable=True)

class FarmerRiskProfile(Base):
    __tablename__ = "farmer_risk_profiles"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), unique=True)  # One profile per farmer

    # Admin-vetted fields
    land_title_verified = Column(Boolean, default=False)
    irrigation_type = Column(String, nullable=True)  # Admin fills "Canal", "Tubewell", "Rainfed"
    location_risk = Column(String, nullable=True)  # "Low", "Medium", "High"
    distance_to_market = Column(Float, nullable=True)  # Normalized 0-1
    crop_history = Column(Float, nullable=True)  # Normalized 0-1
    estimated_land_value = Column(Float, nullable=True)  # In PKR

    # Risk scoring
    risk_score = Column(Float, nullable=True)  # 0–100
    is_risk_scored = Column(Boolean, default=False)
    risk_label = Column(String, nullable=True)  # Low / Medium / High


    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    category = Column(String, index=True) # fertilizers, seeds, etc.
    price = Column(Float)
    stock = Column(Integer)
    unit = Column(String) # kg, liter, bag
    images = Column(String, nullable=True) # Comma separated URLs
    
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    
    # Ratings
    rating = Column(Float, default=0.0)
    reviews_count = Column(Integer, default=0)
    
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    
    total_amount = Column(Float)
    status = Column(String, default="PENDING") # PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
    payment_method = Column(String, default="BNPL") # BNPL, CASH
    payment_status = Column(String, default="PENDING")
    
    delivery_address = Column(String)
    notes = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    
    quantity = Column(Integer)
    price = Column(Float) # Snapshot of price at time of order
    unit = Column(String)

class InsurancePlan(Base):
    __tablename__ = "insurance_plans"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    provider = Column(String)
    coverage_amount = Column(Float)
    premium_amount = Column(Float)
    premium_period = Column(String) # "season", "year", "month"
    description = Column(String)
    icon = Column(String, nullable=True)
    color = Column(String, nullable=True)
    features = Column(String) # Comma-separated features
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class InsurancePolicy(Base):
    __tablename__ = "insurance_policies"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    plan_id = Column(Integer, ForeignKey("insurance_plans.id"))
    
    policy_number = Column(String, unique=True, index=True)
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    status = Column(String, default="ACTIVE") # ACTIVE, EXPIRED, CANCELLED, CLAIMED
    premium_paid = Column(Float)
    next_payment_date = Column(DateTime(timezone=True), nullable=True)
    
    # Claim tracking
    claim_amount = Column(Float, nullable=True, default=0.0)
    claim_status = Column(String, nullable=True) # PENDING, APPROVED, REJECTED
    claim_date = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

