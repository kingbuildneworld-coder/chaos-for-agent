#!/usr/bin/env node
/**
 * 构建期预生成 faq.json —— 供 Worker 的 /faq 页面用 1 个子请求取用。
 *
 * 为什么需要它
 * ------------
 * /faq 原实现会顺序抓取**全部**文章 markdown（86 篇 = 86 个 subrequest），
 * 而 Cloudflare Workers 免费版单个请求上限是 **50 个 subrequest** —— 必然超限抛错，
 * 所以 /faq 在线上长期是坏的（旧代码返回 500 并回显内部错误，后被容错层转为 503）。
 *
 * 只靠"取最近 N 篇"也不可行：实测全站 6 篇含 FAQ 的文章**全部是旧文**，
 * 按日期取最近 40 篇会一篇都覆盖不到，页面退化成"暂无常见问题"。
 *
 * 因此改为构建期全量扫描一次、产出静态 JSON；页面运行时只读这一个文件。
 *
 * 关键设计：**复用 Worker 自身的实现**
 * ----------------------------------
 * 本脚本 import 了 src/index.js（即线上那个 Worker 模块），用本地文件 mock 上游，
 * 逐篇渲染文章页并抽取其中的 FAQPage JSON-LD。
 * 这样 FAQ 检测逻辑**只有一份**（在 Worker 里），不会出现"Python 版与 JS 版漂移"
 * —— 那正是本仓库历史上反复踩的坑（见审计报告 G-24）。
 *
 * 用法：node scripts/generate_faq_index.mjs
 * 输出：faq.json（确定性：同输入产生同字节）
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const REPO_RAW = 'https://raw.githubusercontent.com/kingbuildneworld-coder/chaos-for-agent/main';
const OUT = join(ROOT, 'faq.json');

// 用本地文件 mock 上游，使 Worker 能在本地完整渲染
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  const s = String(url);
  if (s.startsWith(REPO_RAW)) {
    let rel = s.slice(REPO_RAW.length).replace(/^\//, '');
    try { rel = decodeURIComponent(rel); } catch (_) {}
    const p = join(ROOT, rel);
    if (existsSync(p)) return new Response(readFileSync(p));
    return new Response('nf', { status: 404 });
  }
  return realFetch(url, opts);
};

// 仓库无 package.json，Node 默认把 .js 当 CommonJS；复制成 .mjs 后再 import
const tmp = join(tmpdir(), `dsh-faqgen-${process.pid}.mjs`);
writeFileSync(tmp, readFileSync(join(ROOT, 'src', 'index.js'), 'utf8'));
const worker = (await import(`file://${tmp}`)).default;

const index = JSON.parse(readFileSync(join(ROOT, 'articles', 'index.json'), 'utf8'));

/** 从渲染出的文章页里抽取 FAQPage 的问答对。 */
function extractFaq(html) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  for (const b of blocks) {
    let obj;
    try { obj = JSON.parse(b[1].trim()); } catch (_) { continue; }
    if (!obj || obj['@type'] !== 'FAQPage' || !Array.isArray(obj.mainEntity)) continue;
    const faqs = [];
    for (const q of obj.mainEntity) {
      const question = (q && q.name) || '';
      const answer = (q && q.acceptedAnswer && q.acceptedAnswer.text) || '';
      if (question && answer) faqs.push({ question, answer });
    }
    if (faqs.length) return faqs;
  }
  return null;
}

const items = [];
for (const a of index) {
  const res = await worker.fetch(new Request(`https://bi-chao.com/articles/${a.slug}`), {}, {});
  if (!res.ok) continue;
  const html = await res.text();
  const faqs = extractFaq(html);
  if (!faqs) continue;
  items.push({
    slug: a.slug,
    title: a.title,
    url: `https://bi-chao.com/articles/${a.slug}`,
    date: a.date || '',
    faqs,
  });
}

// 稳定排序，保证同输入产生同字节
items.sort((x, y) => (y.date || '').localeCompare(x.date || '') || x.slug.localeCompare(y.slug));

const dates = index.map((a) => a.date).filter(Boolean).sort();
const total = items.reduce((n, it) => n + it.faqs.length, 0);

const payload = {
  generated_from: 'src/index.js (Worker) + articles/*.md',
  // 用"最新文章日期"而非墙钟时间，保证无变更时重跑是零 diff
  updated: dates[dates.length - 1] || '',
  scanned_articles: index.length,
  articles_with_faq: items.length,
  total_questions: total,
  items,
};

const text = JSON.stringify(payload, null, 2) + '\n';
const before = existsSync(OUT) ? readFileSync(OUT, 'utf8') : null;
if (before === text) {
  console.log(`faq.json: unchanged  (扫描 ${index.length} 篇 → ${items.length} 篇有 FAQ，共 ${total} 问)`);
} else {
  writeFileSync(OUT, text);
  console.log(`faq.json: updated    (扫描 ${index.length} 篇 → ${items.length} 篇有 FAQ，共 ${total} 问)`);
}
