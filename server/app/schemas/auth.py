"""Auth schemas matching frontend types."""
from pydantic import BaseModel, Field, ConfigDict


class DonorProfile(BaseModel):
    full_name: str
    phone: str
    organization: str | None = None
    aadhaar_last4: str | None = None
    aadhaar_consent: bool
    id_front_image: str | None = None
    id_back_image: str | None = None


class VolunteerProfile(BaseModel):
    full_name: str
    phone: str
    city: str | None = None
    has_vehicle: bool = False


class DonorRegisterRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    username: str
    password: str
    full_name: str = Field(..., alias="fullName")
    phone: str
    organization: str | None = Field(None, alias="organization")
    aadhaar_last4: str | None = Field(None, alias="aadhaarLast4")
    aadhaar_consent: bool = Field(..., alias="aadhaarConsent")
    id_front_image: str | None = Field(None, alias="idFrontImage")
    id_back_image: str | None = Field(None, alias="idBackImage")


class VolunteerRegisterRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    username: str
    password: str
    full_name: str = Field(..., alias="fullName")
    phone: str
    city: str | None = Field(None, alias="city")
    has_vehicle: bool = Field(False, alias="hasVehicle")


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    token: str
    user: dict


class UserResponse(BaseModel):
    id: str
    role: str  # DONOR | VOLUNTEER
    username: str
    createdAt: str
    donor: DonorProfile | None = None
    volunteer: VolunteerProfile | None = None
