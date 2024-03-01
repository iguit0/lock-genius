import secrets
import string

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/passwords")


# TODO: Dynamic this
class GeneratePasswordOptions(BaseModel):
    length: int = 12
    uppercase: bool = True
    lowercase: bool = True
    numbers: bool = True
    symbols: bool = True


@router.post(
    "/generate",
    summary="Generate a strong password",
    response_description="Returns a strong password based on the provided options",
    tags=["Password"],
)
def generate_password(options: GeneratePasswordOptions):
    """Generate a strong password given the parameters"""
    char_sets = {
        "uppercase": string.ascii_uppercase,
        "lowercase": string.ascii_lowercase,
        "numbers": string.digits,
        "symbols": string.punctuation,
    }

    selected_sets = [
        char_sets[charset]
        for charset in char_sets
        if getattr(options, charset)
    ]

    if not selected_sets:
        raise HTTPException(
            status_code=400,
            detail="At least one character set should be selected",
        )

    chars = "".join(selected_sets)
    password = "".join(secrets.choice(chars) for _ in range(options.length))
    return {"password": password}
