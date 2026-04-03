"""
Pydantic models for the Dukaan Dosth AI Service.
Defines request/response schemas for all AI endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


# ─── Enums ───────────────────────────────────────────────

class TransactionType(str, Enum):
    SALE = "SALE"
    EXPENSE = "EXPENSE"
    CREDIT_GIVEN = "CREDIT_GIVEN"
    CREDIT_RECEIVED = "CREDIT_RECEIVED"


class SupportedLanguage(str, Enum):
    ENGLISH = "en"
    TELUGU = "te"


# ─── Parse Endpoint Models ──────────────────────────────

class ParseRequest(BaseModel):
    """Request body for POST /api/ai/parse"""
    raw_input: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Raw natural language input from the user (Telugu/English/Tenglish)",
        examples=["Ramesh ki 500 ka rice becha", "bijli bill 2000 bhara"]
    )
    language: SupportedLanguage = Field(
        default=SupportedLanguage.ENGLISH,
        description="Preferred language for the response"
    )


class ParsedTransaction(BaseModel):
    """Structured transaction data extracted by AI"""
    type: TransactionType = Field(
        ...,
        description="Transaction type: SALE, EXPENSE, CREDIT_GIVEN, CREDIT_RECEIVED"
    )
    amount: float = Field(
        ...,
        ge=0,
        description="Transaction amount in INR"
    )
    description: str = Field(
        ...,
        description="Item or transaction description in English"
    )
    category: str = Field(
        default="general",
        description="Transaction category (e.g., grocery, electricity, rent)"
    )
    customer_name: Optional[str] = Field(
        default=None,
        description="Customer name if mentioned"
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="AI confidence score (0.0 to 1.0)"
    )
    clarification: Optional[str] = Field(
        default=None,
        description="Clarification question if confidence < 0.7"
    )


class ParseResponse(BaseModel):
    """Response body for POST /api/ai/parse"""
    success: bool = True
    raw_input: str
    parsed: Optional[ParsedTransaction] = None
    error: Optional[str] = None


# ─── Daily Summary Endpoint Models ──────────────────────

class TransactionData(BaseModel):
    """Transaction data for summary generation"""
    type: TransactionType
    amount: float
    description: str
    category: str = "general"
    customer_name: Optional[str] = None


class DailySummaryRequest(BaseModel):
    """Request body for POST /api/ai/daily-summary"""
    transactions: List[TransactionData] = Field(
        ...,
        min_length=1,
        description="List of today's transactions"
    )
    language: SupportedLanguage = Field(
        default=SupportedLanguage.ENGLISH,
        description="Language for the summary output"
    )
    date: Optional[str] = Field(
        default=None,
        description="Date of the summary (YYYY-MM-DD format)"
    )


class DailySummaryResponse(BaseModel):
    """Response body for POST /api/ai/daily-summary"""
    success: bool = True
    summary: Optional[str] = None
    total_sales: float = 0.0
    total_expenses: float = 0.0
    total_credit_given: float = 0.0
    total_credit_received: float = 0.0
    net_profit: float = 0.0
    transaction_count: int = 0
    error: Optional[str] = None


# ─── Weekly Insight Endpoint Models ─────────────────────

class DailySummaryData(BaseModel):
    """Daily summary data for weekly insight generation"""
    date: str = Field(..., description="Date (YYYY-MM-DD)")
    total_sales: float = 0.0
    total_expenses: float = 0.0
    net_profit: float = 0.0
    total_credit_given: float = 0.0
    total_credit_received: float = 0.0
    transaction_count: int = 0


class WeeklyInsightRequest(BaseModel):
    """Request body for POST /api/ai/weekly-insight"""
    daily_summaries: List[DailySummaryData] = Field(
        ...,
        min_length=1,
        max_length=7,
        description="List of daily summaries for the past week"
    )
    language: SupportedLanguage = Field(
        default=SupportedLanguage.ENGLISH,
        description="Language for the insight output"
    )


class WeeklyInsightResponse(BaseModel):
    """Response body for POST /api/ai/weekly-insight"""
    success: bool = True
    insight: Optional[str] = None
    weekly_total_sales: float = 0.0
    weekly_total_expenses: float = 0.0
    weekly_net_profit: float = 0.0
    best_day: Optional[str] = None
    worst_day: Optional[str] = None
    error: Optional[str] = None
