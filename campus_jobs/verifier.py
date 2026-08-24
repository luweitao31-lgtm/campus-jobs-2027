from __future__ import annotations

from urllib.parse import urlsplit

from .config import Settings
from .crawler import Page
from .models import JobRecord, normalize_url, now_iso


APPLY_HINTS = ("apply", "job", "career", "campus", "join", "recruit", "zhaopin", "position", "投递", "招聘", "职位")


def domain_of(url: str) -> str:
    return urlsplit(url).netloc.lower().split(":", 1)[0].removeprefix("www.")


def domain_matches(domain: str, candidates: list[str]) -> bool:
    return any(domain == item.lower() or domain.endswith(f".{item.lower()}") for item in candidates)


def verify_job(job: JobRecord, page: Page | None, settings: Settings) -> JobRecord:
    verification = settings.verification
    trusted_ats = verification.get("trusted_ats_domains", [])
    aggregators = verification.get("aggregator_domains", [])
    company_domains = verification.get("company_domains", {}).get(job.company, [])
    source_domain = domain_of(job.source_url)

    if domain_matches(source_domain, company_domains):
        job.official_url = normalize_url(job.source_url)
        job.verification_status = "verified_company"
    elif domain_matches(source_domain, trusted_ats):
        job.official_url = normalize_url(job.source_url)
        job.verification_status = "verified_ats"
    else:
        candidates: list[tuple[int, str, str]] = []
        for link in (page.links if page and page.links else []):
            if not link.startswith(("http://", "https://")):
                continue
            domain = domain_of(link)
            score = sum(hint in link.lower() for hint in APPLY_HINTS)
            if domain_matches(domain, company_domains):
                candidates.append((score + 10, link, "verified_company"))
            elif domain_matches(domain, trusted_ats):
                # A trusted ATS link found on a non-aggregator or recognized source is stronger
                # than plain text, while still requiring an explicit configured ATS domain.
                candidates.append((score + (2 if domain_matches(source_domain, aggregators) else 5), link, "verified_ats"))
        if candidates:
            _, link, status = max(candidates, key=lambda item: item[0])
            job.official_url = normalize_url(link)
            job.verification_status = status
        else:
            job.verification_status = "unverified"
    job.last_checked_at = now_iso()
    return job

