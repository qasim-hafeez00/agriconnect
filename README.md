# AgriConnect - Agricultural BNPL Platform

AgriConnect is a comprehensive Buy Now, Pay Later (BNPL) platform designed specifically for the agricultural sector in Pakistan. It bridges the gap between Farmers and Suppliers, enabling farmers to purchase essential agricultural inputs on credit while ensuring suppliers receive guaranteed payments.

## Features

### 🚜 Farmer Portal
-   **Dashboard**: Overview of credit limit, active orders, and upcoming installments.
-   **Product Catalog**: Browse and purchase seeds, fertilizers, and machinery.
-   **BNPL Checkout**: Flexible installment plans tailored to crop cycles.
-   **Order Tracking**: Real-time status of orders and deliveries.
-   **Urdu Support**: Fully localized interface for accessibility.

### 🏪 Supplier Portal
-   **Inventory Management**: Add, update, and manage product listings.
-   **Order Management**: Process incoming orders and track fulfillment.
-   **Financial Analytics**: Track revenue, sales trends, and pending payments.
-   **KYC Verification**: Secure business verification process.

### 🛡️ Admin Portal
-   **User Management**: Approve/Reject Farmer and Supplier registrations.
-   **KYC & Risk Assessment**: Verify documents and assign risk-based credit limits.
-   **System Health**: Monitor platform performance and active users.
-   **Blacklist Management**: Manage defaulting users.

## Technology Stack

-   **Frontend**: Next.js 14, TailwindCSS, TypeScript
-   **Backend**: FastAPI (Python), SQLAlchemy
-   **Database**: PostgreSQL
-   **Authentication**: JWT (JSON Web Tokens)
-   **Charts**: Recharts

## Getting Started

### Prerequisites
-   Node.js & npm
-   Python 3.9+
-   PostgreSQL

### Backend Setup
1.  Navigate to `newfyp` directory:
    ```bash
    cd newfyp
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Run the server:
    ```bash
    uvicorn app.main:app --reload --port 5000
    ```

### Frontend Setup
1.  Navigate to `agriconnect-app` directory:
    ```bash
    cd agriconnect-app
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```

## Project Structure
-   `/agriconnect-app`: Next.js Frontend application
-   `/newfyp`: FastAPI Backend application

## License
Proprietary software. All rights reserved.
