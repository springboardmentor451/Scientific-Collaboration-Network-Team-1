import json
import logging
from pathlib import Path
from typing import Any

import httpx

logger: logging.Logger = logging.getLogger(__name__)

DOMAINS_URL = "https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json"
CACHE_FILE = Path("./data/research_domains.json")

# global cache — loaded once at startup
_research_domains: set[str] = set()


async def _fetch_remote() -> list[dict[str, Any]]:
    """Fetch raw university dataset from remote."""
    logger.info("fetching university domains from remote")
    async with httpx.AsyncClient() as client:
        response: httpx.Response = await client.get(DOMAINS_URL, timeout=30)
        response.raise_for_status()
        return response.json()


def _convert_into_simple_format(raw_data: list[dict[str, Any]]) -> dict[str, list[str]]:
    """Convert raw list[dict] into simplified {"domains": [...]} format."""
    domains: set[str] = set()
    for institute in raw_data:
        for domain in institute.get("domains", []):
            domains.add(domain)
    return {"domains": sorted(domains)}


def _extract_domains(data: dict[str, list[str]]) -> set[str]:
    """Convert simplified dict into a set of domains."""
    return {domain.lower() for domain in data.get("domains", [])}


def _load_from_cache() -> dict[str, list[str]]:
    """Load simplified domains dict from cache file."""
    logger.info("loading domains from cache")
    return json.loads(CACHE_FILE.read_text())


def _save_to_cache(data: dict[str, list[str]]) -> None:
    """Save simplified domains dict to cache file."""
    CACHE_FILE.parent.mkdir(exist_ok=True)
    CACHE_FILE.write_text(json.dumps(data))
    logger.info("domains cached to %s", CACHE_FILE)


async def fetch_domains() -> set[str]:
    """
    Get domains either from cache or remote.
    Returns a set of lowercase domains.
    """
    if CACHE_FILE.exists():
        data: dict[str, list[str]] = _load_from_cache()
    else:
        raw_data: list[dict[str, Any]] = await _fetch_remote()
        data = _convert_into_simple_format(raw_data)
        _save_to_cache(data)
    return _extract_domains(data)


async def load_domains() -> None:
    global _research_domains
    _research_domains = await fetch_domains()
    logger.info("loaded %d academic domains", len(_research_domains))


def is_research_email(email: str) -> bool:
    domain: str = email.split("@")[-1].lower()
    return domain in _research_domains
