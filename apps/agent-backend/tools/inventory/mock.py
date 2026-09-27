from datetime import datetime, timezone
from importlib.resources import files

from tools.inventory.models import (
    CaseSpecs,
    Catalog,
    Component,
    ComponentLookup,
    CoolerSpecs,
    CpuSpecs,
    DetailResult,
    GpuSpecs,
    InventoryQuery,
    MotherboardSpecs,
    PsuSpecs,
    RamSpecs,
    SearchResult,
    StockResult,
)


class MockInventoryProvider:
    def __init__(self, catalog: Catalog) -> None:
        self._catalog = catalog
        self._components = {component.sku: component for component in catalog.components}

    @classmethod
    def from_bundled_catalog(cls) -> "MockInventoryProvider":
        data = files("tools.inventory").joinpath("data/catalog.json").read_text(encoding="utf-8")
        return cls(Catalog.model_validate_json(data))

    async def query_components(self, query: InventoryQuery) -> SearchResult:
        matches = sorted(
            (component for component in self._components.values() if self._matches(component, query)),
            key=lambda component: (component.price_minor, component.sku),
        )
        return SearchResult(
            shop_id=self._catalog.shop_id,
            currency=self._catalog.currency,
            total=len(matches),
            components=tuple(matches[:query.limit]),
        )

    async def get_component(self, query: ComponentLookup) -> DetailResult:
        return DetailResult(
            shop_id=self._catalog.shop_id,
            currency=self._catalog.currency,
            sku=query.sku,
            component=self._components.get(query.sku),
        )

    async def check_stock(self, query: ComponentLookup) -> StockResult:
        component = self._components.get(query.sku)
        return StockResult(
            shop_id=self._catalog.shop_id,
            sku=query.sku,
            quantity=component.stock_quantity if component is not None else None,
            checked_at=datetime.now(timezone.utc),
        )

    @staticmethod
    def _matches(component: Component, query: InventoryQuery) -> bool:
        specs = component.specs
        if specs.category != query.category:
            return False
        if query.in_stock_only and component.stock_quantity == 0:
            return False
        if query.max_price_minor is not None and component.price_minor > query.max_price_minor:
            return False
        if query.socket is not None:
            sockets = specs.supported_sockets if isinstance(specs, CoolerSpecs) else (specs.socket,)
            if query.socket not in sockets:
                return False
        if query.memory_type is not None and isinstance(specs, (CpuSpecs, MotherboardSpecs, RamSpecs)):
            if specs.memory_type != query.memory_type:
                return False
        if query.min_memory_gb is not None and isinstance(specs, RamSpecs):
            if specs.capacity_gb < query.min_memory_gb:
                return False
        if query.min_vram_gb is not None and isinstance(specs, GpuSpecs):
            if specs.vram_gb < query.min_vram_gb:
                return False
        if query.min_psu_watts is not None and isinstance(specs, PsuSpecs):
            if specs.wattage < query.min_psu_watts:
                return False
        if query.motherboard_form_factor is not None:
            sizes = specs.supported_motherboard_form_factors if isinstance(specs, CaseSpecs) else (specs.form_factor,)
            if query.motherboard_form_factor not in sizes:
                return False
        return True
