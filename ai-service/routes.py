from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime, timedelta
import database

router = APIRouter(prefix="/api")

# Models
class TransactionCreate(BaseModel):
    type: str
    amount: float
    description: str
    category: Optional[str] = "general"
    customer_name: Optional[str] = None
    raw_input: Optional[str] = None

class TransactionOut(TransactionCreate):
    id: int
    user_id: int
    created_at: str

# Endpoints
@router.post("/transactions", response_model=TransactionOut)
def create_transaction(data: TransactionCreate):
    conn = database.get_conn()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO transactions (type, amount, description, category, customer_name, raw_input)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (data.type, data.amount, data.description, data.category, data.customer_name, data.raw_input))
    conn.commit()
    t_id = cursor.lastrowid
    conn.close()
    return {**data.dict(), "id": t_id, "user_id": 1, "created_at": datetime.now().isoformat()}

@router.get("/transactions", response_model=List[TransactionOut])
def get_transactions(date: Optional[str] = None):
    conn = database.get_conn()
    cursor = conn.cursor()
    if date:
        cursor.execute("SELECT * FROM transactions WHERE date(created_at) = ?", (date,))
    else:
        cursor.execute("SELECT * FROM transactions ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.get("/transactions/today", response_model=List[TransactionOut])
def get_today_transactions():
    today = date.today().isoformat()
    return get_transactions(date=today)

@router.delete("/transactions/{t_id}")
def delete_transaction(t_id: int):
    conn = database.get_conn()
    conn.execute("DELETE FROM transactions WHERE id = ?", (t_id,))
    conn.commit()
    conn.close()
    return {"success": True}

@router.get("/dashboard/today")
def get_dashboard_today():
    today = date.today().isoformat()
    conn = database.get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM transactions WHERE date(created_at) = ?", (today,))
    rows = cursor.fetchall()
    conn.close()
    
    sales = sum(r["amount"] for r in rows if r["type"] == "SALE")
    expenses = sum(r["amount"] for r in rows if r["type"] == "EXPENSE")
    net = sales - expenses
    return {
        "sales": sales,
        "expenses": expenses,
        "netProfit": net,
        "customers": len(set(r["customer_name"] for r in rows if r["customer_name"])),
        "transactionsCount": len(rows)
    }

@router.get("/dashboard/recent")
def get_dashboard_recent(limit: int = 5):
    conn = database.get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM transactions ORDER BY created_at DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.get("/dashboard/udhaar")
def get_udhaar():
    conn = database.get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM transactions WHERE type IN ('CREDIT_GIVEN', 'CREDIT_RECEIVED')")
    rows = cursor.fetchall()
    conn.close()
    
    given = sum(r["amount"] for r in rows if r["type"] == "CREDIT_GIVEN")
    received = sum(r["amount"] for r in rows if r["type"] == "CREDIT_RECEIVED")
    return {
        "totalGiven": given,
        "totalReceived": received,
        "netPending": given - received
    }
