from unittest.mock import AsyncMock, MagicMock

import pytest
from app.utils.file_upload import sanitize_filename, save_publication_file
from fastapi import HTTPException


def test_sanitize_filename_removes_path_traversal() -> None:
    result: str = sanitize_filename("../../../etc/passwd.pdf", 1)
    assert ".." not in result
    assert result.endswith(".pdf")


def test_sanitize_filename_is_unique() -> None:
    a: str = sanitize_filename("paper.pdf", 1)
    b: str = sanitize_filename("paper.pdf", 1)
    assert a != b


def test_sanitize_filename_preserves_extension() -> None:
    result: str = sanitize_filename("thesis.docx", 5)
    assert result.endswith(".docx")


async def test_save_file_rejects_non_academic_extension() -> None:
    mock_file = MagicMock()
    mock_file.filename = "no_file.exe"
    mock_file.content_type = "application/octet-stream"
    mock_file.read = AsyncMock(return_value=b"fake content")

    with pytest.raises(HTTPException) as exc:
        await save_publication_file(mock_file, 1)
    assert exc.value.status_code == 400


async def test_save_file_rejects_oversized_file() -> None:
    mock_file = MagicMock()
    mock_file.filename = "paper.pdf"
    mock_file.content_type = "application/pdf"
    mock_file.read = AsyncMock(return_value=b"x" * (26 * 1024 * 1024))  # 26MB

    with pytest.raises(HTTPException) as exc:
        await save_publication_file(mock_file, 1)
    assert exc.value.status_code == 400
    assert "too large" in exc.value.detail
