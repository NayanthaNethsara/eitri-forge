from typing import NotRequired, TypedDict

from langchain_core.messages import BaseMessage
from langgraph.graph import MessagesState

from app.orchestrator.result import AgentResult


class AgentState(MessagesState):
    tool_rounds: NotRequired[int]
    error: NotRequired[str | None]
    result: NotRequired[AgentResult]


class NodeUpdate(TypedDict, total=False):
    messages: list[BaseMessage]
    tool_rounds: int
    error: str | None


class FinalAnswerUpdate(TypedDict):
    result: AgentResult
