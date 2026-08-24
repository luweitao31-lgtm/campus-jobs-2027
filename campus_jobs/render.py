from __future__ import annotations

import csv
import json
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from jinja2 import Environment, FileSystemLoader

from .config import Settings
from .models import JobRecord


CSV_FIELDS = [
    "company", "title", "city", "category", "recruitment_type", "published_at",
    "first_seen_at", "source_channel", "source_url", "official_url",
    "verification_status", "active_status", "last_checked_at", "summary",
]


def verification_label(status: str) -> str:
    return {
        "verified_company": "官网已验证",
        "verified_ats": "官方 ATS 已验证",
        "unverified": "待核验",
    }.get(status, status or "待核验")


def active_label(status: str) -> str:
    return {"active": "招聘中", "expired": "已失效", "unknown": "状态未知"}.get(status, status)


def render_outputs(jobs: list[JobRecord], settings: Settings) -> tuple[Path, Path]:
    output = settings.output
    site_dir = Path(output.get("site_dir", "docs"))
    site_dir.mkdir(parents=True, exist_ok=True)
    csv_path = Path(output.get("csv_file", site_dir / "jobs.csv"))
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    with csv_path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=CSV_FIELDS, extrasaction="ignore")
        writer.writeheader()
        for job in jobs:
            writer.writerow(job.to_dict())

    timezone = ZoneInfo(settings.raw.get("timezone", "Asia/Shanghai"))
    today = datetime.now(timezone).date().isoformat()
    ordered = sorted(jobs, key=lambda job: job.first_seen_at, reverse=True)
    environment = Environment(
        loader=FileSystemLoader(Path(__file__).parent / "templates"),
        # The template uses a .j2 suffix, so enable escaping explicitly instead
        # of relying on extension-based auto-detection.
        autoescape=True,
    )
    template = environment.get_template("index.html.j2")
    html = template.render(
        title=output.get("site_title", "2027届校园招聘信息"),
        jobs=ordered,
        today=today,
        generated_at=datetime.now(timezone).strftime("%Y-%m-%d %H:%M:%S %Z"),
        verification_label=verification_label,
        active_label=active_label,
        stats={
            "total": len(ordered),
            "verified": sum(job.verification_status != "unverified" for job in ordered),
            "today": sum(job.first_seen_at[:10] == today for job in ordered),
            "active": sum(job.active_status == "active" for job in ordered),
        },
    )
    index_path = site_dir / "index.html"
    index_path.write_text(html, encoding="utf-8")
    (site_dir / ".nojekyll").touch()
    public_data = {
        "updated_at": datetime.now(timezone).isoformat(timespec="seconds"),
        "jobs": [job.to_dict() for job in ordered],
    }
    (site_dir / "jobs.json").write_text(
        json.dumps(public_data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return index_path, csv_path
