from __future__ import annotations

import logging
import urllib.robotparser
from dataclasses import dataclass
from urllib.parse import urljoin, urlsplit

import requests
from bs4 import BeautifulSoup

from .config import Settings

LOGGER = logging.getLogger(__name__)


@dataclass
class Page:
    url: str
    status_code: int
    title: str = ""
    text: str = ""
    links: list[str] | None = None
    link_texts: list[tuple[str, str]] | None = None
    content_type: str = "text/html"
    raw: str = ""


class PageCrawler:
    def __init__(self, settings: Settings, session: requests.Session | None = None):
        self.settings = settings
        self.session = session or requests.Session()
        self.user_agent = settings.crawler.get("user_agent", "CampusJobs2027/0.1")
        self.session.headers.update({"User-Agent": self.user_agent})
        self._robots: dict[str, urllib.robotparser.RobotFileParser] = {}

    def allowed(self, url: str) -> bool:
        if not self.settings.crawler.get("respect_robots_txt", True):
            return True
        parts = urlsplit(url)
        origin = f"{parts.scheme}://{parts.netloc}"
        if origin not in self._robots:
            robots_url = urljoin(origin, "/robots.txt")
            parser = urllib.robotparser.RobotFileParser(robots_url)
            try:
                response = self.session.get(
                    robots_url,
                    timeout=float(self.settings.crawler.get("timeout_seconds", 12)),
                )
                if response.status_code == 200:
                    parser.parse(response.text.splitlines())
                else:
                    parser.parse([])
            except requests.RequestException as exc:
                LOGGER.info("无法读取 robots.txt，按允许处理：%s (%s)", origin, exc)
                parser.parse([])
            self._robots[origin] = parser
        parser = self._robots[origin]
        try:
            return parser.can_fetch(self.user_agent, url)
        except Exception:
            return True

    def fetch(self, url: str) -> Page | None:
        if not self.allowed(url):
            LOGGER.info("robots.txt 禁止访问，跳过：%s", url)
            return None
        try:
            response = self.session.get(
                url,
                timeout=float(self.settings.crawler.get("timeout_seconds", 12)),
                allow_redirects=True,
                stream=True,
            )
            response.raise_for_status()
            content_type = response.headers.get("Content-Type", "")
            limit = int(self.settings.crawler.get("max_page_bytes", 2_000_000))
            chunks: list[bytes] = []
            size = 0
            for chunk in response.iter_content(65536):
                size += len(chunk)
                if size > limit:
                    break
                chunks.append(chunk)
            response._content = b"".join(chunks)
            # Some Chinese government/corporate sites return UTF-8 bytes while
            # omitting charset, which requests otherwise treats as ISO-8859-1.
            response.encoding = response.apparent_encoding or response.encoding or "utf-8"
            if "html" not in content_type.lower():
                return Page(
                    url=response.url, status_code=response.status_code,
                    content_type=content_type, raw=response.text,
                )
            soup = BeautifulSoup(response.content, "html.parser", from_encoding=response.encoding)
            for tag in soup(["script", "style", "noscript", "svg"]):
                tag.decompose()
            title = soup.title.get_text(" ", strip=True) if soup.title else ""
            text = soup.get_text(" ", strip=True)
            link_texts = [
                (urljoin(response.url, anchor.get("href")), anchor.get_text(" ", strip=True))
                for anchor in soup.select("a[href]")
            ]
            links = [item[0] for item in link_texts]
            return Page(
                url=response.url, status_code=response.status_code, title=title, text=text,
                links=links, link_texts=link_texts, content_type=content_type,
                raw=response.text,
            )
        except requests.RequestException as exc:
            LOGGER.info("页面读取失败：%s (%s)", url, exc)
            return None

    def check(self, url: str) -> tuple[str, str]:
        """Return active status and final URL without raising."""
        if not self.allowed(url):
            return "unknown", url
        try:
            response = self.session.head(
                url,
                timeout=float(self.settings.crawler.get("timeout_seconds", 12)),
                allow_redirects=True,
            )
            if response.status_code in (403, 405, 429):
                response = self.session.get(url, timeout=10, allow_redirects=True, stream=True)
            if response.status_code in (404, 410):
                return "expired", response.url
            if response.status_code < 400 or response.status_code in (401, 403, 429):
                return "active", response.url
            return "unknown", response.url
        except requests.RequestException:
            return "unknown", url
