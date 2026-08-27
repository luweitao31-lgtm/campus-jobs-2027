import responses

from campus_jobs.crawler import PageCrawler
from campus_jobs.search import BraveSearchClient, GoogleNewsRssSearchClient, build_queries, create_search_client


def test_query_budget(settings):
    queries = build_queries(settings)
    assert len(queries) == 3
    assert all("2027届" in query for query in queries)


@responses.activate
def test_keyless_google_news_rss_is_parsed(settings):
    rss = """<?xml version="1.0"?><rss><channel><item><title>示例科技2027届校招</title><link>https://news.google.com/articles/1</link><description>北京研发岗位</description><pubDate>Mon, 24 Aug 2026 00:00:00 GMT</pubDate><source url="https://jobs.example.com">示例科技官网</source></item></channel></rss>"""
    responses.get(settings.search["endpoint"], body=rss, status=200, content_type="application/rss+xml")
    client = create_search_client(settings)
    assert isinstance(client, GoogleNewsRssSearchClient)
    result = client.search("2027届 校园招聘")
    assert result[0].url == "https://news.google.com/articles/1"
    assert result[0].title == "示例科技2027届校招"
    assert "示例科技官网" in result[0].snippet


@responses.activate
def test_brave_response_is_parsed(settings, monkeypatch):
    monkeypatch.setenv("BRAVE_API_KEY", "not-a-real-secret")
    responses.get(
        settings.search["endpoint"],
        json={"web": {"results": [{"title": "校招", "url": "https://example.com/job", "description": "2027届"}]}},
        status=200,
    )
    result = BraveSearchClient(settings).search("2027届 校园招聘")
    assert result[0].url == "https://example.com/job"


@responses.activate
def test_crawler_redirect_and_404_check(settings):
    responses.head("https://example.com/old", status=302, headers={"Location": "https://example.com/new"})
    responses.head("https://example.com/new", status=200)
    responses.head("https://example.com/gone", status=404)
    crawler = PageCrawler(settings)
    assert crawler.check("https://example.com/old") == ("active", "https://example.com/new")
    assert crawler.check("https://example.com/gone")[0] == "expired"


@responses.activate
def test_crawler_detects_utf8_when_header_omits_charset(settings):
    url = "https://example.com/recruit"
    body = "<html><head><title>中国电信2027届秋季校园招聘</title></head><body>正式启动</body></html>".encode("utf-8")
    responses.get(url, body=body, status=200, content_type="text/html")
    page = PageCrawler(settings).fetch(url)
    assert page and page.title == "中国电信2027届秋季校园招聘"
