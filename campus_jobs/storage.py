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
        self.load()

    def load(self) -> None:
        if not self.path.exists():
            self.jobs = []
            return
        with self.path.open("r", encoding="utf-8") as handle:
            payload = json.load(handle)
        self.jobs = [JobRecord.from_dict(item) for item in payload.get("jobs", [])]

    def save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "schema_version": 1,
            "updated_at": now_iso(),
            "jobs": [job.to_dict() for job in sorted(self.jobs, key=lambda j: j.first_seen_at, reverse=True)],
        }
        fd, temp_name = tempfile.mkstemp(prefix="jobs-", suffix=".json", dir=self.path.parent)
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as handle:
                json.dump(payload, handle, ensure_ascii=False, indent=2)
                handle.write("\n")
            os.replace(temp_name, self.path)
        finally:
            if os.path.exists(temp_name):
                os.unlink(temp_name)

    def upsert(self, incoming: JobRecord) -> tuple[JobRecord, bool]:
        for current in self.jobs:
            if current.id != incoming.id:
                continue
            current.updated_at = now_iso()
            for field in (
                "company", "title", "city", "category", "recruitment_type",
                "published_at", "source_channel", "source_url", "summary", "source_query",
            ):
                value = getattr(incoming, field)
                if value:
                    setattr(current, field, value)
            if incoming.official_url:
                current.official_url = incoming.official_url
            if incoming.verification_status != "unverified":
                current.verification_status = incoming.verification_status
            if incoming.active_status:
                current.active_status = incoming.active_status
            return current, False
        self.jobs.append(incoming)
        return incoming, True

    def unnotified(self) -> list[JobRecord]:
        return [job for job in self.jobs if not job.last_notified_at]

