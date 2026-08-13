"""Helper utility functions for graph calculations & metrics."""
def calculate_h_index(citations_list: list[int]) -> int:
    citations_list.sort(reverse=True)
    h_index = 0
    for i, citations in enumerate(citations_list):
        if citations >= i + 1:
            h_index = i + 1
        else:
            break
    return h_index
