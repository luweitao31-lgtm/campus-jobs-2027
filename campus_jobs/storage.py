from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path

from .models import JobRecord, now_iso


class JobStore:
    def __init__(self, path: str | Path):
        self.path = Path(path)
        self.jobs: list[JobRecord] = []
        self.dirty = False
        self.updated_at = ""
        self.load()

    def load(self) -> None:
        if not self.path.exists():
            self.jobs = []
            return
        with self.path.open("r", encoding="utf-8") as handle:
            payload = json.load(handle)
        self.updated_at = payload.get("updated_at", "")
        self.jobs = [JobRecord.from_dict(item) for item in payload.get("jobs", [])]

    def save(self) -> None:
        if self.path.exists() and not self.dirty:
            return
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.updated_at = now_iso()
        payload = {
            "schema_version": 2,
            "updated_at": self.updated_at,
            "jobs": [job.to_dict() for job in sorted(self.jobs, key=lambda j: j.first_seen_at, reverse=True)],
        }
        fd, temp_name = tempfile.mkstemp(prefix="jobs-", suffix=".json", dir=self.path.parent)
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as handle:
                json.dump(payload, handle, ensure_ascii=False, indent=2)
                handle.write("\n")
            os.replace(temp_name, self.path)
            self.dirty = False
        finally:
            if os.path.exists(temp_name):
                os.unlink(temp_name)

    def upsert(self, incoming: JobRecord) -> tuple[JobRecord, bool]:
        for current in self.jobs:
            same_source = bool(current.source_url and current.source_url == incoming.source_url)
            if current.id != incoming.id and not same_source:
                continue
            changed = False
            if same_source and current.id != incoming.id:
                current.id = incoming.id
                changed = True
            for field in (
                "company", "title", "city", "category", "recruitment_type",
                "published_at", "source_channel", "source_url", "summary", "source_query",
                "parent_company", "ownership_type", "campaign", "locations", "deadline",
                "source_type",
            ):
                value = getattr(incoming, field)
                if value and value != getattr(current, field):
                    setattr(current, field, value)
                    changed = True
            if incoming.official_url and incoming.official_url != current.official_url:
                current.official_url = incoming.official_url
                changed = True
            if incoming.verification_status != "unverified" and incoming.verification_status != current.verification_status:
                current.verification_status = incoming.verification_status
                changed = True
            if incoming.active_status and incoming.active_status != current.active_status:
                current.active_status = incoming.active_status
                changed = True
            if changed:
                current.updated_at = now_iso()
                self.dirty = True
            return current, False
        self.jobs.append(incoming)
        self.dirty = True
        return incoming, True
