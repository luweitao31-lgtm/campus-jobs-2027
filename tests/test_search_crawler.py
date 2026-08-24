import responses

from campus_jobs.crawler import PageCrawler
from campus_jobs.search import BraveSearchClient, build_queries


def test_query_budget(settings):
    queries = build_queries(settings)
    assert len(queries) == 3
    assert all("2027届" in query for query in queries)


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

