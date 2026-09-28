from fastapi import APIRouter
from fastapi.responses import JSONResponse
from langchain_core.messages import AIMessage, HumanMessage
from pydantic import ValidationError

from app.api.schemas import ChatRequest, ChatResponse
from app.core.config import GeminiSettings
from app.core.logging import get_logger
from app.orchestrator.service import run_chat


router = APIRouter()
logger = get_logger("api.chat")


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse | JSONResponse:
    if payload.messages[-1].role != "user":
        return JSONResponse({"detail": "The last message must be from the user."}, status_code=422)
    try:
        settings = GeminiSettings()
    except ValidationError:
        logger.error("Gemini configuration is invalid")
        return JSONResponse({"detail": "The assistant is not configured."}, status_code=503)
    messages = [
        HumanMessage(content=message.content) if message.role == "user" else AIMessage(content=message.content)
        for message in payload.messages
    ]
    result = await run_chat(messages, settings)
    if result.error:
        return JSONResponse({"detail": result.error}, status_code=503)
    return result.response
