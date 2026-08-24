from campus_jobs.crawler import Page
from campus_jobs.extractor import classify_recruitment, extract_job, infer_company, is_relevant
from campus_jobs.models import JobRecord, SearchResult, identity_key
from campus_jobs.verifier import verify_job


def test_relevance_requires_2027_and_conversion_for_internship(settings):
    assert is_relevant("示例科技2027届校园招聘正式启动", settings)
    assert is_relevant("面向2027届的暑期实习，表现优秀可转正", settings)
    assert is_relevant("2027届校园招聘岗位，同时介绍在校实习经历", settings)
    assert not is_relevant("面向2027届的普通参观实习", settings)
    assert not is_relevant("示例科技2026届校园招聘", settings)
    assert classify_recruitment("2027届校园招聘，欢迎有实习经历的同学") == "校园招聘"


def test_extracts_structured_job(settings):
    result = SearchResult(
        title="示例科技｜2027届校园招聘后端工程师",
        url="https://news.example.net/job",
        snippet="北京研发岗位，2027届校园招聘正式启动",
    )
    job = extract_job(result, None, settings)
    assert job is not None
    assert job.company == "示例科技"
    assert job.city == "北京"
    assert job.category == "研发/技术"


def test_google_news_suffix_and_recruitment_phrase_do_not_pollute_company(settings):
    result = SearchResult(
        title="得物2027届暑期实习招聘 - 温州大学就业网",
        url="https://news.google.com/rss/articles/1",
        snippet="面向2027届，可转正留用",
    )
    job = extract_job(result, None, settings)
    assert job is not None
    assert job.company == "得物"
    assert job.title == "得物暑期实习招聘"
    assert job.source_channel == "温州大学就业网"
    assert infer_company("27届提前批来的太早了", "", settings) == "待识别企业"


def test_verifies_company_domain_link_from_source_page(settings):
    job = JobRecord(
        id=identity_key("示例科技", "招聘", "全国"), company="示例科技", title="招聘",
        source_url="https://news.example.net/post",
    )
    page = Page(
        url=job.source_url, status_code=200, links=["https://jobs.example.com/campus/apply?id=1"]
    )
    verify_job(job, page, settings)
    assert job.verification_status == "verified_company"
    assert job.official_url.startswith("https://jobs.example.com/")


def test_keeps_plain_aggregator_link_unverified(settings):
    job = JobRecord(
        id="1", company="未知企业", title="招聘", source_url="https://news.example.net/post"
    )
    verify_job(job, Page(job.source_url, 200, links=[]), settings)
    assert job.verification_status == "unverified"
    assert not job.official_url
