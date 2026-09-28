from abc import ABC, abstractmethod
from collections.abc import Sequence
from typing import Any, TypedDict

from langchain_core.messages import AIMessage, BaseMessage


class LLMError(Exception):
    pass


class ToolDefinition(TypedDict):
    name: str
    description: str
    parameters: dict[str, Any]


class LLMAdapter(ABC):
    @abstractmethod
    async def generate(
        self, messages: Sequence[BaseMessage], tools: list[ToolDefinition]
    ) -> AIMessage:
        raise NotImplementedError
