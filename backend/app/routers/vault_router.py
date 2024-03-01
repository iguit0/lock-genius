from .base import APIRouter, NoCache

router = APIRouter(prefix="/api/v1/vault")


@router.get(
    "",
    summary="Retrieve item",
    dependencies=(NoCache,),
    tags=["Vault"],
)
def retrieve_item():
    return {"Testing OK!"}
