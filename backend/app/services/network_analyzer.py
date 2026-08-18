import networkx as nx
from typing import Dict, Any, List

class NetworkAnalyzerService:
    def __init__(self, edges: List[Dict[str, Any]]):
        self.graph = nx.Graph()
        for edge in edges:
            self.graph.add_edge(
                edge["source"],
                edge["target"],
                weight=edge.get("weight", 1)
            )

    def calculate_centrality() -> Dict[str, Any]:
        return {
            "degree": nx.degree_centrality(self.graph) if len(self.graph) > 0 else {},
            "betweenness": nx.betweenness_centrality(self.graph) if len(self.graph) > 0 else {},
            "eigenvector": nx.eigenvector_centrality(self.graph, max_iter=500) if len(self.graph) > 0 else {}
        }

    def detect_communities() -> List[List[str]]:
        if len(self.graph) == 0:
            return []
        communities = list(nx.community.greedy_modularity_communities(self.graph))
        return [list(c) for c in communities]
