import json
from typing import Any, Literal

from langchain_core.messages import AIMessage, BaseMessage, ToolMessage
from langchain_core.tools import BaseTool
from pydantic import BaseModel, ValidationError

from app.orchestrator.state import AgentState, NodeUpdate


async def execute_inventory_tools(
    state: AgentState, *, tools: dict[str, BaseTool], max_tool_rounds: int
) -> NodeUpdate:
    message = state["messages"][-1]
    if not isinstance(message, AIMessage) or not message.tool_calls:
        return {"error": "No inventory calls were provided."}
    calls = message.tool_calls
    rounds = state.get("tool_rounds", 0)
    if rounds >= max_tool_rounds:
        error = "The inventory lookup limit was reached. Please narrow your request."
        error_messages = [
            ToolMessage(content=error, tool_call_id=call["id"], status="error")
            for call in calls
        ]
        return {
            "messages": [*error_messages, AIMessage(content=error)],
            "error": error,
        }
    messages: list[BaseMessage] = []
    for call in calls:
        content, failed = await invoke_inventory_tool(tools, call["name"], call["args"])
        messages.append(
            ToolMessage(
                content=content,
                name=call["name"],
                tool_call_id=call["id"],
                status="error" if failed else "success",
            )
        )
    return {"messages": messages, "tool_rounds": rounds + 1, "error": None}


async def invoke_inventory_tool(
    tools: dict[str, BaseTool], name: str, arguments: dict[str, Any]
) -> tuple[str, bool]:
    if name not in tools:
        return "Unknown inventory tool. Use one of the provided tool names.", True
    try:
        result = await tools[name].ainvoke(arguments)
    except ValidationError as error:
        details = error.errors(include_input=False, include_context=False, include_url=False)
        return json.dumps(details), True
    except Exception:
        return "Inventory lookup failed. Retry later; do not assume availability.", True
    if not isinstance(result, BaseModel):
        return "Inventory tool returned an invalid response.", True
    return result.model_dump_json(), False


def route_inventory_result(state: AgentState) -> Literal["model", "final_answer"]:
    return "final_answer" if state.get("error") else "model"
