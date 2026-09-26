#!/usr/bin/env python3
"""Regenerate derived site artifacts for bi-chao.com (chaos-for-agent).

Generated files:
  articles/index.json  - consumed by the Cloudflare Worker at runtime (critical)
  feed.xml             - Atom feed, proxied from repo by the Worker
  sitemap.xml          - static sitemap artifact (Worker also serves dynamic one)
  ai-manifest.json     - AI-agent manifest, proxied from repo by the Worker
  llms-full.txt        - full-content dump for LLM ingestion
  llms.txt             - short index, mirrors the Worker's dynamic output

Pure stdlib, deterministic output. Timestamps derive from the newest article
date rather than wall-clock time, so a no-op run produces a zero diff.
"""

from __future__ import annotations

import json
import re
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote
from xml.etree import ElementTree as ET
from xml.sax.saxutils import escape

DOMAIN = "https://bi-chao.com"
ROOT = Path.cwd()
ART_DIR = ROOT / "articles"

# 低于此文章数的标签页不进 sitemap（与 src/index.js 的 TAG_INDEX_MIN_ARTICLES 保持一致）。
# 薄标签页是近重复的低价值聚合页，会稀释正文的抓取预算。
TAG_INDEX_MIN_ARTICLES = 3

# Curated metadata preserved from the existing manifest.
TOPICS = [
    "AI Agent", "AI大模型", "银行业", "金融科技", "数字化转型", "数据治理",
    "数字人民币", "GEO", "Agent-First 写作", "词元经济", "AI农业", "零基预算",
    "AI安全", "人才发展", "G20", "AI治理", "量子加密", "后量子密码", "量子计算",
    "金融安全",
]
SCHEMA_TYPES = [
    "Article", "Book", "Person", "Organization", "Website", "FAQPage",
    "BreadcrumbList", "ItemList",
]
MANIFEST_META = {
    "name": "chaos-for-agent",
    "domain": "bi-chao.com",
    "description": "毕超的知识库：Agent-First 内容写作、AI大模型、银行业数字化转型深度文章。采用 Agent-First 架构构建，支持 AI Agent 直接读取和引用。",
    "author": {
        "name": "毕超",
        "title": "博士、高级工程师",
        "organization": "金融行业",
        "url": f"{DOMAIN}/about",
    },
    "ai_access": {
        "llms_txt": f"{DOMAIN}/llms.txt",
        "sitemap": f"{DOMAIN}/sitemap.xml",
        "feed": f"{DOMAIN}/feed.xml",
        "robots_txt": f"{DOMAIN}/robots.txt",
    },
    "license": "CC BY-NC-ND 4.0",
    "version": "1.1",
}


def _unquote(v: str) -> str:
    v = v.strip()
    if len(v) >= 2 and v[0] == v[-1] and v[0] in ('"', "'"):
        return v[1:-1]
    return v


def parse_frontmatter(text: str) -> dict:
    """Extract the small subset of frontmatter fields we care about.

    Handles JSON-style arrays (tags: ["a", "b"]), block YAML lists
    (tags:\\n  - a), and plain scalars. Nested maps such as the AIGC label
    block and the schema: block are ignored.
    """
    if not text.startswith("---"):
        return {}
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.S)
    if not m:
        return {}
    fm: dict = {}
    lines = m.group(1).split("\n")
    i = 0
    while i < len(lines):
        km = re.match(r"^([A-Za-z_][A-Za-z0-9_\-]*)\s*:\s?(.*)$", lines[i])
        if not km:
            i += 1
            continue
        key, val = km.group(1), km.group(2).strip()
        i += 1
        cont: list[str] = []
        while i < len(lines) and (lines[i][:1] in (" ", "\t") or not lines[i].strip()):
            cont.append(lines[i])
            i += 1
        if val == "":
            items = []
            for c in cont:
                im = re.match(r"^\s*-\s+(.+?)\s*$", c)
                if im:
                    items.append(_unquote(im.group(1)))
            if items:
                fm[key] = items
            # nested map (AIGC / schema) intentionally dropped
        elif val.startswith("[") and val.endswith("]"):
            try:
                fm[key] = json.loads(val)
            except Exception:
                fm[key] = _unquote(val)
        else:
            fm[key] = _unquote(val)
    return fm


def load_articles() -> list[dict]:
    arts: list[dict] = []
    for p in sorted(ART_DIR.glob("*.md")):
        fm = parse_frontmatter(p.read_text(encoding="utf-8"))
        title = (fm.get("title") or "").strip()
        if not title or title == p.stem:
            continue
        tags = fm.get("tags", [])
        if isinstance(tags, str):
            tags = [tags]
        if not isinstance(tags, list):
            tags = []
        arts.append({
            "title": title,
            "slug": p.stem,
            "url": f"/articles/{p.name}",
            "description": fm.get("description", ""),
            "date": (fm.get("date") or "").strip(),
            "tags": [t for t in tags if isinstance(t, str) and t.strip()],
            "schema_type": (fm.get("schema_type") or "Article"),
        })
    # stable: date descending, slug ascending within a date
    arts.sort(key=lambda a: a["slug"])
    arts.sort(key=lambda a: a["date"], reverse=True)
    return arts


def effective_date(articles: list[dict]) -> str:
    dates = [a["date"] for a in articles if a["date"]]
    return max(dates) if dates else datetime.now(timezone.utc).strftime("%Y-%m-%d")


def git_date(path: str, fallback: str) -> str:
    """Last commit date (YYYY-MM-DD) that touched *path*, or *fallback*."""
    import subprocess

    try:
        out = subprocess.run(
            ["git", "log", "-1", "--format=%ad", "--date=short", "--", path],
            capture_output=True, text=True, timeout=10, check=True,
        )
        d = out.stdout.strip()
        if re.match(r"^\d{4}-\d{2}-\d{2}$", d):
            return d
    except Exception:
        pass
    return fallback


def tag_map(articles: list[dict]) -> dict[str, int]:
    c: Counter = Counter()
    for a in articles:
        c.update(a["tags"])
    return dict(c)


def gen_index(articles: list[dict]) -> str:
    return json.dumps(articles, ensure_ascii=False, indent=2) + "\n"


def _xml(s) -> str:
    return escape(str(s), {'"': "&quot;", "'": "&apos;"})


def gen_feed(articles: list[dict], edate: str) -> str:
    out = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="zh-CN">',
        f"  <id>{DOMAIN}/</id>",
        "  <title>chaos-for-agent — 毕超的知识库</title>",
        "  <subtitle>Agent-First 内容写作、AI大模型、银行业数字化转型深度文章</subtitle>",
        f"  <updated>{edate}T00:00:00Z</updated>",
        f'  <link href="{DOMAIN}/" rel="alternate" type="text/html"/>',
        f'  <link href="{DOMAIN}/feed.xml" rel="self" type="application/atom+xml"/>',
        "  <author>",
        "    <name>毕超</name>",
        f"    <uri>{DOMAIN}/about</uri>",
        "  </author>",
        f'  <generator uri="{DOMAIN}/">chaos-for-agent</generator>',
        "  <rights>CC BY-NC-ND 4.0</rights>",
        "",
    ]
    for a in articles:
        out.append("  <entry>")
        out.append(f'    <id>{DOMAIN}/articles/{a["slug"]}</id>')
        out.append(f"    <title>{_xml(a['title'])}</title>")
        out.append(f'    <updated>{a["date"] or edate}T00:00:00Z</updated>')
        out.append(f'    <link href="{DOMAIN}/articles/{a["slug"]}" rel="alternate" type="text/html"/>')
        out.append(f'    <summary>{_xml(a["description"])}</summary>')
        for t in a["tags"]:
            out.append(f'    <category term="{_xml(t)}"/>')
        out.append("  </entry>")
    out.append("</feed>")
    return "\n".join(out) + "\n"


def gen_sitemap(articles: list[dict], edate: str) -> str:
    SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
    ET.register_namespace("", SITEMAP_NS)

    def q(tag: str) -> str:
        return f"{{{SITEMAP_NS}}}{tag}"

    root = ET.Element(q("urlset"))

    def add(loc, freq, prio, mod):
        u = ET.SubElement(root, q("url"))
        ET.SubElement(u, q("loc")).text = loc
        ET.SubElement(u, q("changefreq")).text = freq
        ET.SubElement(u, q("priority")).text = prio
        ET.SubElement(u, q("lastmod")).text = mod

    add(f"{DOMAIN}/", "weekly", "1.0", edate)
    add(f"{DOMAIN}/about", "monthly", "0.6", git_date("about.md", edate))
    for a in sorted(articles, key=lambda a: a["slug"]):
        add(f'{DOMAIN}/articles/{a["slug"]}', "monthly", "0.8", a["date"] or edate)
    add(f"{DOMAIN}/quant-course/index.html", "monthly", "0.7", edate)
    add(f"{DOMAIN}/quant-course/chapter2-first-quant-experiment.html", "monthly", "0.7", edate)
    # tutorials/ 下的互动教程：此前完全未进 sitemap，是不可发现的孤儿页
    add(f"{DOMAIN}/tutorials/{quote('什么是量化金融_互动教程.html')}", "monthly", "0.6", edate)
    add(f"{DOMAIN}/tags", "weekly", "0.6", edate)
    # 只收录达到阈值的标签页：原先全量收录 416 个标签页（占 sitemap 的 82%），
    # 大量是仅含 1 篇文章的薄聚合页，稀释了正文的抓取预算。
    counts = tag_map(articles)
    for tag in sorted(counts):
        if counts[tag] < TAG_INDEX_MIN_ARTICLES:
            continue
        add(f"{DOMAIN}/tags/{quote(tag)}", "weekly", "0.5", edate)

    body = ET.tostring(root, encoding="utf-8", xml_declaration=True).decode("utf-8")
    return body + "\n"


def gen_manifest(articles: list[dict], edate: str) -> str:
    man_arts = []
    for a in articles:
        e = {
            "slug": a["slug"],
            "title": a["title"],
            "date": a["date"],
            "description": a["description"],
        }
        if a["tags"]:
            e["tags"] = a["tags"]
        man_arts.append(e)
    manifest = {
        "name": MANIFEST_META["name"],
        "domain": MANIFEST_META["domain"],
        "description": MANIFEST_META["description"],
        "author": MANIFEST_META["author"],
        "content": {
            "format": "Markdown with YAML front matter",
            "total_articles": len(articles),
            "update_frequency": "weekly",
            "primary_language": "zh-CN",
            "topics": TOPICS,
            "schema_types": SCHEMA_TYPES,
        },
        "ai_access": MANIFEST_META["ai_access"],
        "articles": man_arts,
        "license": MANIFEST_META["license"],
        "last_updated": edate,
        "version": MANIFEST_META["version"],
        "total_articles": len(articles),
    }
    return json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"


def gen_llms_full(articles: list[dict], edate: str) -> str:
    out = [
        "# chaos-for-agent — 全量知识库",
        "",
        f"> 面向 AI Agent 的完整知识库。共 {len(articles)} 篇文章。",
        f"> 生成时间: {edate}",
        "> 作者: 毕超，金融行业风险管理从业者",
        "",
        "---",
        "",
    ]
    for a in articles:
        p = ART_DIR / f"{a['slug']}.md"
        content = p.read_text(encoding="utf-8").rstrip()
        out.append(f"## {a['title']}")
        out.append("")
        out.append(f"日期: {a['date']}")
        out.append("")
        out.append(content)
        out.append("")
        out.append("---")
        out.append("")
    return "\n".join(out)


def gen_llms(articles: list[dict], edate: str) -> str:
    tm = tag_map(articles)
    top = sorted(tm, key=lambda t: (-tm[t], t))[:10]
    out = [
        "# chaos-for-agent — 智能体的知识库",
        "",
        "> 面向 AI Agent 和搜索引擎优化的知识站点。主题：Agent-First 内容写作、AI大模型、银行业数字化转型。",
        "> 作者：毕超，金融行业风险管理从业者，清华大学校友。",
        "",
        "## Site Map",
        f"- Home: {DOMAIN}/",
        f"- About: {DOMAIN}/about",
        f"- Tags: {DOMAIN}/tags",
        f"- Tutorials: {DOMAIN}/quant-course/index.html",
        "",
        f"## Articles ({len(articles)})",
    ]
    for a in articles:
        out.append(f'- [{a["title"]}]({DOMAIN}/articles/{a["slug"]})')
        out.append(f'  - Description: {a["description"]}')
        out.append(f'  - Date: {a["date"]}')
        if a["tags"]:
            out.append(f'  - Tags: {", ".join(a["tags"])}')
        out.append("")
    out.append(f"## Topics (top {len(top)})")
    for t in top:
        out.append(f'- {t}: {tm[t]} articles → {DOMAIN}/tags/{quote(t)}')
    out.append("")
    out.append("## For AI Agents")
    out.append(f"- Sitemap: {DOMAIN}/sitemap.xml")
    out.append(f"- RSS: {DOMAIN}/feed.xml")
    out.append(f"- AI Manifest: {DOMAIN}/ai-manifest.json")
    out.append(f"- Robots: {DOMAIN}/robots.txt")
    out.append(f"- Search: {DOMAIN}/search?q={{query}}")
    return "\n".join(out) + "\n"


TARGETS = {
    "articles/index.json": gen_index,
    "feed.xml": gen_feed,
    "sitemap.xml": gen_sitemap,
    "ai-manifest.json": gen_manifest,
    "llms-full.txt": gen_llms_full,
    "llms.txt": gen_llms,
}


def validate(articles: list[dict]) -> None:
    slugs = [a["slug"] for a in articles]
    assert len(slugs) == len(set(slugs)), "duplicate slugs"
    assert all(a["title"] for a in articles), "article missing title"
    for p in ART_DIR.glob("*.md"):
        if p.stem in slugs:
            continue
        fm = parse_frontmatter(p.read_text(encoding="utf-8"))
        t = (fm.get("title") or "").strip()
        assert not t or t == p.stem, f"{p.name} has a title but was dropped"


def main() -> int:
    articles = load_articles()
    validate(articles)
    edate = effective_date(articles)
    written = 0
    for rel, fn in TARGETS.items():
        path = ROOT / rel
        if path is None:  # pragma: no cover
            continue
        args = (articles,) if rel == "articles/index.json" else (articles, edate)
        path.parent.mkdir(parents=True, exist_ok=True)
        before = path.read_text(encoding="utf-8") if path.exists() else None
        text = fn(*args)
        if before != text:
            path.write_text(text, encoding="utf-8")
            written += 1
        print(f"{rel}: {'updated' if before != text else 'unchanged'}")
    print(f"articles={len(articles)} effective_date={edate} files_changed={written}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
