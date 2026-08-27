import json
from pathlib import Path


def test_public_dataset_obeys_nanning_subsidiary_scope():
    payload = json.loads((Path(__file__).parents[1] / "data" / "jobs.json").read_text(encoding="utf-8"))
    for job in payload["jobs"]:
        assert job["verification_status"] != "unverified"
        if (
            job["ownership_type"] == "央国企"
            and job["parent_company"]
            and job["parent_company"] != job["company"]
        ):
            assert "南宁" in job["locations"]
