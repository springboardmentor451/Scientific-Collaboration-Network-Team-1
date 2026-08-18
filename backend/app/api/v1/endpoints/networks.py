from fastapi import APIRouter

router = APIRouter()

@router.get("/graph")
def get_collaboration_graph():
    return {
        "nodes": [
            {"id": "1", "label": "Dr. Elena Rostova", "department": "AI Lab"},
            {"id": "2", "label": "Prof. Marcus Vance", "department": "Quantum Computing"}
        ],
        "edges": [
            {"source": "1", "target": "2", "weight": 5, "papers_count": 3}
        ]
    }
