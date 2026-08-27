from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit

import yaml


@dataclass(frozen=True)
class Source:
    url: str
    kind: str = "html"
    label: str = "企业官网"
    company: str = ""


@dataclass(frozen=True)
class Company:
    name: str
    parent: str
    ownership: str
    domains: tuple[str, ...]
    sources: tuple[Source, ...]
    wechat_accounts: tuple[str, ...] = field(default_factory=tuple)


def _domain(url: str) -> str:
    return urlsplit(url).netloc.lower().split(":", 1)[0].removeprefix("www.")


def load_registry(path: str | Path, expected_count: int | None = None) -> list[Company]:
    registry_path = Path(path)
    with registry_path.open("r", encoding="utf-8") as handle:
        payload: dict[str, Any] = yaml.safe_load(handle) or {}
    raw_companies = payload.get("companies", [])
    companies: list[Company] = []
    names: set[str] = set()
    for index, item in enumerate(raw_companies, 1):
        name = str(item.get("name", "")).strip()
        if not name or name in names:
            raise ValueError(f"企业来源注册表第 {index} 项名称为空或重复：{name}")
        names.add(name)
        domains = tuple(str(value).lower().removeprefix("www.") for value in item.get("domains", []) if value)
        sources = tuple(Source(**source) for source in item.get("sources", []))
        if item.get("ownership") not in {"央国企", "外企"}:
            raise ValueError(f"{name} 的 ownership 必须是“央国企”或“外企”")
        if not domains or not sources:
            raise ValueError(f"{name} 必须配置官方域名和至少一个来源")
        if any(urlsplit(source.url).scheme != "https" and source.kind != "government" for source in sources):
            raise ValueError(f"{name} 的公开来源必须使用 HTTPS")
        if any(
            source.kind != "government"
            and not any(_domain(source.url) == d or _domain(source.url).endswith(f".{d}") for d in domains)
            for source in sources
        ):
            raise ValueError(f"{name} 的来源 URL 必须属于其官方域名：{sources}")
        if any(source.kind == "government" and not _domain(source.url).endswith("sasac.gov.cn") for source in sources):
            raise ValueError(f"{name} 的政府权威来源目前仅允许国资委官网")
        companies.append(
            Company(
                name=name,
                parent=str(item.get("parent") or name),
                ownership=item["ownership"],
                domains=domains,
                sources=sources,
                wechat_accounts=tuple(item.get("wechat_accounts", [])),
            )
        )
    if expected_count is not None and len(companies) != expected_count:
        raise ValueError(f"企业来源注册表必须包含 {expected_count} 家，当前为 {len(companies)} 家")
    return companies


def domain_allowed(url: str, company: Company) -> bool:
    domain = _domain(url)
    return any(domain == item or domain.endswith(f".{item}") for item in company.domains)
