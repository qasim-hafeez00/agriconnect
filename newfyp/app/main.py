from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app import models
from app.routes import admin, farmers, supplier, products, orders, finance, documents, insurance

models.Base.metadata.create_all(bind=engine)
# ------------------------------------------------------------------

app = FastAPI()

# CORS Configuration - Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Include the routers (Controllers)
app.include_router(admin.router)
app.include_router(farmers.router)
app.include_router(supplier.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(finance.router)
app.include_router(documents.router)
app.include_router(insurance.router)

@app.get("/")
def root():
    return {"message": "Server is running perfectly!"}