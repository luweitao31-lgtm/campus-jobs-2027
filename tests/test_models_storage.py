from campus_jobs.models import JobRecord, identity_key, normalize_url
from campus_jobs.storage import JobStore


def make_job() -> JobRecord:
    return JobRecord(
        id=identity_key("示例科技", "后端工程师", "北京"),
        company="示例科技",
        title="后端工程师",
        city="北京",
        source_url="https://news.example.net/job?id=1&utm_source=test#top",
    )


def test_url_normalization_removes_tracking_and_fragment():
    assert normalize_url("HTTPS://EXAMPLE.COM/a/?id=1&utm_source=x#top") == "https://example.com/a?id=1"
    assert normalize_url("javascript:alert(1)") == ""


def test_store_upsert_is_idempotent(settings):
    store = JobStore(settings.output["data_file"])
    current, added = store.upsert(make_job())
    assert added is True
    incoming = make_job()
    incoming.summary = "更新后的摘要"
    incoming.official_url = "https://jobs.example.com/apply"
    current, added = store.upsert(incoming)
    assert added is False
    assert len(store.jobs) == 1
    assert current.summary == "更新后的摘要"
    store.save()
    assert len(JobStore(settings.output["data_file"]).jobs) == 1


def test_store_updates_identity_when_same_source_is_reparsed(settings):
    store = JobStore(settings.output["data_file"])
    original = make_job()
    store.upsert(original)
    reparsed = make_job()
    reparsed.id = "new-better-identity"
    reparsed.company = "更准确的企业名"
    current, added = store.upsert(reparsed)
    assert added is False
    assert len(store.jobs) == 1
    assert current.id == "new-better-identity"
    assert current.company == "更准确的企业名"
