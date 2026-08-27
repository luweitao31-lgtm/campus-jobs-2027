import json
from pathlib import Path

from campus_jobs.models import JobRecord
from zoneinfo import ZoneInfo

from campus_jobs.render import latest_timestamp, render_outputs


def test_render_only_publishes_verified_official_records_and_escapes(settings):
    verified = JobRecord(
        id="ok", company="<示例集团>", parent_company="示例集团", title='2027届校园招聘 "启动"',
        source_url="https://jobs.example.com/2027", official_url="https://jobs.example.com/2027",
        verification_status="verified_company", campaign="校园招聘", locations="北京",
        summary="<img src=x onerror=alert(1)>",
    )
    unverified = JobRecord(
        id="bad", company="转载企业", title="2027届招聘",
        source_url="https://news.example.net/post", verification_status="unverified",
    )
    index, csv_path = render_outputs([verified, unverified], settings)
    content = Path(index).read_text(encoding="utf-8")
    assert "转载企业" not in content
    assert "&lt;示例集团&gt;" in content
    assert "<img src=x" not in content
    payload = json.loads((Path(index).parent / "jobs.json").read_text(encoding="utf-8"))
    assert payload["schema_version"] == 2
    assert [job["id"] for job in payload["jobs"]] == ["ok"]
    assert csv_path.exists()


def test_render_uses_latest_health_check_time(settings):
    health_path = Path(settings.output["health_file"])
    health_path.write_text('{"updated_at":"2099-01-01T08:00:00+08:00"}', encoding="utf-8")
    job = JobRecord(
        id="ok", company="示例集团", title="示例集团2027届秋招",
        official_url="https://jobs.example.com/2027", verification_status="verified_company",
        updated_at="2026-08-27T08:00:00+08:00",
    )
    index, _ = render_outputs([job], settings)
    content = Path(index).read_text(encoding="utf-8")
    assert "最近生成：2099-01-01T08:00:00+08:00" in content


def test_latest_timestamp_compares_different_timezones_as_instants():
    assert latest_timestamp(
        ["2026-08-27T22:14:00+08:00", "2026-08-27T15:36:19+00:00"],
        ZoneInfo("Asia/Shanghai"),
    ) == "2026-08-27T23:36:19+08:00"
