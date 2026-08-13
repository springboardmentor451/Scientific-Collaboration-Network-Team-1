from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def list_researchers(limit: int = 100):
    return [{"id": 1, "name": "Dr. Elena Rostova", "institution": "MIT", "h_index": 42}]

@router.get("/{researcher_id}")
def get_researcher(researcher_id: int):
    return {"id": researcher_id, "name": "Dr. Elena Rostova", "institution": "MIT"}
