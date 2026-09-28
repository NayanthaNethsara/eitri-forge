from typing import Literal

from langchain_core.messages import AIMessage, SystemMessage

from app.orchestrator.llm.base import LLMAdapter, LLMError, ToolDefinition
from app.orchestrator.prompts import SYSTEM_PROMPT
from app.orchestrator.state import AgentState, NodeUpdate


async def call_model(state: AgentState, *, llm: LLMAdapter, tools: list[ToolDefinition]) -> NodeUpdate:
    if not state.get("messages"):
        error = "Please provide a message for the assistant."
        return {"messages": [AIMessage(content=error)], "error": error}
    try:
        response = await llm.generate(
            [SystemMessage(content=SYSTEM_PROMPT), *state["messages"]], tools
        )
    except LLMError:
        error = "The assistant is temporarily unavailable. Please try again."
        return {"messages": [AIMessage(content=error)], "error": error}
    return {"messages": [response], "error": None}


def route_model_response(state: AgentState) -> Literal["inventory", "final_answer"]:
    message = state["messages"][-1]
    if not state.get("error") and isinstance(message, AIMessage) and message.tool_calls:
        return "inventory"
    return "final_answer"
