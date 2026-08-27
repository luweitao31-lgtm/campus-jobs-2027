from __future__ import annotations

import json
import re
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from datetime import date
from html import unescape
from typing import Any, Iterable
from urllib.parse import urljoin, urlsplit

from bs4 import BeautifulSoup

from .crawler import Page, PageCrawler
from .models import JobRecord, announcement_identity, normalize_text, normalize_url
from .registry import Company, Source, domain_allowed


COHORT_RE = re.compile(r"(?:2027\s*(?:届|年度)|(?<!20)27\s*届)", re.I)
FORMAL_RE = re.compile(r"校园招聘|校招|秋招|秋季招聘|春招|春季招聘|提前批|campus\s+(?:recruit|hiring)|graduate\s+(?:program|role|job)", re.I)
INTERN_RE = re.compile(r"实习|intern(?:ship)?", re.I)
NEWS_RE = re.compile(r"洞察|薪酬报告|求职攻略|时间线|信息差|复盘|盘点|宣讲会回顾", re.I)
DATE_RE = re.compile(r"(20\d{2})[年./-](\d{1,2})[月./-](\d{1,2})日?")
DEADLINE_RE = re.compile(r"(?:截止|网申截止|申请截止)[^\d]{0,8}(20\d{2}[年./-]\d{1,2}[月./-]\d{1,2}日?)")
CITY_RE = re.compile(r"(北京|上海|广州|深圳|杭州|南京|苏州|成都|武汉|西安|重庆|天津|长沙|合肥|厦门|青岛|济南|郑州|东莞|佛山|珠海|宁波|无锡|全国|海外)")


@dataclass(frozen=True)
class Candidate:
    title: str
    url: str
    text: str = ""
    published_at: str = ""


def clean_text(value: str) -> str:
    decoded = unescape(value or "")
    if "<" not in decoded:
        return normalize_text(decoded)
    return normalize_text(BeautifulSoup(decoded, "html.parser").get_text(" ", strip=True))


def is_formal_2027(text: str) -> bool:
    value = clean_text(text)
    return bool(COHORT_RE.search(value) and FORMAL_RE.search(value) and not INTERN_RE.search(value) and not NEWS_RE.search(value))


def campaign_of(text: str) -> str:
    if "提前批" in text:
        return "提前批"
    if "春招" in text or "春季" in text:
        return "春招"
    if "秋招" in text or "秋季" in text:
        return "秋招"
    return "校园招聘"


def _iso_date(value: str) -> str:
    match = DATE_RE.search(value or "")
    if not match:
        return ""
    try:
        return date(*(int(part) for part in match.groups())).isoformat()
    except ValueError:
        return ""


def _rss_candidates(page: Page) -> list[Candidate]:
    root = ET.fromstring(page.raw)
    items: list[Candidate] = []
    for item in root.findall(".//item"):
        link = clean_text(item.findtext("link") or "")
        title = clean_text(item.findtext("title") or "")
        description = clean_text(item.findtext("description") or "")
        items.append(Candidate(title, link, description, clean_text(item.findtext("pubDate") or "")))
    return items


def _walk_json(value: Any) -> Iterable[dict[str, Any]]:
    if isinstance(value, dict):
        if any(key in value for key in ("title", "name", "jobTitle")) and any(key in value for key in ("url", "link", "applyUrl")):
            yield value
        for child in value.values():
            yield from _walk_json(child)
    elif isinstance(value, list):
        for child in value:
            yield from _walk_json(child)


def _json_candidates(page: Page) -> list[Candidate]:
    payload = json.loads(page.raw)
    candidates: list[Candidate] = []
    for item in _walk_json(payload):
        candidates.append(
            Candidate(
                clean_text(str(item.get("title") or item.get("name") or item.get("jobTitle") or "")),
                urljoin(page.url, str(item.get("url") or item.get("link") or item.get("applyUrl") or "")),
                clean_text(str(item.get("description") or item.get("summary") or "")),
                clean_text(str(item.get("publishedAt") or item.get("date") or "")),
            )
        )
    return candidates


def candidates_from_page(page: Page, source: Source) -> list[Candidate]:
    if source.kind == "rss":
        return _rss_candidates(page)
    if source.kind == "json":
        return _json_candidates(page)
    # A listing/homepage may contain a 2027 announcement somewhere in its body;
    # only treat the page itself as an announcement when its own title qualifies.
    candidates = [Candidate(page.title, page.url, page.text)] if is_formal_2027(page.title) else []
    candidates.extend(Candidate(text, url, text) for url, text in (page.link_texts or []) if text)
    return candidates


def candidate_to_job(candidate: Candidate, company: Company, source: Source) -> JobRecord | None:
    candidate_title = clean_text(candidate.title)
    if source.kind == "government":
        candidate_title = re.sub(r"\s*[－_-]\s*国务院国有资产监督管理委员会.*$", "", candidate_title).strip()
    candidate_detail = clean_text(candidate.text)
    combined = candidate_title if candidate_detail == candidate_title else clean_text(f"{candidate_title} {candidate_detail}")
    relevance_text = candidate_title if is_formal_2027(candidate_title) else combined
    official_url = normalize_url(candidate.url)
    government_url = source.kind == "government" and urlsplit(official_url).netloc.lower().endswith("sasac.gov.cn")
    if not official_url or not (domain_allowed(official_url, company) or government_url) or not is_formal_2027(relevance_text):
        return None
    if source.kind == "wechat" and company.wechat_accounts and not any(account in combined for account in company.wechat_accounts):
        return None
    campaign = campaign_of(combined)
    cities = sorted(set(CITY_RE.findall(combined)))
    locations = "、".join(cities) or "全国"
    deadline_match = DEADLINE_RE.search(combined)
    deadline = _iso_date(deadline_match.group(1)) if deadline_match else ""
    published_at = _iso_date(candidate.published_at) or _iso_date(combined)
    if campaign == "校园招聘" and published_at[5:7] in {"07", "08", "09", "10", "11"}:
        campaign = "秋招"
    source_type = {
        "wechat": "官方公众号", "rss": "官方 RSS", "json": "官方招聘平台",
        "government": "国资委官网",
    }.get(source.kind, source.label)
    entity_name = source.company or company.name
    parent_name = company.name if entity_name != company.name else company.parent
    active_status = "expired" if deadline and deadline < date.today().isoformat() else "active"
    title = candidate_title[:160] or f"{company.name}2027届{campaign}"
    summary = "" if source.kind == "government" or combined == title else combined[:500]
    return JobRecord(
        id=announcement_identity(entity_name, campaign, official_url),
        company=entity_name,
        parent_company=parent_name,
        ownership_type=company.ownership,
        title=title,
        campaign=campaign,
        recruitment_type=campaign,
        city=locations,
        locations=locations,
        published_at=published_at,
        deadline=deadline,
        source_type=source_type,
        source_channel=source.label,
        source_url=official_url,
        official_url=official_url,
        verification_status="verified_company",
        active_status=active_status,
        summary=summary,
    )


def discover_company(company: Company, crawler: PageCrawler) -> tuple[list[JobRecord], list[str], int]:
    jobs: list[JobRecord] = []
    failures: list[str] = []
    successes = 0
    for source in company.sources:
        page = crawler.fetch(source.url)
        if page is None:
            failures.append(source.url)
            continue
        successes += 1
        try:
            for candidate in candidates_from_page(page, source):
                job = candidate_to_job(candidate, company, source)
                if job:
                    jobs.append(job)
        except (ET.ParseError, json.JSONDecodeError, ValueError) as exc:
            failures.append(f"{source.url} ({exc})")
    unique = {job.id: job for job in jobs}
    return list(unique.values()), failures, successes
