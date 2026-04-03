"""
Gemini API client wrapper for the Dukaan Dosth AI Service.
Handles all interactions with Google's Generative AI (Gemini) API.
"""

import json
import os
import logging
import re
from typing import Optional

import google.generativeai as genai
from google.generativeai.types import GenerationConfig

from models import (
    ParsedTransaction,
    TransactionType,
    TransactionData,
    DailySummaryData,
    SupportedLanguage,
)
from prompts import (
    TRANSACTION_PARSE_PROMPT,
    DAILY_SUMMARY_PROMPT_EN,
    DAILY_SUMMARY_PROMPT_TE,
    WEEKLY_INSIGHT_PROMPT_EN,
    WEEKLY_INSIGHT_PROMPT_TE,
)

logger = logging.getLogger(__name__)


class GeminiClient:
    """Wrapper around Google Generative AI SDK for Dukaan Dosth."""

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY not set — AI features will return mock data")
            self._model = None
            return

        genai.configure(api_key=api_key)
        self._model = genai.GenerativeModel("gemini-2.0-flash")
        logger.info("Gemini client initialized with gemini-2.0-flash")

    # ─── Transaction Parsing ────────────────────────────

    async def parse_transaction(self, raw_input: str, language: str = "en") -> ParsedTransaction:
        """
        Parse natural language input into a structured transaction.
        Supports Telugu, English, Hindi, and Tenglish.
        """
        if not self._model:
            return self._mock_parse(raw_input)

        prompt = TRANSACTION_PARSE_PROMPT.format(user_input=raw_input)

        try:
            response = self._model.generate_content(
                prompt,
                generation_config=GenerationConfig(
                    temperature=0.1,       # Low temperature for deterministic parsing
                    max_output_tokens=300,
                    response_mime_type="application/json",
                ),
            )

            result_text = response.text.strip()
            # Clean up potential markdown code blocks
            result_text = self._clean_json_response(result_text)

            data = json.loads(result_text)

            # Validate and normalize the type field
            tx_type = self._normalize_transaction_type(data.get("type", "SALE"))

            return ParsedTransaction(
                type=tx_type,
                amount=float(data.get("amount", 0)),
                description=str(data.get("description", raw_input)),
                category=str(data.get("category", "general")),
                customer_name=data.get("customer_name"),
                confidence=float(data.get("confidence", 0.5)),
                clarification=data.get("clarification"),
            )

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini JSON response: {e}")
            return ParsedTransaction(
                type=TransactionType.SALE,
                amount=0,
                description=raw_input,
                category="general",
                confidence=0.0,
                clarification="I couldn't understand that. Please try again with a clearer description of your sale or expense.",
            )
        except Exception as e:
            logger.error(f"Gemini API error during parsing: {e}")
            return ParsedTransaction(
                type=TransactionType.SALE,
                amount=0,
                description=raw_input,
                category="general",
                confidence=0.0,
                clarification=f"AI service encountered an error. Please try again or enter the transaction manually.",
            )

    # ─── Daily Summary Generation ───────────────────────

    async def generate_daily_summary(
        self,
        transactions: list[TransactionData],
        language: str = "en",
        date: Optional[str] = None,
    ) -> str:
        """Generate an AI daily summary from transaction data."""
        from datetime import date as date_type

        if date is None:
            date = str(date_type.today())

        # Calculate totals
        total_sales = sum(t.amount for t in transactions if t.type == TransactionType.SALE)
        total_expenses = sum(t.amount for t in transactions if t.type == TransactionType.EXPENSE)
        credit_given = sum(t.amount for t in transactions if t.type == TransactionType.CREDIT_GIVEN)
        credit_received = sum(t.amount for t in transactions if t.type == TransactionType.CREDIT_RECEIVED)
        net_profit = total_sales - total_expenses

        # Build transaction text
        transactions_text = "\n".join(
            f"- {t.type.value}: ₹{t.amount} — {t.description}"
            + (f" (Customer: {t.customer_name})" if t.customer_name else "")
            for t in transactions
        )

        if not self._model:
            return self._mock_daily_summary(
                total_sales, total_expenses, net_profit, credit_given, credit_received, len(transactions), language
            )

        # Select prompt by language
        prompt_template = DAILY_SUMMARY_PROMPT_TE if language == "te" else DAILY_SUMMARY_PROMPT_EN

        prompt = prompt_template.format(
            date=date,
            transactions_text=transactions_text,
            total_sales=f"{total_sales:,.2f}",
            total_expenses=f"{total_expenses:,.2f}",
            net_profit=f"{net_profit:,.2f}",
            credit_given=f"{credit_given:,.2f}",
            credit_received=f"{credit_received:,.2f}",
            transaction_count=len(transactions),
        )

        try:
            response = self._model.generate_content(
                prompt,
                generation_config=GenerationConfig(
                    temperature=0.7,       # More creative for summaries
                    max_output_tokens=500,
                ),
            )
            return response.text.strip()

        except Exception as e:
            logger.error(f"Gemini API error during daily summary: {e}")
            # Fallback summary
            if language == "te":
                return (
                    f"మీరు ఈరోజు ₹{total_sales:,.2f} అమ్మకాలు చేశారు. "
                    f"₹{total_expenses:,.2f} ఖర్చు అయింది. "
                    f"మీ లాభం ₹{net_profit:,.2f}."
                )
            return (
                f"Today you made ₹{total_sales:,.2f} in sales. "
                f"Your expenses were ₹{total_expenses:,.2f}. "
                f"Net profit: ₹{net_profit:,.2f}."
            )

    # ─── Weekly Insight Generation ──────────────────────

    async def generate_weekly_insight(
        self,
        daily_summaries: list[DailySummaryData],
        language: str = "en",
    ) -> dict:
        """Generate weekly business insight from daily summaries."""

        # Calculate weekly totals
        weekly_sales = sum(d.total_sales for d in daily_summaries)
        weekly_expenses = sum(d.total_expenses for d in daily_summaries)
        weekly_profit = weekly_sales - weekly_expenses

        # Find best and worst days
        best_day_data = max(daily_summaries, key=lambda d: d.net_profit)
        worst_day_data = min(daily_summaries, key=lambda d: d.net_profit)

        # Build weekly data text
        weekly_data_text = "\n".join(
            f"- {d.date}: Sales ₹{d.total_sales:,.2f}, Expenses ₹{d.total_expenses:,.2f}, "
            f"Profit ₹{d.net_profit:,.2f}, Transactions: {d.transaction_count}"
            for d in daily_summaries
        )

        if not self._model:
            return {
                "insight": self._mock_weekly_insight(weekly_sales, weekly_expenses, weekly_profit, language),
                "best_day": best_day_data.date,
                "worst_day": worst_day_data.date,
            }

        # Select prompt by language
        prompt_template = WEEKLY_INSIGHT_PROMPT_TE if language == "te" else WEEKLY_INSIGHT_PROMPT_EN

        prompt = prompt_template.format(
            weekly_data_text=weekly_data_text,
            weekly_sales=f"{weekly_sales:,.2f}",
            weekly_expenses=f"{weekly_expenses:,.2f}",
            weekly_profit=f"{weekly_profit:,.2f}",
            best_day=best_day_data.date,
            best_profit=f"{best_day_data.net_profit:,.2f}",
            worst_day=worst_day_data.date,
            worst_profit=f"{worst_day_data.net_profit:,.2f}",
        )

        try:
            response = self._model.generate_content(
                prompt,
                generation_config=GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=400,
                ),
            )

            return {
                "insight": response.text.strip(),
                "best_day": best_day_data.date,
                "worst_day": worst_day_data.date,
            }

        except Exception as e:
            logger.error(f"Gemini API error during weekly insight: {e}")
            if language == "te":
                fallback = (
                    f"ఈ వారం మీ అమ్మకాలు ₹{weekly_sales:,.2f}, ఖర్చులు ₹{weekly_expenses:,.2f}. "
                    f"మీ వారపు లాభం ₹{weekly_profit:,.2f}."
                )
            else:
                fallback = (
                    f"This week your sales were ₹{weekly_sales:,.2f}, expenses ₹{weekly_expenses:,.2f}. "
                    f"Weekly profit: ₹{weekly_profit:,.2f}."
                )
            return {
                "insight": fallback,
                "best_day": best_day_data.date,
                "worst_day": worst_day_data.date,
            }

    # ─── Helper Methods ─────────────────────────────────

    @staticmethod
    def _clean_json_response(text: str) -> str:
        """Remove markdown code block markers from Gemini response."""
        text = text.strip()
        # Remove ```json ... ``` or ``` ... ```
        text = re.sub(r"^```(?:json)?\s*\n?", "", text)
        text = re.sub(r"\n?```\s*$", "", text)
        return text.strip()

    @staticmethod
    def _normalize_transaction_type(type_str: str) -> TransactionType:
        """Normalize transaction type string to enum."""
        type_map = {
            "SALE": TransactionType.SALE,
            "EXPENSE": TransactionType.EXPENSE,
            "CREDIT_GIVEN": TransactionType.CREDIT_GIVEN,
            "CREDIT_RECEIVED": TransactionType.CREDIT_RECEIVED,
            "sale": TransactionType.SALE,
            "expense": TransactionType.EXPENSE,
            "credit_given": TransactionType.CREDIT_GIVEN,
            "credit_received": TransactionType.CREDIT_RECEIVED,
        }
        return type_map.get(type_str, TransactionType.SALE)

    # ─── Mock Responses (when API key not set) ──────────

    @staticmethod
    def _mock_parse(raw_input: str) -> ParsedTransaction:
        """Return mock parsed transaction when Gemini is unavailable."""
        # Simple heuristic mock
        raw_lower = raw_input.lower()

        if any(word in raw_lower for word in ["udhaar", "udhar", "credit", "owe"]):
            if any(word in raw_lower for word in ["wapas", "received", "return", "tirigi"]):
                tx_type = TransactionType.CREDIT_RECEIVED
            else:
                tx_type = TransactionType.CREDIT_GIVEN
        elif any(word in raw_lower for word in ["kharcha", "expense", "bill", "bhara", "paid", "bought", "liya"]):
            tx_type = TransactionType.EXPENSE
        else:
            tx_type = TransactionType.SALE

        # Try to extract amount
        import re
        amounts = re.findall(r'\d+(?:\.\d+)?', raw_input)
        amount = float(amounts[0]) if amounts else 0.0

        return ParsedTransaction(
            type=tx_type,
            amount=amount,
            description=raw_input,
            category="general",
            confidence=0.3,
            clarification="AI service is running without API key. Please set GEMINI_API_KEY for accurate parsing.",
        )

    @staticmethod
    def _mock_daily_summary(
        total_sales: float,
        total_expenses: float,
        net_profit: float,
        credit_given: float,
        credit_received: float,
        count: int,
        language: str,
    ) -> str:
        """Return mock daily summary when Gemini is unavailable."""
        if language == "te":
            return (
                f"మీరు ఈరోజు {count} లావాదేవీలు చేశారు. "
                f"మీ అమ్మకాలు ₹{total_sales:,.2f}, ఖర్చులు ₹{total_expenses:,.2f}. "
                f"మీ లాభం ₹{net_profit:,.2f}. బాగా చేస్తున్నారు!"
            )
        return (
            f"Today you had {count} transactions. "
            f"Sales: ₹{total_sales:,.2f}, Expenses: ₹{total_expenses:,.2f}. "
            f"Net profit: ₹{net_profit:,.2f}. Keep up the good work!"
        )

    @staticmethod
    def _mock_weekly_insight(
        weekly_sales: float,
        weekly_expenses: float,
        weekly_profit: float,
        language: str,
    ) -> str:
        """Return mock weekly insight when Gemini is unavailable."""
        if language == "te":
            return (
                f"ఈ వారం మీ అమ్మకాలు ₹{weekly_sales:,.2f}. "
                f"ఖర్చులు ₹{weekly_expenses:,.2f}. "
                f"మీ వారపు లాభం ₹{weekly_profit:,.2f}. మంచి పని చేస్తున్నారు!"
            )
        return (
            f"This week your total sales were ₹{weekly_sales:,.2f}. "
            f"Expenses: ₹{weekly_expenses:,.2f}. "
            f"Weekly profit: ₹{weekly_profit:,.2f}. Great work!"
        )


# Singleton instance
gemini_client = GeminiClient()
