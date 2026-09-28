from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.orchestrator.result import AssistantResponse


class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="forbid")
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    messages: list[ChatMessage] = Field(min_length=1, max_length=20)


ChatResponse = AssistantResponse
