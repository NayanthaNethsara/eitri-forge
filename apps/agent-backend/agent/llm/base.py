from abc import ABC, abstractmethod
from collections.abc import Sequence

from langchain_core.messages import AIMessage, BaseMessage


class LLMError(Exception):
    pass


class LLMAdapter(ABC):
    @abstractmethod
    async def generate(
        self, messages: Sequence[BaseMessage], tools: list[dict]
    ) -> AIMessage:
        raise NotImplementedError
