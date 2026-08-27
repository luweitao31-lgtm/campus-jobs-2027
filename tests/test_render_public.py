import json
from pathlib import Path

from campus_jobs.models import JobRecord
from campus_jobs.render import render_outputs


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
