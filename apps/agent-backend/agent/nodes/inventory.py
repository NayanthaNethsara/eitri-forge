import json

from langchain_core.messages import AIMessage, ToolMessage
from langchain_core.tools import BaseTool
from pydantic import BaseModel, ValidationError

from agent.state import AgentState


async def execute_inventory_tools(
    state: AgentState, *, tools: dict[str, BaseTool], max_tool_rounds: int
) -> dict:
    calls = state["messages"][-1].tool_calls
    rounds = state.get("tool_rounds", 0)
    if rounds >= max_tool_rounds:
        error = "The inventory lookup limit was reached. Please narrow your request."
        messages = [
            ToolMessage(content=error, tool_call_id=call["id"], status="error")
            for call in calls
        ]
        return {
            "messages": [*messages, AIMessage(content=error)],
            "error": error,
        }
    messages = []
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
    tools: dict[str, BaseTool], name: str, arguments: dict
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
