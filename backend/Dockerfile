FROM python:3.13-slim

WORKDIR /app

# Install uv, granian, and uvicorn
RUN pip install --no-cache-dir uv granian uvicorn

COPY pyproject.toml* uv.lock* requirements.txt* ./

RUN if [ -f pyproject.toml ]; then \
        uv sync --frozen --no-dev || uv sync --no-dev; \
    elif [ -f requirements.txt ]; then \
        pip install --no-cache-dir -r requirements.txt; \
    else \
        echo "No dependency file found" && exit 1; \
    fi

COPY . .

EXPOSE 8000

# Default to granian, but allow override with SERVER env
CMD ["sh", "-c", "if [ \"$SERVER\" = \"uvicorn\" ]; then uv run uvicorn app.main:app --host 0.0.0.0 --port 8000; else uv run granian --interface asgi --host 0.0.0.0 --port 8000 app.main:app; fi"]
