from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml


@dataclass
class Settings:
    raw: dict[str, Any]
    path: Path

    @property
    def search(self) -> dict[str, Any]:
        return self.raw.get("search", {})

    @property
    def crawler(self) -> dict[str, Any]:
        return self.raw.get("crawler", {})

    @property
    def output(self) -> dict[str, Any]:
        return self.raw.get("output", {})

    def env(self, name: str, default: str = "") -> str:
        return os.getenv(name, default)


def load_settings(path: str | Path = "config.yaml") -> Settings:
    config_path = Path(path)
    if not config_path.exists():
        raise FileNotFoundError(f"配置文件不存在：{config_path}")
    with config_path.open("r", encoding="utf-8") as handle:
        raw = yaml.safe_load(handle) or {}
    return Settings(raw=raw, path=config_path)
