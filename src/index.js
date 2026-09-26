/**
 * bi-chao.com Cloudflare Worker — GEO Optimized v2.12
 *
 * v2.12: 数据引用标记 + FAQ聚合页 + HowTo Schema + ImageObject Schema + 知识图谱增强
 * v2.11: 首页 ItemList Schema + ai-manifest.json 同步全部18篇文章
 * v2.9: 正文内链自动注入 — 自动识别文章间标题共现并插入上下文链接
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
const AUTHOR_JOB_TITLE = '中国农业发展银行总行风险管理部资产保全二处处长';
const AUTHOR_ORG = '中国农业发展银行';

// ========== 实体锚点（GEO） ==========
// 用稳定的 @id 让 AI 引擎/搜索引擎能把本站与第三方权威落点归并到同一实体，
// 而不是每个页面重复内联一份 Person 定义。"毕超"是高频同名（另有北京化工大学
// 副教授、陕西师范大学教师、CSDN 博主等），实体消歧是权威性归因的前提。
const PERSON_ID = `${DOMAIN}/#person`;
const ORG_ID = `${DOMAIN}/#organization`;

/**
 * 第三方可核实的权威落点，用于 Person.sameAs。
 * 以下 URL 均于 2026-09-26 逐一实测返回 HTTP 200 后才收录；
 * 未验证或不可达的来源（如维普）一律不放，避免结构化数据里出现死链。
 */
const PERSON_SAME_AS = [
  'https://book.douban.com/subject/37397035/',
  'https://www.j-bigdataresearch.com.cn/zh/article/doi/10.11959/j.issn.2096-0271.2025004/',
  'https://opaj.napstic.cn/periodicalArticle/0120250200890414',
  'https://m.wanfangdata.com.cn/jewelbox/search/toArticleDetails.html?id=yhj202409009&type=perio_artical',
  'https://sem.ucas.ac.cn/article/article_xq_time/eyJhcnRpY2xlX3d6X2lkIjoxOTM4OSwidGl0bGUxIjoi5a2m5pyv6K6m5bqnIiwidHlwZV9pZCI6MjksImluZGV4IjoyfQ==',
  'https://github.com/kingbuildneworld-coder'
];

/** 所有 Person 节点统一引用此 @id，全站实体唯一 */
const AUTHOR_REF = { '@id': PERSON_ID };

/** 文章页 robots meta：放开大图与大摘要预览（默认 standard 会限制 AI 摘要与 Discover 的图） */
const ROBOTS_META = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';

/** 标签页收录阈值：文章数低于此值的标签页输出 noindex 且不进 sitemap，避免薄内容稀释抓取预算 */
const TAG_INDEX_MIN_ARTICLES = 3;

/**
 * llms.txt 中每篇文章 description 的截断长度。
 *
 * 社区（afdocs / agent-docs-spec）阈值按**字符**计：<50k Pass / 50k–100k Warn / >100k Fail。
 * 实测：截断前 32,634 字符、截断后 30,992 字符 —— **两种状态都已在 Pass 区**。
 * 因此这**不是**"修复阈值超标"，只是让链接后的说明更贴合规范里"简短注释"
 * 的定位，并减少约 8% 的传输字节（61,923 → 56,829 字节）。完整描述仍保留在
 * ai-manifest.json 与文章正文中。
 *
 * ⚠️ 计数陷阱：本机 `wc -m` 按**字节**计数（locale 未设 UTF-8），据此判断字符
 * 阈值会得出错误结论。测字符请用 Python `len()` 或 `LC_ALL=C.UTF-8 wc -m`。
 */
const LLM_DESC_MAX = 140;

/** 单行截断（用于 llms.txt 的简短说明） */
function truncate(s, n) {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length <= n ? t : t.slice(0, n - 1) + '…';
}

/**
 * 统一的作者实体节点。
 * 设计取舍：文章页保持"自包含"（内联完整 Person），因为 AI 爬虫可能只抓单篇
 * 文章而不访问首页；同时带上稳定 @id，使跨页面/跨站点能归并为同一实体。
 */
function buildPersonNode() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    'name': AUTHOR_NAME,
    'url': `${DOMAIN}/about`,
    'jobTitle': AUTHOR_JOB_TITLE,
    'alumniOf': { '@type': 'CollegeOrUniversity', 'name': '清华大学' },
    'memberOf': [
      { '@type': 'Organization', 'name': '中国人工智能学会' },
      { '@type': 'Organization', 'name': '中国计算机学会' }
    ],
    'sameAs': PERSON_SAME_AS
  };
}

// ========== JSON-LD Schema 模板 ==========

// 注意：原先此处有 SCHEMA_ARTICLE / SCHEMA_BOOK 两个常量，属于**死代码**
// （定义后从未被任何代码引用）。真正生效的 JSON-LD 在 renderArticle() 内联构造。
// 保留两套 schema 定义曾导致"以为改了 schema、其实改的是死代码"的维护陷阱，
// 故移除；如需文章/图书的结构化数据模板，请统一在 renderArticle() 中维护。

const SCHEMA_PERSON = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": PERSON_ID,
  "name": "毕超",
  "alternateName": "Bi Chao",
  "description": "博士、高级工程师（计算机技术专业），中国农业发展银行总行风险管理部资产保全二处处长。清华大学校友导师，中国人工智能学会终身会员，中国计算机学会学术审稿专家。研究方向为大语言模型、数字金融、金融科技。",
  "url": "https://bi-chao.com/about",
  "jobTitle": AUTHOR_JOB_TITLE,
  "worksFor": {"@type": "Organization", "name": "中国农业发展银行"},
  "alumniOf": {"@type": "CollegeOrUniversity", "name": "清华大学"},
  "memberOf": [
    {"@type": "Organization", "name": "中国人工智能学会"},
    {"@type": "Organization", "name": "中国计算机学会"},
    {"@type": "Organization", "name": "中国职业技术教育学会人工智能专家指导委员会"}
  ],
  "award": "北京市西城区'西融计划'第一批青年拔尖人才（2024年）",
  "knowsAbout": ["大语言模型", "数字金融", "金融科技", "人工智能", "银行业数字化转型", "数据治理"],
  "sameAs": PERSON_SAME_AS
};

const SCHEMA_ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORG_ID,
  "name": "chaos-for-agent",
  "alternateName": "智能体的知识库",
  "url": "https://bi-chao.com",
  "description": "Agent-First 内容写作、AI大模型、银行业数字化转型深度文章知识库。由毕超博士创建和维护。",
  "founder": {"@type": "Person", "@id": PERSON_ID, "name": "毕超", "url": "https://bi-chao.com/about"},
  "sameAs": [
    "https://github.com/kingbuildneworld-coder"
  ],
  "knowsAbout": ["大语言模型", "数字金融", "金融科技", "人工智能", "银行业数字化转型", "数据治理",
    "词元经济", "Tokenomics", "AI Agent", "Prompt Engineering", "RAG", "向量数据库", "企业架构"],
  "hasCredential": [
    {"@type": "EducationalOccupationalCredential", "credentialCategory": "degree", "name": "博士学位", "about": "计算机科学/金融科技"},
    {"@type": "EducationalOccupationalCredential", "credentialCategory": "professional", "name": "银行业高级管理", "about": "金融行业"}
  ]
};

/** 知识图谱（C3）：用于首页 JSON-LD 的知识图谱声明 */
const SCHEMA_KNOWLEDGE_GRAPH = {
  "@context": {
    "schema": "https://schema.org/",
    "skos": "https://www.w3.org/2004/02/skos/core#"
  },
  "@graph": [
    {"@id": "https://bi-chao.com", "@type": "schema:WebSite", "schema:name": "智能体的知识库", "schema:about": {"@id": "https://bi-chao.com/topics/ai-finance"}},
    {"@id": "https://bi-chao.com/topics/ai-finance", "@type": "skos:Concept", "skos:prefLabel": "AI+金融", "skos:broader": {"@id": "https://bi-chao.com/topics/fintech"}},
    {"@id": "https://bi-chao.com/topics/fintech", "@type": "skos:Concept", "skos:prefLabel": "金融科技"},
    {"@id": "https://bi-chao.com/topics/llm", "@type": "skos:Concept", "skos:prefLabel": "大语言模型"},
    {"@id": "https://bi-chao.com/topics/tokenomics", "@type": "skos:Concept", "skos:prefLabel": "词元经济"},
    {"@id": "https://bi-chao.com/topics/agent", "@type": "skos:Concept", "skos:prefLabel": "AI Agent"},
    {"@id": "https://bi-chao.com/about", "@type": "schema:Person", "schema:name": "毕超", "schema:knowsAbout": [{"@id": "https://bi-chao.com/topics/ai-finance"}, {"@id": "https://bi-chao.com/topics/llm"}]}
  ]
};

const SCHEMA_WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "chaos-for-agent",
  "alternateName": "智能体的知识库",
  "url": "https://bi-chao.com",
  "description": "Agent-First 内容写作、AI大模型、银行业数字化转型深度文章知识库。由毕超博士创建和维护。",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://bi-chao.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  },
  "hasPart": [
    {"@type": "WebPage", "name": "关于作者", "url": "https://bi-chao.com/about", "description": "毕超博士的个人简介与学术背景"},
    {"@type": "WebPage", "name": "标签索引", "url": "https://bi-chao.com/tags", "description": "按主题标签浏览全部文章"},
    {"@type": "WebPage", "name": "Sitemap", "url": "https://bi-chao.com/sitemap.xml"}
  ]
};

// ========== HTML 模板 ==========

const TEMPLATE_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>__TITLE__ — 智能体的知识库</title>
<meta name="baidu-site-verification" content="codeva-J4sirVAId0">
<meta name="description" content="__DESCRIPTION__">
<meta name="author" content="毕超">
<meta name="robots" content="__ROBOTS__">
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
<meta name="twitter:image:alt" content="__TITLE__">
<meta property="og:image" content="__OG_IMAGE__">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="__TITLE__">
<meta property="article:published_time" content="__DATE__">
<meta property="article:modified_time" content="__DATE_MODIFIED__">
<link rel="canonical" href="https://bi-chao.com/articles/__SLUG__">
<link rel="alternate" hreflang="zh-CN" href="https://bi-chao.com/articles/__SLUG__">
<link rel="alternate" type="text/markdown" href="https://bi-chao.com/articles/__SLUG__.md" title="Markdown 原文">
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
    {"@type": "ListItem", "position": 2, "name": "__JSON_TITLE__", "item": "https://bi-chao.com/articles/__SLUG__"}
  ]
}
</script>
__FAQ_BLOCK__
__HOWTO_BLOCK__
__IMG_BLOCK__
<script type="application/ld+json">
__SPEAKABLE_JSONLD__
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
  /* Key Takeaways */
  .key-takeaways{background:linear-gradient(135deg,#eff6ff,#f0fdf4);border:2px solid var(--accent);border-radius:8px;padding:1.25rem 1.5rem;margin-bottom:1.5rem;}
  .key-takeaways h3{font-size:.95rem;color:var(--accent);margin:0 0 .75rem;}
  .key-takeaways ul{margin:0 0 0 1.25rem;}
  .key-takeaways li{margin:.25rem 0;font-size:.875rem;color:var(--text);}
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
  /* Definition block */
  .definition-block{background:linear-gradient(135deg,#f0f9ff,#f8fafc);border-left:3px solid var(--accent);padding:.75rem 1rem;margin:.75rem 0;border-radius:0 6px 6px 0;}
  .def-label{display:inline-block;background:var(--accent);color:#fff;font-size:.65rem;font-weight:700;padding:.1em .5em;border-radius:3px;margin-right:.5rem;vertical-align:middle;text-transform:uppercase;}
  footer{margin-top:3rem;padding-top:1.5rem;border-top:1px solid var(--border);color:var(--muted);font-size:.85rem;}
  footer a,a{color:var(--accent);text-decoration:none;}
  a:hover{text-decoration:underline;}
  strong{font-weight:700;}
  img{max-width:100%;height:auto;}
  @media(max-width:600px){
    .prev-next{flex-direction:column;}
  }
  /* ===== v3.0 UX Upgrade (E05) ===== */
  :root{--card-bg:#ffffff;--nav-bg:rgba(250,250,248,.92);--soft:#eff6ff;}
  html[data-theme="dark"]{--bg:#0f1116;--text:#e6e8ee;--muted:#9aa0ac;--accent:#7aa2ff;--border:#2a2f3a;--code-bg:#1a1f2b;--card-bg:#161a23;--nav-bg:rgba(15,17,22,.92);--soft:#16203a;}
  html[data-theme="dark"] th{background:#1a1f2b;}
  html[data-theme="dark"] blockquote{background:#121620;color:#c3c8d4;}
  html[data-theme="dark"] .toc{background:#161a23;}
  html[data-theme="dark"] .author-card{background:linear-gradient(135deg,#16203a,#121620) !important;}
  html[data-theme="dark"] .key-takeaways{background:linear-gradient(135deg,#16203a,#12201a) !important;}
  html[data-theme="dark"] .faq-section{background:#161a23 !important;}
  html[data-theme="dark"] .ref-section{background:#12161f !important;}
  html[data-theme="dark"] pre{background:#0d1017;}
  html[data-theme="dark"] .definition-block{background:#121a26 !important;}
  .reading-progress{position:fixed;top:0;left:0;height:3px;width:0;background:linear-gradient(90deg,#1e40af,#3b82f6);z-index:1000;transition:width .1s linear;}
  html[data-theme="dark"] .reading-progress{background:linear-gradient(90deg,#7aa2ff,#93c5fd);}
  .site-nav{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.8rem 0;border-bottom:1px solid var(--border);margin-bottom:2rem;position:sticky;top:0;background:var(--nav-bg);backdrop-filter:blur(6px);z-index:900;}
  .site-nav .brand{font-weight:800;font-size:1rem;color:var(--text);text-decoration:none;}
  .site-nav .nav-links{display:flex;gap:1rem;align-items:center;font-size:.85rem;}
  .site-nav .nav-links a{color:var(--muted);}
  .site-nav .nav-links a:hover{color:var(--accent);text-decoration:none;}
  .theme-toggle{cursor:pointer;border:1px solid var(--border);background:var(--card-bg);color:var(--text);border-radius:6px;padding:.2rem .55rem;font-size:.8rem;}
  .article-actions{display:flex;flex-wrap:wrap;gap:.5rem;margin:0 0 1.5rem;padding:.6rem .8rem;background:var(--card-bg);border:1px solid var(--border);border-radius:8px;font-size:.8rem;}
  .article-actions button{cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--muted);border-radius:6px;padding:.28rem .6rem;font-size:.8rem;}
  .article-actions button:hover{color:var(--accent);border-color:var(--accent);}
  .article-actions .act-copied{color:#16a34a;border-color:#16a34a;}
  html[data-theme="dark"] .article-actions .act-copied{color:#4ade80;border-color:#4ade80;}
  .page-wrap{position:relative;}
  .toc-sidebar{background:var(--toc-bg,#f8fafc);border:1px solid var(--border);border-radius:8px;padding:1rem 1.25rem;margin-bottom:2rem;}
  .toc-sidebar .toc{margin-bottom:0;background:transparent;border:none;}
  html[data-theme="dark"] .toc-sidebar{background:#161a23;}
  /*
   * 宽屏目录布局修复（原实现会遮挡正文）
   * -----------------------------------
   * 原实现：
   *     .toc-sidebar{position:fixed; right:max(1rem,calc((100vw - 1000px)/2)); width:min(260px,18vw); ...}
   *     .page-wrap{max-width:1180px; margin:0 auto; padding-left:10px;}
   * 这个 `calc((100vw - 1000px)/2)` **假定正文列宽 1000px**，但本模板的
   * `body{max-width:720px}` —— 正文实际只有约 662px 宽。于是目录被放到了正文之上：
   * 实测 1200px 视口下，正文右边缘 x=929、目录左边缘 x=869 →
   * **水平压住正文 60px、纵向压 568px**，直接妨碍阅读。
   *
   * 修法（两处关键）：
   *   1. 目录改为固定在**正文列右侧的留白**里：正文居中，其右边缘在 `50% + 331px`
   *      （662/2），目录从 `50% + 351px` 起（留 20px 间距）。
   *   2. 只在视口**确实容得下两者**时才启用（≥1240px：331 + 20 + 240 + 余量）；
   *      否则目录退回为正文上方的普通区块 —— 与原窄屏行为一致。
   * 因此**任何视口宽度下都不可能遮挡正文**。
   *
   * 注意：**不改 body 宽度**，正文阅读宽度保持原样（约 662px）。
   * （曾尝试用网格把目录做成右边一列，但那会在 720px 的 body 内把正文压到 390px，
   *   等于用一个过窄的正文换掉重叠，得不偿失，故弃用。）
   */
  @media(min-width:1240px){
    .toc-sidebar{
      position:fixed;
      top:96px;
      left:calc(50% + 351px);
      width:240px;
      max-height:80vh;
      overflow-y:auto;
      margin:0;
      font-size:.85rem;
    }
  }
  @media(max-width:600px){
    .site-nav .nav-links{font-size:.78rem;gap:.6rem;}
  }
</style>
</head>
<body data-article-slug="__SLUG__" data-article-title="__TITLE__" data-article-date="__DATE__" data-aigc-label="__AIGC_LABEL__" data-aigc-content-producer="__AIGC_PRODUCER__">
<div class="reading-progress" id="readingProgress"></div>
<nav class="site-nav">
  <a class="brand" href="https://bi-chao.com/">智能体的知识库</a>
  <div class="nav-links">
    <a href="https://bi-chao.com/">首页</a>
    <a href="https://bi-chao.com/tags">标签</a>
    <a href="https://bi-chao.com/faq">FAQ</a>
    <a href="https://bi-chao.com/about">关于</a>
    <button class="theme-toggle" id="themeToggle" type="button">主题</button>
  </div>
</nav>
<div class="page-wrap">
  <aside class="toc-sidebar">__TOC__</aside>
  <article>
    <h1>__TITLE__</h1>
    __AIGC_NOTICE__
    <div class="article-meta">__AUTHOR__ &nbsp;|&nbsp; __DATE__ &nbsp;|&nbsp; __READING_TIME__ &nbsp;|&nbsp; <a href="https://bi-chao.com/">chaos-for-agent</a> &nbsp; __TAGS__</div>
    <div class="article-actions">
      <button type="button" id="copyCiteBtn">引用</button>
      <button type="button" id="copyLinkBtn">复制链接</button>
      <button type="button" id="shareWxBtn">微信</button>
      <button type="button" id="shareWbBtn">微博</button>
      <button type="button" id="shareXBtn">X / 推特</button>
    </div>
    __KEY_TAKEAWAYS__
    __FAQ__
    __CONTENT__
    __REFERENCES__
    __AUTHOR_CARD__
  </article>
</div>
<div class="related-nav">
  __PREV_NEXT__
  __RELATED__
  <p>← <a href="https://bi-chao.com/">返回首页</a> &nbsp;|&nbsp; <a href="https://bi-chao.com/about">关于作者</a> &nbsp;|&nbsp; <a href="https://bi-chao.com/feed.xml">RSS</a></p>
</div>
<footer>
  <p>&copy; 2026 <a href="https://bi-chao.com/about">毕超</a> · <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/">CC BY-NC-ND 4.0</a> · <a href="https://bi-chao.com/">chaos-for-agent</a></p>
</footer>
<script>
(function(){
  var $=function(s){return document.querySelector(s);};
  var KEY='bc-theme';
  function apply(t){
    if(!t){t=localStorage.getItem(KEY)||((window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light');}
    document.documentElement.setAttribute('data-theme',t);
    localStorage.setItem(KEY,t);
    var b=$('#themeToggle');
    if(b){b.textContent=(t==='dark')?'亮色':'主题';}
  }
  var tbtn=$('#themeToggle');
  if(tbtn){tbtn.addEventListener('click',function(){var cur=document.documentElement.getAttribute('data-theme')||'light';apply(cur==='dark'?'light':'dark');});}
  apply();
  var rp=$('#readingProgress');
  function prog(){
    var h=document.documentElement.scrollHeight-window.innerHeight;
    var y=window.scrollY||document.documentElement.scrollTop;
    if(rp){rp.style.width=(h>0?(y/h*100):0)+'%';}
  }
  window.addEventListener('scroll',prog,{passive:true});
  window.addEventListener('resize',prog);
  prog();
  function copy(txt,btn,ok){
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(function(){flash(btn,ok);}).catch(function(){window.prompt('复制：',txt);});
    }else{window.prompt('复制：',txt);}
  }
  function flash(btn,ok){
    btn.classList.add('act-copied');
    var old=btn.textContent;
    btn.textContent=ok;
    setTimeout(function(){btn.classList.remove('act-copied');btn.textContent=old;},1800);
  }
  var slug=document.body.getAttribute('data-article-slug')||'';
  var title=document.body.getAttribute('data-article-title')||'';
  var rawdate=document.body.getAttribute('data-article-date')||'';
  var date=rawdate.slice(0,10);
  var url='https://bi-chao.com/articles/'+slug;
  var cbtn=$('#copyCiteBtn');
  if(cbtn){cbtn.addEventListener('click',function(){
    var md='> 来源：'+(date?date+' ':'')+'毕超，《'+title+'》，bi-chao.com，'+url;
    copy(md,cbtn,'已复制引用');
  });}
  var lbtn=$('#copyLinkBtn');
  if(lbtn){lbtn.addEventListener('click',function(){copy(url,lbtn,'已复制链接');});}
  var wbtn=$('#shareWxBtn');
  if(wbtn){wbtn.addEventListener('click',function(){copy('《'+title+'》 '+url+' —— 毕超',wbtn,'已复制，去微信粘贴');});}
  var wb=$('#shareWbBtn');
  if(wb){wb.addEventListener('click',function(){
    window.open('https://service.weibo.com/share/share.php?url='+encodeURIComponent(url)+'&title='+encodeURIComponent('推荐：「'+title+'」—— 毕超'),'_blank');
  });}
  var xb=$('#shareXBtn');
  if(xb){xb.addEventListener('click',function(){
    window.open('https://twitter.com/intent/tweet?url='+encodeURIComponent(url)+'&text='+encodeURIComponent(title),'_blank');
  });}
})();
</script>
</body>
</html>`;

// ========== About 页模板 ==========

const ABOUT_TEMPLATE_PART = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>毕超 — 关于作者 | chaos-for-agent</title>
<meta name="description" content="毕超，博士、高级工程师（计算机技术专业），金融行业风险管理从业者。清华大学校友导师，中国人工智能学会终身会员。">
<meta property="og:title" content="毕超 — 关于作者">
<meta property="og:description" content="博士、高级工程师，金融行业风险管理从业者。主要研究方向为大语言模型、数字金融、金融科技。">
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

/**
 * YAML Front Matter 解析（支持块状 map 列表）。
 *
 * 修复要点：原实现把所有多行数组项一律当作**标量**处理，于是
 *
 *   references:
 *     - title: "麦肯锡报告"
 *       url: "https://..."
 *
 * 会被解析成 ['title: "麦肯锡报告"', 'url: "https://..."'] 这样的字符串数组，
 * 而 renderReferences() 期望的是 {title,url} 对象 —— 结果是线上渲染出
 * <a href="undefined">undefined</a>，citation JSON-LD 变成 [{"@type":"CreativeWork"}]
 * （空引用对象，比没有更糟）。这条链路此前从未被真实数据验证过。
 *
 * 现在三种写法都支持：
 *   tags: ["a","b"]                内联数组
 *   tags:\n  - a                   标量列表
 *   references:\n  - title: x\n    url: y     块状 map 列表
 * 嵌套 map（如 AIGC: / schema:）仍按原样忽略，以保持既有行为。
 */
function parseFrontMatter(md) {
  const match = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { body: md, meta: {} };

  const meta = {};
  const lines = match[1].split('\n');
  let currentKey = null;
  let listMode = false;   // 当前键是否处于块状列表
  let currentObj = null;  // 块状列表中的当前 map 项

  const flushObj = () => {
    if (currentObj && currentKey && Array.isArray(meta[currentKey])) {
      meta[currentKey].push(currentObj);
    }
    currentObj = null;
  };

  for (const line of lines) {
    if (!line.trim()) continue;
    if (/^\s*#/.test(line)) continue;   // YAML 注释

    // 列表项：  - xxx
    const item = line.match(/^(\s*)-\s+(.*)$/);
    if (currentKey && listMode && item) {
      flushObj();
      const rest = item[2].trim();
      // 「- key: value」视为 map 项的起点；但 https://x 不是键值对
      const inlineKv = rest.match(/^([\w-]+):\s*(.*)$/);
      if (inlineKv && !/^https?:\/\//i.test(rest)) {
        currentObj = { [inlineKv[1]]: parseYamlValue(inlineKv[2]) };
      } else {
        meta[currentKey].push(parseYamlValue(rest));
      }
      continue;
    }

    // 缩进更深的「键: 值」行，两种可能：
    //   a) 列表项 map 的续行（currentObj 已存在）→ 追加到该对象
    //   b) 该顶层键其实是个**嵌套 map**（如 AIGC: / schema:）→ 就地升级为对象
    // 此前一律丢弃（b），导致 AIGC 合规标识块虽然写在文件里，渲染层完全读不到。
    const contKv = line.match(/^\s+([\w-]+):\s*(.*)$/);
    if (currentKey && listMode && contKv) {
      if (currentObj) {
        currentObj[contKv[1]] = parseYamlValue(contKv[2]);
      } else if (!Array.isArray(meta[currentKey]) || meta[currentKey].length === 0) {
        if (Array.isArray(meta[currentKey])) meta[currentKey] = {};
        meta[currentKey][contKv[1]] = parseYamlValue(contKv[2]);
      }
      continue;
    }

    // 顶层键值对
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kv) {
      flushObj();
      currentKey = kv[1];
      const rawVal = kv[2];
      if (rawVal === '') {
        meta[currentKey] = [];
        listMode = true;
        continue;
      }
      meta[currentKey] = parseYamlValue(rawVal);
      listMode = false;
    }
    // 其余无法识别的行（含 AIGC/schema 等嵌套块）保持忽略
  }
  flushObj();

  return { body: md.substring(match[0].length), meta };
}

/** Markdown → HTML 转换 */
/**
 * 行内格式：加粗 / 斜体 / 链接。
 *
 * 抽成独立函数，是因为**表格单元格此前拿不到任何行内格式**：
 * md2html 里表格在「加粗/斜体/链接」规则**之前**就被渲染并抽进 tables[] ，
 * 单元格内容是原样 `${c.trim()}` 输出，之后再也不会被处理 ——
 * 于是作者写的 `**加粗**` 在页面上直接显示为字面星号。
 *
 * 实测影响面：全站 14 篇文章、77 个表格行（含多条核心文章的对照表），
 * 属既存渲染缺陷，非本次新增内容引入。
 */
function inlineFmt(s) {
  return String(s)
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function md2html(md) {
  // 代码块保护
  const codeBlocks = [];
  md = md.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(`<pre><code>${code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').trim()}</code></pre>`);
    return `\x00CB${idx}\x00`;
  });

  // 原始 HTML 块保护（作者手写的 <script type="application/ld+json"> 等）
  //
  // 此前 md2html **不识别 <script>**：它不在下方「已是 HTML」白名单里，于是被当普通行
  // **逐行包成 <p>**，JSON 被撕成 `</p><p>{</p><p>  "@context"…`，产出**非法 JSON-LD**
  // （实测约 25 篇文章各有一个）。搜索引擎读到的是坏的结构化数据。
  // 这里按原样透传，既修好存量，也让作者今后写原始 HTML 不再被破坏。
  const rawBlocks = [];
  md = md.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (m) => {
    const idx = rawBlocks.length;
    rawBlocks.push(m);
    return `\x00RB${idx}\x00`;
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
    html += '<thead><tr>' + lines[0].split('|').filter(Boolean).map(c => `<th>${inlineFmt(c.trim())}</th>`).join('') + '</tr></thead>';
    // Body (skip separator line)
    html += '<tbody>';
    for (let i = 2; i < lines.length; i++) {
      html += '<tr>' + lines[i].split('|').filter(Boolean).map(c => `<td>${inlineFmt(c.trim())}</td>`).join('') + '</tr>';
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
    if (line.startsWith('\x00CB') || line.startsWith('\x00TB') || line.startsWith('\x00RB')) {
      const match = line.match(/\x00(CB|TB|RB)(\d+)\x00/);
      if (match) {
        const kind = match[1];
        result.push(kind === 'CB' ? codeBlocks[parseInt(match[2])]
          : kind === 'TB' ? tables[parseInt(match[2])]
          : rawBlocks[parseInt(match[2])]);
      }
      continue;
    }
    if (!line.trim()) { result.push(''); continue; }
    if (/^<(h[1-4]|ul|ol|li|blockquote|pre|code|table|thead|tbody|tr|th|td|hr|script|\/?(ul|ol|table|thead|tbody|blockquote|script))/.test(line.trim())) {
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

/**
 * JSON 字符串内联转义 —— 用于把动态值插进手写的 JSON-LD 文本。
 *
 * 为什么需要：JSON-LD 是模板字符串手写拼接的，动态值（尤其文章标题）直接插入。
 * 标题里只要出现一个直引号 `"`，整段 JSON 就会被截断成**非法结构**
 * （实测 3 篇中招，标题形如 `JEV：当 AI 学会"只决策、不聊天"，…`）。
 * 用 JSON.stringify 后再剥掉外层引号，即得可安全内联的转义结果。
 */
function jsonStr(s) {
  return JSON.stringify(String(s ?? '')).slice(1, -1);
}

/** 用 __KEY__ 占位符填充模板（安全，不依赖正则替换值） */
/**
 * 把一段 JSON-LD 字符串包成完整的 <script> 标签；内容为空时返回空串。
 * 原先模板无条件输出 <script type="application/ld+json"> 包裹，导致
 * FAQ / HowTo / Image 等可选 schema 缺省时留下**空脚本块**（无效 JSON），
 * 会被 Search Console 报为"结构化数据 JSON 无效"。
 */
function ldBlock(json) {
  const s = (json || '').trim();
  return s ? `<script type="application/ld+json">\n${s}\n</script>` : '';
}

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
<p><strong>毕超</strong>，博士、高级工程师（计算机技术专业），金融行业风险管理从业者。</p>
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
      // 清理问题文本尾部残留的 Markdown 强调标记。
      // 原文常写作 `**Q1：……？**`，qRe 只吃掉开头的 `**Q1：`，结尾的 `**`
      // 会留在问题里、页面上直接显示成字面星号
      // （实测 local-llm-deployment-data-sovereignty 有 5 处）。
      currentQ = m[1].trim().replace(/\*{1,3}\s*$/, '').trim();
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
/**
 * 把 references 归一化为 {title,url,source} 列表。
 *
 * 兼容作者的多种写法：{title,url,source} 对象、纯 URL 字符串、只给 url 不给 title。
 * **无 url 的条目一律丢弃** —— 渲染出 href="undefined" 的可见坏链，或在
 * citation JSON-LD 里产出空对象，都比完全不渲染更糟。
 */
function normalizeReferences(refs) {
  if (!Array.isArray(refs)) return [];
  const out = [];
  for (const r of refs) {
    let url = '', title = '', source = '';
    if (typeof r === 'string') {
      url = r.trim();
    } else if (r && typeof r === 'object') {
      url = String(r.url || '').trim();
      title = String(r.title || '').trim();
      source = String(r.source || r.publisher || '').trim();
    }
    if (!/^https?:\/\//i.test(url)) continue;   // 只接受可点击的绝对链接
    out.push({ title: title || url, url, source });
  }
  return out;
}

function renderReferences(refs) {
  const items = normalizeReferences(refs);
  if (items.length === 0) return '';
  let html = '<section class="ref-section"><h2>参考文献</h2><ol>';
  for (const r of items) {
    const src = r.source ? ` <span class="ref-source">[${escHtml(r.source)}]</span>` : '';
    html += `<li><a href="${escHtml(r.url)}" target="_blank" rel="noopener noreferrer">${escHtml(r.title)}</a>${src}</li>`;
  }
  html += '</ol></section>';
  return html;
}

/** 估算阅读时间（中文 ~400 字/分钟） */
function readingTime(text) {
  const chars = text.replace(/\s/g, '').length;
  return Math.max(1, Math.ceil(chars / 400));
}

/** 生成核心摘要框：从正文提取关键句（加粗语句 + 首段关键句） */
function genKeyTakeaways(body, description) {
  const items = [];

  // 1. 提取加粗语句 **text**（前 800 字符范围内，限 4 条）
  const boldRe = /\*\*(.+?)\*\*/g;
  const earlyBody = body.slice(0, 800);
  let bm;
  while ((bm = boldRe.exec(earlyBody)) !== null && items.length < 4) {
    const t = bm[1].trim();
    if (t.length >= 8 && t.length <= 80 && !items.includes(t)) {
      items.push(t);
    }
  }

  // 2. 首段纯文本句（20~120 字普通句，非标题、非列表）
  if (items.length < 3) {
    const plainText = body.replace(/[#*>\-`\[\]()!_~|]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
    const sentences = plainText.split(/[。；\n]/).filter(s => {
      const len = s.trim().length;
      return len >= 15 && len <= 120;
    });
    for (const s of sentences) {
      const t = s.trim();
      if (items.length >= 4) break;
      if (!items.includes(t)) items.push(t);
    }
  }

  // 3. 兜底：使用 description
  if (items.length === 0 && description) {
    items.push(description);
  }

  if (items.length === 0) return '';
  let html = '<div class="key-takeaways"><h3>核心摘要</h3><ul>';
  for (const item of items.slice(0, 4)) {
    html += `<li>${item}</li>`;
  }
  html += '</ul></div>';
  return html;
}

/** 定义块检测：识别正文中 25-50 字的独立定义句，标注为 definition 语义块 */
function detectDefinitions(html) {
  // 匹配 <p> 标签内 25-50 字纯文本段落，包含 "是/是指/即/指的是/就是" 等定义模式
  const defRe = /<p>((?!<[^>]*>)..*?(?:是指|指的是|即是|就是|即 |—|——)..*?(?=<\/p>))<\/p>/g;
  return html.replace(defRe, (match, text) => {
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    const charLen = cleanText.replace(/\s/g, '').length;
    if (charLen >= 25 && charLen <= 50 && !/<[ab]/.test(cleanText)) {
      return `<p class="definition-block"><span class="def-label">定义</span>${text}</p>`;
    }
    return match;
  });
}

/**
 * 行内数据引用标记：识别 `[来源:URL]` / `（数据来源：xxx）` 并标注为 citation。
 *
 * 修复要点：原实现只把文字包进 <cite>，**从不生成链接** —— 于是
 * `（数据来源：某监管文件）` 在页面上是"标了来源却没有出处可点"，
 * 对读者和 AI 引擎都没有可溯源性。现在如果捕获内容里含 URL，会真的渲染成链接。
 * 括号内只有文字、没有 URL 时保持原有的 <cite> 标注（没有 URL 可链）。
 *
 * ⚠️ 已核实：**本函数在全部 86 篇文章上触发 0 次**，原因不是代码错，而是
 * **标记形式与实际写法不一致**：
 *   - 本函数要求 `[来源:…]` 或 `（数据来源：…）`（带全角括号）
 *   - 站内实际写作是**不带括号**的句末形式，例如
 *       "文中市场规模数据来源：中商产业研究院"
 *       "参考与数据来源：世界人工智能大会官方公众号《WAIP UP!》…"
 *   实测含该写法的文章有 3 篇，但无一满足本函数的括号要求。
 *
 * 如需让它生效，只需把模式2 改为可匹配无括号的 `数据来源：xxx`（以句读符或换行
 * 为界）。**评估：收益仅为给 3 篇文章加上 <cite> 语义标记，属低价值** ——
 * <cite> 不产生富结果，也没有 AI 引用收益的证据。故此处不做，仅记录待决。
 */
/**
 * 把正文里的裸 URL 自动转成可点击链接。
 *
 * 背景（重要）：站内不少文章以"来源清单"形式列出一手出处，但写成**裸 URL**，
 * 例如：
 *     - OCC 新闻稿《OCC Issues Updated Model Risk Management Guidance》，
 *       https://www.occ.gov/news-issuances/news-releases/2026/nr-occ-2026-29.html
 * Markdown 标准并不自动链接裸 URL，本站的 md2html 也不链接，于是这些一手来源
 * 在页面上**全是不可点击的纯文本** —— 读者点不了，AI 引擎也不把它当作可溯源引用。
 *
 * 实测规模：11 篇文章共 47 条来源 URL 处于该状态（最多的两篇分别有 14 与 12 条）。
 * 这是"引用体系空转"里**纯代码可修**的那一半，与"作者没写来源"是两回事。
 *
 * 安全性：按标签切分逐段扫描，跳过
 *   - 标签内部（即 HTML 属性值，避免把 href="..." 再包一层）
 *   - <a> … </a> 已链接区域
 *   - <code> / <pre> 代码区域
 * 并剥离 URL 末尾的 ASCII 标点（避免把句号、逗号吃进链接）。
 */
function autolinkBareUrls(html) {
  const parts = html.split(/(<[^>]+>)/);
  let inAnchor = 0, inCode = 0;
  // 前导分隔符保证不会从单词中间切开；URL 字符集排除中英文收尾标点
  const URL_RE = /(^|[\s（(【\[>：:，,、；;])(https?:\/\/[^\s<>"'）)】\]，。；：、]+)/g;

  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i];
    if (seg.startsWith('<')) {
      const t = seg.toLowerCase();
      if (/^<a[\s>]/.test(t)) inAnchor++;
      else if (t.startsWith('</a>')) inAnchor = Math.max(0, inAnchor - 1);
      else if (/^<(code|pre)[\s>]/.test(t)) inCode++;
      else if (/^<\/(code|pre)>/.test(t)) inCode = Math.max(0, inCode - 1);
      continue;
    }
    if (inAnchor > 0 || inCode > 0 || !seg.includes('http')) continue;
    parts[i] = seg.replace(URL_RE, (m, pre, raw) => {
      // 剥离 URL 末尾的 ASCII 标点，留在链接之外
      const mm = raw.match(/^(.*?)([.,;:!?]+)?$/);
      const url = mm[1];
      const tail = mm[2] || '';
      return `${pre}<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>${tail}`;
    });
  }
  return parts.join('');
}

function detectDataCitations(html) {
  // 避免对已有 HTML 实体二次转义
  const escCite = (s) => s
    .replace(/&(?!(?:[a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const render = (label, text) => {
    const m = text.match(/https?:\/\/[^\s，。；、）】]+/);
    if (!m) return `<cite class="inline-citation">${escCite(label)}</cite>`;
    const url = m[0];
    const safeUrl = escCite(url).replace(/"/g, '%22');
    return `<cite class="inline-citation"><a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${escCite(label)}</a></cite>`;
  };

  // 模式1: [来源:…] / [数据来源:…] / [Source:…]
  html = html.replace(/\[(?:来源|数据来源|参考|Source|Ref)[：:]?\s*(.+?)\]/g,
    (match, text) => render(`[${text}]`, text));

  // 模式2: （来源：…）/（数据来源：…）
  html = html.replace(/（(?:数据)?来源[：:]\s*(.+?)）/g,
    (match, text) => render(`（来源：${text}）`, text));

  return html;
}

/** HowTo Schema 检测：识别步骤模式 "步骤1/2/3"、"Step 1"、或有序列表型教程 */
/**
 * HowTo 步骤检测。
 *
 * ⚠️ 已核实：**本函数在全部 86 篇文章上触发 0 次，且不建议为此修改。**
 *
 * 为什么触发 0 次：下面的中文正则要求「第 + 阿拉伯数字」（第1步），但站内文章
 * 一律写作中文数字（"第一步/第二步"）—— 实测 19 篇文章含"第N步"式表述，
 * 却无一篇能匹配。英文正则同理不适用于中文内容。
 *
 * 为什么不建议修：据 Google 官方文档
 *   - 2023-08《HowTo 和常见问题解答富媒体搜索结果方面的变化》：
 *     HowTo 富结果**仅向桌面设备显示**；FAQ 富结果**仅为知名且权威的政府/健康
 *     网站显示**，其他网站不再定期显示。
 *   - 该公告并明确表示：此类未被使用的结构化数据"无需主动移除，不会对 Google
 *     搜索造成问题，也不会产生明显影响"。
 *   - 2025-06《简化搜索结果页》的弃用清单为 Book Actions / Course Info /
 *     Claim Review / Estimated Salary / Learning Video / Special Announcement /
 *     Vehicle Listing —— **HowTo 与 FAQ 不在其中**，即仍受支持但价值已极低。
 *   - 另有研究综述表明：结构化数据**没有**提升 AI 引用率的证据。
 *
 * 结论：为一个中文博客修好 HowTo，最多换来"桌面端富结果"，投入产出比不成立。
 * 保留此代码无害（Google 明确说无需移除）；若将来要精简代码面，可整体删除本函数
 * 及其在 renderArticle 中的调用，不要试图"修好它"。
 */
function detectHowTo(body) {
  // 模式1: "步骤 N" 或 "第 N 步" (中文)
  const stepReCN = /(?:步骤|第)\s*(\d{1,2})\s*(?:步|\.|：|:|、)\s*(.+)/gi;
  // 模式2: "Step N" (英文)
  const stepReEN = /Step\s+(\d{1,2})[\.:：]\s*(.+)/gi;
  const steps = [];

  for (const re of [stepReCN, stepReEN]) {
    let m;
    while ((m = re.exec(body)) !== null) {
      steps.push({
        position: parseInt(m[1]),
        text: m[2].trim().substring(0, 200)
      });
    }
  }

  // 模式3: 检测有序列表 "1. xxx\n2. xxx" 且有 "首先/然后/最后/接下来" 引导词
  const hasGuide = /\b(?:首先|然后|接下来|最后|第一步|开始|完成)\b/i.test(body);
  const olSteps = body.match(/^\d{1,2}\.\s+(.+)/gm);
  if (hasGuide && olSteps && olSteps.length >= 3) {
    const existingPositions = new Set(steps.map(s => s.position));
    olSteps.forEach((s, i) => {
      const pos = i + 1;
      if (!existingPositions.has(pos)) {
        steps.push({ position: pos, text: s.replace(/^\d{1,2}\.\s*/, '').trim().substring(0, 200) });
      }
    });
  }

  if (steps.length < 2) return null;
  // 按 position 排序去重
  steps.sort((a, b) => a.position - b.position);
  const deduped = [];
  const seen = new Set();
  for (const s of steps) {
    if (!seen.has(s.position)) { deduped.push(s); seen.add(s.position); }
  }
  return deduped.length >= 2 ? deduped : null;
}

/** 图片 Schema 检测：提取 HTML 中 <img> 标签生成 ImageObject 列表 */
function generateImageSchemas(html) {
  const imgRe = /<img\b[^>]*\bsrc="([^"]+)"[^>]*(?:\balt="([^"]*)")?[^>]*>/gi;
  const images = [];
  let m;
  while ((m = imgRe.exec(html)) !== null) {
    const src = m[1];
    const alt = m[2] || '';
    if (src && !src.includes('data:') && !src.includes('pixel') && !src.includes('tracking')) {
      images.push({ url: src, caption: alt.trim() });
    }
  }
  return images;
}

/** 正文内链注入：在 HTML 正文中自动插入对其他文章的上下文链接 */
function injectInternalLinks(html, articles, currentSlug) {
  if (!articles || articles.length < 2) return html;

  // 构建候选文章列表（排除当前文章，按标题长度降序避免短标题误匹配）
  const candidates = articles
    .filter(a => a.slug !== currentSlug && a.title && a.title.length >= 4)
    .sort((a, b) => b.title.length - a.title.length);

  if (candidates.length === 0) return html;

  // 提取已存在的链接文本，避免重复链接
  const existingLinks = new Set();
  const linkRe = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;
  let lm;
  while ((lm = linkRe.exec(html)) !== null) {
    existingLinks.add(lm[1].replace(/<[^>]*>/g, '').trim());
  }

  // 收集所有已标记的位置区间 [start, end)，避免嵌套链接
  const markedRanges = [];

  for (const cand of candidates) {
    const escaped = cand.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escaped, 'g');
    let m;
    while ((m = re.exec(html)) !== null) {
      const start = m.index;
      const end = start + cand.title.length;

      // 跳过已链接区域
      if (existingLinks.has(cand.title)) continue;

      // 检查是否与已标记区间重叠
      let overlap = false;
      for (const [ms, me] of markedRanges) {
        if (start < me && end > ms) { overlap = true; break; }
      }
      if (overlap) continue;

      // 检查是否在 HTML 标签内（简单检测：前 200 字符内有未闭合的 <）
      const before = html.substring(Math.max(0, start - 200), start);
      const openCount = (before.match(/<[^/>][^>]*>/g) || []).length;
      const closeCount = (before.match(/<\/[^>]+>/g) || []).length + (before.match(/<[^/>]+\/>/g) || []).length;
      if (openCount !== closeCount) continue;

      // 标记区间并替换
      markedRanges.push([start, end]);
      const link = `<a href="/articles/${cand.slug}">${cand.title}</a>`;
      html = html.substring(0, start) + link + html.substring(end);
      break; // 每篇文章最多链接一次
    }
  }
  return html;
}

// ========== 数据获取 ==========
//
// 上游容错（G-08）
// ---------------
// 问题：本站**所有**渲染都依赖 raw.githubusercontent.com —— getArticles() 位于每一条
// 渲染路径上，文章正文也从该域名逐篇获取。原实现没有兜底：上游一旦抖动、限流或短时
// 不可达，**每一页都会失败**（getArticles 抛错 → 500）。对搜索引擎与 AI 爬虫而言，
// 可用性就是可抓取性，这是 GEO 的前置条件，比任何 schema 调整都更底层。
//
// 方案：内存态"最后一次成功"缓存 + 失败兜底。
//   · 内存缓存只作**兜底与去抖**，不当主缓存（主缓存仍是 Cloudflare 的 cf.cacheTtl）
//   · freshMs 默认 0：文章正文仍每次回源，**不引入任何新的内容延迟**
//   · index.json 用 30s 新鲜窗口 —— 它本来就有 300s 边缘缓存，故不增加可见延迟
//   · 内存有条数上限，避免 isolate 内存膨胀
const UPSTREAM_MAX_KEYS = 80;
const _upstreamCache = new Map();

function upstreamCacheSet(key, text) {
  if (_upstreamCache.size >= UPSTREAM_MAX_KEYS) {
    const oldest = _upstreamCache.keys().next().value;
    if (oldest !== undefined) _upstreamCache.delete(oldest);
  }
  _upstreamCache.set(key, { text, at: Date.now() });
}

/**
 * 带容错的上游获取。返回 { ok, text, stale? }；ok=false 时附带 status。
 * 区分两类失败（这点很关键）：
 *   · 网络异常 / 5xx / 载荷无效 → 视为**故障**，可用历史值兜底
 *   · 404 / 410                  → 视为**明确答案**，如实返回，不用历史值
 *                                 （否则已删除的文章会继续可访问）
 */
async function fetchUpstream(path, { freshMs = 0, validate = null } = {}) {
  const hit = _upstreamCache.get(path);
  if (hit && freshMs > 0 && Date.now() - hit.at < freshMs) {
    return { ok: true, text: hit.text, cached: true };
  }

  let resp;
  try {
    resp = await fetch(`${REPO_RAW}${path}`, { cf: { cacheTtl: 300 } });
  } catch (e) {
    if (hit) return { ok: true, text: hit.text, cached: true, stale: true };
    throw e;
  }

  if (!resp.ok) {
    if (resp.status === 404 || resp.status === 410) return { ok: false, status: resp.status };
    if (hit) return { ok: true, text: hit.text, cached: true, stale: true };
    return { ok: false, status: resp.status };
  }

  const text = await resp.text();
  if (validate && !validate(text)) {
    if (hit) return { ok: true, text: hit.text, cached: true, stale: true };
    return { ok: false, status: 502 };
  }
  upstreamCacheSet(path, text);
  return { ok: true, text };
}

async function getArticles() {
  const r = await fetchUpstream('/articles/index.json', {
    freshMs: 30_000,
    // 校验载荷：非数组或空数组一律视为无效，避免坏数据进缓存并渲染出空站
    validate: (t) => {
      try {
        const d = JSON.parse(t);
        return Array.isArray(d) && d.length > 0;
      } catch (_) {
        return false;
      }
    },
  });
  if (!r.ok) throw new Error(`Failed to fetch index (status ${r.status})`);
  return JSON.parse(r.text);
}

function findArticle(articles, slug) {
  return articles.find(a => a.slug === slug);
}

// ========== 文章渲染 ==========

/**
 * 内容协商：判断请求方是否要 Markdown 原文。
 * 依据 llms.txt v2 约定 —— 同 URL 追加 `.md`、或显式 `Accept: text/markdown`；
 * 另支持 `?format=md|html` 便于人工调试与显式覆盖。
 *
 * 注意 explicitMd 必须由路由层传入原始路径判断结果，不能在 renderArticle 内部
 * 用 pathname.endsWith('.md') 判断 —— 路由会把无后缀路径规范化成 .md 再传进来，
 * 那样恒为真，会导致默认文章页误返回 Markdown、整站正文对浏览器失效。
 */
function wantsMarkdown(request, explicitMd) {
  if (explicitMd) return true;
  if (!request) return false;
  try {
    const fmt = (new URL(request.url).searchParams.get('format') || '').toLowerCase();
    if (fmt === 'md' || fmt === 'markdown') return true;
    if (fmt === 'html') return false;
  } catch (_) {}
  return /\btext\/markdown\b/i.test(request.headers.get('Accept') || '');
}

async function renderArticle(pathname, request, explicitMd) {
  const slug = (pathname.replace(/^\/articles\//, '').replace(/\.md$/, '')).trim();

  try {
    const articles = await getArticles();
    const article = findArticle(articles, slug);
    // 用统一的 HTML 404 页，而非裸文本 —— 否则这两条路径会绕过 404 页
    // （审计中的路由全覆盖扫描发现的遗漏：通用兜底已改，这两处没跟着改）
    if (!article) return renderNotFound(`/articles/${slug}`);

    // 获取 markdown 原文（走上游容错：404 视为明确不存在，网络故障才用历史值兜底）
    const md = await fetchUpstream(pathname);
    if (!md.ok) return renderNotFound(`/articles/${slug}`);

    const mdText = md.text;

    // 真正返回 Markdown（此前无论 .md 还是裸 URL 都渲染 HTML）。
    // 注意：仓库里的 _headers 声明了 text/markdown，但脚本型 Worker 不读取
    // _headers，那些规则从未生效 —— 这也是 README/llms.txt 对外宣称的
    // “Markdown 直读”长期未兑现的原因。
    if (wantsMarkdown(request, explicitMd)) {
      return new Response(mdText, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
          'Vary': 'Accept',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

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

    // 独立摘要框
    const keyTakeawaysHtml = genKeyTakeaways(body, description);

    // 参考文献：先归一化，过滤掉没有 URL 的条目（避免坏链与空 citation 对象）
    const references = normalizeReferences(meta.references || article.references || []);
    const refHtml = renderReferences(references);

    // 阅读时间
    const readTime = readingTime(body);

    // OG 图片：改为指向构建期生成的静态 PNG。
    // 原实现指向 /og?title=... 且由 Worker 返回 image/svg+xml，而 X/Twitter、Facebook、
    // LinkedIn、微信、Slack 等主流平台均不支持 SVG 作为 og:image —— 结果是所有分享
    // 卡片都没有图片。静态 PNG 由 scripts/generate_og_images.py 在 CI 中预生成。
    // 路径选择说明：静态图放 /assets/og/ 而非 /og*/，因为 robots.txt 的
    // `Disallow: /og` 是**前缀匹配**，会连带屏蔽 /og-img/... 这类路径。
    const ogImage = meta.og_image || article.og_image || `${DOMAIN}/assets/og/${article.slug}.png`;

    // AIGC 标识（G-10）
    // 25/86 篇文章的 front matter 里**作者已声明** AIGC 标识块
    // （Label / ContentProducer / ProduceID / ReservedCode），但此前解析器有意丢弃嵌套 map，
    // 页面上一字不渲染 —— 又一处"声明了但没接上"。
    // 这里只**如实呈现作者自己声明的字段**，不新增任何判断、不解读 Label 的取值含义。
    // 注：《人工智能生成合成内容标识办法》对显式标识的形式另有具体要求，
    //     上线前建议对照法规确认呈现形式；此处给出的是可见提示 + data-* 机器可读载体。
    const aigc = (meta.AIGC && typeof meta.AIGC === 'object' && !Array.isArray(meta.AIGC)) ? meta.AIGC : null;
    const aigcLabel = aigc && aigc.Label !== undefined ? String(aigc.Label) : '';
    const aigcProducer = aigc && aigc.ContentProducer ? String(aigc.ContentProducer) : '';
    const aigcProduceId = aigc && aigc.ProduceID ? String(aigc.ProduceID) : '';
    const aigcNotice = aigcLabel
      ? `<div class="aigc-notice" role="note" data-aigc-label="${escHtml(aigcLabel)}"`
        + (aigcProducer ? ` data-aigc-content-producer="${escHtml(aigcProducer)}"` : '')
        + (aigcProduceId ? ` data-aigc-produce-id="${escHtml(aigcProduceId)}"` : '')
        + ` style="margin:.6rem 0 1rem;padding:.5rem .75rem;border-left:3px solid #94a3b8;background:#f1f5f9;color:#475569;font-size:.8rem;line-height:1.6;border-radius:0 4px 4px 0;">`
        + `本内容带有 AI 生成合成内容标识（Label: ${escHtml(aigcLabel)}`
        + (aigcProducer ? `；生成服务提供者编号: ${escHtml(aigcProducer)}` : '')
        + `）</div>`
      : '';

    // 转换正文 + 定义块检测 + 内链注入
    let contentHtml = injectHeadingIds(md2html(body));
    contentHtml = detectDefinitions(contentHtml);
    contentHtml = detectDataCitations(contentHtml);   // B2: 行内数据引用标记
    // 顺序很重要：必须在 detectDataCitations 之后。否则裸 URL 会先被包成 <a>，
    // 接着 detectDataCitations 再套一层 <cite>，产生嵌套锚点。
    contentHtml = autolinkBareUrls(contentHtml);      // 裸 URL → 可点击的一手来源链接
    contentHtml = injectInternalLinks(contentHtml, articles, slug);
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
        "author": buildPersonNode(),
        "publisher": {"@type": "Organization", "name": meta.publisher || "中国金融出版社"},
        "datePublished": meta.publication_date || date,
        "numberOfPages": meta.pages ? String(meta.pages) : "",
        "image": { "@type": "ImageObject", "url": ogImage, "width": 1200, "height": 630 },
        "inLanguage": "zh-CN"
      };
    } else {
      jsonLd = {
        "@context": "https://schema.org",
        // Google 富结果只支持 Article / NewsArticle / BlogPosting。
        // 此前用 ScholarlyArticle，属无效选择（Search Gallery 不含该类型，拿不到富结果资格）。
        "@type": (schemaType === 'Article' || schemaType === 'AcademicPaper') ? 'BlogPosting' : schemaType,
        "headline": title,
        "description": description,
        "author": buildPersonNode(),
        "datePublished": date,
        "dateModified": dateModified,
        "publisher": { "@type": "Organization", "@id": ORG_ID, "name": "chaos-for-agent", "url": DOMAIN },
        "inLanguage": "zh-CN",
        "isAccessibleForFree": true,
        "about": {"@type": "Thing", "name": (Array.isArray(tags) ? tags[0] : '') || title},
        "keywords": Array.isArray(tags) ? tags.join(', ') : (tags || ''),
        "wordCount": body.replace(/\s/g, '').length,
        "timeRequired": `PT${readTime}M`,
        "articleSection": Array.isArray(tags) && tags.length ? tags[0] : undefined,
        "image": { "@type": "ImageObject", "url": ogImage, "width": 1200, "height": 630 },
        // citation 的值应当是「被引用的作品」本身。此前直接 map 原始 references，
        // 当作者用块状列表时解析结果是字符串数组，于是产出
        // [{"@type":"CreativeWork"}] 这种**空引用对象**（无效结构化数据，比没有更糟）。
        // references 已在上面 normalizeReferences() 过，此处必然含 name+url。
        // 另补 isBasedOn：本站文章的典型表述是"以 X 为底本"，该属性语义更贴切。
        "citation": references.length ? references.map(r => ({
          "@type": "CreativeWork", "name": r.title, "url": r.url
        })) : undefined,
        "isBasedOn": references.length ? references.map(r => r.url) : undefined
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

    // HowTo Schema (C1)
    let howToJsonLd = '';
    const howToSteps = detectHowTo(body);
    if (howToSteps) {
      howToJsonLd = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": title,
        "description": description,
        "step": howToSteps.map(s => ({
          "@type": "HowToStep",
          "position": s.position,
          "text": s.text
        }))
      }, null, 2);
    }

    // Image Schema (C2)
    let imgSchemasJsonLd = '';
    const imageObjects = generateImageSchemas(contentHtml);
    if (imageObjects.length) {
      imgSchemasJsonLd = JSON.stringify(imageObjects.map((img, i) => ({
        "@context": "https://schema.org",
        "@type": "ImageObject",
        "contentUrl": img.url,
        "caption": img.caption,
        "representativeOfPage": i === 0,
        "inLanguage": "zh-CN"
      })), null, 2);
    }

    // Speakable Schema（保留，但不作为 GEO 手段）
    // 说明：Google 的 Speakable 仍标记为 BETA，且实际只服务「美国 + Google Home
    // 英文 + Google Assistant 热点新闻朗读」，对中文技术博客没有投入价值。
    // 保留它成本为零，但不要指望它带来 AI 引用。
    const speakableJsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", "article > p:first-of-type"]
    });

    const html = fillTpl(TEMPLATE_HTML, {
      TITLE: title,
      DESCRIPTION: description,
      AUTHOR: AUTHOR_NAME,
      DATE: date,
      DATE_MODIFIED: dateModified,
      SLUG: article.slug,
      OGTYPE: ogType,
      JSONLD: JSON.stringify(jsonLd, null, 2),
      FAQ_BLOCK: ldBlock(faqJsonLd),
      HOWTO_BLOCK: ldBlock(howToJsonLd),           // C1
      IMG_BLOCK: ldBlock(imgSchemasJsonLd),        // C2
      SPEAKABLE_JSONLD: speakableJsonLd,
      TAGS: tagsHtml,
      CONTENT: contentHtml,
      TOC: tocHtml,
      AUTHOR_CARD: AUTHOR_CARD_HTML,
      PREV_NEXT: prevNextHtml,
      RELATED: relatedHtml,
      FAQ: faqHtml,
      KEY_TAKEAWAYS: keyTakeawaysHtml,
      REFERENCES: refHtml,
      READING_TIME: `约 ${readTime} 分钟`,
      ROBOTS: ROBOTS_META,
      JSON_TITLE: jsonStr(meta.title || article.title),   // JSON-LD 内联安全：转义引号
      AIGC_NOTICE: aigcNotice,
      AIGC_LABEL: escHtml(aigcLabel),
      AIGC_PRODUCER: escHtml(aigcProducer),
      OG_IMAGE: ogImage
    });

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        // 同一 URL 会因 Accept 头返回 HTML 或 Markdown，必须声明 Vary，
        // 否则 CDN/代理可能把 Markdown 响应错误地喂给浏览器（或反之）。
        'Vary': 'Accept'
      }
    });
  } catch (e) {
    // 不把内部异常文本回显给访客（原先会输出 `Error rendering article: ...`，
    // 既泄漏实现细节，对爬虫也是低质页面）。改用 503 + 可读提示：
    // 走到这里通常是上游内容源短时不可用，属**暂时性**故障，503 比 500 语义更准，
    // 也提示爬虫稍后重试而不是判定页面永久失效。
    console.error('renderArticle failed:', e && e.message);
    return upstreamDegraded();
  }
}

// ========== 首页 ==========

async function renderIndex() {
  const articles = await getArticles();
  const sorted = [...articles].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  // ItemList JSON-LD（保留 SEO）
  const itemListLd = sorted.map((a, i) =>
    `{"@type": "ListItem", "position": ${i + 1}, "url": "https://bi-chao.com/articles/${a.slug}", "name": ${JSON.stringify(a.title)}}`
  ).join(',\n    ');

  // 精选区：最新 6 篇（卡片）
  const featured = sorted.slice(0, 6).map(a =>
    `<a class="card" href="/articles/${a.slug}">
      <h3>${a.title}</h3>
      <div class="card-meta"><span>${a.date}</span>${(Array.isArray(a.tags) && a.tags.length ? a.tags.map(t => `<span class="tag">${t}</span>`).join('') : '')}</div>
      <p>${a.description}</p>
    </a>`).join('');

  // 主题分区：按标签聚合（取文章数前 6 个主题）
  const tagMap = getTagMap(articles);
  const topTags = Object.keys(tagMap).sort((x, y) => tagMap[y].length - tagMap[x].length).slice(0, 6);
  const topicsHtml = topTags.map(tag => {
    const items = [...tagMap[tag]].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 5);
    const lis = items.map(a2 => `<li><a href="/articles/${a2.slug}">${a2.title}</a><span class="date">${a2.date}</span></li>`).join('');
    return `<section class="topic-block">
      <h2 class="topic-title"><a href="/tags/${encodeURIComponent(tag)}">${tag}</a><span class="topic-count">${tagMap[tag].length} 篇</span></h2>
      <ul>${lis}</ul>
    </section>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="银行人看得懂、用得上的AI知识库：Agent-First 内容写作、AI大模型、银行业数字化转型深度文章。">
<meta name="author" content="毕超">
<meta name="google-site-verification" content="VKkZGy9h23phxHAOaQseoRl9knPfnD_HFVGfI7RSrxs">
<meta name="baidu-site-verification" content="codeva-J4sirVAId0">
<meta name="robots" content="${ROBOTS_META}">
<meta property="og:title" content="智能体的知识库 — chaos-for-agent">
<meta property="og:description" content="银行人看得懂、用得上的AI知识库：Agent-First 内容写作、AI大模型、银行业数字化转型深度文章。">
<meta property="og:type" content="website">
<meta property="og:url" content="https://bi-chao.com/">
<meta property="og:site_name" content="chaos-for-agent">
<meta property="og:locale" content="zh_CN">
<meta property="og:image" content="${DOMAIN}/assets/og/default.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="智能体的知识库 — chaos-for-agent">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="智能体的知识库 — chaos-for-agent">
<meta name="twitter:description" content="银行人看得懂、用得上的AI知识库：Agent-First 内容写作、AI大模型、银行业数字化转型深度文章。">
<meta name="twitter:image" content="${DOMAIN}/assets/og/default.png">
<meta name="twitter:image:alt" content="智能体的知识库 — chaos-for-agent">
<link rel="canonical" href="https://bi-chao.com/">
<link rel="alternate" type="application/atom+xml" title="chaos-for-agent RSS" href="https://bi-chao.com/feed.xml">
<script type="application/ld+json">
${JSON.stringify(SCHEMA_WEBSITE)}
</script>
<script type="application/ld+json">
${JSON.stringify(SCHEMA_ORGANIZATION)}
</script>
<script type="application/ld+json">
${JSON.stringify(SCHEMA_KNOWLEDGE_GRAPH)}
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
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "智能体的知识库 — 全部文章",
  "description": "Agent-First 内容写作、AI大模型、银行业数字化转型深度文章列表。",
  "url": "https://bi-chao.com/",
  "numberOfItems": __ITEM_COUNT__,
  "itemListElement": [
    __ITEM_LIST__
  ]
}
</script>
<title>智能体的知识库 — chaos-for-agent</title>
<style>
  :root{--bg:#fafaf8;--text:#1a1a1a;--muted:#6b6b6b;--accent:#1e40af;--border:#e5e5e5;--card:#ffffff;--soft:#eff6ff;--nav-bg:rgba(250,250,248,.92);}
  html[data-theme="dark"]{--bg:#0f1116;--text:#e6e8ee;--muted:#9aa0ac;--accent:#7aa2ff;--border:#2a2f3a;--card:#161a23;--soft:#16203a;--nav-bg:rgba(15,17,22,.92);}
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans SC","PingFang SC",sans-serif;line-height:1.8;color:var(--text);background:var(--bg);}
  .wrap{max-width:1100px;margin:0 auto;padding:0 1.5rem;}
  .site-nav{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem 0;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--nav-bg);backdrop-filter:blur(6px);z-index:900;}
  .site-nav .brand{font-size:1.05rem;font-weight:800;color:var(--text);text-decoration:none;}
  .site-nav .nav-links{display:flex;align-items:center;gap:.9rem;font-size:.88rem;}
  .site-nav .nav-links a{color:var(--muted);text-decoration:none;}
  .site-nav .nav-links a:hover{color:var(--accent);}
  .theme-toggle{cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--text);border-radius:6px;padding:.2rem .55rem;font-size:.8rem;}
  .hero{background:linear-gradient(135deg,#eff6ff,#f8fafc);border:1px solid var(--border);border-radius:16px;padding:2.8rem 2rem 2.4rem;margin:2.4rem 0 1rem;text-align:center;}
  html[data-theme="dark"] .hero{background:linear-gradient(135deg,#131a2e,#161a23);}
  .hero h1{font-size:1.95rem;font-weight:800;letter-spacing:.02em;line-height:1.4;}
  .hero .sub{color:var(--muted);margin:.9rem auto 0;max-width:600px;font-size:1rem;}
  .hero .cta{margin-top:1.6rem;display:flex;gap:.8rem;justify-content:center;flex-wrap:wrap;}
  .cta a{padding:.6rem 1.3rem;border-radius:8px;text-decoration:none;font-weight:600;font-size:.92rem;}
  .cta .primary{background:var(--accent);color:#fff;}
  html[data-theme="dark"] .cta .primary{color:#fff;}
  .cta .ghost{border:1px solid var(--accent);color:var(--accent);}
  .section-title{font-size:1.35rem;font-weight:800;margin:2.6rem 0 1.1rem;padding-bottom:.4rem;border-bottom:2px solid var(--accent);}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:1rem;}
  .card{display:block;background:var(--card);border:1px solid var(--border);border-radius:10px;padding:1.15rem 1.25rem;text-decoration:none;color:var(--text);transition:border-color .15s,transform .15s;}
  .card:hover{border-color:var(--accent);transform:translateY(-2px);}
  .card h3{font-size:1.02rem;font-weight:700;margin-bottom:.45rem;line-height:1.5;}
  .card p{font-size:.86rem;color:var(--muted);margin-top:.45rem;}
  .card-meta{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;font-size:.78rem;color:var(--muted);}
  .card-meta .tag{background:var(--soft);color:var(--accent);border-radius:4px;padding:.05rem .45rem;font-size:.72rem;}
  .topic-block{margin-bottom:1.9rem;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:1.2rem 1.4rem;}
  .topic-title{font-size:1.05rem;font-weight:700;margin-bottom:.7rem;}
  .topic-title a{color:var(--accent);text-decoration:none;}
  .topic-title a:hover{text-decoration:underline;}
  .topic-count{color:var(--muted);font-size:.8rem;font-weight:400;margin-left:.5rem;}
  .topic-block ul{list-style:none;}
  .topic-block li{margin:.45rem 0;font-size:.92rem;display:flex;justify-content:space-between;gap:1rem;}
  .topic-block li a{color:var(--text);text-decoration:none;flex:1;}
  .topic-block li a:hover{color:var(--accent);}
  .topic-block .date{color:var(--muted);font-size:.8rem;white-space:nowrap;}
  .author-hero{display:flex;gap:1.4rem;align-items:center;background:var(--card);border:1px solid var(--border);border-radius:16px;padding:1.7rem;margin:2.4rem 0 1rem;}
  .author-hero .avatar{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.6rem;font-weight:800;flex-shrink:0;}
  html[data-theme="dark"] .author-hero .avatar{background:linear-gradient(135deg,#7aa2ff,#93c5fd);color:#0f1116;}
  .author-hero h3{font-size:1.15rem;margin-bottom:.45rem;}
  .author-hero p{font-size:.9rem;color:var(--muted);margin:.25rem 0;}
  .author-hero a{color:var(--accent);}
  footer{margin-top:2.6rem;padding:1.6rem 0 3rem;border-top:1px solid var(--border);color:var(--muted);font-size:.85rem;}
  footer a{color:var(--accent);text-decoration:none;}
  @media(max-width:600px){
    .hero h1{font-size:1.5rem;}
    .author-hero{flex-direction:column;text-align:center;}
    .topic-block li{flex-direction:column;gap:.1rem;}
  }
</style>
</head>
<body>
<nav class="site-nav wrap">
  <a class="brand" href="/">智能体的知识库</a>
  <div class="nav-links">
    <a href="/tags">标签</a>
    <a href="/faq">FAQ</a>
    <a href="/quant-course/index.html">教程</a>
    <a href="/about">关于</a>
    <a href="/feed.xml">RSS</a>
    <button class="theme-toggle" id="themeToggle" type="button">主题</button>
  </div>
</nav>
<main class="wrap">
  <section class="hero">
    <h1>银行人看得懂、用得上的 AI 知识库</h1>
    <p class="sub">Agent-First 内容写作、AI 大模型、银行业数字化转型的深度文章。毕超博士以金融行业风险管理一线的视角拆解银行 AI 落地。</p>
    <div class="cta">
      <a class="primary" href="#latest">开始阅读</a>
      <a class="ghost" href="/about">关于作者</a>
    </div>
  </section>
  <h2 class="section-title" id="latest">最新文章</h2>
  <div class="grid">${featured}</div>
  <h2 class="section-title">主题分区</h2>
  ${topicsHtml}
  <section class="author-hero">
    <div class="avatar">毕</div>
    <div>
      <h3>毕超</h3>
      <p>博士 · 高级工程师（计算机技术专业）· 金融行业风险管理从业者 · 清华大学校友导师</p>
      <p>研究方向：大语言模型、数字金融、金融科技。2024 年北京市西城区"西融计划"青年拔尖人才。</p>
      <p><a href="/about">查看完整简介 →</a></p>
    </div>
  </section>
</main>
<footer class="wrap">
  共 ${articles.length} 篇文章 · <a href="/tags/AI%E5%89%8D%E7%9E%BB">AI前瞻</a> · <a href="/about">关于作者</a> · <a href="/feed.xml">RSS</a> · <a href="/ai-manifest.json">AI Manifest</a>
</footer>
<script>
(function(){
  var KEY='bc-theme';
  function apply(t){
    if(!t){t=localStorage.getItem(KEY)||((window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light');}
    document.documentElement.setAttribute('data-theme',t);
    localStorage.setItem(KEY,t);
    var b=document.getElementById('themeToggle');
    if(b){b.textContent=(t==='dark')?'亮色':'主题';}
  }
  var tb=document.getElementById('themeToggle');
  if(tb){tb.addEventListener('click',function(){var c=document.documentElement.getAttribute('data-theme')||'light';apply(c==='dark'?'light':'dark');});}
  apply();
})();
</script>
</body>
</html>`;

  const finalHtml = html.replace('__ITEM_COUNT__', articles.length).replace('__ITEM_LIST__', itemListLd);
  return new Response(finalHtml, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
  });
}

// ========== Sitemap ==========

async function renderSitemap() {
  const articles = await getArticles();
  // 有效日期 = 最新文章日期，用于首页/标签页等聚合页的 lastmod。
  // 修复：此前 Worker 输出的 sitemap **完全没有 <lastmod>**（Python 版有），
  // 而线上取的是 Worker 版 —— 等于线上 sitemap 丢失了 lastmod 这个抓取优先级信号。
  const edate = articles.reduce((m, a) => ((a.date || '') > m ? a.date : m), '')
    || new Date().toISOString().slice(0, 10);

  const url = (loc, freq, prio, mod) =>
    `\n  <url><loc>${loc}</loc><changefreq>${freq}</changefreq><priority>${prio}</priority>${mod ? `<lastmod>${mod}</lastmod>` : ''}</url>`;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  xml += url(`${DOMAIN}/`, 'weekly', '1.0', edate);
  xml += url(`${DOMAIN}/about`, 'monthly', '0.6', edate);

  for (const a of articles) {
    xml += url(`${DOMAIN}/articles/${a.slug}`, 'monthly', '0.8', a.date || edate);
  }
  // 教程页
  xml += url(`${DOMAIN}/quant-course/index.html`, 'monthly', '0.7', edate);
  xml += url(`${DOMAIN}/quant-course/chapter2-first-quant-experiment.html`, 'monthly', '0.7', edate);
  // tutorials/ 下的互动教程：此前完全未进 sitemap，成为不可发现的孤儿页
  xml += url(`${DOMAIN}/tutorials/${encodeURIComponent('什么是量化金融_互动教程.html')}`, 'monthly', '0.6', edate);
  // 标签页：只收录达到阈值的标签。
  // 原先全量收录 416 个标签页，占 sitemap 的 82%，其中大量是仅含 1 篇文章的
  // 薄聚合页，稀释了 86 篇正文的抓取预算，且是 AI 引擎最不会引用的页面类型。
  xml += url(`${DOMAIN}/tags`, 'weekly', '0.6', edate);
  const tagMap = getTagMap(articles);
  for (const tag of Object.keys(tagMap)) {
    if (tagMap[tag].length < TAG_INDEX_MIN_ARTICLES) continue;
    xml += url(`${DOMAIN}/tags/${encodeURIComponent(tag)}`, 'weekly', '0.5', edate);
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

  let txt = `# chaos-for-agent — 智能体的知识库

> 面向 AI Agent 与搜索优化的知识站点。主题：Agent-First 内容写作、AI大模型、银行业数字化转型。
> 作者：${AUTHOR_NAME}，${AUTHOR_JOB_TITLE}，清华大学校友。
> 说明：本文件遵循 llms.txt 约定，主要服务 coding agent 与文档消费者。
> Google 官方明确表示 Search 不使用 llms.txt —— 请不要把它当作提升
> AI Overviews 收录的手段；进入 Google 的路径始终是 sitemap + Googlebot。

## Site Map
- Home: ${DOMAIN}/
- About: ${DOMAIN}/about
- Tags: ${DOMAIN}/tags
- Tutorials: ${DOMAIN}/tutorials/${encodeURIComponent('什么是量化金融_互动教程.html')}
- Quant course: ${DOMAIN}/quant-course/index.html

## Articles (${articles.length})
`;

  for (const a of articles) {
    const tagStr = (Array.isArray(a.tags) ? a.tags : []).join(', ');
    txt += `\n- [${a.title}](${DOMAIN}/articles/${a.slug})`;
    txt += `\n  - Description: ${truncate(a.description, LLM_DESC_MAX)}`;
    txt += `\n  - Date: ${a.date}`;
    if (tagStr) txt += `\n  - Tags: ${tagStr}`;
  }

  txt += `\n\n## Topics (top ${topTags.length})`;
  for (const tag of topTags) {
    txt += `\n- ${tag}: ${tagMap[tag].length} articles → ${DOMAIN}/tags/${encodeURIComponent(tag)}`;
  }

  txt += `\n\n## For AI Agents
- Markdown 原文：文章 URL 后加 \`.md\`（如 ${DOMAIN}/articles/<slug>.md），或发送 \`Accept: text/markdown\`
- Sitemap: ${DOMAIN}/sitemap.xml
- RSS: ${DOMAIN}/feed.xml
- Robots: ${DOMAIN}/robots.txt
- 站内搜索（JSON）: ${DOMAIN}/search?q={query}&format=json
- 全文合集（约 1.37MB，**仅在确实需要全量语料时读取**）: ${DOMAIN}/llms-full.txt
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
<meta name="description" content="智能体的知识库 — 按标签浏览全部文章：AI、大数据、金融科技、数据治理等主题分类。">
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

  if (matched.length === 0) return renderNotFound(`/tags/${tag}`);

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
    "name": `${tag} — 智能体的知识库`,
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

  // 薄标签页（文章数低于阈值）输出 noindex,follow：保留链接权重传递，但不进索引，
  // 避免近重复薄页面稀释整站质量判断。
  const thinTag = matched.length < TAG_INDEX_MIN_ARTICLES;
  const tagRobots = thinTag
    ? '<meta name="robots" content="noindex,follow">'
    : `<meta name="robots" content="${ROBOTS_META}">`;
  // 修复：原模板写成 content="标签"${tag}"下的…" —— 属性值被内层双引号提前截断，
  // 是无效 HTML（标签名含引号时更会破坏结构）。统一转义并改用中文引号。
  const escTag = tag.replace(/&/g, '&amp;').replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${tagRobots}
<meta name="description" content="标签「${escTag}」下的 ${matched.length} 篇深度文章。毕超知识库 — Agent-First 内容写作、AI大模型、银行业数字化转型。">
<meta property="og:title" content="${escTag} — 标签归档 | chaos-for-agent">
<meta property="og:description" content="标签「${escTag}」下的 ${matched.length} 篇文章。">
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
  const txt = `# chaos-for-agent — https://bi-chao.com
#
# 关于本文件的两个要点（避免误判）：
# 1) 首条 \`User-agent: *\` + \`Allow: /\` 已经放行全部合规爬虫，
#    因此下面逐个列出名称**不是**为了"解锁"谁，而是为了：
#    · 显式声明欢迎检索/引用（政策收紧趋势下更可靠）
#    · 可审计性
# 2) robots.txt 只约束守规矩的**自动**抓取。用户触发型抓取器
#    （ChatGPT-User、Perplexity-User、Claude-User、meta-externalfetcher、
#    Amzn-User）官方明确可能不遵循 robots.txt —— 对它们的真正控制点是
#    Cloudflare WAF / Bot Management，而不是本文件。

User-agent: *
Allow: /
# 动态 OG 生成端点：无价值抓取，且消耗 Worker CPU。静态分享图在 /assets/og/
Disallow: /og
# 站内搜索结果页：避免近重复页面被索引
Disallow: /search

# ---------- 检索/引用类 AI 爬虫（决定内容能否被 AI 检索并引用） ----------
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: meta-webindexer
Allow: /

User-agent: Amzn-SearchBot
Allow: /

User-agent: DuckAssistBot
Allow: /

User-agent: Applebot
Allow: /

# ---------- 训练/语料类爬虫 ----------
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

# 注：Google-Extended 不是爬虫、没有 UA，它是纯 robots.txt 令牌，
# 控制的是 Gemini 模型训练与 Gemini Apps/Vertex AI 的 grounding，
# 不影响 Google Search 收录、也不是排名信号。进入 AI Overviews 的
# 唯一爬虫控制点始终是 Googlebot。
User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: meta-externalagent
Allow: /

User-agent: CCBot
Allow: /

User-agent: Amazonbot
Allow: /

# ---------- 传统搜索引擎 ----------
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Baiduspider
Allow: /

# ---------- Content Signals Policy ----------
# Cloudflare 于 2025-09-24 推出、并由其边缘实际执行的策略声明。
# 本站内容以 CC BY-NC-ND 4.0 发布。是否声明 AI 训练许可属于**站点政策决定**，
# 故此处仅预留位置、默认不表态；若决定明确授权训练，取消下面一行的注释即可：
# Content-Signal: search=yes, ai-input=yes, ai-train=yes

Sitemap: ${DOMAIN}/sitemap.xml
`;
  return new Response(txt, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
  });
}

// ========== About ==========

async function renderAbout() {
  try {
    const up = await fetchUpstream('/about.md');
    if (up.ok) {
      const contentHtml = md2html(up.text);
      const html = fillTpl(ABOUT_TEMPLATE_PART, { CONTENT: contentHtml });
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=600' }
      });
    }
  } catch (_) {}
  return renderNotFound('/about');
}

// ========== FAQ 聚合页 (B3) ==========

/** 抓取所有文章的 FAQ 并渲染聚合页 */
async function renderFaqPage() {
  try {
    const articles = await getArticles();
    const allFaqs = [];
    let scanned = 0;

    // 首选：构建期预生成的 faq.json —— **只需 1 个子请求**，且全量覆盖。
    // 生成器 scripts/generate_faq_index.mjs 直接 import 本 Worker 并逐篇渲染、
    // 抽取 FAQPage JSON-LD，因此 FAQ 检测逻辑**只有一份**，不存在双实现漂移。
    try {
      const r = await fetchUpstream('/faq.json', { freshMs: 300_000 });
      if (r.ok) {
        const d = JSON.parse(r.text);
        if (d && Array.isArray(d.items)) {
          for (const it of d.items) {
            const a = findArticle(articles, it.slug) || { slug: it.slug, title: it.title, date: it.date };
            if (it.faqs && it.faqs.length) allFaqs.push({ article: a, faqs: it.faqs });
          }
          scanned = d.scanned_articles || articles.length;
        }
      }
    } catch (_) { /* 落到下面的兜底扫描 */ }

    // 兜底：faq.json 尚未生成或不可用时，只扫最近 FAQ_SCAN_LIMIT 篇。
    // 背景（这是个既存的生产故障）：Cloudflare Workers 免费版每个请求最多 **50 个
    // subrequest**。原实现顺序抓取**全部**文章（86 篇 → 86 个 subrequest 再加 1 个
    // index），必然超限抛错 —— 即 /faq 在线上长期是坏的。旧代码返回 500 并回显内部
    // 错误，加了上游容错后被转成 503，只是**暴露**了它，并非新引入。
    // 注意：仅"取最近 N 篇"不足以覆盖 —— 实测全站含 FAQ 的文章全部是旧文，
    // 按日期取最近 40 篇一篇都覆盖不到。这正是首选 faq.json 的原因。
    if (!allFaqs.length) {
      const FAQ_SCAN_LIMIT = 40;
      const scanList = [...articles]
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
        .slice(0, FAQ_SCAN_LIMIT);
      scanned = scanList.length;

      for (const a of scanList) {
        let mdText;
        try {
          const mdResp = await fetch(`${REPO_RAW}/articles/${a.slug}.md`);
          if (!mdResp.ok) continue;
          mdText = await mdResp.text();
        } catch (_) {
          continue;   // 单篇失败不影响整页
        }
        const { body } = parseFrontMatter(mdText);
        const faqItems = detectFAQ(body);
        if (faqItems && faqItems.length) {
          allFaqs.push({ article: a, faqs: faqItems });
        }
      }
    }

    if (!allFaqs.length) {
      return new Response('<html><head><meta charset="utf-8"><title>FAQ - 智能体的知识库</title></head><body><h1>FAQ</h1><p>暂无常见问题。</p></body></html>', {
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' }
      });
    }

    // 构建聚合内容
    let groupsHtml = '';
    for (const group of allFaqs) {
      groupsHtml += `<div class="faq-group">
        <h2><a href="/articles/${group.article.slug}">${group.article.title}</a></h2>
        <div class="faq-items">`;
      for (const f of group.faqs) {
        groupsHtml += `<div class="faq-item">
          <h3 class="faq-q">${f.question}</h3>
          <div class="faq-a">${md2html(f.answer)}</div>
        </div>`;
      }
      groupsHtml += `</div></div>`;
    }

    // 构建 JSON-LD 聚合
    const allQa = [];
    for (const g of allFaqs) {
      for (const f of g.faqs) {
        allQa.push({ "@type": "Question", "name": f.question, "acceptedAnswer": { "@type": "Answer", "text": f.answer } });
      }
    }
    const faqPageJsonLd = JSON.stringify({
      "@context": "https://schema.org", "@type": "FAQPage",
      "mainEntity": allQa, "about": { "@type": "Thing", "name": "智能体的知识库常见问题" }
    });

    const totalFaq = allFaqs.reduce((s, g) => s + g.faqs.length, 0);

    const html = `<!DOCTYPE html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>常见问题 FAQ - 智能体的知识库</title>
<meta name="description" content="bi-chao.com 全部文章的常见问题汇总，共 ${totalFaq} 个问答">
<link rel="canonical" href="https://bi-chao.com/faq">
<script type="application/ld+json">${faqPageJsonLd}</script>
<style>
  body{font-family:"Noto Serif SC","Songti SC",Georgia,serif;max-width:720px;margin:0 auto;padding:2rem 1.5rem;line-height:1.75;background:#fafaf8;color:#1a1a1a;}
  h1{font-size:1.75rem;border-bottom:2px solid #1e40af;padding-bottom:.5rem;}
  h2{font-size:1.2rem;margin:1.5rem 0 0.75rem;}
  h2 a{color:#1e40af;text-decoration:none;}
  h2 a:hover{text-decoration:underline;}
  .faq-group{border-left:3px solid #e5e5e5;padding-left:1rem;margin-bottom:2rem;}
  .faq-item{margin-bottom:1rem;}
  .faq-q{font-size:1rem;font-weight:600;margin-bottom:.25rem;}
  .faq-a{font-size:.95rem;color:#444;}
  .faq-a p{margin:0.25rem 0;}
  .back{display:block;margin-top:2rem;color:#666;font-size:.9rem;}
  .stats{color:#6b6b6b;font-size:.9rem;margin-bottom:1.5rem;}
</style>
</head><body>
<h1>常见问题 FAQ</h1>
<p class="stats">共收录 ${allFaqs.length} 篇文章中的 ${totalFaq} 个问答（全站 ${articles.length} 篇，本次扫描 ${scanned} 篇）</p>
${groupsHtml}
<a class="back" href="/">← 返回首页</a>
</body></html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' }
    });
  } catch (e) {
    console.error('renderFaqPage failed:', e && e.message);
    return upstreamDegraded();
  }
}

// ========== OG 图片生成 ==========

function renderOgImage(title, date) {
  const lines = wrapText(title, 24);
  let y = 280 - (lines.length - 1) * 20;
  const textEls = lines.map(l => `<text x="50%" y="${y}" text-anchor="middle" fill="white" font-size="36" font-weight="700" font-family="'Noto Serif SC',serif">${escapeXml(l)}</text>${(y += 48, '')}`).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#1e293b"/>
  <rect x="40" y="40" width="1120" height="550" rx="12" fill="none" stroke="#334155" stroke-width="2"/>
  <text x="50%" y="180" text-anchor="middle" fill="#94a3b8" font-size="20" font-family="sans-serif">chaos-for-agent / 智能体的知识库</text>
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
  // 这里刻意保留裸文本 404：本函数只服务 /ai-manifest.json、/feed.xml 这类
  // **机器端点**，返回带导航的 HTML 404 页对机器消费者没有意义。
  // 面向人类的 404（文章/标签/关于/通用兜底）均走 renderNotFound()。
  return new Response('Not Found', { status: 404 });
}

// ========== 站内搜索 ==========

/**
 * 真正的站内搜索（替代原先 302 跳 Google 的假实现）。
 *
 * 原实现把 /search?q= 重定向到 google.com/search?q=site:bi-chao.com，却在两处
 * 把它当作站内能力对外宣传：
 *   1) llms.txt 的 "For AI Agents" 段：Search: https://bi-chao.com/search?q={query}
 *   2) 首页 WebSite 结构化数据的 SearchAction.urlTemplate
 * 对 AI Agent 而言这是功能谎报 —— agent 按声明调用会拿到 Google 的反自动化验证页。
 * 现在返回真实结果：HTML 给人，JSON 给 agent（Accept: application/json 或 ?format=json）。
 */
async function renderSearch(url, request) {
  const q = (url.searchParams.get('q') || '').trim();
  const fmt = (url.searchParams.get('format') || '').toLowerCase();
  const accept = request ? (request.headers.get('Accept') || '') : '';
  const wantJson = fmt === 'json' || /\bapplication\/json\b/i.test(accept);
  const jsonHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=300',
    'Access-Control-Allow-Origin': '*'
  };

  if (!q) {
    if (wantJson) {
      return new Response(JSON.stringify({
        query: '', count: 0, results: [],
        usage: `${DOMAIN}/search?q=关键词&format=json`
      }, null, 2), { headers: jsonHeaders });
    }
    return new Response(renderSearchHtml('', []), {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' }
    });
  }

  const articles = await getArticles();
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);

  const scored = [];
  for (const a of articles) {
    const title = (a.title || '').toLowerCase();
    const desc = (a.description || '').toLowerCase();
    const tags = (Array.isArray(a.tags) ? a.tags.join(' ') : '').toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (title.includes(t)) score += 10;   // 标题命中权重最高
      if (tags.includes(t)) score += 5;
      if (desc.includes(t)) score += 3;
    }
    if (score > 0) scored.push({ score, a });
  }
  // 同分时按日期降序，保证结果稳定
  scored.sort((x, y) => y.score - x.score || (y.a.date || '').localeCompare(x.a.date || ''));

  const results = scored.slice(0, 30).map(x => ({
    title: x.a.title,
    url: `${DOMAIN}/articles/${x.a.slug}`,
    markdown: `${DOMAIN}/articles/${x.a.slug}.md`,
    description: x.a.description,
    date: x.a.date,
    tags: x.a.tags
  }));

  if (wantJson) {
    return new Response(JSON.stringify({ query: q, count: results.length, results }, null, 2), { headers: jsonHeaders });
  }
  return new Response(renderSearchHtml(q, results), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' }
  });
}

function renderSearchHtml(q, results) {
  const items = results.map(r =>
    `<li><a href="${r.url}">${escHtml(r.title)}</a><span class="date">${r.date || ''}</span><p class="desc">${escHtml(r.description || '')}</p></li>`
  ).join('');
  const body = q
    ? (results.length
        ? `<p style="color:#555;margin-bottom:20px;">找到 ${results.length} 篇相关文章</p><ul>${items}</ul>`
        : `<p style="color:#555;margin-bottom:20px;">没有匹配「${escHtml(q)}」的文章。可浏览 <a href="/tags">标签索引</a> 或 <a href="/">全部文章</a>。</p>`)
    : `<p style="color:#555;">用法：<code>/search?q=关键词</code>；机器可读格式：<code>/search?q=关键词&amp;format=json</code></p>`;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex,follow">
<title>搜索${q ? '：' + escHtml(q) : ''} | chaos-for-agent</title>
<style>
  body{max-width:720px;margin:40px auto;padding:0 20px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.8;color:#222;}
  h1{font-size:1.6em;border-bottom:2px solid #eee;padding-bottom:8px;}
  a{color:#2563eb;text-decoration:none;}a:hover{text-decoration:underline;}
  .date{color:#999;font-size:.85em;margin-left:12px;}
  .desc{color:#555;font-size:.9em;margin:4px 0 0 0;}
  li{margin-bottom:16px;}
  code{background:#f4f4f5;padding:.15em .35em;border-radius:3px;font-size:.85em;}
</style>
</head>
<body>
<h1>站内搜索</h1>
${body}
<footer style="margin-top:60px;padding-top:20px;border-top:1px solid #eee;color:#999;font-size:.8em;">← <a href="/">返回首页</a> · <a href="/tags">标签索引</a> · <a href="/llms.txt">llms.txt</a></footer>
</body>
</html>`;
}

// ========== 404 ==========

/**
 * 带导航的 404 页面。此前返回 content-type: text/plain 的裸 "Not Found"，
 * 人和爬虫走进来都是死胡同。
 * 关键：HTTP 状态码必须保持 404 —— 用 200 会变成"软 404"，比裸文本更糟。
 */
/**
 * 上游内容源短时不可用时的降级响应。
 * 用 503（暂时不可用）+ Retry-After，而不是 500、也不回显异常文本：
 * 既不让访客看到内部错误，也让爬虫理解这是**临时**故障、稍后重试即可，
 * 而不是把页面判定为永久失效（对收录有实质差别）。
 */
function upstreamDegraded() {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex,follow">
<title>内容暂时不可用（503） | chaos-for-agent</title>
<style>
  body{max-width:720px;margin:40px auto;padding:0 20px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.8;color:#222;}
  h1{font-size:1.5em;border-bottom:2px solid #eee;padding-bottom:8px;}
  a{color:#2563eb;text-decoration:none;}a:hover{text-decoration:underline;}
</style>
</head>
<body>
<h1>内容暂时不可用</h1>
<p style="color:#555;">内容源短时不可用，本页稍后重试即可。</p>
<ul>
  <li><a href="/">返回首页</a></li>
  <li><a href="/sitemap.xml">sitemap</a></li>
  <li><a href="/llms.txt">llms.txt</a></li>
</ul>
</body>
</html>`;
  return new Response(html, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Retry-After': '60',
      'Cache-Control': 'no-store'
    }
  });
}

async function renderNotFound(path) {
  let recent = '';
  try {
    const articles = await getArticles();
    recent = [...articles]
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, 5)
      .map(a => `<li><a href="/articles/${a.slug}">${escHtml(a.title)}</a></li>`)
      .join('');
  } catch (_) {}

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex,follow">
<title>页面不存在（404） | chaos-for-agent</title>
<style>
  body{max-width:720px;margin:40px auto;padding:0 20px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.8;color:#222;}
  h1{font-size:1.6em;border-bottom:2px solid #eee;padding-bottom:8px;}
  a{color:#2563eb;text-decoration:none;}a:hover{text-decoration:underline;}
  code{background:#f4f4f5;padding:.15em .35em;border-radius:3px;font-size:.85em;}
</style>
</head>
<body>
<h1>404 — 页面不存在</h1>
<p style="color:#555;">找不到 <code>${escHtml(path)}</code>。</p>
<p>可以试试：</p>
<ul>
  <li><a href="/">首页（全部文章）</a></li>
  <li><a href="/tags">标签索引</a></li>
  <li><a href="/about">关于作者</a></li>
  <li>站内搜索：<code>/search?q=关键词</code></li>
</ul>
${recent ? `<p>最新文章：</p><ul>${recent}</ul>` : ''}
<footer style="margin-top:60px;padding-top:20px;border-top:1px solid #eee;color:#999;font-size:.8em;">← <a href="/">返回首页</a> · <a href="/llms.txt">llms.txt</a> · <a href="/sitemap.xml">sitemap</a></footer>
</body>
</html>`;
  return new Response(html, {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' }
  });
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
    if (p === '/search' || p === '/search/') {
      return renderSearch(url, request);
    }
    if (p === '/ai-manifest.json') return proxyFile('/ai-manifest.json', 'application/json', 300);
    if (p === '/feed.xml') return proxyFile('/feed.xml', 'application/atom+xml', 300);
    if (p === '/about' || p === '/about/') return renderAbout();
    if (p === '/faq') return renderFaqPage();  // B3: FAQ 聚合页

    // 动态 OG 生成端点（兜底用途）。
    // 必须是精确匹配：静态分享图位于 /assets/og/，若这里用 startsWith('/og')
    // 会把任何以 /og 开头的路径都吞掉。
    if (p === '/og') {
      const title = url.searchParams.get('title') || 'chaos-for-agent';
      const date = url.searchParams.get('date') || '';
      return renderOgImage(title, date);
    }

    if (p === '/baidu_verify_codeva-IkuNscl7vN.html') {
      return new Response('d18be845a58e082d27ee6451330313f1', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // 文章页（renderArticle 内部完成 HTML / Markdown 内容协商）
    if (p.startsWith('/articles/')) {
      const explicitMd = p.endsWith('.md');
      return renderArticle(explicitMd ? p : p + '.md', request, explicitMd);
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

    return renderNotFound(p);
  }
};
