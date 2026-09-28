from langchain_core.messages import AIMessage

from app.orchestrator.result import AgentResult, AssistantResponse, inventory_products
from app.orchestrator.state import AgentState, FinalAnswerUpdate


def final_answer(state: AgentState) -> FinalAnswerUpdate:
    error = state.get("error")
    messages = state["messages"]
    message = messages[-1] if messages else None
    reply = (
        message.text.strip()
        if isinstance(message, AIMessage) and not message.tool_calls
        else ""
    )
    if not error and not reply:
        error = "The assistant returned an empty answer. Please try again."
    return {
        "result": AgentResult(
            response=AssistantResponse(
                reply=error or reply,
                products=[] if error else inventory_products(messages),
            ),
            error=error,
        )
    }
