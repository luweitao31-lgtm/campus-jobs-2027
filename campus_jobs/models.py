from __future__ import annotations

import hashlib
import re
from dataclasses import asdict, dataclass, field
from datetime import datetime
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit


TRACKING_PARAMS = {
    "from", "source", "ref", "refer", "spm", "track", "tracking_id",
    "utm_campaign", "utm_content", "utm_medium", "utm_source", "utm_term",
}


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "")).strip()


def normalize_url(url: str) -> str:
    if not url:
        return ""
    parts = urlsplit(url.strip())
    if parts.scheme.lower() not in ("http", "https") or not parts.netloc:
        return ""
    query = [
        (key, value)
        for key, value in parse_qsl(parts.query, keep_blank_values=True)
        if key.lower() not in TRACKING_PARAMS and not key.lower().startswith("utm_")
    ]
    path = parts.path.rstrip("/") or "/"
    return urlunsplit((parts.scheme.lower(), parts.netloc.lower(), path, urlencode(query), ""))


def identity_key(company: str, title: str, city: str) -> str:
    raw = "|".join(normalize_text(v).lower() for v in (company, title, city))
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:20]


def announcement_identity(company: str, campaign: str, official_url: str) -> str:
    """Return a stable id for an official recruitment announcement."""
    raw = "|".join(
        (normalize_text(company).lower(), normalize_text(campaign).lower(), normalize_url(official_url))
    )
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:20]


@dataclass
class SearchResult:
    title: str
    url: str
    snippet: str = ""
    published_at: str = ""
    source_query: str = ""


@dataclass
class JobRecord:
    id: str
    company: str
    title: str
    city: str = "全国"
    category: str = "其他"
    recruitment_type: str = "校园招聘"
    published_at: str = ""
    first_seen_at: str = field(default_factory=now_iso)
    updated_at: str = field(default_factory=now_iso)
    source_channel: str = "网页搜索"
    source_url: str = ""
    official_url: str = ""
    verification_status: str = "unverified"
    active_status: str = "active"
    last_checked_at: str = ""
    summary: str = ""
    source_query: str = ""
    parent_company: str = ""
    ownership_type: str = "央国企"
    campaign: str = "校园招聘"
    locations: str = "全国"
    deadline: str = ""
    source_type: str = "企业官网"

    def __post_init__(self) -> None:
        self.source_url = normalize_url(self.source_url)
        self.official_url = normalize_url(self.official_url)

    @property
    def apply_url(self) -> str:
        return self.official_url or self.source_url

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "JobRecord":
        allowed = cls.__dataclass_fields__.keys()
        return cls(**{key: data.get(key, "") for key in allowed})
