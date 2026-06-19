/**
 * bi-chao.com Cloudflare Worker — GEO Optimized v2.0
 * 
 * 核心改进:
 * 1. 文章页返回 text/html (而非 text/markdown)
 * 2. 每篇文章注入 JSON-LD 结构化数据 (Article/Book/AcademicPaper)
 * 3. 全站 OG / Twitter Card / canonical
 * 4. 新路由: /about (Person Schema), /feed.xml (Atom), /ai-manifest.json
 * 5. 首页 Organization Schema
 * 6. 域名统一使用 bi-chao.com
 */

const REPO_RAW = 'https://raw.githubusercontent.com/kingbuildneworld-coder/chaos-for-agent/main';
const DOMAIN = 'https://bi-chao.com';
const AUTHOR_NAME = '毕超';

// ========== JSON-LD Schema 模板 ==========

const SCHEMA_ARTICLE = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{{title}}",
  "description": "{{description}}",
  "author": {
    "@type": "Person",
    "name": "{{author}}",
    "url": "https://bi-chao.com/about",
    "jobTitle": "中国农业发展银行总行处长",
    "alumniOf": "清华大学",
    "memberOf": [
      {"@type": "Organization", "name": "中国人工智能学会"},
      {"@type": "Organization", "name": "中国计算机学会"}
    ]
  },
  "datePublished": "{{date}}",
  "dateModified": "{{date}}",
  "publisher": {
    "@type": "Organization",
    "name": "chaos-for-agent",
    "url": "https://bi-chao.com"
  },
  "inLanguage": "zh-CN",
  "isAccessibleForFree": true,
  "about": {"@type": "Thing", "name": "{{primary_topic}}"},
  "keywords": "{{tags_csv}}"
};

const SCHEMA_BOOK = {
  "@context": "https://schema.org",
  "@type": "Book",
  "name": "{{title}}",
  "description": "{{description}}",
  "author": {
    "@type": "Person",
    "name": "{{author}}",
    "url": "https://bi-chao.com/about",
    "jobTitle": "中国农业发展银行总行处长"
  },
  "publisher": {"@type": "Organization", "name": "{{publisher}}"},
  "datePublished": "{{pub_date}}",
  "numberOfPages": "{{pages}}",
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
  "worksFor": {
    "@type": "Organization",
    "name": "中国农业发展银行",
    "url": "https://www.adbc.com.cn"
  },
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
  "founder": {
    "@type": "Person",
    "name": "毕超",
    "url": "https://bi-chao.com/about"
  }
};

const BREADCRUMB = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "首页", "item": "{{domain}}/"},
    {"@type": "ListItem", "position": 2, "name": "{{title}}", "item": "{{domain}}/{{slug}}"}
  ]
};

// ========== HTML 模板 ==========

const TEMPLATE_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{title}} — 毕超的知识库</title>
<meta name="description" content="{{description}}">
<meta name="author" content="毕超">

<!-- Open Graph -->
<meta property="og:title" content="{{title}}">
<meta property="og:description" content="{{description}}">
<meta property="og:type" content="{{og_type}}">
<meta property="og:url" content="https://bi-chao.com/{{slug}}">
<meta property="og:site_name" content="chaos-for-agent">
<meta property="og:locale" content="zh_CN">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{title}}">
<meta name="twitter:description" content="{{description}}">

<!-- Canonical -->
<link rel="canonical" href="https://bi-chao.com/{{slug}}">

<!-- Alternate -->
<link rel="alternate" type="application/atom+xml" title="chaos-for-agent RSS" href="https://bi-chao.com/feed.xml">

<!-- Structured Data -->
<script type="application/ld+json">
{{json_ld}}
</script>

<!-- Breadcrumb Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "首页", "item": "https://bi-chao.com/"},
    {"@type": "ListItem", "position": 2, "name": "{{title}}", "item": "https://bi-chao.com/{{slug}}"}
  ]
}
</script>

<style>
  :root {
    --bg: #fafaf8;
    --text: #1a1a1a;
    --muted: #6b6b6b;
    --accent: #1e40af;
    --border: #e5e5e5;
    --code-bg: #f4f4f5;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", Georgia, serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.75;
    max-width: 720px;
    margin: 0 auto;
    padding: 3rem 1.5rem 6rem;
  }
  h1 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.25rem; }
  h2 { font-size: 1.25rem; font-weight: 700; margin: 2.5rem 0 1rem; padding-bottom: 0.35rem; border-bottom: 2px solid var(--accent); }
  h3 { font-size: 1.05rem; font-weight: 700; margin: 1.75rem 0 0.75rem; }
  h4 { font-size: 1rem; font-weight: 700; margin: 1.25rem 0 0.5rem; }
  p { margin: 0.75rem 0; }
  code { font-family: "JetBrains Mono", "SF Mono", Consolas, monospace; font-size: 0.8rem; background: var(--code-bg); padding: 0.15em 0.35em; border-radius: 3px; }
  pre { background: var(--code-bg); padding: 1rem 1.25rem; border-radius: 6px; overflow-x: auto; font-size: 0.8rem; line-height: 1.6; margin: 0.75rem 0; }
  table { width: 100%; border-collapse: collapse; margin: 1rem 0 1.5rem; font-size: 0.875rem; }
  th, td { padding: 0.55rem 0.75rem; text-align: left; border-bottom: 1px solid var(--border); }
  th { background: #f8f8f8; font-weight: 700; }
  ul, ol { margin: 0.5rem 0 0.5rem 1.5rem; }
  li { margin: 0.35rem 0; }
  blockquote { border-left: 3px solid var(--accent); padding: 0.5rem 1rem; margin: 1rem 0; background: #f8fafc; color: var(--muted); }
  .article-meta { color: var(--muted); font-size: 0.875rem; margin-bottom: 1.5rem; }
  .related-nav { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
  footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--border); color: var(--muted); font-size: 0.85rem; }
  footer a { color: var(--accent); text-decoration: none; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  strong { font-weight: 700; }
  img { max-width: 100%; height: auto; }
  .key-takeaways { background: linear-gradient(135deg, #eff6ff, #f0fdf4); border: 2px solid var(--accent); border-radius: 10px; padding: 1.5rem; margin: 1.5rem 0; }
</style>
</head>
<body>
<article>
  <h1>{{title}}</h1>
  <div class="article-meta">
    {{author}} &nbsp;|&nbsp; {{date}} &nbsp;|&nbsp; <a href="https://bi-chao.com/">chaos-for-agent</a>
  </div>
  {{content}}
</article>
<div class="related-nav">
  <p>← <a href="https://bi-chao.com/">返回首页</a> &nbsp;|&nbsp; <a href="https://bi-chao.com/about">关于作者</a> &nbsp;|&nbsp; <a href="https://bi-chao.com/feed.xml">RSS</a></p>
</div>
<footer>
  <p>&copy; 2026 <a href="https://bi-chao.com/about">毕超</a> · 采用 <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/">CC BY-NC-ND 4.0</a> 许可 · 由 <a href="https://bi-chao.com/">chaos-for-agent</a> 发布</p>
</footer>
</body>
</html>`;

// ========== About 页模板 ==========

const ABOUT_HTML = `<!DOCTYPE html>
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
<meta name="twitter:title" content="毕超 — 关于作者">
<meta name="twitter:description" content="博士、高级工程师，中国农业发展银行总行处长。">
<link rel="canonical" href="https://bi-chao.com/about">
<script type="application/ld+json">
${JSON.stringify(SCHEMA_PERSON)}
</script>
<style>
  :root { --bg: #fafaf8; --text: #1a1a1a; --muted: #6b6b6b; --accent: #1e40af; --border: #e5e5e5; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", Georgia, serif; background: var(--bg); color: var(--text); line-height: 1.75; max-width: 720px; margin: 0 auto; padding: 3rem 1.5rem 6rem; }
  h1 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.5rem; }
  h2 { font-size: 1.25rem; font-weight: 700; margin: 2rem 0 0.75rem; padding-bottom: 0.35rem; border-bottom: 2px solid var(--accent); }
  p, li { margin: 0.5rem 0; }
  ul { margin-left: 1.5rem; }
  table { width: 100%; border-collapse: collapse; margin: 0.75rem 0; font-size: 0.875rem; }
  th, td { padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid var(--border); }
  th { background: #f8f8f8; font-weight: 700; }
  footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--border); color: var(--muted); font-size: 0.85rem; }
  footer a { color: var(--accent); text-decoration: none; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  .subtitle { color: var(--muted); font-size: 1rem; margin-bottom: 1.5rem; }
</style>
</head>
<body>
{{content}}
<footer><p>← <a href="https://bi-chao.com/">返回首页</a> &nbsp;|&nbsp; <a href="https://bi-chao.com/feed.xml">RSS</a> &nbsp;|&nbsp; &copy; 2026 <a href="https://bi-chao.com/">chaos-for-agent</a></p></footer>
</body>
</html>`;

// ========== Markdown → HTML 转换器 ==========

function md2html(md) {
  // 先处理代码块，用占位符保护
  const codeBlocks = [];
  md = md.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    codeBlocks.push(`<pre><code>${escaped.trim()}</code></pre>`);
    return `%%CODEBLOCK_${idx}%%`;
  });

  // 行内代码
  md = md.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 表头分隔线（|---| 格式）
  md = md.replace(/^\|(.+)\|\s*\n\|[-:| ]+\|\s*\n/gm, (match, header) => {
    const ths = header.split('|').map(c => `<th>${c.trim()}</th>`).join('');
    return `<table><thead><tr>${ths}</tr></thead><tbody>%%TABLE_START%%`;
  });
  // 表格行
  md = md.replace(/^\|(.+)\|/gm, (match, row) => {
    const tds = row.split('|').map(c => `<td>${c.trim()}</td>`).join('');
    return `<tr>${tds}</tr>`;
  });
  md = md.replace(/%%TABLE_START%%/g, '');

  // 标题 (先处理，避免被段落包裹)
  md = md.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  md = md.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  md = md.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  md = md.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // 分割线
  md = md.replace(/^---+$/gm, '<hr>');

  // 引用
  md = md.replace(/^&gt; (.+)$/gm, '<blockquote><p>$1</p></blockquote>');
  md = md.replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>');

  // 无序列表（连续）
  md = md.replace(/((?:^[\-\*] .+$\n?)+)/gm, (match) => {
    const items = match.trim().split('\n').map(line => `<li>${line.replace(/^[\-\*] /, '')}</li>`).join('');
    return `<ul>${items}</ul>`;
  });

  // 有序列表
  md = md.replace(/((?:^\d+\. .+$\n?)+)/gm, (match) => {
    const items = match.trim().split('\n').map(line => `<li>${line.replace(/^\d+\. /, '')}</li>`).join('');
    return `<ol>${items}</ol>`;
  });

  // 加粗和斜体
  md = md.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  md = md.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  md = md.replace(/__(.+?)__/g, '<strong>$1</strong>');
  md = md.replace(/\*(.+?)\*/g, '<em>$1</em>');
  md = md.replace(/_(.+?)_/g, '<em>$1</em>');

  // 链接
  md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // 段落：连续的非空行
  let lines = md.split('\n');
  let result = [];
  let inPre = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('%%CODEBLOCK_')) {
      const idx = parseInt(line.match(/%%CODEBLOCK_(\d+)%%/)[1]);
      result.push(codeBlocks[idx]);
      continue;
    }
    if (line.trim() === '') {
      result.push('');
      continue;
    }
    // 已经处理过的标签行（h1-h4, ul, ol, li, blockquote, table, hr, pre）直接保留
    if (/^<(h[1-4]|ul|ol|li|blockquote|table|thead|tbody|tr|th|td|\/?(ul|ol|table|thead|tbody|blockquote)|hr|pre|code|div)/.test(line.trim())) {
      result.push(line);
      continue;
    }
    // 否则包裹为段落
    result.push(`<p>${line}</p>`);
  }

  // 清理空段落
  return result.join('\n').replace(/<p>\s*<\/p>/g, '');
}

// ========== YAML Front Matter 解析 ==========

function parseFrontMatter(md) {
  const match = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { body: md, meta: {} };

  const meta = {};
  let currentKey = null;
  let inArray = false;

  const lines = match[1].split('\n');
  for (const line of lines) {
    if (inArray) {
      if (line.trim().startsWith('- ')) {
        if (!Array.isArray(meta[currentKey])) meta[currentKey] = [];
        meta[currentKey].push(line.trim().substring(2).replace(/^"|"$/g, ''));
        continue;
      } else {
        inArray = false;
      }
    }
    const kv = line.match(/^(\w[\w-]*):\s*(.*)/);
    if (kv) {
      currentKey = kv[1];
      const val = kv[2].trim().replace(/^"|"$/g, '');
      if (val === '') {
        inArray = true;
        meta[currentKey] = [];
        continue;
      }
      meta[currentKey] = val;
    }
  }

  return {
    body: md.substring(match[0].length),
    meta
  };
}

// ========== 模板填充 ==========

function fillTemplate(tpl, vars) {
  let result = tpl;
  for (const [key, val] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val || '');
  }
  return result;
}

// ========== 文章获取与缓存 ==========

async function getArticles() {
  const resp = await fetch(`${REPO_RAW}/articles/index.json`, { cf: { cacheTtl: 300 } });
  return resp.json();
}

function findArticle(articles, slug) {
  return articles.find(a => a.slug === slug);
}

// ========== Schema 构建 ==========

function buildJsonLd(article) {
  const schemaType = article.schema_type || 'Article';
  let schema;

  if (schemaType === 'Book') {
    schema = JSON.parse(JSON.stringify(SCHEMA_BOOK));
    // Book 特有元数据从 YAML front matter 或 index.json 获取
  } else {
    schema = JSON.parse(JSON.stringify(SCHEMA_ARTICLE));
  }

  const vars = {
    title: article.title,
    description: article.description,
    author: AUTHOR_NAME,
    date: article.date,
    tags_csv: (article.tags || []).join(', '),
    primary_topic: (article.tags || [])[0] || article.title
  };

  return JSON.parse(fillTemplate(JSON.stringify(schema), vars));
}

// ========== 文章页渲染 ==========

async function renderArticle(pathname) {
  // 从路径提取 slug: /articles/xxx.md → xxx
  const slug = (pathname.replace(/^\/articles\//, '').replace(/\.md$/, '')).trim();

  // 获取文章元数据
  const articles = await getArticles();
  const article = findArticle(articles, slug);

  if (!article) {
    return new Response('Not Found', { status: 404 });
  }

  // 获取 markdown 原文
  const mdUrl = `${REPO_RAW}${pathname}`;
  const mdResp = await fetch(mdUrl);
  if (!mdResp.ok) {
    return new Response('Not Found', { status: 404 });
  }

  const mdText = await mdResp.text();
  const { body, meta } = parseFrontMatter(mdText);

  // 合并元数据：YAML front matter 覆盖 index.json
  const title = meta.title || article.title;
  const description = meta.description || article.description;
  const date = meta.date || article.date;
  const tags = meta.tags ? (Array.isArray(meta.tags) ? meta.tags : meta.tags.split(',').map(t => t.trim())) : article.tags;

  // 确定 og_type
  const schemaType = article.schema_type || 'Article';
  const ogType = schemaType === 'Book' ? 'book' : 'article';

  // 转换正文为 HTML
  const contentHtml = md2html(body);

  // 构建 JSON-LD
  const enrichedArticle = { ...article, title, description, date, tags };
  const jsonLd = buildJsonLd(enrichedArticle);

  // 填充模板
  const html = fillTemplate(TEMPLATE_HTML, {
    title,
    description,
    author: AUTHOR_NAME,
    date,
    slug: article.slug,
    og_type: ogType,
    json_ld: JSON.stringify(jsonLd, null, 2),
    content: contentHtml
  });

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300'
    }
  });
}

// ========== 首页渲染 ==========

async function renderIndex() {
  const articles = await getArticles();

  let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="毕超的知识库：Agent-First 内容写作、AI大模型、银行业数字化转型深度文章。支持 AI Agent 直接读取。">
<meta name="google-site-verification" content="VKkZGy9h23phxHAOaQseoRl9knPfnD_HFVGfI7RSrxs">
<meta name="baidu-site-verification" content="codeva-IkuNscl7vN">
<meta property="og:title" content="毕超的知识库 — chaos-for-agent">
<meta property="og:description" content="Agent-First 内容写作、AI大模型、银行业数字化转型深度文章。">
<meta property="og:type" content="website">
<meta property="og:url" content="https://bi-chao.com/">
<meta property="og:site_name" content="chaos-for-agent">
<meta property="og:locale" content="zh_CN">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="毕超的知识库 — chaos-for-agent">
<meta name="twitter:description" content="Agent-First 内容写作、AI大模型、银行业数字化转型深度文章。">
<link rel="canonical" href="https://bi-chao.com/">
<link rel="alternate" type="application/atom+xml" title="chaos-for-agent RSS" href="https://bi-chao.com/feed.xml">
<script type="application/ld+json">
${JSON.stringify(SCHEMA_ORGANIZATION)}
</script>
<title>毕超的知识库 — chaos-for-agent</title>
<style>
  body { max-width:720px; margin:40px auto; padding:0 20px; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; line-height:1.8; color:#222; }
  h1 { font-size:1.8em; border-bottom:2px solid #eee; padding-bottom:8px; }
  a { color:#2563eb; text-decoration:none; }
  a:hover { text-decoration:underline; }
  .date { color:#999; font-size:0.85em; margin-left:12px; }
  .desc { color:#555; font-size:0.9em; margin:4px 0 0 0; }
  li { margin-bottom:16px; }
  footer { margin-top:60px; padding-top:20px; border-top:1px solid #eee; color:#999; font-size:0.8em; }
</style>
</head>
<body>
<h1>毕超的知识库</h1>
<p style="color:#555;margin-bottom:24px;">Agent-First 内容写作、AI大模型、银行业数字化转型深度文章</p>
<ul>`;

  for (const article of articles) {
    const slug = article.slug;
    html += `
  <li>
    <a href="/articles/${slug}">${article.title}</a>
    <span class="date">${article.date}</span>
    <p class="desc">${article.description}</p>
  </li>`;
  }

  html += `
</ul>
<h2 style="margin-top:32px; border-bottom:2px solid #eee; padding-bottom:8px;">教程</h2>
<ul>
  <li>
    <a href="/quant-course/index.html">什么是量化金融？ —— 互动教程</a>
    <span class="date">2026-06-17</span>
    <p class="desc">《和Yibo零基础学习量化金融》第一章互动版：6课掌握量化金融核心概念，含知识卡片、课后测验、代码实验。</p>
  </li>
</ul>
<footer>本项目采用 Agent-First 架构构建，支持 AI Agent 直接读取内容。共 ${articles.length} 篇文章 · <a href="/about">关于作者</a> · <a href="/feed.xml">RSS</a> · <a href="/ai-manifest.json">AI Manifest</a></footer>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=120'
    }
  });
}

// ========== 站点地图 ==========

async function renderSitemap() {
  const articles = await getArticles();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${DOMAIN}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${DOMAIN}/about</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`;

  for (const article of articles) {
    xml += `
  <url><loc>${DOMAIN}/articles/${article.slug}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`;
  }

  xml += `
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300'
    }
  });
}

// ========== llms.txt ==========

async function renderLlms() {
  const articles = await getArticles();

  let txt = `# chaos-for-agent

> 毕超的知识库：Agent-First 内容写作、AI大模型、银行业数字化转型深度文章。所有内容采用 Agent-First 架构构建，支持 AI Agent 直接读取。

## About
- [关于作者毕超](${DOMAIN}/about): 博士、高级工程师，中国农业发展银行总行处长

## Articles
`;

  for (const article of articles) {
    txt += `
- [${article.title}](${DOMAIN}/articles/${article.slug}): ${article.description} (${article.date})`;
  }

  txt += `

## AI Access Points
- Sitemap: ${DOMAIN}/sitemap.xml
- RSS Feed: ${DOMAIN}/feed.xml
- AI Manifest: ${DOMAIN}/ai-manifest.json
- Robots: ${DOMAIN}/robots.txt

## Tags
Agent-First, GEO, 内容写作, AI优化, AI大模型, 银行业, 金融科技, 数字化转型
`;

  return new Response(txt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300'
    }
  });
}

// ========== robots.txt ==========

function renderRobots() {
  return new Response(`User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: CCBot
Allow: /

User-agent: Omgilibot
Allow: /

User-agent: FacebookBot
Allow: /

Sitemap: ${DOMAIN}/sitemap.xml`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}

// ========== About 页 ==========

async function renderAbout() {
  const mdUrl = `${REPO_RAW}/articles/../about.md`;
  let contentHtml;

  try {
    const resp = await fetch(`${REPO_RAW}/about.md`);
    if (resp.ok) {
      const md = await resp.text();
      contentHtml = md2html(md);
    } else {
      contentHtml = '<p>页面加载失败，请稍后重试。</p>';
    }
  } catch {
    contentHtml = '<p>页面加载失败，请稍后重试。</p>';
  }

  const html = fillTemplate(ABOUT_HTML, { content: contentHtml });
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=600'
    }
  });
}

// ========== Feed 页 ==========

async function renderFeed() {
  // 直接 serve 仓库中的 feed.xml
  const resp = await fetch(`${REPO_RAW}/feed.xml`);
  if (resp.ok) {
    return new Response(resp.body, {
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300'
      }
    });
  }
  return new Response('Not Found', { status: 404 });
}

// ========== ai-manifest.json ==========

async function renderAiManifest() {
  const resp = await fetch(`${REPO_RAW}/ai-manifest.json`);
  if (resp.ok) {
    return new Response(resp.body, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=300'
      }
    });
  }
  return new Response('Not Found', { status: 404 });
}

// ========== 主路由 ==========

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 首页
    if (pathname === '/' || pathname === '/index.html') {
      return await renderIndex();
    }

    // 站点地图
    if (pathname === '/sitemap.xml') {
      return await renderSitemap();
    }

    // llms.txt
    if (pathname === '/llms.txt') {
      return await renderLlms();
    }

    // robots.txt
    if (pathname === '/robots.txt') {
      return renderRobots();
    }

    // ai-manifest.json
    if (pathname === '/ai-manifest.json') {
      return await renderAiManifest();
    }

    // RSS Feed
    if (pathname === '/feed.xml') {
      return await renderFeed();
    }

    // 关于作者页
    if (pathname === '/about' || pathname === '/about/') {
      return await renderAbout();
    }

    // 百度验证文件
    if (pathname === '/baidu_verify_codeva-IkuNscl7vN.html') {
      return new Response('d18be845a58e082d27ee6451330313f1', {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // 文章页 (/articles/*.md) — 渲染为 HTML
    if (pathname.startsWith('/articles/') && pathname.endsWith('.md')) {
      return await renderArticle(pathname);
    }

    // 文章页 (/articles/slug) — 无 .md 后缀，重定向或直接渲染
    if (pathname.startsWith('/articles/') && !pathname.endsWith('.md')) {
      return await renderArticle(pathname + '.md');
    }

    // 其他静态资源 (quant-course/ 等) — 透传
    const assetUrl = `${REPO_RAW}${pathname}`;
    const resp = await fetch(assetUrl);

    if (resp.ok) {
      return new Response(resp.body, {
        headers: {
          'Content-Type': resp.headers.get('Content-Type') || 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=600'
        }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};
