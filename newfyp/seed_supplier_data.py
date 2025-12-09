"""
Script to add more sample orders and products for testing the supplier portal
"""
from app.database import SessionLocal
from app import models
from datetime import datetime, timedelta
import random

def seed_additional_data():
    db = SessionLocal()
    
    try:
        # Get existing suppliers and farmers
        suppliers = db.query(models.Supplier).all()
        farmers = db.query(models.Farmer).all()
        
        if not suppliers or not farmers:
            print("No suppliers or farmers found. Run seed_data.py first.")
            return
        
        supplier = suppliers[0]
        
        # Add more products for the supplier
        products_to_add = [
            {
                "name": "Premium Urea Fertilizer",
                "category": "Fertilizers",
                "price": 3500.0,
                "unit": "50kg bag",
                "stock": 150,
                "min_order": 5,
                "images": "urea1.jpg,urea2.jpg",
                "description": "High-quality urea fertilizer for better crop yield",
                "rating": 4.7
            },
            {
                "name": "Organic Compost",
                "category": "Fertilizers",
                "price": 2000.0,
                "unit": "25kg bag",
                "stock": 200,
                "min_order": 10,
                "images": "compost1.jpg",
                "description": "100% organic compost for healthy soil",
                "rating": 4.8
            },
            {
                "name": "Wheat Seeds - High Yield",
                "category": "Seeds",
                "price": 5000.0,
                "unit": "10kg",
                "stock": 80,
                "min_order": 2,
                "images": "wheat_seeds.jpg",
                "description": "Disease-resistant wheat seeds",
                "rating": 4.6
            },
            {
                "name": "Rice Seeds - Basmati",
                "category": "Seeds",
                "price": 8000.0,
                "unit": "10kg",
                "stock": 0,  # Out of stock
                "min_order": 2,
                "images": "rice_seeds.jpg",
                "description": "Premium basmati rice seeds",
                "rating": 4.9
            },
        ]
        
        created_products = []
        for product_data in products_to_add:
            # Check if product already exists
            existing = db.query(models.Product).filter(
                models.Product.name == product_data["name"],
                models.Product.supplier_id == supplier.id
            ).first()
            
            if not existing:
                new_product = models.Product(
                    **product_data,
                    supplier_id=supplier.id
                )
                db.add(new_product)
                created_products.append(new_product)
        
        db.commit()
        print(f"✓ Added {len(created_products)} new products!")
        
        # Create more orders with different statuses
        all_products = db.query(models.Product).filter(
            models.Product.supplier_id == supplier.id
        ).all()
        
        if not all_products:
            print("No products available to create orders")
            return
        
        statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"]
        payment_methods = ["BNPL", "CASH"]
        
        orders_to_create = 15
        created_orders = 0
        
        for i in range(orders_to_create):
            farmer = random.choice(farmers)
            product = random.choice(all_products)
            quantity = random.randint(5, 20)
            
            # Create order
            order = models.Order(
                farmer_id=farmer.id,
                supplier_id=supplier.id,
                total_amount=product.price * quantity,
                status=random.choice(statuses),
                delivery_address=farmer.address,
                payment_method=random.choice(payment_methods),
                payment_status="PENDING" if random.choice(payment_methods) == "BNPL" else "PAID",
                notes=f"Order for {quantity} units of {product.name}",
                created_at=datetime.now() - timedelta(days=random.randint(0, 30))
            )
            db.add(order)
            created_orders += 1
        
        db.commit()
        print(f"✓ Created {created_orders} new orders with various statuses!")
        print("\n✅ Additional data seeding complete!")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_additional_data()
