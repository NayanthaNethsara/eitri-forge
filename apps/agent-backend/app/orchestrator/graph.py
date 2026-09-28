from functools import partial

from langchain_core.tools import BaseTool
from langgraph.graph import END, START, StateGraph
from langgraph.graph.state import CompiledStateGraph

from app.orchestrator.llm.base import LLMAdapter, ToolDefinition
from app.orchestrator.nodes.final_answer import final_answer
from app.orchestrator.nodes.inventory import execute_inventory_tools, route_inventory_result
from app.orchestrator.nodes.model import call_model, route_model_response
from app.orchestrator.state import AgentState


def create_agent(
    llm: LLMAdapter,
    tools: list[BaseTool],
    max_tool_rounds: int = 3,
) -> CompiledStateGraph:
    if max_tool_rounds < 1:
        raise ValueError("max_tool_rounds must be positive")
    if len({tool.name for tool in tools}) != len(tools):
        raise ValueError("Tool names must be unique")
    tool_schemas: list[ToolDefinition] = [
        {
            "name": tool.name,
            "description": tool.description,
            "parameters": tool.get_input_schema().model_json_schema(),
        }
        for tool in tools
    ]
    graph = StateGraph(AgentState)
    graph.add_node("final_answer", final_answer)
    graph.add_node("model", partial(call_model, llm=llm, tools=tool_schemas))
    graph.add_node(
        "inventory",
        partial(
            execute_inventory_tools,
            tools={tool.name: tool for tool in tools},
            max_tool_rounds=max_tool_rounds,
        ),
    )
    graph.add_edge(START, "model")
    graph.add_conditional_edges(
        "model", route_model_response,
        {"inventory": "inventory", "final_answer": "final_answer"},
    )
    graph.add_conditional_edges(
        "inventory",
        route_inventory_result,
        {"model": "model", "final_answer": "final_answer"},
    )
    graph.add_edge("final_answer", END)
    return graph.compile()
