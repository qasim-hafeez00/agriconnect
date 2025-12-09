from pydantic import BaseModel
from typing import Optional

class DashboardStats(BaseModel):
    available_credit: float
    credit_limit: float
    total_debt: float
    credit_used_percentage: float
    farm_size: float
    risk_score: Optional[int] = None
    risk_label: Optional[str] = None
    total_orders: int
    pending_installments: int
