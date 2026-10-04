from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import Config
from routes.health import health


def create_app():
    app = FastAPI()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=Config.CORS_ORIGINS,
        allow_methods=["GET"],
    )
    app.include_router(health)

    @app.exception_handler(404)
    async def not_found(_request, _error):
        return JSONResponse(status_code=404, content={"error": "Endpoint not found"})

    @app.exception_handler(413)
    async def too_large(_request, _error):
        return JSONResponse(status_code=413, content={"error": "Request body is too large"})

    return app


app = create_app()
