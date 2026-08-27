import pytest

from campus_jobs.models import JobRecord
from campus_jobs.pipeline import Pipeline
from campus_jobs.registry import Company, Source
from campus_jobs.search import SearchError


def test_unhealthy_official_sources_preserve_last_good_data(settings, monkeypatch):
    settings.raw["expected_company_count"] = 1
    settings.crawler["source_workers"] = 1
    settings.crawler["min_source_success_ratio"] = 0.5
    pipeline = Pipeline(settings)
    pipeline.store.upsert(
        JobRecord(
            id="old", company="示例集团", title="已发布公告",
            source_url="https://jobs.example.com/old", official_url="https://jobs.example.com/old",
            verification_status="verified_company",
        )
    )
    pipeline.store.save()
    before = pipeline.store.path.read_text(encoding="utf-8")
    registered = Company(
        "示例集团", "示例集团", "央国企", ("jobs.example.com",),
        (Source("https://jobs.example.com/campus"),),
    )
    monkeypatch.setattr("campus_jobs.pipeline.load_registry", lambda *args, **kwargs: [registered])
    monkeypatch.setattr("campus_jobs.pipeline.discover_company", lambda *args: ([], ["failed"], 0))
    with pytest.raises(SearchError, match="保留上一版数据"):
        pipeline.discover()
    assert pipeline.store.path.read_text(encoding="utf-8") == before
