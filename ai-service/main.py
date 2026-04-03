"""
Dukaan Dosth AI Service — FastAPI Application
Provides AI-powered transaction parsing, daily summaries, and weekly insights
using Google Gemini API with Telugu/English/Tenglish support.
"""

import logging
import os
from datetime import date, datetime

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from gemini_client import gemini_client
from models import (
    DailySummaryRequest,
    DailySummaryResponse,
    ParseRequest,
    ParseResponse,
    TransactionType,
    WeeklyInsightRequest,
    WeeklyInsightResponse,
)

# ─── Configuration ──────────────────────────────────────

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ─── FastAPI App ────────────────────────────────────────

app = FastAPI(
    title="Dukaan Dosth AI Service",
    description=(
        "AI-powered transaction parsing, daily summaries, and weekly insights "
        "for Indian small business owners. Supports Telugu, English, and Tenglish."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS Middleware ────────────────────────────────────

ALLOWED_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000,https://dukaan-dosth.vercel.app",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import routes
app.include_router(routes.router)

logger.info(f"CORS enabled for origins: {ALLOWED_ORIGINS}")


# ─── Health Check ───────────────────────────────────────

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for UptimeRobot and monitoring."""
    return {
        "status": "healthy",
        "service": "Dukaan Dosth AI Service",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "gemini_configured": gemini_client._model is not None,
    }


@app.get("/api/ai/health", tags=["Health"])
async def ai_health_check():
    """AI-specific health check endpoint."""
    return {
        "status": "healthy",
        "service": "Dukaan Dosth AI Service",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "gemini_configured": gemini_client._model is not None,
    }


# ─── POST /api/ai/parse ────────────────────────────────

@app.post(
    "/api/ai/parse",
    response_model=ParseResponse,
    tags=["AI"],
    summary="Parse natural language into structured transaction",
    description=(
        "Takes raw text input (Telugu/English/Tenglish) and uses Gemini AI "
        "to extract transaction type, amount, description, category, and customer name."
    ),
)
async def parse_transaction(request: ParseRequest):
    """
    Parse a natural language transaction input.

    Examples:
    - "Ramesh ki 500 ka rice becha" → SALE, ₹500, rice, customer: Ramesh
    - "bijli bill 2000 bhara" → EXPENSE, ₹2000, electricity bill
    - "Suresh ki 300 udhaar diya" → CREDIT_GIVEN, ₹300, customer: Suresh
    """
    logger.info(f"Parse request: '{request.raw_input}' (lang={request.language})")

    try:
        parsed = await gemini_client.parse_transaction(
            raw_input=request.raw_input,
            language=request.language.value,
        )

        logger.info(
            f"Parsed result: type={parsed.type}, amount={parsed.amount}, "
            f"desc='{parsed.description}', confidence={parsed.confidence}"
        )

        return ParseResponse(
            success=True,
            raw_input=request.raw_input,
            parsed=parsed,
        )

    except Exception as e:
        logger.error(f"Parse error: {e}", exc_info=True)
        return ParseResponse(
            success=False,
            raw_input=request.raw_input,
            error=f"Failed to parse input. Please try again or enter the transaction manually.",
        )


# ─── POST /api/ai/daily-summary ────────────────────────

@app.post(
    "/api/ai/daily-summary",
    response_model=DailySummaryResponse,
    tags=["AI"],
    summary="Generate AI daily business summary",
    description=(
        "Takes a list of today's transactions and generates a warm, "
        "conversational end-of-day summary in the user's preferred language."
    ),
)
async def generate_daily_summary(request: DailySummaryRequest):
    """
    Generate an AI-powered daily business summary.
    Supports English and Telugu output.
    """
    logger.info(
        f"Daily summary request: {len(request.transactions)} transactions, "
        f"lang={request.language}, date={request.date}"
    )

    try:
        summary_date = request.date or str(date.today())

        # Calculate totals
        total_sales = sum(
            t.amount for t in request.transactions if t.type == TransactionType.SALE
        )
        total_expenses = sum(
            t.amount for t in request.transactions if t.type == TransactionType.EXPENSE
        )
        credit_given = sum(
            t.amount for t in request.transactions if t.type == TransactionType.CREDIT_GIVEN
        )
        credit_received = sum(
            t.amount for t in request.transactions if t.type == TransactionType.CREDIT_RECEIVED
        )
        net_profit = total_sales - total_expenses

        # Generate AI summary
        summary_text = await gemini_client.generate_daily_summary(
            transactions=request.transactions,
            language=request.language.value,
            date=summary_date,
        )

        return DailySummaryResponse(
            success=True,
            summary=summary_text,
            total_sales=total_sales,
            total_expenses=total_expenses,
            total_credit_given=credit_given,
            total_credit_received=credit_received,
            net_profit=net_profit,
            transaction_count=len(request.transactions),
        )

    except Exception as e:
        logger.error(f"Daily summary error: {e}", exc_info=True)
        return DailySummaryResponse(
            success=False,
            error="Failed to generate daily summary. Please try again.",
        )


# ─── POST /api/ai/weekly-insight ───────────────────────

@app.post(
    "/api/ai/weekly-insight",
    response_model=WeeklyInsightResponse,
    tags=["AI"],
    summary="Generate AI weekly business insight",
    description=(
        "Takes daily summaries for the past week and generates actionable "
        "business insights and trend analysis."
    ),
)
async def generate_weekly_insight(request: WeeklyInsightRequest):
    """
    Generate an AI-powered weekly business insight.
    Supports English and Telugu output.
    """
    logger.info(
        f"Weekly insight request: {len(request.daily_summaries)} days, "
        f"lang={request.language}"
    )

    try:
        # Calculate weekly totals
        weekly_sales = sum(d.total_sales for d in request.daily_summaries)
        weekly_expenses = sum(d.total_expenses for d in request.daily_summaries)
        weekly_profit = weekly_sales - weekly_expenses

        # Generate AI insight
        result = await gemini_client.generate_weekly_insight(
            daily_summaries=request.daily_summaries,
            language=request.language.value,
        )

        return WeeklyInsightResponse(
            success=True,
            insight=result["insight"],
            weekly_total_sales=weekly_sales,
            weekly_total_expenses=weekly_expenses,
            weekly_net_profit=weekly_profit,
            best_day=result["best_day"],
            worst_day=result["worst_day"],
        )

    except Exception as e:
        logger.error(f"Weekly insight error: {e}", exc_info=True)
        return WeeklyInsightResponse(
            success=False,
            error="Failed to generate weekly insight. Please try again.",
        )


# ─── Run Server ─────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info",
    )
