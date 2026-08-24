from __future__ import annotations

import argparse
import logging
import sys

from .config import load_settings
from .pipeline import Pipeline
from .search import SearchError


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="2027届校园招聘每日聚合程序")
    parser.add_argument("--config", default="config.yaml", help="YAML 配置文件路径")
    parser.add_argument("--verbose", action="store_true", help="输出调试日志")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("full", help="搜索、复检、生成页面并发送邮件")
    commands.add_parser("search", help="只搜索并更新数据")
    commands.add_parser("recheck", help="只复检已有链接")
    commands.add_parser("generate", help="只重新生成网页和 CSV")
    commands.add_parser("mail", help="只发送尚未通知的记录摘要")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    try:
        pipeline = Pipeline(load_settings(args.config))
        if args.command == "full":
            pipeline.full()
        elif args.command == "search":
            pipeline.discover()
        elif args.command == "recheck":
            pipeline.recheck()
        elif args.command == "generate":
            pipeline.generate()
        elif args.command == "mail":
            pipeline.mail()
    except (FileNotFoundError, SearchError, ValueError) as exc:
        logging.error("任务失败：%s", exc)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())

