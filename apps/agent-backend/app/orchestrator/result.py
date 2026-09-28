from langchain_core.messages import BaseMessage, ToolMessage
from pydantic import BaseModel, Field, ValidationError

from app.inventory.models import DetailResult, InventoryProduct, SearchResult, StockResult


class AssistantResponse(BaseModel):
    reply: str = Field(min_length=1)
    products: list[InventoryProduct] = Field(default_factory=list)


class AgentResult(BaseModel):
    response: AssistantResponse
    error: str | None = None


def inventory_products(messages: list[BaseMessage]) -> list[InventoryProduct]:
    products: dict[tuple[str, str], InventoryProduct] = {}
    for message in messages:
        if not isinstance(message, ToolMessage) or message.status == "error" or not isinstance(message.content, str):
            continue
        try:
            if message.name == "query_components":
                result = SearchResult.model_validate_json(message.content)
                components = result.components
            elif message.name == "get_component":
                result = DetailResult.model_validate_json(message.content)
                components = (result.component,) if result.component else ()
            elif message.name == "check_stock":
                stock = StockResult.model_validate_json(message.content)
                key = (stock.shop_id, stock.sku)
                if key in products and stock.quantity is not None:
                    products[key] = products[key].model_copy(update={"stock_quantity": stock.quantity})
                continue
            else:
                continue
        except ValidationError:
            continue
        for component in components:
            products[(result.shop_id, component.sku)] = InventoryProduct(
                **component.model_dump(), shop_id=result.shop_id, currency=result.currency
            )
    return list(products.values())
