import argparse
import asyncio

from google.auth.exceptions import GoogleAuthError
from langchain_core.messages import HumanMessage
from pydantic import ValidationError

from app.core.config import ROOT_ENV_FILE, GeminiSettings, LoggingSettings
from app.core.logging import configure_logging
from app.orchestrator.service import run_chat
from app.orchestrator.result import AgentResult


async def run_agent(prompt: str, settings: GeminiSettings) -> AgentResult:
    return await run_chat([HumanMessage(content=prompt)], settings)


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
    print(result.response.reply)
    if result.error:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
