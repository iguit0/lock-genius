from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


def configure_middlewares(app: FastAPI) -> None:
    app.add_middleware(
        CORSMiddleware,
        allow_origins={"*"},
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


def configure_routes(app: FastAPI) -> None:
    """Configure routes for the application"""
    from app.routers.vault_router import router as vault_router
    from app.routers.health_router import router as health_router

    routes = (health_router, vault_router)

    for router in routes:
        app.include_router(router)


def create_fastapi_application() -> FastAPI:
    """Create FastAPI application"""
    from app.utils.settings import APP_VERSION

    from .openapi.generator import generate_description

    description_md = generate_description()

    app = FastAPI(
        title="Lock Genius API",
        description=description_md,
        version=APP_VERSION,
        openapi_tags=[
            {
                "name": "Vault",
                "description": "Password Vault Services",
            },
            {
                "name": "Utils",
                "description": "Utility Services",
            },
        ],
    )

    configure_middlewares(app)
    configure_routes(app)

    return app