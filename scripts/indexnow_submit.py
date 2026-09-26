#!/usr/bin/env python3
"""IndexNow 提交：把新增/变更的 URL 主动推送给搜索引擎。

为什么做这件事
--------------
审计发现站点**零收录**（`site:bi-chao.com` 检索 0 命中，而对照组命中）。
IndexNow 是目前最快的新内容收录通道：发布后主动推送，Bing（及 Copilot
检索）、Yandex、Naver、Seznam 可即时抓取，无需等爬虫自然回访。

**重要边界（据一手来源核实）**：
  - IndexNow **不被 Google 支持**。Google 侧只能靠 sitemap + URL Inspection，
    且 Google Indexing API 官方仅支持 JobPosting 与 BroadcastEvent，
    **不能用它做博客即时收录**。
  - 百度也不在 IndexNow 参与方之列；百度需用其搜索资源平台主动推送
    （而该通道目前被验证码不一致问题阻塞，见审计报告 G-04）。
  - 因此本脚本的价值集中在 **Bing / Copilot** 这条 AI 检索链路上。

规范要点（indexnow.org）
------------------------
  - 端点：https://api.indexnow.org/indexnow
  - POST，Content-Type: application/json; charset=utf-8
  - 请求体：{"host","key","keyLocation"?,"urlList":[...]}
  - 单次 ≤ 10,000 个 URL；同一 URL 建议至少间隔 5 分钟
  - 密钥：8–128 字符，仅 a-z A-Z 0-9 和连字符；密钥文件置于站点根目录，
    文件名为 {key}.txt，内容即 key 本身
  - **不要用它提交整站**（整站交给 sitemap），只提交新增/变更的 URL

安全性
------
默认 **dry-run**：只打印将要发送的内容，不实际提交。
确认无误后加 --submit 才真正发出去。
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENDPOINT = "https://api.indexnow.org/indexnow"
HOST = "bi-chao.com"
DOMAIN = f"https://{HOST}"
MAX_URLS = 10_000
KEY_RE = re.compile(r"^[A-Za-z0-9-]{8,128}$")


def find_key() -> tuple[str, Path]:
    """在仓库根目录找 {key}.txt 形式的 IndexNow 密钥文件。"""
    cands = []
    for p in sorted(ROOT.glob("*.txt")):
        name = p.stem
        if not KEY_RE.match(name):
            continue
        content = p.read_text(encoding="utf-8").strip()
        if content == name:          # 文件名即密钥，内容也必须是该密钥
            cands.append((name, p))
    if not cands:
        sys.exit("未找到合法的 IndexNow 密钥文件（根目录下的 {key}.txt，内容须等于文件名）")
    if len(cands) > 1:
        sys.exit(f"发现多个候选密钥文件，请只保留一个：{[str(p) for _, p in cands]}")
    return cands[0]


def article_urls_from_paths(paths: list[str]) -> list[str]:
    """把 articles/*.md 文件路径映射为文章 URL。"""
    urls = []
    for raw in paths:
        p = raw.strip()
        if not p or not p.endswith(".md"):
            continue
        # 只处理顶层 articles/*.md（生成器也只 glob 顶层）
        m = re.match(r"^articles/([^/]+)\.md$", p)
        if not m:
            continue
        urls.append(f"{DOMAIN}/articles/{m.group(1)}")
    return sorted(set(urls))


def all_article_urls(limit: int = 0) -> list[str]:
    import json as _json
    idx = ROOT / "articles" / "index.json"
    if not idx.is_file():
        sys.exit("缺少 articles/index.json")
    arts = _json.loads(idx.read_text(encoding="utf-8"))
    urls = [f"{DOMAIN}/articles/{a['slug']}" for a in arts if a.get("slug")]
    return urls[:limit] if limit else urls


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--submit", action="store_true",
                    help="真正提交（默认只 dry-run 打印）")
    ap.add_argument("--urls-file", help="包含变更文件路径的文件（每行一个），"
                                        "用于只提交本次新增/变更的文章")
    ap.add_argument("--all", action="store_true", help="提交全部文章（谨慎使用）")
    ap.add_argument("--limit", type=int, default=0, help="限制 URL 数量")
    ap.add_argument("--key-location", action="store_true",
                    help="在请求体中附带 keyLocation（密钥文件不在根目录时才需要）")
    args = ap.parse_args()

    key, keyfile = find_key()

    if args.urls_file:
        paths = Path(args.urls_file).read_text(encoding="utf-8").splitlines()
        urls = article_urls_from_paths(paths)
        src = f"变更文件 {args.urls_file}"
    elif args.all:
        urls = all_article_urls(args.limit)
        src = "全部文章"
    else:
        sys.exit("请指定 --urls-file（推荐，只推变更）或 --all")

    if not urls:
        print("没有需要提交的 URL（变更里不含 articles/*.md）")
        return 0

    if len(urls) > MAX_URLS:
        print(f"⚠️  URL 数 {len(urls)} 超过单次上限 {MAX_URLS}，将截断")
        urls = urls[:MAX_URLS]

    payload: dict = {"host": HOST, "key": key, "urlList": urls}
    if args.key_location:
        payload["keyLocation"] = f"{DOMAIN}/{keyfile.name}"

    body = json.dumps(payload, ensure_ascii=False, indent=2)
    print(f"密钥文件     : {keyfile.name}（内容等于文件名 ✓）")
    print(f"URL 来源     : {src}")
    print(f"URL 数量     : {len(urls)}")
    print(f"端点         : {ENDPOINT}")
    print()
    print("请求体：")
    print(body if len(urls) <= 15 else
          json.dumps({"host": HOST, "key": key,
                      "urlList": urls[:5] + [f"…（其余 {len(urls) - 5} 条）"]},
                     ensure_ascii=False, indent=2))
    print()

    if not args.submit:
        print("【dry-run】未实际提交。确认无误后加 --submit。")
        print()
        print("⚠️ 提交前请确认密钥文件已在线上可访问：")
        print(f"     curl -sS {DOMAIN}/{keyfile.name}")
        print("   否则搜索引擎无法校验密钥，提交会被拒（403/422）。")
        return 0

    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": "chaos-for-agent-indexnow/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            code = resp.status
            text = resp.read().decode("utf-8", "replace")
        print(f"HTTP {code} —— {text[:300] or '(空响应体，通常表示已接受)'}")
        # 官方语义：200/202 表示已接收
        return 0 if code in (200, 202) else 1
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")[:300]
        print(f"HTTP {e.code} —— {detail}", file=sys.stderr)
        hints = {
            400: "格式无效（检查 host/key/urlList）",
            403: "密钥无效 —— 确认 {key}.txt 已在站点根目录可访问且内容等于文件名",
            422: "URL 不属于该 host，或密钥与 host 不匹配",
            429: "请求过于频繁 —— 稍后重试",
        }
        if e.code in hints:
            print(f"提示：{hints[e.code]}", file=sys.stderr)
        return 1
    except Exception as e:  # noqa: BLE001
        print(f"提交异常：{e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
