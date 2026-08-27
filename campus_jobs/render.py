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
    "company", "parent_company", "ownership_type", "title", "campaign", "locations",
    "published_at", "deadline", "source_type", "official_url", "first_seen_at",
    "updated_at", "active_status",
]


def active_label(status: str) -> str:
    return {"active": "招聘中", "expired": "已失效", "unknown": "状态未知"}.get(status, status)


def render_outputs(jobs: list[JobRecord], settings: Settings) -> tuple[Path, Path]:
    output = settings.output
    site_dir = Path(output.get("site_dir", "docs"))
    site_dir.mkdir(parents=True, exist_ok=True)
    csv_path = Path(output.get("csv_file", site_dir / "jobs.csv"))
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    public_jobs = [job for job in jobs if job.official_url and job.verification_status != "unverified"]
    with csv_path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=CSV_FIELDS, extrasaction="ignore", lineterminator="\n")
        writer.writeheader()
        for job in public_jobs:
            writer.writerow(job.to_dict())

    timezone = ZoneInfo(settings.raw.get("timezone", "Asia/Shanghai"))
    today = datetime.now(timezone).date().isoformat()
    ordered = sorted(public_jobs, key=lambda job: (job.published_at, job.first_seen_at), reverse=True)
    health = {}
    health_path = Path(output.get("health_file", "data/health.json"))
    if not health_path.is_absolute():
        health_path = settings.path.parent / health_path
    if health_path.exists():
        try:
            health = json.loads(health_path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            health = {}
    environment = Environment(
        loader=FileSystemLoader(Path(__file__).parent / "templates"),
        # The template uses a .j2 suffix, so enable escaping explicitly instead
        # of relying on extension-based auto-detection.
        autoescape=True,
        trim_blocks=True,
        lstrip_blocks=True,
    )
    template = environment.get_template("index.html.j2")
    content_updated_at = max((job.updated_at for job in ordered), default=health.get("updated_at", ""))
    generated_label = content_updated_at or "等待首次官方采集"
    html = template.render(
        title=output.get("site_title", "2027届校园招聘信息"),
        jobs=ordered,
        today=today,
        generated_at=generated_label,
        active_label=active_label,
        stats={
            "total": len(ordered),
            "companies": len({job.company for job in ordered}),
            "today": sum(job.first_seen_at[:10] == today for job in ordered),
            "active": sum(job.active_status == "active" for job in ordered),
        },
        health=health,
        target_companies=int(settings.raw.get("expected_company_count", 100)),
    )
    index_path = site_dir / "index.html"
    index_path.write_text(html, encoding="utf-8")
    (site_dir / ".nojekyll").touch()
    public_data = {
        "schema_version": 2,
        "updated_at": content_updated_at,
        "jobs": [job.to_dict() for job in ordered],
    }
    (site_dir / "jobs.json").write_text(
        json.dumps(public_data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return index_path, csv_path
