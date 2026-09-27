from langchain_core.messages import AIMessage, HumanMessage

from app.core.config import GeminiSettings
from app.inventory.repository import InventoryRepository
from app.inventory.tools import create_inventory_tools
from app.orchestrator.graph import create_agent
from app.orchestrator.llm.gemini import GeminiAdapter


async def run_chat(messages: list[HumanMessage | AIMessage], settings: GeminiSettings) -> tuple[str, bool]:
    tools = create_inventory_tools(InventoryRepository.from_bundled_catalog())
    agent = create_agent(GeminiAdapter(settings), tools)
    result = await agent.ainvoke({"messages": messages})
    return result["messages"][-1].text, bool(result.get("error"))
