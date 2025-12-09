from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer

from app.database import get_db
from sqlalchemy.orm import Session
from app import models

# ==========================
# CONFIGURATION
# ==========================
SECRET_KEY = "supersecretkey"   # Change this in production!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# HTTP Bearer scheme for JWT
bearer_scheme = HTTPBearer()


# ==========================
# CREATE JWT TOKEN
# ==========================
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# ==========================
# VERIFY TOKEN
# ==========================
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        username: str = payload.get("sub")
        role: str = payload.get("role")

        if username is None:
            raise JWTError("Invalid token payload")

        return {
            "username": username,
            "role": role
        }

    except JWTError as e:
        print(f"[AUTH] JWT verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ==================================
# CORE DEPENDENCY: Extract Token Data
# ==================================
def get_token_data(credentials = Depends(bearer_scheme)):
    """
    Reads the Authorization header and verifies the token.
    Returns the raw token data (username, role) dictionary.
    """
    try:
        token = credentials.credentials
        print(f"[AUTH] Extracted token: {token[:20]}...")
    except Exception as e:
        print(f"[AUTH] Error extracting token from credentials: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # verify_token handles the JWT decoding and validation
    return verify_token(token) 

# ==========================================
# ROLE-SPECIFIC DEPENDENCIES
# =========================================
def get_current_admin(token_data: dict = Depends(get_token_data), db: Session = Depends(get_db)):
    print(f"[AUTH] get_current_admin called with token_data: {token_data}")
    if token_data["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    
    admin = db.query(models.Admin).filter(models.Admin.username == token_data["username"]).first()
    if not admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin user not found")
        
    print(f"[AUTH] Admin authenticated: {admin.username}")
    return admin

def get_current_farmer(token_data: dict = Depends(get_token_data), db: Session = Depends(get_db)):
    if token_data["role"] != "farmer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Farmer access required")
    
    # 1. Fetch the Farmer object
    farmer = db.query(models.Farmer).filter(models.Farmer.username == token_data["username"]).first()
    
    if not farmer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farmer user not found")
        
    if not farmer.approved_by_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account pending admin approval")
    
    return farmer

def get_current_supplier(token_data: dict = Depends(get_token_data), db: Session = Depends(get_db)):
    if token_data["role"] != "supplier":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Supplier access required")
    
    supplier = db.query(models.Supplier).filter(models.Supplier.username == token_data["username"]).first()
    if not supplier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier user not found")
    
    if not supplier.approved_by_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account pending admin approval")

    return supplier

# Alias for generic user (defaulting to farmer for now as per requirement)
def get_current_active_user(token_data: dict = Depends(get_token_data), db: Session = Depends(get_db)):
    # This function is used by orders.py which expects a Farmer object
    return get_current_farmer(token_data, db)