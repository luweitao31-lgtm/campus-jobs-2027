from pathlib import Path

from campus_jobs.mailer import build_mail_html, send_digest
from campus_jobs.models import JobRecord
from campus_jobs.render import render_outputs


def test_render_escapes_untrusted_content(settings):
    job = JobRecord(
        id="x", company="<script>alert(1)</script>", title='研发 "工程师"',
        source_url="https://example.com/job", summary="<img src=x onerror=alert(1)>",
    )
    index, csv_path = render_outputs([job], settings)
    content = Path(index).read_text(encoding="utf-8")
    assert "<script>alert(1)</script>" not in content
    assert "&lt;script&gt;alert(1)&lt;/script&gt;" in content
    assert csv_path.exists()


def test_mail_groups_verified_and_unverified_and_escapes():
    jobs = [
        JobRecord(id="1", company="已验证企业", title="研发", source_url="https://example.com", official_url="https://jobs.example.com", verification_status="verified_company"),
        JobRecord(id="2", company="<未知>", title="岗位", source_url="https://news.example.net", verification_status="unverified"),
    ]
    body = build_mail_html(jobs)
    assert "官网已验证（1）" in body
    assert "待核验线索（1）" in body
    assert "&lt;未知&gt;" in body


def test_smtp_is_mocked_and_secrets_are_not_written(settings, monkeypatch):
    sent = {}

    class FakeSMTP:
        def __init__(self, host, port, timeout):
            sent["connection"] = (host, port, timeout)

        def __enter__(self):
            return self

        def __exit__(self, *args):
            return None

        def starttls(self):
            sent["tls"] = True

        def login(self, username, password):
            sent["login"] = (username, password)

        def send_message(self, message, to_addrs):
            sent["message"] = message
            sent["recipients"] = to_addrs

    secrets = {
        "SMTP_HOST": "smtp.example.com", "SMTP_PORT": "587",
        "SMTP_USERNAME": "sender@example.com", "SMTP_PASSWORD": "secret-value",
        "MAIL_FROM": "sender@example.com", "MAIL_TO": "one@example.com,two@example.com",
    }
    for name, value in secrets.items():
        monkeypatch.setenv(name, value)
    monkeypatch.setattr("campus_jobs.mailer.smtplib.SMTP", FakeSMTP)
    send_digest([], settings)
    assert sent["tls"] is True
    assert sent["recipients"] == ["one@example.com", "two@example.com"]
    assert "secret-value" not in sent["message"].as_string()
