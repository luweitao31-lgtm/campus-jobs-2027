from __future__ import annotations

import html
import smtplib
from email.message import EmailMessage
from urllib.parse import urlsplit

from .config import Settings
from .models import JobRecord


class MailConfigurationError(RuntimeError):
    pass


def _safe_link(url: str) -> str:
    parts = urlsplit(url)
    return url if parts.scheme in ("http", "https") else ""


def build_mail_html(jobs: list[JobRecord], site_url: str = "") -> str:
    verified = [job for job in jobs if job.verification_status != "unverified"]
    unverified = [job for job in jobs if job.verification_status == "unverified"]

    def section(title: str, records: list[JobRecord]) -> str:
        if not records:
            return f"<h2>{html.escape(title)}</h2><p>无新增记录。</p>"
        rows = []
        for job in records:
            url = _safe_link(job.apply_url)
            link = f'<a href="{html.escape(url, quote=True)}">投递/查看</a>' if url else "无链接"
            rows.append(
                "<li><strong>{}</strong> — {}（{}，{}） · {}</li>".format(
                    html.escape(job.company), html.escape(job.title), html.escape(job.city),
                    html.escape(job.recruitment_type), link,
                )
            )
        return f"<h2>{html.escape(title)}（{len(records)}）</h2><ul>{''.join(rows)}</ul>"

    headline = f"今日发现 {len(jobs)} 条尚未通知的招聘信息。" if jobs else "今日没有新增招聘信息。"
    site = f'<p><a href="{html.escape(_safe_link(site_url), quote=True)}">打开完整招聘页面</a></p>' if _safe_link(site_url) else ""
    return (
        '<div style="font-family:Arial,\'Microsoft YaHei\',sans-serif;line-height:1.6;color:#182230">'
        f"<h1>2027届校园招聘日报</h1><p>{headline}</p>{site}"
        f"{section('官网已验证', verified)}{section('待核验线索', unverified)}"
        "<p style=\"color:#667085\">请在投递前再次确认岗位有效性和官网域名。</p></div>"
    )


def send_digest(jobs: list[JobRecord], settings: Settings) -> None:
    required = {
        name: settings.env(name)
        for name in ("SMTP_HOST", "SMTP_USERNAME", "SMTP_PASSWORD", "MAIL_FROM", "MAIL_TO")
    }
    missing = [name for name, value in required.items() if not value]
    if missing:
        raise MailConfigurationError(f"邮件未发送，缺少配置：{', '.join(missing)}")
    port = int(settings.env("SMTP_PORT", "465" if settings.mail.get("use_ssl", False) else "587"))
    message = EmailMessage()
    prefix = settings.mail.get("subject_prefix", "[2027届校招]")
    message["Subject"] = f"{prefix} 今日新增 {len(jobs)} 条"
    message["From"] = required["MAIL_FROM"]
    recipients = [item.strip() for item in required["MAIL_TO"].replace(";", ",").split(",") if item.strip()]
    message["To"] = ", ".join(recipients)
    message.set_content(f"2027届校园招聘日报：今日新增 {len(jobs)} 条。请使用 HTML 邮件查看详情。")
    message.add_alternative(build_mail_html(jobs, settings.output.get("public_base_url", "")), subtype="html")
    smtp_class = smtplib.SMTP_SSL if settings.mail.get("use_ssl", False) else smtplib.SMTP
    with smtp_class(required["SMTP_HOST"], port, timeout=30) as server:
        if settings.mail.get("use_tls", True) and not settings.mail.get("use_ssl", False):
            server.starttls()
        server.login(required["SMTP_USERNAME"], required["SMTP_PASSWORD"])
        server.send_message(message, to_addrs=recipients)

