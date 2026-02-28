"""Donation schemas matching frontend types."""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional


class DonationItem(BaseModel):
    name: str
    quantity: int
    unit: str  # packs | kg | plates | boxes


class Location(BaseModel):
    label: str
    address: str
    lat: float
    lng: float


class AssignedVolunteer(BaseModel):
    id: str
    name: str
    phoneMasked: str


class DonationCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    donorName: str = Field(..., alias="donorName")
    donorPhoneMasked: str = Field(..., alias="donorPhoneMasked")
    pickupBy: str = Field(..., alias="pickupBy")
    category: str
    servingsEstimate: int = Field(..., alias="servingsEstimate")
    items: list[DonationItem]
    pickupLocation: Location
    notes: Optional[str] = None
    dietaryTags: Optional[list[str]] = Field(None, alias="dietaryTags")


class DonationResponse(BaseModel):
    id: str
    donorName: str
    donorPhoneMasked: str
    createdAt: str
    pickupBy: str
    status: str
    category: str
    servingsEstimate: int
    items: list[DonationItem]
    pickupLocation: Location
    notes: Optional[str] = None
    dietaryTags: Optional[list[str]] = None
    assignedVolunteer: Optional[AssignedVolunteer] = None
