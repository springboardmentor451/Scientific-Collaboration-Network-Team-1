import uuid
from pathlib import Path
from typing import Final

from fastapi import HTTPException, UploadFile

ALLOWED_EXTENSIONS: Final[set[str]] = {".pdf", ".docx"}
ALLOWED_CONTENT_TYPES: Final[set[str]] = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
MAX_FILE_SIZE: Final[int] = 25 * 1024 * 1024
UPLOAD_DIR: Final[Path] = Path("uploads/publications")


def ensure_upload_dir() -> None:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def sanitize_filename(original: str, publication_id: int) -> str:
    """Generate a safe server-side filename, never trust client filename."""
    suffix: str = Path(original).suffix.lower()
    unique: str = uuid.uuid4().hex
    return f"pub_{publication_id}_{unique}{suffix}"


async def save_publication_file(file: UploadFile, publication_id: int) -> str:
    if not file.filename:
        raise HTTPException(status_code=400, detail="no filename provided")
    suffix: str = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, detail=f"file type not allowed, use {ALLOWED_EXTENSIONS}"
        )
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="invalid content type")
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"file too large, maximum {MAX_FILE_SIZE // (1024 * 1024)}MB",
        )
    ensure_upload_dir()
    safe_name: str = sanitize_filename(file.filename, publication_id)
    file_path: Path = UPLOAD_DIR / safe_name
    file_path.write_bytes(content)
    return str(file_path)
