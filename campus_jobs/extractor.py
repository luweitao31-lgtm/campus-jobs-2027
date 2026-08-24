from __future__ import annotations

import re
from urllib.parse import urlsplit

from .config import Settings
from .crawler import Page
from .models import JobRecord, SearchResult, identity_key, normalize_text


COHORT_RE = re.compile(r"(?:2027\s*届|(?<!20)27\s*届)", re.I)
INTERNSHIP_RE = re.compile(r"实习|intern", re.I)
CONVERSION_RE = re.compile(r"转正|留用|return\s*offer|正式招聘衔接", re.I)
RECRUITMENT_RE = re.compile(r"校园招聘|校招|秋招|春招|提前批|招聘|campus|graduate", re.I)
FORMAL_RECRUITMENT_RE = re.compile(r"校园招聘|校招|秋招|春招|提前批|campus|graduate", re.I)
COMPANY_SUFFIX_RE = re.compile(r"([\u4e00-\u9fffA-Za-z0-9·（）()]{2,30}(?:公司|集团|银行|研究院|事务所|科技|网络|股份|证券|保险))")
CITY_RE = re.compile(r"(北京|上海|广州|深圳|杭州|南京|苏州|成都|武汉|西安|重庆|天津|长沙|合肥|厦门|青岛|济南|郑州|东莞|佛山|珠海|宁波|无锡|全国|海外)")

CATEGORY_RULES = {
    "研发/技术": ("研发", "开发", "算法", "软件", "硬件", "测试", "运维", "安全", "工程师", "programmer"),
    "数据/人工智能": ("数据", "人工智能", "ai", "机器学习", "大模型"),
    "产品/设计": ("产品", "设计", "交互", "用户体验", "ui", "ux"),
    "金融": ("金融", "投行", "证券", "精算", "风控", "银行"),
    "市场/运营": ("市场", "运营", "销售", "商务", "品牌", "营销"),
    "职能": ("人力", "财务", "法务", "行政", "采购", "审计"),
}


def is_relevant(text: str, settings: Settings) -> bool:
    normalized = normalize_text(text)
    if not COHORT_RE.search(normalized):
        return False
    if (
        INTERNSHIP_RE.search(normalized)
        and not FORMAL_RECRUITMENT_RE.search(normalized)
        and not CONVERSION_RE.search(normalized)
    ):
        return False
    return bool(RECRUITMENT_RE.search(normalized) or CONVERSION_RE.search(normalized))


def classify_recruitment(text: str) -> str:
    lowered = text.lower()
    if "提前批" in text:
        return "提前批"
    if "春招" in text:
        return "春招"
    if "秋招" in text:
        return "秋招"
    if "校园招聘" in text or "校招" in text or "campus" in lowered or "graduate" in lowered:
        return "校园招聘"
    if "实习" in text or "intern" in lowered:
        return "可转正实习"
    return "校园招聘"


def classify_category(text: str) -> str:
    lowered = text.lower()
    for category, keywords in CATEGORY_RULES.items():
        if any(keyword in lowered for keyword in keywords):
            return category
    return "其他"


def infer_company(title: str, text: str, settings: Settings) -> str:
    combined = f"{title} {text[:500]}"
    for company in settings.verification.get("company_domains", {}):
        if company.lower() in combined.lower():
            return company
    match = COMPANY_SUFFIX_RE.search(combined)
    if match:
        return match.group(1)
    # Search titles commonly use “Company｜2027届...” or “Company - Campus...”.
    first = re.split(r"\s+-\s+|[|｜_—–]", title, maxsplit=1)[0]
    first = re.sub(r"【.*?】|\[.*?]", "", first).strip()
    prefix = re.match(
        r"^(.*?)(?:2027\s*届|27\s*届|校园招聘|校招|秋招|春招|提前批|暑期实习|日常实习|招聘公告)",
        first,
        re.I,
    )
    if prefix:
        first = prefix.group(1).strip() or "待识别企业"
    return first[:40] if 1 < len(first) <= 40 else "待识别企业"


def infer_title(title: str) -> str:
    cleaned = re.split(r"\s+-\s+", re.sub(r"<[^>]+>", "", title), maxsplit=1)[0]
    cleaned = re.sub(r"^【.*?】|^\[.*?\]", "", cleaned).strip()
    cleaned = re.sub(r"【?2027\s*届】?|【?27\s*届】?", "", cleaned, flags=re.I)
    return normalize_text(cleaned)[:120] or "校园招聘岗位"


def source_channel(url: str) -> str:
    domain = urlsplit(url).netloc.lower().removeprefix("www.")
    labels = {
        "nowcoder.com": "牛客网",
        "yingjiesheng.com": "应届生求职网",
        "ncss.cn": "国家大学生就业服务平台",
        "iguopin.com": "国聘",
    }
    for suffix, label in labels.items():
        if domain == suffix or domain.endswith(f".{suffix}"):
            return label
    if domain.endswith(".edu.cn"):
        return "高校就业网"
    return domain or "网页搜索"


def infer_source_channel(result: SearchResult) -> str:
    channel = source_channel(result.url)
    if channel == "news.google.com":
        parts = re.split(r"\s+-\s+", result.title)
        if len(parts) > 1 and 1 < len(parts[-1].strip()) <= 60:
            return parts[-1].strip()
        return "Google News RSS"
    return channel


def extract_job(result: SearchResult, page: Page | None, settings: Settings) -> JobRecord | None:
    page_text = page.text if page else ""
    combined = normalize_text(f"{result.title} {result.snippet} {page_text[:10000]}")
    if not is_relevant(combined, settings):
        return None
    company = infer_company(result.title, combined, settings)
    title = infer_title(result.title)
    city_match = CITY_RE.search(combined)
    city = city_match.group(1) if city_match else "全国"
    return JobRecord(
        id=identity_key(company, title, city),
        company=company,
        title=title,
        city=city,
        category=classify_category(combined),
        recruitment_type=classify_recruitment(combined),
        published_at=result.published_at,
        source_channel=infer_source_channel(result),
        source_url=page.url if page else result.url,
        summary=normalize_text(result.snippet)[:500],
        source_query=result.source_query,
    )
