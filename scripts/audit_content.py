#!/usr/bin/env python3
"""内容引用审计：找出"声称有来源、却没有可点击出处"的文章。

为什么需要这个脚本
------------------
审计发现全站 86 篇文章的引用体系是空的：
  - `references` front matter：**0 篇非空**
  - 正文外链：只有页脚的 CC 协议链接，正文几乎没有
  - 含 Markdown 外链的文章：18 / 86

但几乎所有文章的 description 都在宣称基于一手材料，例如"以麦肯锡报告为
底本""据路透社报道""对照 NVIDIA 提交 SEC 的 8-K 文件"。对读者和 AI 引擎
而言，**声明了来源却不给出处**，等于不可溯源。

代码侧的解析/渲染链路已修复（见 src/index.js 的 normalizeReferences()），
但内容侧需要逐个补引用。本脚本把"该补哪几篇"变成一份有序清单。

判定规则（保守，避免误报）
--------------------------
一个"来源声明"只有在同时满足下列条件时才计为**缺口**：
  1. 正文或 description 命中来源线索词（如「为底本」「据…报道」「来源」「白皮书」）
  2. 且该文章**既没有非空 references，正文也没有任何出站链接**

输出：按缺口严重度排序的清单 + 汇总统计。只读，不修改任何文件。

用法：
  python3 scripts/audit_content.py            # 人读的报告
  python3 scripts/audit_content.py --json     # 机器可读
  python3 scripts/audit_content.py --limit 20 # 只看前 N 篇
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ART_DIR = ROOT / "articles"

# 来源线索：只收**明确的署源表述**。
# 曾用「据」「参考」「基于」这类单字/泛词，结果 "数据" 里含 "据"、几乎全站命中，
# 清单失去区分度。这里改为具体短语 + 正则模式。
STRONG_HINTS = [
    "为底本", "为底稿", "为事实底本", "数据来源", "来源：", "来源:",
    "出处", "白皮书", "招股书", "年报", "半年报", "财报", "季报",
    "arXiv", "DOI", "论文", "期刊", "官方披露", "监管披露", "官网",
    "报道称", "报告称", "新闻稿", "公开信", "发布会", "电话会", "股东信",
]

HINT_PATTERNS = [
    r"据[^，。；！？\n]{1,14}(报道|披露|统计|显示|称|发布)",
    r"以[^，。；！？\n]{1,24}(为底本|为依据|为基础|为底稿|为切口|为坐标)",
    r"(年报|财报|季报|半年报|白皮书|招股书)[^，。；！？\n]{0,12}(显示|指出|称|披露)",
    r"对照[^，。；！？\n]{1,24}(文件|报告|披露|研究)",
]

# 出站链接：Markdown 形式 [text](http...) 或裸 URL（排除站内相对链接）
MD_LINK_RE = re.compile(r"\[[^\]]*\]\((https?://[^)\s]+)\)")
BARE_URL_RE = re.compile(r"(?<![(\[])\bhttps?://[^\s)>\]]+")

FRONT_MATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.S)
REF_BLOCK_RE = re.compile(r"^references:\s*$", re.M)
REF_INLINE_RE = re.compile(r"^references:\s*\[(.*?)\]\s*$", re.M)


def strip_front_matter(text: str) -> tuple[dict, str]:
    m = FRONT_MATTER_RE.match(text)
    if not m:
        return {}, text
    fm_raw = m.group(1)
    meta: dict = {"_raw": fm_raw}
    for line in fm_raw.split("\n"):
        mm = re.match(r"^([A-Za-z_][\w-]*):\s*(.*)$", line)
        if mm:
            meta[mm.group(1)] = mm.group(2).strip().strip("\"'")
    return meta, text[m.end():]


def reference_entries(fm_raw: str) -> int:
    """统计 references 里真正有 URL 的条目数（与 Worker 的 normalizeReferences 同口径）。"""
    m = re.search(r"^references:\s*\n((?:[ \t]+.*\n?)*)", fm_raw, re.M)
    if not m:
        inline = REF_INLINE_RE.search(fm_raw)
        if inline:
            return len([u for u in re.findall(r"https?://[^\s,\]]+", inline.group(1))])
        return 0
    return len(re.findall(r"https?://[^\s,]+", m.group(1)))


def audit() -> list[dict]:
    rows: list[dict] = []
    for p in sorted(ART_DIR.glob("*.md")):
        text = p.read_text(encoding="utf-8")
        meta, body = strip_front_matter(text)
        fm_raw = meta.get("_raw", "")

        outbound_md = {u for u in MD_LINK_RE.findall(body) if "creativecommons.org" not in u}
        outbound_bare = {u for u in BARE_URL_RE.findall(body) if "creativecommons.org" not in u}
        # 裸 URL 现已由 src/index.js 的 autolinkBareUrls() 自动转成可点击链接，
        # 因此它同样算"有可溯源出处"；但不与 Markdown 链接混为一谈，
        # 因为两者的修复路径不同（前者曾是渲染缺陷，后者是内容写作）。
        refs = reference_entries(fm_raw)

        haystack = (meta.get("description", "") or "") + "\n" + body
        hits = {h for h in STRONG_HINTS if h in haystack}
        for pat in HINT_PATTERNS:
            for mm in re.finditer(pat, haystack):
                hits.add(mm.group(0)[:16])
        hints = sorted(hits)

        has_citation = bool(refs) or bool(outbound_md) or bool(outbound_bare)
        gap = bool(hints) and not has_citation

        rows.append({
            "slug": p.stem,
            "title": meta.get("title", p.stem),
            "date": meta.get("date", ""),
            "reference_entries": refs,
            "markdown_links": len(outbound_md),
            "bare_urls": len(outbound_bare),
            "hint_terms": hints,
            "gap": gap,
            # 严重度：命中线索词越多、正文越长，越该优先补
            "severity": len(hints) if gap else 0,
            "body_chars": len(body),
        })
    # 三段稳定排序：slug 升序 -> 日期降序 -> 严重度降序
    rows.sort(key=lambda r: r["slug"])
    rows.sort(key=lambda r: r["date"] or "", reverse=True)
    rows.sort(key=lambda r: r["severity"], reverse=True)
    return rows


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--json", action="store_true", help="输出 JSON")
    ap.add_argument("--limit", type=int, default=0, help="只显示前 N 篇（0=全部）")
    args = ap.parse_args()

    rows = audit()
    total = len(rows)
    gaps = [r for r in rows if r["gap"]]
    with_refs = [r for r in rows if r["reference_entries"] > 0]
    with_md = [r for r in rows if r["markdown_links"] > 0]
    with_bare = [r for r in rows if r["bare_urls"] > 0]
    n_md = sum(r["markdown_links"] for r in rows)
    n_bare = sum(r["bare_urls"] for r in rows)

    if args.json:
        print(json.dumps({
            "total": total,
            "with_references": len(with_refs),
            "articles_with_markdown_links": len(with_md),
            "markdown_links": n_md,
            "articles_with_bare_urls": len(with_bare),
            "bare_urls": n_bare,
            "gaps": len(gaps),
            "rows": rows,
        }, ensure_ascii=False, indent=2))
        return 0

    print("=" * 78)
    print("内容引用审计 —— 找出「声称有来源、却没有可点击出处」的文章")
    print("=" * 78)
    print()
    print(f"  文章总数                        : {total}")
    print(f"  有非空 references               : {len(with_refs)}")
    print(f"  正文含 Markdown 来源链接         : {len(with_md)} 篇 / {n_md} 条")
    print(f"  正文含裸 URL 来源（现已自动链接）: {len(with_bare)} 篇 / {n_bare} 条")
    print(f"  **完全没有任何来源链接**         : {len(gaps)} 篇  ({len(gaps) * 100 // total}%)")
    print()
    print("  说明：裸 URL 过去在页面上是不可点击的纯文本（渲染缺陷），")
    print("        src/index.js 的 autolinkBareUrls() 已修复；本项统计其规模。")
    print()

    if not gaps:
        print("  ✓ 未发现引用缺口")
        return 0

    shown = gaps[: args.limit] if args.limit else gaps
    print(f"  按优先级排序的缺口清单（前 {len(shown)} 篇）：")
    print()
    print(f"  {'#':>3}  {'日期':10}  {'线索词':>4}  {'正文':>6}  文章")
    print(f"  {'-'*3}  {'-'*10}  {'-'*4}  {'-'*6}  {'-'*44}")
    for i, r in enumerate(shown, 1):
        title = r["title"][:44]
        print(f"  {i:>3}  {r['date'] or '—':10}  {len(r['hint_terms']):>4}  {r['body_chars']:>6}  {title}")
    print()
    print("  建议顺序：优先补日期最新、且线索词命中多的（正文质量往往更高，")
    print("  也更可能被 AI 引擎检索引用）。日期分布：")
    from collections import Counter
    months = Counter((r["date"] or "?")[:7] for r in gaps)
    for m, c in sorted(months.items(), reverse=True)[:8]:
        print(f"    {m}: {c} 篇")
    print()
    print("  补法（两种任选，Worker 均支持）：")
    print("    A) front matter 结构化引用：")
    print("         references:")
    print("           - title: \"麦肯锡 2026 银行 AI 报告\"")
    print("             url: \"https://www.mckinsey.com/...\"")
    print("             source: \"McKinsey\"")
    print("    B) 正文行内标记（会自动生成链接）：")
    print("         （数据来源：https://...）   或   [来源:https://...]")
    return 0


if __name__ == "__main__":
    sys.exit(main())
