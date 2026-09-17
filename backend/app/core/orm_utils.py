from typing import Any

from pydantic import BaseModel


def apply_updates(
    instance: Any, data: BaseModel, exclude: set[str] | None = None
) -> None:
    """
    Copy every non-None field from an update schema onto an ORM instance.
    Field names come from the schema itself (data.model_dump), never hardcoded here,
    so this stays correct automatically when fields are added to/removed from the
    Pydantic update schema, no second place to update.

    Args:
        instance (Any): The destination target object (typically a SQLAlchemy or
            SQLModel ORM instance) that will receive the updated attributes.
        data (BaseModel): The source Pydantic schema model instance containing the
            new payload data values to copy over.
        exclude: (set[str] | None): fields that need custom handling instead of a plain setattr
            (e.g. a relationship backed by an association table), it names *behavioral*
            exceptions, not column names, so it doesn't reintroduce hardcoding of the
            plain-attribute fields.
    """
    updates: dict[str, Any] = data.model_dump(
        exclude_none=True, exclude=exclude or set()
    )
    for field, value in updates.items():
        setattr(instance, field, value)
