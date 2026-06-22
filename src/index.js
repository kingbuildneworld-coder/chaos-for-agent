/**
 * bi-chao.com Cloudflare Worker — GEO Optimized v2.2
 *
 * 修复: canonical/og:url 路径 + WebSite Schema + SearchAction + 缓存优化
 */

const REPO_RAW = 'https://raw.githubusercontent.com/kingbuildneworld-coder/chaos-for-agent/main';
const DOMAIN = 'https://bi-chao.com';
const AUTHOR_NAME = '毕超';

// ========== JSON-LD Schema 模板 ==========

const SCHEMA_ARTICLE = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "__TITLE__",
  "description": "__DESCRIPTION__",
  "author": {
    "@type": "Person",
    "name": "__AUTHOR__",
    "url": "https://bi-chao.com/about",
    "jobTitle": "中国农业发展银行总行处长",
    "alumniOf": "清华大学",
    "memberOf": [
      {"@type": "Organization", "name": "中国人工智能学会"},
      {"@type": "Organization", "name": "中国计算机学会"}
    ]
  },
  "datePublished": "__DATE__",
  "dateModified": "__DATE__",
  "publisher": {
    "@type": "Organization",
    "name": "chaos-for-agent",
    "url": "https://bi-chao.com"
  },
  "inLanguage": "zh-CN",
  "isAccessibleForFree": true,
  "about": {"@type": "Thing", "name": "__TOPIC__"},
  "keywords": "__TAGS__"
};

const SCHEMA_BOOK = {
  "@context": "https://schema.org",
  "@type": "Book",
  "name": "__TITLE__",
  "description": "__DESCRIPTION__",
  "author": {
    "@type": "Person",
    "name": "__AUTHOR__",
    "url": "https://bi-chao.com/about",
    "jobTitle": "中国农业发展银行总行处长"
  },
  "publisher": {"@type": "Organization", "name": "中国金融出版社"},
  "datePublished": "__PUB_DATE__",
  "numberOfPages": "__PAGES__",
  "inLanguage": "zh-CN"
};

const SCHEMA_PERSON = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "毕超",
  "alternateName": "Bi Chao",
  "description": "博士、高级工程师（计算机技术专业），中国农业发展银行总行处长。清华大学校友导师，中国人工智能学会终身会员，中国计算机学会学术审稿专家。研究方向为大语言模型、数字金融、金融科技。",
  "url": "https://bi-chao.com/about",
  "jobTitle": "中国农业发展银行总行处长",
  "worksFor": {"@type": "Organization", "name": "中国农业发展银行", "url": "https://www.adbc.com.cn"},
  "alumniOf": {"@type": "CollegeOrUniversity", "name": "清华大学"},
  "memberOf": [
    {"@type": "Organization", "name": "中国人工智能学会"},
    {"@type": "Organization", "name": "中国计算机学会"},
    {"@type": "Organization", "name": "中国职业技术教育学会人工智能专家指导委员会"}
  ],
  "award": "北京市西城区'西融计划'第一批青年拔尖人才（2024年）",
  "knowsAbout": ["大语言模型", "数字金融", "金融科技", "人工智能", "银行业数字化转型", "数据治理"],
  "sameAs": ["https://bi-chao.com/about"]
};

const SCHEMA_ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "chaos-for-agent",
  "alternateName": "毕超的知识库",
  "url": "https://bi-chao.com",
  "description": "Agent-First 内容写作、AI大模型、银行业数字化转型深度文章知识库。由毕超博士创建和维护。",
  "founder": {"@type": "Person", "name": "毕超", "url": "https://bi-chao.com/about"}
};

const SCHEMA_WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "chaos-for-agent",
  "alternateName": "毕超的知识库",
  "url": "https://bi-chao.com",
  "description": "Agent-First 内容写作、AI大模型、银行业数字化转型深度文章知识库。由毕超博士创建和维护。",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://bi-chao.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

// ========== HTML 模板 ==========

const TEMPLATE_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>__TITLE__ — 毕超的知识库</title>
<meta name="description" content="__DESCRIPTION__">
<meta name="author" content="毕超">
<meta property="og:title" content="__TITLE__">
<meta property="og:description" content="__DESCRIPTION__">
<meta property="og:type" content="__OGTYPE__">
<meta property="og:url" content="https://bi-chao.com/articles/__SLUG__">
<meta property="og:site_name" content="chaos-for-agent">
<meta property="og:locale" content="zh_CN">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="__TITLE__">
<meta name="twitter:description" content="__DESCRIPTION__">
<link rel="canonical" href="https://bi-chao.com/articles/__SLUG__">
<link rel="alternate" type="application/atom+xml" title="chaos-for-agent RSS" href="https://bi-chao.com/feed.xml">
<script type="application/ld+json">
__JSONLD__
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "首页", "item": "https://bi-chao.com/"},
    {"@type": "ListItem", "position": 2, "name": "__TITLE__", "item": "https://bi-chao.com/articles/__SLUG__"}
  ]
}
</script>
<style>
  :root {--bg:#fafaf8;--text:#1a1a1a;--muted:#6b6b6b;--accent:#1e40af;--border:#e5e5e5;--code-bg:#f4f4f5;}
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:"Noto Serif SC","Source Han Serif SC","Songti SC",Georgia,serif;background:var(--bg);color:var(--text);line-height:1.75;max-width:720px;margin:0 auto;padding:3rem 1.5rem 6rem;}
  h1{font-size:1.75rem;font-weight:800;margin-bottom:.25rem;}
  h2{font-size:1.25rem;font-weight:700;margin:2.5rem 0 1rem;padding-bottom:.35rem;border-bottom:2px solid var(--accent);}
  h3{font-size:1.05rem;font-weight:700;margin:1.75rem 0 .75rem;}
  h4{font-size:1rem;font-weight:700;margin:1.25rem 0 .5rem;}
  p{margin:.75rem 0;}
  code{font-family:"JetBrains Mono","SF Mono",Consolas,monospace;font-size:.8rem;background:var(--code-bg);padding:.15em .35em;border-radius:3px;}
  pre{background:var(--code-bg);padding:1rem 1.25rem;border-radius:6px;overflow-x:auto;font-size:.8rem;line-height:1.6;margin:.75rem 0;}
  table{width:100%;border-collapse:collapse;margin:1rem 0 1.5rem;font-size:.875rem;}
  th,td{padding:.55rem .75rem;text-align:left;border-bottom:1px solid var(--border);}
  th{background:#f8f8f8;font-weight:700;}
  ul,ol{margin:.5rem 0 .5rem 1.5rem;}
  li{margin:.35rem 0;}
  blockquote{border-left:3px solid var(--accent);padding:.5rem 1rem;margin:1rem 0;background:#f8fafc;color:var(--muted);}
  .article-meta{color:var(--muted);font-size:.875rem;margin-bottom:1.5rem;}
  .related-nav{margin-top:3rem;padding-top:1.5rem;border-top:1px solid var(--border);}
  footer{margin-top:3rem;padding-top:1.5rem;border-top:1px solid var(--border);color:var(--muted);font-size:.85rem;}
  footer a,a{color:var(--accent);text-decoration:none;}
  a:hover{text-decoration:underline;}
  strong{font-weight:700;}
  img{max-width:100%;height:auto;}
</style>
</head>
<body>
<article>
  <h1>__TITLE__</h1>
  <div class="article-meta">__AUTHOR__ &nbsp;|&nbsp; __DATE__ &nbsp;|&nbsp; <a href="https://bi-chao.com/">chaos-for-agent</a></div>
  __CONTENT__
</article>
<div class="related-nav">
  <p>← <a href="https://bi-chao.com/">返回首页</a> &nbsp;|&nbsp; <a href="https://bi-chao.com/about">关于作者</a> &nbsp;|&nbsp; <a href="https://bi-chao.com/feed.xml">RSS</a></p>
</div>
<footer>
  <p>&copy; 2026 <a href="https://bi-chao.com/about">毕超</a> · <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/">CC BY-NC-ND 4.0</a> · <a href="https://bi-chao.com/">chaos-for-agent</a></p>
</footer>
</body>
</html>`;

// ========== About 页模板 ==========

const ABOUT_TEMPLATE_PART = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>毕超 — 关于作者 | chaos-for-agent</title>
<meta name="description" content="毕超，博士、高级工程师（计算机技术专业），中国农业发展银行总行处长。清华大学校友导师，中国人工智能学会终身会员。">
<meta property="og:title" content="毕超 — 关于作者">
<meta property="og:description" content="博士、高级工程师，中国农业发展银行总行处长。主要研究方向为大语言模型、数字金融、金融科技。">
<meta property="og:type" content="profile">
<meta property="og:url" content="https://bi-chao.com/about">
<meta property="og:site_name" content="chaos-for-agent">
<meta property="og:locale" content="zh_CN">
<meta name="twitter:card" content="summary">
<link rel="canonical" href="https://bi-chao.com/about">
<script type="application/ld+json">
${JSON.stringify(SCHEMA_PERSON)}
</script>
<style>
  :root{--bg:#fafaf8;--text:#1a1a1a;--muted:#6b6b6b;--accent:#1e40af;--border:#e5e5e5;}
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:"Noto Serif SC","Source Han Serif SC","Songti SC",Georgia,serif;background:var(--bg);color:var(--text);line-height:1.75;max-width:720px;margin:0 auto;padding:3rem 1.5rem 6rem;}
  h1{font-size:1.75rem;font-weight:800;margin-bottom:.5rem;}
  h2{font-size:1.25rem;font-weight:700;margin:2rem 0 .75rem;padding-bottom:.35rem;border-bottom:2px solid var(--accent);}
  p,li{margin:.5rem 0;}
  ul{margin-left:1.5rem;}
  table{width:100%;border-collapse:collapse;margin:.75rem 0;font-size:.875rem;}
  th,td{padding:.5rem .75rem;text-align:left;border-bottom:1px solid var(--border);}
  th{background:#f8f8f8;font-weight:700;}
  footer{margin-top:3rem;padding-top:1.5rem;border-top:1px solid var(--border);color:var(--muted);font-size:.85rem;}
  footer a,a{color:var(--accent);text-decoration:none;}
  a:hover{text-decoration:underline;}
</style>
</head>
<body>
__CONTENT__
<footer><p>← <a href="https://bi-chao.com/">返回首页</a> &nbsp;|&nbsp; <a href="https://bi-chao.com/feed.xml">RSS</a> &nbsp;|&nbsp; &copy; 2026 <a href="https://bi-chao.com/">chaos-for-agent</a></p></footer>
</body>
</html>`;

// ========== 工具函数 ==========

/** 简易 YAML 值解析：支持标量、内联数组 ["a","b"]、多行数组 - item */
function parseYamlValue(raw) {
  raw = raw.trim();
  // 内联数组 ["a","b","c"]
  if (/^\[.*\]$/.test(raw)) {
    try {
      return JSON.parse(raw);
    } catch (_) {
      return raw.replace(/^\[|\]$/g, '').split(',').map(s => s.trim().replace(/^"|"$/g, ''));
    }
  }
  // 去掉包裹引号
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1);
  }
  // 数字
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
  return raw;
}

/** YAML Front Matter 解析 */
function parseFrontMatter(md) {
  const match = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { body: md, meta: {} };

  const meta = {};
  const lines = match[1].split('\n');
  let currentKey = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // 多行数组项 - item
    if (currentKey && /^\s+-\s/.test(line)) {
      const itemVal = line.replace(/^\s+-\s+/, '').trim();
      if (!Array.isArray(meta[currentKey])) meta[currentKey] = [];
      meta[currentKey].push(parseYamlValue(itemVal));
      continue;
    }
    // 键值对
    const kv = line.match(/^(\w[\w-]*):\s*(.*)/);
    if (kv) {
      currentKey = kv[1];
      const rawVal = kv[2];
      if (rawVal === '') {
        // 多行数组开始
        meta[currentKey] = [];
        continue;
      }
      meta[currentKey] = parseYamlValue(rawVal);
    }
  }

  return { body: md.substring(match[0].length), meta };
}

/** Markdown → HTML 转换 */
function md2html(md) {
  // 代码块保护
  const codeBlocks = [];
  md = md.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(`<pre><code>${code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').trim()}</code></pre>`);
    return `\x00CB${idx}\x00`;
  });

  // 行内代码
  md = md.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 表格
  const tables = [];
  md = md.replace(/(?:^\|.+\|\s*\n)+/gm, (block) => {
    const lines = block.trim().split('\n');
    if (lines.length < 2) return block;
    const idx = tables.length;
    let html = '<table>';
    // Header
    html += '<thead><tr>' + lines[0].split('|').filter(Boolean).map(c => `<th>${c.trim()}</th>`).join('') + '</tr></thead>';
    // Body (skip separator line)
    html += '<tbody>';
    for (let i = 2; i < lines.length; i++) {
      html += '<tr>' + lines[i].split('|').filter(Boolean).map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
    }
    html += '</tbody></table>';
    tables.push(html);
    return `\x00TB${idx}\x00`;
  });

  // 标题
  md = md.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  md = md.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  md = md.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  md = md.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // 分割线
  md = md.replace(/^---+$/gm, '<hr>');

  // 引用
  md = md.replace(/^[>] (.+)$/gm, '<blockquote><p>$1</p></blockquote>');

  // 列表
  md = md.replace(/((?:^[\-\*] .+$\n?)+)/gm, (block) => {
    const items = block.trim().split('\n').map(l => `<li>${l.replace(/^[\-\*] /, '')}</li>`).join('');
    return `<ul>${items}</ul>`;
  });
  md = md.replace(/((?:^\d+\. .+$\n?)+)/gm, (block) => {
    const items = block.trim().split('\n').map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('');
    return `<ol>${items}</ol>`;
  });

  // 加粗/斜体
  md = md.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  md = md.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  md = md.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // 链接
  md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // 段落
  const lines = md.split('\n');
  const result = [];
  for (const line of lines) {
    if (line.startsWith('\x00CB') || line.startsWith('\x00TB')) {
      const match = line.match(/\x00(CB|TB)(\d+)\x00/);
      if (match) {
        result.push(match[1] === 'CB' ? codeBlocks[parseInt(match[2])] : tables[parseInt(match[2])]);
      }
      continue;
    }
    if (!line.trim()) { result.push(''); continue; }
    if (/^<(h[1-4]|ul|ol|li|blockquote|pre|code|table|thead|tbody|tr|th|td|hr|\/?(ul|ol|table|thead|tbody|blockquote))/.test(line.trim())) {
      result.push(line);
    } else {
      result.push(`<p>${line}</p>`);
    }
  }
  return result.join('\n').replace(/<p>\s*<\/p>/g, '');
}

/** HTML 安全转义 */
function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** 用 __KEY__ 占位符填充模板（安全，不依赖正则替换值） */
function fillTpl(tpl, vars) {
  let result = tpl;
  for (const [key, val] of Object.entries(vars)) {
    result = result.split(`__${key}__`).join(String(val ?? ''));
  }
  return result;
}

// ========== 数据获取 ==========

async function getArticles() {
  const resp = await fetch(`${REPO_RAW}/articles/index.json`, { cf: { cacheTtl: 300 } });
  if (!resp.ok) throw new Error('Failed to fetch index');
  return resp.json();
}

function findArticle(articles, slug) {
  return articles.find(a => a.slug === slug);
}

// ========== 文章渲染 ==========

async function renderArticle(pathname) {
  const slug = (pathname.replace(/^\/articles\//, '').replace(/\.md$/, '')).trim();

  try {
    const articles = await getArticles();
    const article = findArticle(articles, slug);
    if (!article) return new Response('Not Found', { status: 404 });

    // 获取 markdown 原文
    const mdResp = await fetch(`${REPO_RAW}${pathname}`);
    if (!mdResp.ok) return new Response('Not Found', { status: 404 });

    const mdText = await mdResp.text();
    const { body, meta } = parseFrontMatter(mdText);

    // 合并元数据
    const title = meta.title || article.title;
    const description = meta.description || article.description;
    const date = meta.date || article.date;
    const tags = meta.tags || article.tags || [];
    const schemaType = meta.schema_type || article.schema_type || 'Article';

    // 转换正文
    const contentHtml = md2html(body);

    // 构建 JSON-LD（直接构造对象，避免字符串注入）
    let jsonLd;
    if (schemaType === 'Book') {
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "Book",
        "name": title,
        "description": description,
        "author": {"@type": "Person", "name": AUTHOR_NAME, "url": "https://bi-chao.com/about"},
        "publisher": {"@type": "Organization", "name": meta.publisher || "中国金融出版社"},
        "datePublished": meta.publication_date || date,
        "numberOfPages": meta.pages ? String(meta.pages) : "",
        "inLanguage": "zh-CN"
      };
    } else {
      jsonLd = {
        "@context": "https://schema.org",
        "@type": schemaType === 'AcademicPaper' ? 'Article' : schemaType,
        "headline": title,
        "description": description,
        "author": {"@type": "Person", "name": AUTHOR_NAME, "url": "https://bi-chao.com/about", "jobTitle": "中国农业发展银行总行处长", "alumniOf": "清华大学"},
        "datePublished": date,
        "dateModified": date,
        "publisher": {"@type": "Organization", "name": "chaos-for-agent", "url": "https://bi-chao.com"},
        "inLanguage": "zh-CN",
        "isAccessibleForFree": true,
        "about": {"@type": "Thing", "name": (Array.isArray(tags) ? tags[0] : '') || title},
        "keywords": Array.isArray(tags) ? tags.join(', ') : (tags || '')
      };
    }

    const ogType = schemaType === 'Book' ? 'book' : 'article';

    const html = fillTpl(TEMPLATE_HTML, {
      TITLE: title,
      DESCRIPTION: description,
      AUTHOR: AUTHOR_NAME,
      DATE: date,
      SLUG: article.slug,
      OGTYPE: ogType,
      JSONLD: JSON.stringify(jsonLd, null, 2),
      CONTENT: contentHtml
    });

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (e) {
    return new Response(`Error rendering article: ${e.message}`, { status: 500 });
  }
}

// ========== 首页 ==========

async function renderIndex() {
  const articles = await getArticles();

  let listItems = '';
  for (const a of articles) {
    listItems += `
  <li>
    <a href="/articles/${a.slug}">${a.title}</a>
    <span class="date">${a.date}</span>
    <p class="desc">${a.description}</p>
  </li>`;
  }

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="毕超的知识库：Agent-First 内容写作、AI大模型、银行业数字化转型深度文章。">
<meta name="google-site-verification" content="VKkZGy9h23phxHAOaQseoRl9knPfnD_HFVGfI7RSrxs">
<meta name="baidu-site-verification" content="codeva-IkuNscl7vN">
<meta property="og:title" content="毕超的知识库 — chaos-for-agent">
<meta property="og:description" content="Agent-First 内容写作、AI大模型、银行业数字化转型深度文章。">
<meta property="og:type" content="website">
<meta property="og:url" content="https://bi-chao.com/">
<meta property="og:site_name" content="chaos-for-agent">
<meta property="og:locale" content="zh_CN">
<meta name="twitter:card" content="summary">
<link rel="canonical" href="https://bi-chao.com/">
<link rel="alternate" type="application/atom+xml" title="chaos-for-agent RSS" href="https://bi-chao.com/feed.xml">
<script type="application/ld+json">
${JSON.stringify(SCHEMA_WEBSITE)}
</script>
<script type="application/ld+json">
${JSON.stringify(SCHEMA_ORGANIZATION)}
</script>
<title>毕超的知识库 — chaos-for-agent</title>
<style>
  body{max-width:720px;margin:40px auto;padding:0 20px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.8;color:#222;}
  h1{font-size:1.8em;border-bottom:2px solid #eee;padding-bottom:8px;}
  a{color:#2563eb;text-decoration:none;}a:hover{text-decoration:underline;}
  .date{color:#999;font-size:.85em;margin-left:12px;}
  .desc{color:#555;font-size:.9em;margin:4px 0 0 0;}
  li{margin-bottom:16px;}
  footer{margin-top:60px;padding-top:20px;border-top:1px solid #eee;color:#999;font-size:.8em;}
</style>
</head>
<body>
<h1>毕超的知识库</h1>
<p style="color:#555;margin-bottom:24px;">Agent-First 内容写作、AI大模型、银行业数字化转型深度文章</p>
<ul>${listItems}</ul>
<h2 style="margin-top:32px;border-bottom:2px solid #eee;padding-bottom:8px;">教程</h2>
<ul>
  <li><a href="/quant-course/index.html">什么是量化金融？ —— 互动教程</a><span class="date">2026-06-17</span><p class="desc">《和Yibo零基础学习量化金融》第一章互动版：6课掌握量化金融核心概念。</p></li>
  <li><a href="/quant-course/chapter2-first-quant-experiment.html">你的第一个量化实验 —— 互动教程</a><span class="date">2026-06-20</span><p class="desc">《和Yibo零基础学习量化金融》第二章互动版：OHLCV数据、收益率计算、多股波动率对比实验。</p></li>
</ul>
<footer>共 ${articles.length} 篇文章 · <a href="/about">关于作者</a> · <a href="/feed.xml">RSS</a> · <a href="/ai-manifest.json">AI Manifest</a></footer>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
  });
}

// ========== Sitemap ==========

async function renderSitemap() {
  const articles = await getArticles();
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${DOMAIN}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${DOMAIN}/about</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`;

  for (const a of articles) {
    xml += `\n  <url><loc>${DOMAIN}/articles/${a.slug}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`;
  }
  xml += '\n</urlset>';

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' }
  });
}

// ========== llms.txt ==========

async function renderLlms() {
  const articles = await getArticles();
  let txt = `# chaos-for-agent\n\n> 毕超的知识库：Agent-First 内容写作、AI大模型、银行业数字化转型深度文章。\n\n## About\n- [关于作者](${DOMAIN}/about)\n\n## Articles\n`;
  for (const a of articles) {
    txt += `\n- [${a.title}](${DOMAIN}/articles/${a.slug}): ${a.description} (${a.date})`;
  }
  txt += `\n\n## AI Access\n- Sitemap: ${DOMAIN}/sitemap.xml\n- RSS: ${DOMAIN}/feed.xml\n- AI Manifest: ${DOMAIN}/ai-manifest.json\n- Robots: ${DOMAIN}/robots.txt\n`;

  return new Response(txt, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=300' }
  });
}

// ========== robots.txt ==========

function renderRobots() {
  return new Response(`User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: anthropic-ai\nAllow: /\n\nUser-agent: CCBot\nAllow: /\n\nSitemap: ${DOMAIN}/sitemap.xml`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
  });
}

// ========== About ==========

async function renderAbout() {
  try {
    const resp = await fetch(`${REPO_RAW}/about.md`);
    if (resp.ok) {
      const md = await resp.text();
      const contentHtml = md2html(md);
      const html = fillTpl(ABOUT_TEMPLATE_PART, { CONTENT: contentHtml });
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=600' }
      });
    }
  } catch (_) {}
  return new Response('Not Found', { status: 404 });
}

// ========== Feed & Manifest (代理) ==========

async function proxyFile(path, contentType, maxAge) {
  try {
    const resp = await fetch(`${REPO_RAW}${path}`);
    if (resp.ok) {
      return new Response(resp.body, {
        headers: { 'Content-Type': `${contentType}; charset=utf-8`, 'Cache-Control': `public, max-age=${maxAge || 300}` }
      });
    }
  } catch (_) {}
  return new Response('Not Found', { status: 404 });
}

// ========== 主路由 ==========

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const p = url.pathname;

    if (p === '/' || p === '/index.html') return renderIndex();
    if (p === '/sitemap.xml') return renderSitemap();
    if (p === '/llms.txt') return renderLlms();
    if (p === '/robots.txt') return renderRobots();
    if (p.startsWith('/search')) {
      const q = url.searchParams.get('q') || '';
      return Response.redirect(`https://www.google.com/search?q=site%3Abi-chao.com+${encodeURIComponent(q)}`, 302);
    }
    if (p === '/ai-manifest.json') return proxyFile('/ai-manifest.json', 'application/json', 300);
    if (p === '/feed.xml') return proxyFile('/feed.xml', 'application/atom+xml', 300);
    if (p === '/about' || p === '/about/') return renderAbout();
    if (p === '/baidu_verify_codeva-IkuNscl7vN.html') {
      return new Response('d18be845a58e082d27ee6451330313f1', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // 文章页
    if (p.startsWith('/articles/')) {
      const targetPath = p.endsWith('.md') ? p : p + '.md';
      return renderArticle(targetPath);
    }

    // 静态资源
    try {
      const resp = await fetch(`${REPO_RAW}${p}`);
      if (resp.ok) {
        const ext = p.split('.').pop().toLowerCase();
        const mimeMap = {
          html: 'text/html', htm: 'text/html',
          css: 'text/css', js: 'application/javascript', json: 'application/json',
          xml: 'application/xml', svg: 'image/svg+xml',
          png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', ico: 'image/x-icon',
          pdf: 'application/pdf',
          md: 'text/html; charset=utf-8', txt: 'text/plain',
          woff2: 'font/woff2', woff: 'font/woff'
        };
        const ct = mimeMap[ext] || 'text/html; charset=utf-8';
        return new Response(resp.body, {
          headers: { 'Content-Type': ct, 'Cache-Control': 'public, max-age=600' }
        });
      }
    } catch (_) {}

    return new Response('Not Found', { status: 404 });
  }
};
