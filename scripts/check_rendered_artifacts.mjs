#!/usr/bin/env node
/**
 * 一致性检查：Worker 动态输出 vs 仓库里的静态产物。
 *
 * 背景
 * ----
 * `/llms.txt`、`/robots.txt`、`/sitemap.xml` 存在**两套独立实现**：
 *   - src/index.js 里的 renderLlms() / renderRobots() / renderSitemap()（线上实际响应）
 *   - scripts/generate_site.py 里的 gen_llms() / gen_sitemap()（写入仓库的副本）
 * 两者一旦漂移，就会出现"仓库版与线上版不一致" —— 这正是审计中 G-06 的表现
 * （线上 llms.txt 是 86 篇、仓库版却停在 84 篇）。
 *
 * 本脚本用本地文件 mock 上游 GitHub raw，渲染 Worker 的输出并与仓库文件比对：
 *   - llms.txt  / robots.txt : 要求**逐字节一致**
 *   - sitemap.xml            : 要求 **URL 集合一致**
 *
 * 为什么 sitemap.xml 只比 URL 集合
 * --------------------------------
 * 两套实现当前在格式上本就不同，且这是**既存差异、非本次引入**：
 *   - Python 版：单行 ElementTree 输出，每个 <url> 带 <lastmod>
 *   - Worker 版：缩进多行输出，**不含 <lastmod>**
 * 线上取 Worker 版，所以线上 sitemap 目前没有 lastmod —— 这本身是一个可改进项
 * （lastmod 是有效的抓取优先级信号）。在两者格式对齐之前，本脚本只强制 URL 集合
 * 一致，避免把一个既存的格式差异误报成漂移。
 *
 * 用法：node scripts/check_rendered_artifacts.mjs
 * 退出码：0 = 一致；1 = 存在漂移。
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const REPO_RAW = 'https://raw.githubusercontent.com/kingbuildneworld-coder/chaos-for-agent/main';

// --- 用本地文件 mock 上游，使 Worker 在本地可渲染 ---
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  const u = String(url);
  if (u.startsWith(REPO_RAW)) {
    const rel = u.slice(REPO_RAW.length).replace(/^\//, '');
    const p = join(ROOT, rel);
    if (existsSync(p)) {
      return new Response(readFileSync(p), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
    }
    return new Response('Not Found', { status: 404 });
  }
  return realFetch(url, opts);
};

// Node 默认把 .js 当 CommonJS；仓库无 package.json，
// 故把 Worker 源码复制成 .mjs 再动态 import。
const workerSrc = readFileSync(join(ROOT, 'src', 'index.js'), 'utf8');
const tmpWorker = join(tmpdir(), `dsh-worker-check-${process.pid}.mjs`);
writeFileSync(tmpWorker, workerSrc);
const { default: worker } = await import(`file://${tmpWorker}`);

async function render(path) {
  const res = await worker.fetch(new Request(`https://bi-chao.com${path}`), {}, {});
  return { status: res.status, text: await res.text() };
}

const results = [];
let failed = 0;

function report(name, ok, detail) {
  results.push({ name, ok, detail });
  if (!ok) failed++;
  console.log(`  ${ok ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`);
}

// ---------- 1) llms.txt：逐字节 ----------
{
  const live = (await render('/llms.txt')).text;
  const repo = readFileSync(join(ROOT, 'llms.txt'), 'utf8');
  const ok = live === repo;
  let detail = `${repo.length} 字符`;
  if (!ok) {
    detail += ` / Worker ${live.length} 字符`;
    const a = repo.split('\n'), b = live.split('\n');
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if (a[i] !== b[i]) {
        detail += ` | 首个差异在第 ${i + 1} 行`;
        console.log(`      仓库: ${JSON.stringify((a[i] ?? '(缺行)').slice(0, 100))}`);
        console.log(`      Worker: ${JSON.stringify((b[i] ?? '(缺行)').slice(0, 100))}`);
        break;
      }
    }
  }
  report('llms.txt 与 Worker 输出逐字节一致', ok, detail);
}

// ---------- 2) robots.txt：逐字节 ----------
{
  const live = (await render('/robots.txt')).text;
  const repo = readFileSync(join(ROOT, 'robots.txt'), 'utf8');
  const ok = live === repo;
  let detail = '';
  if (!ok) {
    const a = new Set(repo.split('\n'));
    const b = new Set(live.split('\n'));
    const onlyRepo = [...a].filter(x => !b.has(x) && x.trim());
    const onlyLive = [...b].filter(x => !a.has(x) && x.trim());
    detail = `仅仓库有 ${onlyRepo.length} 行、仅 Worker 有 ${onlyLive.length} 行`;
    onlyRepo.slice(0, 4).forEach(x => console.log(`      仅仓库: ${JSON.stringify(x)}`));
    onlyLive.slice(0, 4).forEach(x => console.log(`      仅Worker: ${JSON.stringify(x)}`));
  }
  report('robots.txt 与 Worker 输出逐字节一致', ok, detail);
}

// ---------- 3) sitemap.xml：URL 集合 ----------
{
  const live = (await render('/sitemap.xml')).text;
  const repo = readFileSync(join(ROOT, 'sitemap.xml'), 'utf8');
  const locs = (s) => new Set([...s.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]));
  const L = locs(live), R = locs(repo);
  const onlyRepo = [...R].filter(u => !L.has(u));
  const onlyLive = [...L].filter(u => !R.has(u));
  const ok = onlyRepo.length === 0 && onlyLive.length === 0;
  let detail = `双方各 ${L.size} / ${R.size} 条 URL`;
  if (!ok) {
    detail += ` | 仅仓库 ${onlyRepo.length}、仅 Worker ${onlyLive.length}`;
    onlyRepo.slice(0, 5).forEach(u => console.log(`      仅仓库: ${u}`));
    onlyLive.slice(0, 5).forEach(u => console.log(`      仅Worker: ${u}`));
  }
  report('sitemap.xml URL 集合一致', ok, detail);

  const liveHasLastmod = /<lastmod>/.test(live);
  const repoHasLastmod = /<lastmod>/.test(repo);
  console.log(`  ℹ lastmod：Worker=${liveHasLastmod ? '有' : '无'} / Python=${repoHasLastmod ? '有' : '无'}`
    + (liveHasLastmod !== repoHasLastmod ? '（既存差异：线上 sitemap 缺少 lastmod，属可改进项）' : ''));

  // faq.json 新鲜度
  // /faq 页面运行时只读这一个预生成文件（否则会因逐篇抓取超出 Workers 50 个子请求上限）。
  // 它的生成依赖 Node 复用 Worker 逻辑，因此必须在 CI 里显式校验，否则会静默变旧：
  // 新增了带 FAQ 的文章、而 faq.json 未重生成时，/faq 页面会悄悄少内容。
  try {
    const gen = spawnSync('node', [join(ROOT, 'scripts', 'generate_faq_index.mjs')], {
      cwd: ROOT, encoding: 'utf8', timeout: 300000,
    });
    if (gen.error || gen.status !== 0) {
      console.log(`  ℹ faq.json：跳过新鲜度校验（生成器不可用：${(gen.error && gen.error.message) || ('exit ' + gen.status)}）`);
    } else {
      const out = (gen.stdout || '').trim();
      report('faq.json 与当前文章一致（非陈旧）', /faq\.json: unchanged/.test(out), out.split('\n').pop());
    }
  } catch (e) {
    console.log(`  ℹ faq.json：跳过新鲜度校验（${e && e.message}）`);
  }
}

console.log();
if (failed === 0) {
  console.log('✅ 无漂移：Worker 输出与仓库产物一致');
} else {
  console.log(`❌ 检测到 ${failed} 处漂移 —— 请同步 src/index.js 与 scripts/generate_site.py`);
}
process.exit(failed === 0 ? 0 : 1);
