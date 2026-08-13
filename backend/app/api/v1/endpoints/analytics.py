from fastapi import APIRouter

router = APIRouter()

@router.get("/metrics")
def get_network_metrics():
    return {
        "density": 0.042,
        "average_clustering_coefficient": 0.68,
        "connected_components": 3,
        "degree_centrality": {"1": 0.85, "2": 0.72}
    }
