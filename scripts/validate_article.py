#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
文章发布前校验脚本（强制门）。
用法：
  python3 scripts/validate_article.py articles/xxx.md   # 校验单篇
  python3 scripts/validate_article.py                    # 校验全部 articles/*.md
任一检查不通过则退出码为 1，全部通过退出码为 0。
规则与 src/index.js 渲染器、scripts/generate_site.py 保持一致。
"""
import sys, re, glob, os

FM_FIELDS = ["title", "date", "description", "tags", "schema_type", "references"]


def parse_article(path):
    lines = open(path, encoding="utf-8").read().split("\n")
    if lines[0].strip() != "---":
        return None, None, "缺少 front matter 起始 ---"
    end = next((i for i in range(1, len(lines)) if lines[i].strip() == "---"), None)
    if end is None:
        return None, None, "缺少 front matter 结束 ---"
    return "\n".join(lines[1:end]), "\n".join(lines[end + 1:]), None


def fm_value(fm, name):
    m = re.search(rf"^{name}:\s*(.*)$", fm, re.M)
    return m.group(1).strip() if m else None


def validate(path):
    errs = []
    fm, body, perr = parse_article(path)
    if perr:
        return [perr]

    # title
    title = fm_value(fm, "title")
    if not title:
        errs.append("缺少 title")
    elif not re.search(r"[\u4e00-\u9fff]", title):
        errs.append("title 应为中文标题")

    # date
    date = fm_value(fm, "date")
    if not date or not re.match(r"^\d{4}-\d{2}-\d{2}$", date):
        errs.append("date 格式应为 YYYY-MM-DD")

    # description 100-200 字（按字符数，含标点；剥离外层包裹引号）
    desc = fm_value(fm, "description")
    if desc is None:
        errs.append("缺少 description")
    else:
        desc_text = desc[1:-1] if len(desc) >= 2 and desc.startswith('"') and desc.endswith('"') else desc
        if not (100 <= len(desc_text) <= 200):
            errs.append(f"description 字数 {len(desc_text)}，要求 100-200")

    # tags 3-8
    tags_line = fm_value(fm, "tags")
    tags = re.findall(r'"([^"]+)"', tags_line or "")
    if not (3 <= len(tags) <= 8):
        errs.append(f"tags 数量 {len(tags)}，要求 3-8")

    # schema_type
    if fm_value(fm, "schema_type") != "Article":
        errs.append('schema_type 应为 Article')

    # references >= 3，且每条含 title/url/source
    refs_block = fm[fm.find("references:"):] if "references:" in fm else ""
    n_ref = refs_block.count("- title:")
    if n_ref < 3:
        errs.append(f"references 数量 {n_ref}，要求 >=3")
    for chunk in re.split(r"\n\s*- title:", refs_block)[1:]:
        if not re.search(r"url:\s*\S+", chunk):
            errs.append("存在缺少 url 的引用")
        if not re.search(r"source:\s*\S+", chunk):
            errs.append("存在缺少 source 的引用")

    # 正文中文字数 >=1500
    cn = len(re.findall(r"[\u4e00-\u9fff]", body))
    if cn < 1500:
        errs.append(f"正文中文字数 {cn}，要求 >=1500")

    # 文首 1000 字符加粗要点 >=4，且每条 12-140（含空格，与渲染器 length 一致）
    early = body[:1000]
    takeaways = []
    for m in re.finditer(r"\*\*([^*\n]+?)\*\*", early):
        t = m.group(1).strip()
        if 12 <= len(t) <= 140 and t not in takeaways:
            takeaways.append(t)
    if len(takeaways) < 4:
        errs.append(f"文首合格加粗要点 {len(takeaways)} 条，要求 >=4（每条含空格 12-140 字）")

    # 【核心规则】有序列表不得被空行打断（否则渲染成多个 ol，编号重复为 1）
    broken = re.findall(r"^\d+\. .+?$\n\n+(?=\d+\. )", body, re.M)
    if broken:
        errs.append(f"存在 {len(broken)} 处空行打断有序列表（编号会重复，必须去掉列表项间空行）")

    # 禁止正文末尾 URL JSON 数组
    if re.search(r'\["https?://', body):
        errs.append('正文包含 ["url",...] JSON 数组，会被原样渲染，须删除')

    return errs


def main():
    args = sys.argv[1:]
    paths = args if args else sorted(glob.glob("articles/*.md"))
    total_fail = 0
    for path in paths:
        errs = validate(path)
        if errs:
            total_fail += 1
            print(f"❌ {path}")
            for e in errs:
                print(f"    - {e}")
        else:
            print(f"✅ {path}")
    if total_fail:
        print(f"\n{total_fail} 篇未通过，禁止推送。")
        sys.exit(1)
    print("\n全部通过，可以推送。")


if __name__ == "__main__":
    main()
