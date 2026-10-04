from fastapi import APIRouter

health = APIRouter()


@health.get("/health")
def get_health():
    return {"status": "ok", "service": "airforge", "phase": 1}
