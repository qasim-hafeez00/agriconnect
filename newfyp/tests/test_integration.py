import requests
import json

BASE_URL = "http://localhost:8000"

def test_flow():
    print("Starting Integration Test...")
    print("Using seeded data (ahmed_khan farmer and ali_fertilizers supplier)")
    
    # 1. Login Farmer (using seeded data - already approved)
    print("\n1. Logging in Farmer (ahmed_khan)...")
    login_data = {"username": "ahmed_khan", "password": "password123"}
    res = requests.post(f"{BASE_URL}/farmers/login", json=login_data) 
    if res.status_code != 200:
        print(f"   Login Failed: {res.text}")
        return
    farmer_token = res.json()["access_token"]
    print("   Farmer Login Successful")
    
    # 2. Login Supplier (using seeded data - already approved)
    print("\n2. Logging in Supplier (ali_fertilizers)...")
    login_data = {"username": "ali_fertilizers", "password": "password123"}
    res = requests.post(f"{BASE_URL}/suppliers/login", json=login_data)
    if res.status_code != 200:
        print(f"   Login Failed: {res.text}")
        return
    supplier_token = res.json()["access_token"]
    print("   Supplier Login Successful")

    # 3. Get existing products (from seeded data)
    print("\n3. Getting Products...")
    res = requests.get(f"{BASE_URL}/products/")
    if res.status_code != 200:
        print(f"   Get Products Failed: {res.text}")
        return
    products = res.json()
    if len(products) == 0:
        print("   No products found. Please run seed_data.py first.")
        return
    
    # Use the first product (DAP Fertilizer)
    product = products[0]
    product_id = product["id"]
    supplier_id = product["supplier_id"]
    print(f"   Using Product: {product['name']} (ID: {product_id})")

    # 4. Place Order (Farmer)
    print("\n4. Placing Order...")
    headers_farmer = {"Authorization": f"Bearer {farmer_token}"}
    
    # Check credit limit (ahmed_khan has 500,000 PKR from seed data)
    res = requests.get(f"{BASE_URL}/farmers/credit-limit", headers=headers_farmer)
    print(f"   Current Credit Limit: {res.json()}")
    
    order_data = {
        "supplier_id": supplier_id,
        "items": [{"product_id": product_id, "quantity": 1}], # ~5000 amount
        "payment_method": "BNPL",
        "delivery_address": "Farm House, Village 1, Raiwind"
    }
    res = requests.post(f"{BASE_URL}/orders/", json=order_data, headers=headers_farmer)
    
    if res.status_code == 400:
        print(f"   Order Failed: {res.text}")
    elif res.status_code == 200:
        print("   Order Placed Successfully!")
        order_id = res.json()["id"]
        print(f"   Order ID: {order_id}")
        
        # 5. Generate Installments
        print("\n5. Generating Installments...")
        res = requests.post(f"{BASE_URL}/finance/installments/generate/{order_id}", headers=headers_farmer)
        if res.status_code == 200:
            print("   Installments Generated Successfully")
            print(f"   Response: {res.json()}")
        else:
            print(f"   Generate Installments Failed: {res.text}")
        
        # 6. Get Farmer's Installments
        print("\n6. Getting Farmer's Installments...")
        res = requests.get(f"{BASE_URL}/farmers/installments", headers=headers_farmer)
        if res.status_code == 200:
            installments = res.json()
            print(f"   Total Installments: {len(installments)}")
            for inst in installments:
                print(f"      - Amount: {inst['amount_due']}, Due: {inst['due_date']}, Status: {inst['status']}")
        else:
            print(f"   Get Installments Failed: {res.text}")
    else:
        print(f"   Order Failed: {res.text}")
    
    print("\n✓ Integration Test Complete!")

if __name__ == "__main__":
    test_flow()
