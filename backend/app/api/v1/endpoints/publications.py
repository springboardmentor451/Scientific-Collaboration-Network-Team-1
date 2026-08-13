from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def list_publications():
    return [{"id": 101, "title": "Graph Neural Networks in Co-Authorship Graphs", "year": 2024, "citations": 128}]
