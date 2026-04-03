from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Dukaan Dosth AI Service")

class ParseRequest(BaseModel):
    text: str
    language: str = "en"

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/ai/parse")
async def parse_transaction(request: ParseRequest):
    # Placeholder for Gemini integration
    return {
        "raw_text": request.text,
        "status": "parsed_placeholder",
        "data": {
            "type": "expense",
            "amount": 0.0,
            "category": "unclassified",
            "description": request.text
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
