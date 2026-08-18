<<<<<<< HEAD
# Scientific-Collaboration-Network-Team-1
=======
# SciConnect

Connecting Science, People & Ideas. A production-ready full-stack enterprise application for analyzing co-authorship graph topologies, researcher metrics (h-index, citations), institutional partner clusters, and grant funding networks.

## Architecture

```
Scientific_Collaboration_network_Analyser/

frontend/
    src/
        assets/
        components/
        layouts/
        pages/
        hooks/
        services/
        utils/
        context/
        router/
        data/
        styles/
        App.tsx
        main.tsx

backend/
    app/
        api/
        models/
        schemas/
        services/
        database/
        core/
        middleware/
        utils/
        uploads/
        main.py

docker-compose.yml
README.md
```

## Production Features

- **Co-Authorship Network Visualizer**: Interactive 2D graph topology with degree centrality, shortest path finder, and cluster filtering.
- **Publication-Grade PDF Export**: Instant export of executive network summaries, edge matrices, and faculty rosters using `html2canvas` and `jspdf`.
- **Global Search Engine**: Navbar search bar instantly indexing researchers, institutions, grant numbers, and paper topics.
- **Citation Intelligence & BibTeX**: Track citation velocity trends and copy standardized BibTeX references.
- **Role-Based Access Control**: Portals for Researchers, Institution Admins, and System Administrators.
- **Clean Production UI**: All developer demo tools (JWT Studio, Schema Explorer, Code Viewers, Debug Panels) have been completely removed from the user interface.

## Quick Start

### Frontend (Vite + React + Tailwind CSS)
```bash
npm install
npm run dev
```

### Backend (FastAPI + SQLAlchemy + PostgreSQL)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
>>>>>>> 9bb7c4a (Initial commit)
