import argparse
import asyncio

from google.auth.exceptions import GoogleAuthError
from langchain_core.messages import HumanMessage
from pydantic import ValidationError

from agent.graph import create_agent
from agent.llm.gemini import GeminiAdapter
from core.config import ROOT_ENV_FILE, GeminiSettings, LoggingSettings
from core.logging import configure_logging
from tools.inventory.mock import MockInventoryProvider
from tools.inventory.registry import create_inventory_tools


async def run_agent(prompt: str, settings: GeminiSettings) -> dict:
    tools = create_inventory_tools(MockInventoryProvider.from_bundled_catalog())
    agent = create_agent(GeminiAdapter(settings), tools)
    return await agent.ainvoke({"messages": [HumanMessage(content=prompt)]})


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Eitri with Gemini and demo inventory.")
    parser.add_argument("prompt", help="A hardware or inventory question for the agent.")
    parser.add_argument("--env-file", default=str(ROOT_ENV_FILE), help="Environment file; defaults to the repository root .env.")
    arguments = parser.parse_args()
    if not arguments.prompt.strip():
        parser.error("prompt must not be blank")
    try:
        configure_logging(LoggingSettings(_env_file=arguments.env_file).level)
        settings = GeminiSettings(_env_file=arguments.env_file)
        result = asyncio.run(run_agent(arguments.prompt, settings))
    except (ValidationError, GoogleAuthError) as error:
        parser.error(str(error))
    print(result["messages"][-1].text)
    if result.get("error"):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
