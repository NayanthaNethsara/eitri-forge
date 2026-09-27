from langchain_core.tools import BaseTool, tool

from tools.inventory.models import (
    ComponentLookup,
    DetailResult,
    InventoryQuery,
    InventoryModel,
    SearchResult,
    StockResult,
)
from tools.inventory.provider import InventoryProvider


class SearchArguments(InventoryModel):
    query: InventoryQuery


class LookupArguments(InventoryModel):
    query: ComponentLookup


def create_inventory_tools(provider: InventoryProvider) -> list[BaseTool]:

    @tool(args_schema=SearchArguments)
    async def query_components(query: InventoryQuery) -> SearchResult:
        """Search this shop by category, inclusive budget, and hardware specs.

        All supplied filters must match. Stock must be positive by default.
        Results are sorted by price then SKU; total counts matches before limit.
        Empty components means no matches. Use exact returned SKUs for detail and stock.
        Prices use the returned currency's minor units. Matching filters alone do
        not establish complete build compatibility.
        """
        return await provider.query_components(query)

    @tool(args_schema=LookupArguments)
    async def get_component(query: ComponentLookup) -> DetailResult:
        """Get price, stock snapshot, and hardware specifications by exact shop SKU.

        Specs include socket, DDR generation, power ratings, and dimensions where
        applicable. An unknown SKU returns component=null. These are catalog specs,
        not measured benchmarks or a guarantee of whole-build compatibility.
        """
        return await provider.get_component(query)

    @tool(args_schema=LookupArguments)
    async def check_stock(query: ComponentLookup) -> StockResult:
        """Check availability by exact shop SKU without reserving stock.

        quantity=null means unknown SKU; quantity=0 means out of stock.
        checked_at is the lookup time in UTC. The mock provider returns its sample
        stock; a live provider queries the shop on each invocation.
        """
        return await provider.check_stock(query)

    return [query_components, get_component, check_stock]
