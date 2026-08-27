from pathlib import Path

import pytest

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
    companies = load_registry(path, expected_count=101)
    assert len(companies) == 101
    assert sum(item.ownership == "央国企" for item in companies) == 86
    assert sum(item.ownership == "外企" for item in companies) == 15
    assert all(item.domains and item.sources for item in companies)
    subsidiaries = [source for item in companies if item.ownership == "央国企" for source in item.sources if source.company]
    assert subsidiaries
    assert all(source.subsidiary_location == "广西南宁" for source in subsidiaries)


def test_registry_rejects_soe_subsidiary_outside_nanning(tmp_path):
    registry = tmp_path / "sources.yaml"
    registry.write_text(
        """subsidiary_scope: 广西南宁
companies:
  - name: 示例集团
    parent: 示例集团
    ownership: 央国企
    domains: [example.com]
    sources:
      - {url: https://example.com/jobs, company: 示例外地子公司, subsidiary_location: 北京}
""",
        encoding="utf-8",
    )
    with pytest.raises(ValueError, match="必须声明位于 广西南宁"):
        load_registry(registry)


def test_formal_filter_and_html_cleanup():
    assert is_formal_2027("示例集团2027届秋季校园招聘正式启动")
    assert is_formal_2027("示例集团2027年度校园招聘全面启动")
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


def test_identical_anchor_text_is_not_repeated_as_summary():
    source = company().sources[0]
    title = "示例集团2027届校园招聘正式启动"
    job = candidate_to_job(Candidate(title, "https://jobs.example.com/2027", title), company(), source)
    assert job and job.title == title and job.summary == ""


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


def test_declared_official_landing_page_adapter():
    source = Source(
        "https://jobs.example.com/2027", kind="landing", label="企业招聘页",
        announcement_title="示例集团2027届校园招聘", published_at="2026-08-27",
    )
    page = Page(source.url, 200, title="校园招聘", text="2027届校园招聘，面向全球应届毕业生")
    candidates = candidates_from_page(page, source)
    assert len(candidates) == 1 and candidates[0].title == source.announcement_title
    job = candidate_to_job(candidates[0], company(), source)
    assert job and job.published_at == "2026-08-27" and job.campaign == "秋招"


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


def test_sasac_government_source_can_publish_a_subsidiary_announcement():
    registered = company()
    source = Source(
        "http://www.sasac.gov.cn/example", kind="government", label="国资委官网",
        company="示例集团南宁子公司", subsidiary_location="广西南宁",
    )
    job = candidate_to_job(
        Candidate("示例集团南宁子公司2027届秋季校园招聘启动", source.url, "发布时间：2026-08-27"),
        registered, source,
    )
    assert job and job.company == "示例集团南宁子公司"
    assert job.parent_company == "示例集团"
    assert job.source_type == "国资委官网"
    assert job.campaign == "秋招"
    assert job.summary == ""
    assert job.locations == "南宁"


def test_non_nanning_soe_subsidiary_is_rejected():
    registered = company()
    source = Source(
        "http://www.sasac.gov.cn/example", kind="government", label="国资委官网",
        company="示例集团北京子公司", subsidiary_location="北京",
    )
    candidate = Candidate("示例集团北京子公司2027届秋季校园招聘启动", source.url)
    assert candidate_to_job(candidate, registered, source) is None


def test_nanning_subsidiary_article_must_identify_nanning():
    registered = company()
    source = Source(
        "http://www.sasac.gov.cn/example", kind="government", label="国资委官网",
        company="示例集团子公司", subsidiary_location="广西南宁",
    )
    candidate = Candidate("示例集团子公司2027届秋季校园招聘启动", source.url)
    assert candidate_to_job(candidate, registered, source) is None


def test_parent_soe_announcement_remains_nationwide():
    registered = company()
    source = Source("http://www.sasac.gov.cn/example", kind="government", label="国资委官网")
    job = candidate_to_job(Candidate("示例集团2027届秋季校园招聘启动", source.url), registered, source)
    assert job and job.company == job.parent_company == "示例集团" and job.locations == "全国"


def test_sasac_title_removes_government_site_suffix():
    registered = company()
    source = Source("http://www.sasac.gov.cn/example", kind="government", label="国资委官网")
    job = candidate_to_job(
        Candidate(
            "示例集团2027届秋季校园招聘启动－国务院国有资产监督管理委员会",
            source.url, "发布时间：2026-08-27",
        ),
        registered, source,
    )
    assert job and job.title == "示例集团2027届秋季校园招聘启动"


def test_current_autumn_date_classifies_annual_campus_campaign_as_autumn():
    registered = company()
    source = Source("http://www.sasac.gov.cn/example", kind="government", label="国资委官网")
    job = candidate_to_job(
        Candidate("示例集团2027年度校园招聘全面启动", source.url, "发布时间：2026-08-27"),
        registered, source,
    )
    assert job and job.campaign == "秋招" and job.published_at == "2026-08-27"


def test_official_article_sidebar_internship_word_does_not_reject_formal_title():
    registered = company()
    source = Source("http://www.sasac.gov.cn/example", kind="government", label="国资委官网")
    job = candidate_to_job(
        Candidate(
            "示例集团2027届秋季校园招聘正式启动", source.url,
            "发布时间：2026-08-27 侧栏：其他单位暑期实习公告",
        ),
        registered, source,
    )
    assert job and job.campaign == "秋招"


def test_malformed_government_page_link_is_ignored():
    registered = company()
    source = Source("http://www.sasac.gov.cn/example", kind="government", label="国资委官网")
    assert candidate_to_job(Candidate("示例集团2027届秋招", "javascript:void(0)"), registered, source) is None


def test_past_deadline_marks_announcement_expired():
    source = company().sources[0]
    job = candidate_to_job(
        Candidate("示例集团2027届校园招聘", "https://jobs.example.com/closed", "申请截止：2020-01-01"),
        company(), source,
    )
    assert job and job.deadline == "2020-01-01" and job.active_status == "expired"
