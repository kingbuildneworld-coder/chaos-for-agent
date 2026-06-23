/**
 * bi-chao.com Cloudflare Worker — GEO Optimized v2.8
 *
 * v2.8: Article wordCount/timeRequired/articleSection + Tag CollectionPage + Organization sameAs
 * v2.7: OG Image + 阅读时间 + llms.txt 四段式 + 首页 BreadcrumbList + dateModified
 * v2.6: 参考文献区块 + citation JSON-LD
 * v2.5: FAQ 检测与 FAQPage Schema
 * v2.4: 标签聚合页 /tags + /tags/{tag}
 * v2.3: TOC目录 + 作者信息卡 + 上/下篇导航 + 相关文章推荐
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
  "founder": {"@type": "Person", "name": "毕超", "url": "https://bi-chao.com/about"},
  "sameAs": [
    "https://github.com/kingbuildneworld-coder",
    "https://bi-chao.com/about"
  ],
  "knowsAbout": ["大语言模型", "数字金融", "金融科技", "人工智能", "银行业数字化转型", "数据治理"]
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
<meta name="twitter:image" content="__OG_IMAGE__">
<meta property="og:image" content="__OG_IMAGE__">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
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
__FAQ_JSONLD__
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
  /* TOC */
  .toc{background:#f8fafc;border:1px solid var(--border);border-radius:6px;padding:1rem 1.25rem;margin-bottom:2rem;font-size:.9rem;}
  .toc summary{font-weight:700;cursor:pointer;color:var(--accent);}
  .toc ul{list-style:none;margin:.5rem 0 0 0;}
  .toc li{margin:.35rem 0;}
  .toc a{color:var(--text);text-decoration:none;border-bottom:1px dotted var(--border);}
  .toc a:hover{color:var(--accent);}
  .toc .toc-h3{padding-left:1.25rem;}
  /* Author card */
  .author-card{background:linear-gradient(135deg,#f0f4ff,#f8fafc);border:1px solid var(--border);border-radius:8px;padding:1.25rem;margin-top:3rem;}
  .author-card h3{font-size:1rem;margin:0 0 .5rem 0;color:var(--accent);}
  .author-card p{font-size:.875rem;color:var(--muted);margin:.25rem 0;}
  .author-card strong{color:var(--text);}
  /* Nav */
  .prev-next{display:flex;justify-content:space-between;gap:1rem;margin-bottom:1rem;font-size:.875rem;}
  .prev-next a{flex:1;padding:.5rem .75rem;border:1px solid var(--border);border-radius:6px;text-decoration:none;color:var(--text);}
  .prev-next a:hover{border-color:var(--accent);background:#f8fafc;}
  .prev-next span{display:block;color:var(--muted);font-size:.8rem;}
  .related-articles{margin-bottom:1rem;}
  .related-articles h4{font-size:.9rem;color:var(--muted);margin-bottom:.5rem;}
  .related-articles li{font-size:.875rem;}
  .related-nav{margin-top:3rem;padding-top:1.5rem;border-top:1px solid var(--border);}
  /* FAQ */
  .faq-section{margin:2rem 0;padding:1.25rem;background:#f8fafc;border:1px solid var(--border);border-radius:8px;}
  .faq-section h2{font-size:1.15rem;margin:0 0 1rem;border-bottom:none;color:var(--accent);}
  .faq-item{margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px dashed var(--border);}
  .faq-item:last-child{margin-bottom:0;padding-bottom:0;border-bottom:none;}
  .faq-q{font-size:.95rem;font-weight:700;margin:0 0 .35rem;color:var(--text);cursor:default;}
  .faq-a{font-size:.875rem;color:var(--muted);line-height:1.7;}
  .faq-a p{margin:.35rem 0;}
  /* References */
  .ref-section{margin:2rem 0;padding:1rem 1.25rem;background:#fafaf8;border:1px solid var(--border);border-radius:6px;}
  .ref-section h2{font-size:1rem;margin:0 0 .75rem;border-bottom:none;color:var(--muted);}
  .ref-section ol{margin:0;padding-left:1.5rem;font-size:.875rem;}
  .ref-section li{margin:.35rem 0;}
  .ref-source{color:var(--muted);font-size:.75rem;margin-left:.35rem;}
  footer{margin-top:3rem;padding-top:1.5rem;border-top:1px solid var(--border);color:var(--muted);font-size:.85rem;}
  footer a,a{color:var(--accent);text-decoration:none;}
  a:hover{text-decoration:underline;}
  strong{font-weight:700;}
  img{max-width:100%;height:auto;}
  @media(max-width:600px){
    .prev-next{flex-direction:column;}
  }
</style>
</head>
<body>
<article>
  <h1>__TITLE__</h1>
  <div class="article-meta">__AUTHOR__ &nbsp;|&nbsp; __DATE__ &nbsp;|&nbsp; __READING_TIME__ &nbsp;|&nbsp; <a href="https://bi-chao.com/">chaos-for-agent</a> &nbsp; __TAGS__</div>
  __TOC__
  __FAQ__
  __CONTENT__
  __REFERENCES__
  __AUTHOR_CARD__
</article>
<div class="related-nav">
  __PREV_NEXT__
  __RELATED__
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

/** 从 Markdown 提取 h2/h3 生成 TOC */
function generateTOC(md) {
  const headings = [];
  const lines = md.split('\n');
  for (const line of lines) {
    const h2 = line.match(/^## (.+)$/);
    const h3 = line.match(/^### (.+)$/);
    if (h2) {
      const text = h2[1];
      const id = text.replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
      headings.push({ level: 2, text, id });
    } else if (h3) {
      const text = h3[1];
      const id = text.replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
      headings.push({ level: 3, text, id });
    }
  }
  if (headings.length < 3) return '';
  let html = '<details class="toc" open><summary>目录</summary><ul>';
  for (const h of headings) {
    html += h.level === 3
      ? `<li class="toc-h3"><a href="#${h.id}">${h.text}</a></li>`
      : `<li><a href="#${h.id}">${h.text}</a></li>`;
  }
  html += '</ul></details>';
  return html;
}

/** 给 Markdown 中的 h2/h3 添加 id 属性 */
function addHeadingIds(md) {
  return md.replace(/^(#{2,3}) (.+)$/gm, (_, hashes, text) => {
    const id = text.replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
    return `${hashes} ${text} {#${id}}`;
  });
}

/** 在 HTML 中给 h2/h3 标签注入 id */
function injectHeadingIds(html) {
  let idx = 0;
  return html.replace(/<(h[23])>(.+?)<\/\1>/g, (_, tag, text) => {
    const id = text.replace(/<[^>]*>/g, '').replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
    return `<${tag} id="${id}">${text}</${tag}>`;
  });
}

/** 作者信息卡 */
const AUTHOR_CARD_HTML = `<div class="author-card">
<h3>关于作者</h3>
<p><strong>毕超</strong>，博士、高级工程师（计算机技术专业），中国农业发展银行总行处长。</p>
<p>清华大学校友导师，中国人工智能学会终身会员，中国计算机学会学术审稿专家。</p>
<p>研究方向：大语言模型、数字金融、金融科技。2024年获北京市西城区"西融计划"青年拔尖人才。</p>
<p>了解更多：<a href="https://bi-chao.com/about">关于作者</a></p>
</div>`;

/** 上/下篇导航 */
function getPrevNext(articles, currentSlug) {
  const sorted = [...articles].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const idx = sorted.findIndex(a => a.slug === currentSlug);
  if (idx < 0) return '';
  let html = '<div class="prev-next">';
  if (idx > 0) {
    const p = sorted[idx - 1];
    html += `<a href="/articles/${p.slug}"><span>← 上一篇</span>${p.title}</a>`;
  } else {
    html += '<a></a>';
  }
  if (idx < sorted.length - 1) {
    const n = sorted[idx + 1];
    html += `<a href="/articles/${n.slug}"><span>下一篇 →</span>${n.title}</a>`;
  } else {
    html += '<a></a>';
  }
  html += '</div>';
  return html;
}

/** 相关文章（按标签匹配度） */
function getRelated(articles, currentSlug, currentTags) {
  if (!currentTags || currentTags.length === 0) return '';
  const currentTagsSet = new Set(Array.isArray(currentTags) ? currentTags : [currentTags]);
  const scored = articles
    .filter(a => a.slug !== currentSlug)
    .map(a => {
      const aTags = Array.isArray(a.tags) ? a.tags : [];
      const overlap = aTags.filter(t => currentTagsSet.has(t)).length;
      return { ...a, score: overlap };
    })
    .filter(a => a.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  if (scored.length === 0) return '';
  let html = '<div class="related-articles"><h4>相关文章</h4><ul>';
  for (const a of scored) {
    html += `<li><a href="/articles/${a.slug}">${a.title}</a></li>`;
  }
  html += '</ul></div>';
  return html;
}

// ========== FAQ 检测与渲染 ==========

/** 从正文自动检测 FAQ 模式：匹配 Q: 或 **Q:** 或 > Q: 格式 */
function detectFAQ(body) {
  const blocks = [];
  const lines = body.split('\n');
  let currentQ = null, currentA = '';
  const qRe = /^(?:>\s*)?\*{0,2}Q[：:]\*{0,2}\s*(.+)/i;

  for (const line of lines) {
    const m = line.match(qRe);
    if (m) {
      if (currentQ && currentA) blocks.push({ question: currentQ, answer: currentA.trim() });
      currentQ = m[1].trim();
      currentA = '';
    } else if (currentQ) {
      currentA += line + '\n';
    }
  }
  if (currentQ && currentA) blocks.push({ question: currentQ, answer: currentA.trim() });
  return blocks.length >= 2 ? blocks : null;
}

/** 渲染 FAQ HTML 区块 */
function renderFAQ(items) {
  if (!items || items.length < 2) return '';
  let html = '<section class="faq-section"><h2>常见问题</h2>';
  for (const item of items) {
    html += `<div class="faq-item"><h3 class="faq-q">${item.question}</h3><div class="faq-a">${md2html(item.answer)}</div></div>`;
  }
  html += '</section>';
  return html;
}

/** 渲染参考文献区块 */
function renderReferences(refs) {
  if (!refs || refs.length === 0) return '';
  let html = '<section class="ref-section"><h2>参考文献</h2><ol>';
  for (const r of refs) {
    const src = r.source ? ` <span class="ref-source">[${r.source}]</span>` : '';
    html += `<li><a href="${r.url}" target="_blank" rel="noopener noreferrer">${r.title}</a>${src}</li>`;
  }
  html += '</ol></section>';
  return html;
}

/** 估算阅读时间（中文 ~400 字/分钟） */
function readingTime(text) {
  const chars = text.replace(/\s/g, '').length;
  return Math.max(1, Math.ceil(chars / 400));
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
    const dateModified = meta.updated || meta.last_modified || article.updated || article.last_modified || date;
    const tags = meta.tags || article.tags || [];
    const tagsHtml = Array.isArray(tags) && tags.length
      ? tags.map(t => `<a href="/tags/${encodeURIComponent(t)}" style="display:inline-block;margin:0 .2rem;padding:0 .4rem;background:#f0f4ff;border-radius:4px;font-size:.8rem;">${t}</a>`).join('')
      : '';
    const schemaType = meta.schema_type || article.schema_type || 'Article';

    // FAQ: 优先从前置元数据读取，否则从正文自动检测
    let faqItems = meta.faq || article.faq || null;
    if (!faqItems) {
      faqItems = detectFAQ(body);
    }
    const faqHtml = renderFAQ(faqItems);

    // 参考文献
    const references = meta.references || article.references || [];
    const refHtml = renderReferences(references);

    // 阅读时间
    const readTime = readingTime(body);

    // OG Image（优先 frontmatter，否则自动生成占位图）
    const ogImage = meta.og_image || article.og_image || `https://bi-chao.com/og?title=${encodeURIComponent(title)}&date=${encodeURIComponent(date || '')}`;

    // 转换正文
    const contentHtml = injectHeadingIds(md2html(body));
    const tocHtml = generateTOC(body);
    const prevNextHtml = getPrevNext(articles, slug);
    const relatedHtml = getRelated(articles, slug, tags);

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
        "image": { "@type": "ImageObject", "url": ogImage, "width": 1200, "height": 630 },
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
        "dateModified": dateModified,
        "publisher": {"@type": "Organization", "name": "chaos-for-agent", "url": "https://bi-chao.com"},
        "inLanguage": "zh-CN",
        "isAccessibleForFree": true,
        "about": {"@type": "Thing", "name": (Array.isArray(tags) ? tags[0] : '') || title},
        "keywords": Array.isArray(tags) ? tags.join(', ') : (tags || ''),
        "wordCount": body.replace(/\s/g, '').length,
        "timeRequired": `PT${readTime}M`,
        "articleSection": Array.isArray(tags) && tags.length ? tags[0] : undefined,
        "image": { "@type": "ImageObject", "url": ogImage, "width": 1200, "height": 630 },
        "citation": Array.isArray(references) && references.length ? references.map(r => ({
          "@type": "CreativeWork", "name": r.title, "url": r.url
        })) : undefined
      };
    }

    // 清理 undefined 值
    jsonLd = JSON.parse(JSON.stringify(jsonLd));

    const ogType = schemaType === 'Book' ? 'book' : 'article';

    // FAQPage Schema
    let faqJsonLd = '';
    if (faqItems && faqItems.length) {
      faqJsonLd = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItems.map(q => ({
          "@type": "Question",
          "name": q.question,
          "acceptedAnswer": {"@type": "Answer", "text": q.answer}
        }))
      }, null, 2);
    }

    const html = fillTpl(TEMPLATE_HTML, {
      TITLE: title,
      DESCRIPTION: description,
      AUTHOR: AUTHOR_NAME,
      DATE: date,
      SLUG: article.slug,
      OGTYPE: ogType,
      JSONLD: JSON.stringify(jsonLd, null, 2),
      FAQ_JSONLD: faqJsonLd,
      TAGS: tagsHtml,
      CONTENT: contentHtml,
      TOC: tocHtml,
      AUTHOR_CARD: AUTHOR_CARD_HTML,
      PREV_NEXT: prevNextHtml,
      RELATED: relatedHtml,
      FAQ: faqHtml,
      REFERENCES: refHtml,
      READING_TIME: `约 ${readTime} 分钟`,
      OG_IMAGE: ogImage
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
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "首页", "item": "https://bi-chao.com/"}
  ]
}
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
  // 教程页
  xml += `\n  <url><loc>${DOMAIN}/quant-course/index.html</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`;
  xml += `\n  <url><loc>${DOMAIN}/quant-course/chapter2-first-quant-experiment.html</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`;
  // 标签页
  xml += `\n  <url><loc>${DOMAIN}/tags</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`;
  const tagMap = getTagMap(articles);
  for (const tag of Object.keys(tagMap)) {
    xml += `\n  <url><loc>${DOMAIN}/tags/${encodeURIComponent(tag)}</loc><changefreq>weekly</changefreq><priority>0.5</priority></url>`;
  }
  xml += '\n</urlset>';

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' }
  });
}

// ========== llms.txt ==========

async function renderLlms() {
  const articles = await getArticles();

  // 按标签聚合
  const tagMap = getTagMap(articles);
  const topTags = Object.keys(tagMap).sort((a, b) => tagMap[b].length - tagMap[a].length).slice(0, 10);

  let txt = `# chaos-for-agent — 毕超的知识库

> 面向 AI Agent 和搜索引擎优化的知识站点。主题：Agent-First 内容写作、AI大模型、银行业数字化转型。
> 作者：毕超，中国农业发展银行总行处长，清华大学校友。

## Site Map
- Home: ${DOMAIN}/
- About: ${DOMAIN}/about
- Tags: ${DOMAIN}/tags
- Tutorials: ${DOMAIN}/quant-course/index.html

## Articles (${articles.length})
`;

  for (const a of articles) {
    const tagStr = (Array.isArray(a.tags) ? a.tags : []).join(', ');
    txt += `\n- [${a.title}](${DOMAIN}/articles/${a.slug})`;
    txt += `\n  - Description: ${a.description}`;
    txt += `\n  - Date: ${a.date}`;
    if (tagStr) txt += `\n  - Tags: ${tagStr}`;
  }

  txt += `\n\n## Topics (top ${topTags.length})`;
  for (const tag of topTags) {
    txt += `\n- ${tag}: ${tagMap[tag].length} articles → ${DOMAIN}/tags/${encodeURIComponent(tag)}`;
  }

  txt += `\n\n## For AI Agents
- Sitemap: ${DOMAIN}/sitemap.xml
- RSS: ${DOMAIN}/feed.xml
- AI Manifest: ${DOMAIN}/ai-manifest.json
- Robots: ${DOMAIN}/robots.txt
- Search: ${DOMAIN}/search?q={query}
`;

  return new Response(txt, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=300' }
  });
}

// ========== 标签聚合页 ==========

function getTagMap(articles) {
  const map = {};
  for (const a of articles) {
    const tags = Array.isArray(a.tags) ? a.tags : [];
    for (const t of tags) {
      if (!map[t]) map[t] = [];
      map[t].push(a);
    }
  }
  return map;
}

async function renderTagIndex() {
  const articles = await getArticles();
  const tagMap = getTagMap(articles);
  const tagNames = Object.keys(tagMap).sort((a, b) => tagMap[b].length - tagMap[a].length);

  let tagList = '';
  for (const tag of tagNames) {
    tagList += `<li><a href="/tags/${encodeURIComponent(tag)}">${tag}</a> <span class="date">${tagMap[tag].length} 篇</span></li>`;
  }

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="毕超的知识库 — 按标签浏览全部文章：AI、大数据、金融科技、数据治理等主题分类。">
<meta property="og:title" content="标签索引 — chaos-for-agent">
<meta property="og:description" content="按标签浏览毕超知识库的全部文章。">
<meta property="og:type" content="website">
<meta property="og:url" content="https://bi-chao.com/tags">
<meta property="og:site_name" content="chaos-for-agent">
<meta property="og:locale" content="zh_CN">
<meta name="twitter:card" content="summary">
<link rel="canonical" href="https://bi-chao.com/tags">
<script type="application/ld+json">
${JSON.stringify(SCHEMA_WEBSITE)}
</script>
<title>标签索引 — chaos-for-agent</title>
<style>
  body{max-width:720px;margin:40px auto;padding:0 20px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.8;color:#222;}
  h1{font-size:1.8em;border-bottom:2px solid #eee;padding-bottom:8px;}
  a{color:#2563eb;text-decoration:none;}a:hover{text-decoration:underline;}
  .date{color:#999;font-size:.85em;margin-left:12px;}
  li{margin-bottom:12px;}
  footer{margin-top:60px;padding-top:20px;border-top:1px solid #eee;color:#999;font-size:.8em;}
</style>
</head>
<body>
<h1>标签索引</h1>
<p style="color:#555;margin-bottom:24px;">共 ${tagNames.length} 个标签，${articles.length} 篇文章</p>
<ul>${tagList}</ul>
<footer>← <a href="/">返回首页</a> · <a href="/about">关于作者</a> · <a href="/feed.xml">RSS</a></footer>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
  });
}

async function renderTagPage(tagParam) {
  const tag = decodeURIComponent(tagParam);
  const articles = await getArticles();
  const tagMap = getTagMap(articles);
  const matched = tagMap[tag] || [];

  if (matched.length === 0) return new Response('Not Found', { status: 404 });

  let listItems = '';
  for (const a of matched) {
    listItems += `
  <li>
    <a href="/articles/${a.slug}">${a.title}</a>
    <span class="date">${a.date}</span>
    <p class="desc">${a.description}</p>
  </li>`;
  }

  // CollectionPage JSON-LD
  const collectionPageLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${tag} — 毕超的知识库`,
    "description": `标签"${tag}"下的${matched.length}篇深度文章。`,
    "url": `https://bi-chao.com/tags/${encodeURIComponent(tag)}`,
    "isPartOf": {"@type": "WebSite", "name": "chaos-for-agent", "url": "https://bi-chao.com"},
    "about": {"@type": "Thing", "name": tag},
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": matched.map((a, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "url": `https://bi-chao.com/articles/${a.slug}`,
        "name": a.title
      }))
    }
  };

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="标签"${tag}"下的${matched.length}篇深度文章。毕超知识库 — Agent-First 内容写作、AI大模型、银行业数字化转型。">
<meta property="og:title" content="${tag} — 标签归档 | chaos-for-agent">
<meta property="og:description" content="标签"${tag}"下的${matched.length}篇文章。">
<meta property="og:type" content="website">
<meta property="og:url" content="https://bi-chao.com/tags/${encodeURIComponent(tag)}">
<meta property="og:site_name" content="chaos-for-agent">
<meta property="og:locale" content="zh_CN">
<meta name="twitter:card" content="summary">
<link rel="canonical" href="https://bi-chao.com/tags/${encodeURIComponent(tag)}">
<script type="application/ld+json">
${JSON.stringify(collectionPageLd)}
</script>
<title>${tag} — 标签归档 | chaos-for-agent</title>
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
<h1>标签：${tag}</h1>
<p style="color:#555;margin-bottom:24px;">共 ${matched.length} 篇文章</p>
<ul>${listItems}</ul>
<footer>← <a href="/">返回首页</a> · <a href="/tags">标签索引</a> · <a href="/about">关于作者</a></footer>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
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

// ========== OG 图片生成 ==========

function renderOgImage(title, date) {
  const lines = wrapText(title, 24);
  let y = 280 - (lines.length - 1) * 20;
  const textEls = lines.map(l => `<text x="50%" y="${y}" text-anchor="middle" fill="white" font-size="36" font-weight="700" font-family="'Noto Serif SC',serif">${escapeXml(l)}</text>${(y += 48, '')}`).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#1e293b"/>
  <rect x="40" y="40" width="1120" height="550" rx="12" fill="none" stroke="#334155" stroke-width="2"/>
  <text x="50%" y="180" text-anchor="middle" fill="#94a3b8" font-size="20" font-family="sans-serif">chaos-for-agent / 毕超的知识库</text>
  ${textEls}
  <text x="50%" y="520" text-anchor="middle" fill="#64748b" font-size="18" font-family="sans-serif">${date || ''}</text>
  <text x="50%" y="560" text-anchor="middle" fill="#475569" font-size="14" font-family="sans-serif">bi-chao.com</text>
</svg>`;
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' }
  });
}

function wrapText(text, maxChars) {
  const lines = [];
  let cur = '';
  for (const ch of text) {
    if (cur.length >= maxChars) { lines.push(cur); cur = ''; }
    cur += ch;
  }
  if (cur) lines.push(cur);
  return lines;
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
    if (p === '/tags' || p === '/tags/') return renderTagIndex();
    if (p.startsWith('/tags/')) return renderTagPage(p.replace(/^\/tags\//, ''));
    if (p.startsWith('/search')) {
      const q = url.searchParams.get('q') || '';
      return Response.redirect(`https://www.google.com/search?q=site%3Abi-chao.com+${encodeURIComponent(q)}`, 302);
    }
    if (p === '/ai-manifest.json') return proxyFile('/ai-manifest.json', 'application/json', 300);
    if (p === '/feed.xml') return proxyFile('/feed.xml', 'application/atom+xml', 300);
    if (p === '/about' || p === '/about/') return renderAbout();

    // OG 图片
    if (p.startsWith('/og')) {
      const title = url.searchParams.get('title') || 'chaos-for-agent';
      const date = url.searchParams.get('date') || '';
      return renderOgImage(title, date);
    }

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
