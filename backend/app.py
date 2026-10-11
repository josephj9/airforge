from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import Config
from routes.health import health


def create_app():
    app = FastAPI()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=Config.CORS_ORIGINS,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(health)

    @app.exception_handler(404)
    async def not_found(_request, _error):
        return JSONResponse(status_code=404, content={"error": "Endpoint not found"})

    @app.exception_handler(413)
    async def too_large(_request, _error):
        return JSONResponse(status_code=413, content={"error": "Request body is too large"})

    @app.post('/api/generate')
    async def generate_website(sketch: UploadFile = File(...)):
        contents = await sketch.read()

        print("Received file:", sketch.filename)
        print("Content type:", sketch.content_type)
        print("File size:", len(contents), "bytes")

        return {
            "message": "Sketch received successfully",
            "filename": sketch.filename,
            "content_type": sketch.content_type,
            "size": len(contents),
        }
    return app
app = create_app()
