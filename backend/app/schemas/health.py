from pydantic import BaseModel, Field

from app.utils.settings import APP_VERSION


class HealthResponse(BaseModel):
    """Health response schema"""

    pong: bool = Field(
        ...,
        title="Boolean value indicating whether the API is healthy or not",
    )
    version: str = Field(title="API Version")

    class Config:
        json_schema_extra = {"example": {"pong": True, "version": APP_VERSION}}
