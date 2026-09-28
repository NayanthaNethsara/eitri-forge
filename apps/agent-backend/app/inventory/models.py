from datetime import datetime
from typing import Annotated, Literal, Self

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, model_validator


Category = Literal["cpu", "motherboard", "ram", "gpu", "psu", "cooler", "case"]
Socket = Literal["AM4", "AM5", "LGA1700"]
MemoryType = Literal["DDR4", "DDR5"]
FormFactor = Literal["ATX", "Micro-ATX", "Mini-ITX"]
PositiveInteger = Annotated[int, Field(gt=0)]
NonNegativeInteger = Annotated[int, Field(ge=0)]
Identifier = Annotated[str, Field(min_length=1, max_length=100, pattern=r"^[a-zA-Z0-9_-]+$")]


class InventoryModel(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True, frozen=True)


class CpuSpecs(InventoryModel):
    category: Literal["cpu"]
    socket: Socket
    memory_type: MemoryType
    cores: PositiveInteger
    tdp_watts: PositiveInteger
    max_power_watts: PositiveInteger

    @model_validator(mode="after")
    def validate_power(self) -> Self:
        if self.max_power_watts < self.tdp_watts:
            raise ValueError("max_power_watts must be at least tdp_watts")
        return self


class MotherboardSpecs(InventoryModel):
    category: Literal["motherboard"]
    socket: Socket
    memory_type: MemoryType
    form_factor: FormFactor
    memory_slots: PositiveInteger
    max_memory_gb: PositiveInteger


class RamSpecs(InventoryModel):
    category: Literal["ram"]
    memory_type: MemoryType
    capacity_gb: PositiveInteger
    modules: PositiveInteger
    speed_mt_s: PositiveInteger


class GpuSpecs(InventoryModel):
    category: Literal["gpu"]
    vram_gb: PositiveInteger
    power_watts: PositiveInteger
    length_mm: PositiveInteger
    recommended_psu_watts: PositiveInteger


class PsuSpecs(InventoryModel):
    category: Literal["psu"]
    wattage: PositiveInteger
    form_factor: Literal["ATX", "SFX"]
    efficiency: Literal["80 Plus Bronze", "80 Plus Gold"]


class CoolerSpecs(InventoryModel):
    category: Literal["cooler"]
    supported_sockets: Annotated[tuple[Socket, ...], Field(min_length=1)]
    cooling_capacity_watts: PositiveInteger
    height_mm: PositiveInteger


class CaseSpecs(InventoryModel):
    category: Literal["case"]
    supported_motherboard_form_factors: Annotated[tuple[FormFactor, ...], Field(min_length=1)]
    supported_psu_form_factors: Annotated[tuple[Literal["ATX", "SFX"], ...], Field(min_length=1)]
    max_gpu_length_mm: PositiveInteger
    max_cooler_height_mm: PositiveInteger


HardwareSpecs = Annotated[
    CpuSpecs | MotherboardSpecs | RamSpecs | GpuSpecs | PsuSpecs | CoolerSpecs | CaseSpecs,
    Field(discriminator="category"),
]


class Component(InventoryModel):
    sku: Identifier
    name: Annotated[str, Field(min_length=1, max_length=200)]
    price_minor: NonNegativeInteger = Field(description="Unit price in the catalog currency's minor units; USD cents.")
    stock_quantity: NonNegativeInteger
    specs: HardwareSpecs
    image_url: HttpUrl | None = None


class InventoryProduct(Component):
    shop_id: Identifier
    currency: Annotated[str, Field(pattern=r"^[A-Z]{3}$")]


class Catalog(InventoryModel):
    shop_id: Identifier
    currency: Annotated[str, Field(pattern=r"^[A-Z]{3}$")]
    components: tuple[Component, ...]

    @model_validator(mode="after")
    def validate_unique_skus(self) -> Self:
        skus = [component.sku for component in self.components]
        if len(skus) != len(set(skus)):
            raise ValueError("Component SKUs must be unique within a shop")
        return self


class InventoryQuery(InventoryModel):
    category: Category = Field(description="Exact category: cpu, motherboard, ram, gpu, psu, cooler, or case.")
    max_price_minor: NonNegativeInteger | None = Field(default=None, description="Inclusive unit price ceiling in the shop currency's minor units.")
    in_stock_only: bool = Field(default=True, description="Exclude components with zero stock when true.")
    socket: Socket | None = Field(default=None, description="CPU socket; applicable to CPUs, motherboards, and cooler socket support.")
    memory_type: MemoryType | None = Field(default=None, description="DDR generation for CPUs, motherboards, and RAM.")
    min_memory_gb: PositiveInteger | None = Field(default=None, description="Minimum total RAM kit capacity; RAM only.")
    min_vram_gb: PositiveInteger | None = Field(default=None, description="Minimum GPU video memory; GPUs only.")
    min_psu_watts: PositiveInteger | None = Field(default=None, description="Minimum rated PSU output; PSUs only.")
    motherboard_form_factor: FormFactor | None = Field(default=None, description="Motherboard size or case motherboard-size support; motherboards and cases only.")
    limit: Annotated[int, Field(ge=1, le=100)] = Field(default=20, description="Maximum returned items, sorted by price then SKU. total reports all matches.")

    @model_validator(mode="after")
    def validate_filter_categories(self) -> Self:
        allowed_categories = {
            "socket": {"cpu", "motherboard", "cooler"},
            "memory_type": {"cpu", "motherboard", "ram"},
            "min_memory_gb": {"ram"},
            "min_vram_gb": {"gpu"},
            "min_psu_watts": {"psu"},
            "motherboard_form_factor": {"motherboard", "case"},
        }
        for field, categories in allowed_categories.items():
            if getattr(self, field) is not None and self.category not in categories:
                raise ValueError(f"{field} is not applicable to category {self.category}")
        return self


class ComponentLookup(InventoryModel):
    sku: Identifier = Field(description="Exact shop SKU returned by query_components; names are not accepted.")


class SearchResult(InventoryModel):
    shop_id: Identifier
    currency: str
    total: NonNegativeInteger
    components: tuple[Component, ...]


class DetailResult(InventoryModel):
    shop_id: Identifier
    currency: str
    sku: Identifier
    component: Component | None = Field(description="Null if the SKU is not present in this shop.")


class StockResult(InventoryModel):
    shop_id: Identifier
    sku: Identifier
    quantity: NonNegativeInteger | None = Field(description="Null means unknown SKU; zero means known but out of stock.")
    checked_at: datetime = Field(description="UTC time the provider was queried. Stock is a snapshot, not a reservation.")
