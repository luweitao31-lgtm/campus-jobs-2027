from pathlib import Path

from campus_jobs.crawler import Page
from campus_jobs.official import Candidate, candidate_to_job, candidates_from_page, clean_text, is_formal_2027
from campus_jobs.registry import Company, Source, load_registry


def company(kind="html", accounts=()):
    return Company(
        name="示例集团", parent="示例集团", ownership="央国企",
        domains=("jobs.example.com",),
        sources=(Source("https://jobs.example.com/campus", kind=kind, label="官方招聘平台"),),
        wechat_accounts=accounts,
    )


def test_repository_registry_has_exact_mix():
    path = Path(__file__).parents[1] / "sources.yaml"
    companies = load_registry(path)
    assert len(companies) == 100
    assert sum(item.ownership == "央国企" for item in companies) == 85
    assert sum(item.ownership == "外企" for item in companies) == 15
    assert all(item.domains and item.sources for item in companies)


def test_formal_filter_and_html_cleanup():
    assert is_formal_2027("示例集团2027届秋季校园招聘正式启动")
    assert not is_formal_2027("2027届暑期实习，可留用")
    assert not is_formal_2027("2027届校招AI薪酬报告与求职攻略")
    assert clean_text('<a href="x">2027届校园招聘</a>&nbsp;公告') == "2027届校园招聘 公告"


def test_html_source_extracts_only_official_announcement():
    source = company().sources[0]
    page = Page(
        "https://jobs.example.com/campus", 200, title="校园招聘",
        link_texts=[
            ("https://jobs.example.com/2027", "示例集团2027届秋季校园招聘正式启动"),
            ("https://other.example.net/2027", "其他公司2027届校园招聘"),
        ],
    )
    jobs = [candidate_to_job(item, company(), source) for item in candidates_from_page(page, source)]
    jobs = [job for job in jobs if job]
    assert len(jobs) == 1
    assert jobs[0].campaign == "秋招"
    assert jobs[0].verification_status == "verified_company"


def test_listing_page_body_does_not_become_a_duplicate_announcement():
    source = company().sources[0]
    page = Page(
        source.url, 200, title="示例集团官网",
        text="示例集团2027届校园招聘正式启动",
        link_texts=[("https://jobs.example.com/2027", "示例集团2027届校园招聘正式启动")],
    )
    candidates = candidates_from_page(page, source)
    assert [item.url for item in candidates] == ["https://jobs.example.com/2027"]


def test_rss_and_json_adapters_parse_offline_fixtures():
    rss_source = Source("https://jobs.example.com/feed", kind="rss", label="官方 RSS")
    rss_page = Page(
        rss_source.url, 200, content_type="application/rss+xml",
        raw="""<?xml version='1.0'?><rss><channel><item><title>示例集团2027届春季校园招聘</title><link>https://jobs.example.com/spring</link><description>北京岗位</description><pubDate>2027-02-01</pubDate></item></channel></rss>""",
    )
    assert candidates_from_page(rss_page, rss_source)[0].title.endswith("校园招聘")

    json_source = Source("https://jobs.example.com/api", kind="json", label="官方招聘平台")
    json_page = Page(
        json_source.url, 200, content_type="application/json",
        raw='{"data":[{"title":"示例集团2027届提前批校园招聘","url":"/early","description":"上海"}]}',
    )
    candidate = candidates_from_page(json_page, json_source)[0]
    assert candidate.url == "https://jobs.example.com/early"
    assert candidate_to_job(candidate, company("json"), json_source).campaign == "提前批"


def test_wechat_requires_registered_account_identity():
    source = Source("https://jobs.example.com/wechat/1", kind="wechat", label="官方公众号")
    registered = company("wechat", ("示例集团招聘",))
    assert candidate_to_job(
        Candidate("示例集团2027届校园招聘", source.url, "发布账号：未知账号"), registered, source
    ) is None
    job = candidate_to_job(
        Candidate("示例集团2027届校园招聘", source.url, "发布账号：示例集团招聘"), registered, source
    )
    assert job and job.source_type == "官方公众号"


def test_past_deadline_marks_announcement_expired():
    source = company().sources[0]
    job = candidate_to_job(
        Candidate("示例集团2027届校园招聘", "https://jobs.example.com/closed", "申请截止：2020-01-01"),
        company(), source,
    )
    assert job and job.deadline == "2020-01-01" and job.active_status == "expired"
