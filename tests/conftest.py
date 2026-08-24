from __future__ import annotations

from pathlib import Path

import pytest

from campus_jobs.config import Settings


@pytest.fixture
def settings(tmp_path: Path) -> Settings:
    return Settings(
        path=tmp_path / "config.yaml",
        raw={
            "timezone": "Asia/Shanghai",
            "search": {
                "provider": "google_news_rss",
                "endpoint": "https://news.google.com/rss/search",
                "cohort_terms": ["2027届"],
                "recruitment_terms": ["校园招聘", "暑期实习 转正"],
                "source_queries": ["", "site:edu.cn"],
                "daily_query_budget": 3,
                "exclude_terms": ["2026届", "社会招聘"],
            },
            "crawler": {"respect_robots_txt": False, "timeout_seconds": 1},
            "verification": {
                "trusted_ats_domains": ["ats.example.com"],
                "aggregator_domains": ["news.example.net"],
                "company_domains": {"示例科技": ["jobs.example.com"]},
            },
            "output": {
                "data_file": str(tmp_path / "jobs.json"),
                "csv_file": str(tmp_path / "docs" / "jobs.csv"),
                "site_dir": str(tmp_path / "docs"),
            },
            "mail": {"enabled": True, "use_tls": True, "use_ssl": False},
        },
    )
