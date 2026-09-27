from typing import Protocol

from tools.inventory.models import ComponentLookup, DetailResult, InventoryQuery, SearchResult, StockResult


class InventoryProvider(Protocol):
    async def query_components(self, query: InventoryQuery) -> SearchResult: ...

    async def get_component(self, query: ComponentLookup) -> DetailResult: ...

    async def check_stock(self, query: ComponentLookup) -> StockResult: ...
