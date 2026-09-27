from collections.abc import Sequence

from langchain_core.messages import AIMessage, BaseMessage
from langchain_core.utils.json_schema import dereference_refs
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import GeminiSettings
from app.core.logging import get_logger
from app.orchestrator.llm.base import LLMAdapter, LLMError


logger = get_logger("llm.gemini")


class GeminiAdapter(LLMAdapter):
    def __init__(self, settings: GeminiSettings) -> None:
        connection = (
            {"api_key": settings.api_key.get_secret_value(), "vertexai": False}
            if settings.provider == "gemini"
            else {"project": settings.project, "location": settings.location, "vertexai": True}
        )
        self._model = ChatGoogleGenerativeAI(
            model=settings.model,
            timeout=60,
            max_retries=2,
            **connection,
        )

    async def generate(
        self, messages: Sequence[BaseMessage], tools: list[dict]
    ) -> AIMessage:
        definitions = []
        for tool in tools:
            parameters = dereference_refs(tool["parameters"])
            parameters.pop("$defs", None)
            parameters.pop("additionalProperties", None)
            definitions.append({**tool, "parameters": parameters})
        model = self._model.bind_tools(definitions) if definitions else self._model
        try:
            return await model.ainvoke(list(messages))
        except Exception as error:
            logger.error("Gemini request failed: %s", type(error).__name__)
            raise LLMError("Gemini could not complete the request.") from error
