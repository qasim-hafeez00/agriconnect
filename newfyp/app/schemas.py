from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# ==========================
# AUTH / TOKEN
# ==========================
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None


# ==========================
# ADMIN SCHEMAS
# ==========================
class AdminLogin(BaseModel):
    username: str
    password: str

class AdminResponse(BaseModel):
    id: int
    username: str
    email: str
    
    class Config:
        from_attributes = True

# ==========================
# FARMER SCHEMAS
# ==========================
class FarmerSignup(BaseModel):
    name: str
    phone_number: str
    district: str
    tehsil: str
    village: str
    cnic: str
    land_holding: float
    username: str
    password: str

    irrigation_type: Optional[str] = None # Added here

class FarmerLogin(BaseModel):
    username: str
    password: str

class FarmerResponse(BaseModel):
    id: int
    name: str
    username: str
    
    # New Fields
    farm_name: Optional[str] = None
    crops: Optional[str] = None
    avatar: Optional[str] = None
    
    # Verification Status
    approved_by_admin: bool
    #admin_comment: Optional[str] = None  # Kept this!
    
    # NEW: Credit & Risk Fields
    credit_limit: Optional[float] = 0.0
    original_credit_limit: Optional[float] = 0.0

    is_blacklisted: bool
    blacklist_reason: Optional[str] = None
    #blacklist_expiry_date: Optional[datetime] = None

    created_at: datetime
    class Config:
        from_attributes = True

# app/schemas.py (Add this near the other Farmer schemas)

# ... (other Farmer schemas)

class FarmerCreditLimit(BaseModel):
    current_credit_limit: float
    original_credit_limit: float

# ==========================
# SUPPLIER SCHEMAS
# ==========================
class SupplierSignup(BaseModel):
    business_name: str
    owner_name: str
    cnic: str
    email: str
    phone_number: str
    address: Optional[str] = None
    location: Optional[str] = None # City/District
    business_type: Optional[str] = None
    username: str
    password: str

class SupplierLogin(BaseModel):
    username: str
    password: str

class SupplierResponse(BaseModel):
    id: int
    business_name: str
    username: str
    
    # New Fields
    business_type: Optional[str] = None
    location: Optional[str] = None
    avatar: Optional[str] = None
    rating: Optional[float] = 0.0
    
    # Verification Status
    approved_by_admin: bool
    admin_comment: Optional[str] = None  # Kept this!
    
    created_at: datetime
    class Config:
        from_attributes = True


# ==========================
# ADMIN SCHEMAS
# ==========================
class AdminLogin(BaseModel):
    username: str
    password: str

class AdminResponse(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    class Config:
        from_attributes = True

class AdminApprovalUpdate(BaseModel):
    cnic_verified: Optional[bool] = None 
    approved_by_admin: bool
    admin_comment: Optional[str] = None
    
    # Risk fields
    land_title_verified: Optional[bool] = None
    irrigation_type: Optional[str] = None
    location_risk: Optional[str] = None
    distance_to_market: Optional[float] = None
    crop_history: Optional[float] = None
    estimated_land_value: Optional[float] = None
class AdminApprovalUpdateS(BaseModel):
    cnic_verified: Optional[bool] = None 
    approved_by_admin: bool
    admin_comment: Optional[str] = None

# ==========================
# FINANCE (NEW: INSTALLMENTS & TRANSACTIONS)
# ==========================
class InstallmentResponse(BaseModel):
    id: int
    amount_due: float
    due_date: datetime
    paid_date: Optional[datetime] = None
    status: str
    class Config:
        from_attributes = True

class TransactionResponse(BaseModel):
    id: int
    type: str
    amount: float
    timestamp: datetime
    notes: Optional[str] = None
    farmer_id: int
    class Config:
        from_attributes = True

# Optional: Keep this if you ever need to simulate payments via API later
class PaymentCreate(BaseModel):
    installment_id: int
    amount: float

# ==========================
# PRODUCT SCHEMAS
# ==========================
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    price: float
    stock: int
    unit: str
    images: Optional[str] = None # Comma separated URLs

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    supplier_id: int
    rating: float
    reviews_count: int
    is_available: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ==========================
# ORDER SCHEMAS
# ==========================
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float
    unit: str

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    supplier_id: int
    items: List[OrderItemCreate]
    payment_method: str = "BNPL"
    delivery_address: str
    notes: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    farmer_id: int
    supplier_id: int
    total_amount: float
    status: str
    payment_method: str
    land_holding: float
    username: str
    password: str

    irrigation_type: Optional[str] = None # Added here

class FarmerLogin(BaseModel):
    username: str
    password: str

class FarmerResponse(BaseModel):
    id: int
    name: str
    username: str
    
    # New Fields
    farm_name: Optional[str] = None
    crops: Optional[str] = None
    avatar: Optional[str] = None
    
    # Verification Status
    approved_by_admin: bool
    #admin_comment: Optional[str] = None  # Kept this!
    
    # NEW: Credit & Risk Fields
    credit_limit: Optional[float] = 0.0
    original_credit_limit: Optional[float] = 0.0

    is_blacklisted: bool
    blacklist_reason: Optional[str] = None
    #blacklist_expiry_date: Optional[datetime] = None

    created_at: datetime
    class Config:
        from_attributes = True

# app/schemas.py (Add this near the other Farmer schemas)

# ... (other Farmer schemas)

class FarmerCreditLimit(BaseModel):
    current_credit_limit: float
    original_credit_limit: float

# ==========================
# SUPPLIER SCHEMAS
# ==========================
class SupplierSignup(BaseModel):
    business_name: str
    email: str
    phone_number: str
    username: str
    password: str

class SupplierLogin(BaseModel):
    username: str
    password: str

class SupplierResponse(BaseModel):
    id: int
    business_name: str
    username: str
    
    # New Fields
    business_type: Optional[str] = None
    location: Optional[str] = None
    avatar: Optional[str] = None
    rating: Optional[float] = 0.0
    
    # Verification Status
    approved_by_admin: bool
    admin_comment: Optional[str] = None  # Kept this!
    
    created_at: datetime
    class Config:
        from_attributes = True


# ==========================
# ADMIN SCHEMAS
# ==========================
class AdminLogin(BaseModel):
    username: str
    password: str

class AdminResponse(BaseModel):
    id: int
    username: str
    class Config:
        from_attributes = True

class AdminApprovalUpdate(BaseModel):
    cnic_verified: Optional[bool] = None 
    approved_by_admin: bool
    admin_comment: Optional[str] = None
    
    # Risk fields
    land_title_verified: Optional[bool] = None
    irrigation_type: Optional[str] = None
    location_risk: Optional[str] = None
    distance_to_market: Optional[float] = None
    crop_history: Optional[float] = None
    estimated_land_value: Optional[float] = None
class AdminApprovalUpdateS(BaseModel):
    cnic_verified: Optional[bool] = None 
    approved_by_admin: bool
    admin_comment: Optional[str] = None

# ==========================
# FINANCE (NEW: INSTALLMENTS & TRANSACTIONS)
# ==========================
class InstallmentResponse(BaseModel):
    id: int
    amount_due: float
    due_date: datetime
    paid_date: Optional[datetime] = None
    status: str
    class Config:
        from_attributes = True

class TransactionResponse(BaseModel):
    id: int
    type: str
    amount: float
    timestamp: datetime
    notes: Optional[str] = None
    farmer_id: int
    class Config:
        from_attributes = True

# Optional: Keep this if you ever need to simulate payments via API later
class PaymentCreate(BaseModel):
    installment_id: int
    amount: float

# ==========================
# PRODUCT SCHEMAS
# ==========================
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    price: float
    stock: int
    unit: str
    images: Optional[str] = None # Comma separated URLs

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    supplier_id: int
    rating: float
    reviews_count: int
    is_available: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ==========================
# ORDER SCHEMAS
# ==========================
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float
    unit: str

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    supplier_id: int
    items: List[OrderItemCreate]
    payment_method: str = "BNPL"
    delivery_address: str
    notes: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    farmer_id: int
    supplier_id: int
    total_amount: float
    status: str
    payment_method: str
    payment_status: str
    delivery_address: str
    notes: Optional[str] = None
    created_at: datetime
    
    # We might want to include items here, but for now let's keep it simple
    # items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

# ==========================
# FINANCE SCHEMAS (UPDATED)
# ==========================
class InstallmentCreate(BaseModel):
    farmer_id: int
    order_id: int
    amount_due: float
    due_date: datetime

class TransactionCreate(BaseModel):
    amount: float
    type: str # "INSTALLMENT_PAYMENT", "PURCHASE"
    installment_id: Optional[int] = None
    notes: Optional[str] = None