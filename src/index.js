export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = 'https://chaos-for-agent.kingbuildneworld.workers.dev';

    // 文章列表页
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return await renderIndex(origin);
    }

    // sitemap.xml — 动态生成
    if (url.pathname === '/sitemap.xml') {
      return await renderSitemap(origin);
    }

    // llms.txt — AI Agent 索引
    if (url.pathname === '/llms.txt') {
      return await renderLlms(origin);
    }

    // robots.txt
    if (url.pathname === '/robots.txt') {
      return renderRobots();
    }

    // 其他路径（/articles/*）直接 serve 静态文件
    const assetUrl = `https://raw.githubusercontent.com/kingbuildneworld-coder/chaos-for-agent/main${url.pathname}`;
    const resp = await fetch(assetUrl);

    if (resp.ok) {
      const contentType = url.pathname.endsWith('.md')
        ? 'text/markdown; charset=utf-8'
        : 'text/html; charset=utf-8';
      return new Response(resp.body, {
        headers: { 'Content-Type': contentType }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};

async function getArticles() {
  const indexUrl = 'https://raw.githubusercontent.com/kingbuildneworld-coder/chaos-for-agent/main/articles/index.json';
  const resp = await fetch(indexUrl, { cf: { cacheTtl: 300 } });
  return resp.json();
}

async function renderIndex(origin) {
  try {
    const articles = await getArticles();

    let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="知识库：Agent-First 内容写作、AI大模型相关深度文章，支持 AI Agent 直接读取。">
<title>我的知识库</title>
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
<h1>我的知识库</h1>
<ul>`;

    for (const article of articles) {
      html += `
  <li>
    <a href="${article.url}">${article.title}</a>
    <span class="date">${article.date}</span>
    <p class="desc">${article.description}</p>
  </li>`;
    }

    html += `
</ul>
<footer>本项目采用 Agent-First 架构构建，支持 AI Agent 直接读取内容。共 ${articles.length} 篇文章</footer>
</body>
</html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=60'
      }
    });
  } catch (e) {
    return new Response('Error loading articles: ' + e.message, { status: 500 });
  }
}

async function renderSitemap(origin) {
  try {
    const articles = await getArticles();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`;

    for (const article of articles) {
      xml += `
  <url>
    <loc>${origin}${article.url}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    xml += `
</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300'
      }
    });
  } catch (e) {
    return new Response('Error: ' + e.message, { status: 500 });
  }
}

async function renderLlms(origin) {
  try {
    const articles = await getArticles();

    let txt = `# chaos-for-agent

> 知识库：Agent-First 内容写作、AI大模型相关深度文章。所有内容采用 Agent-First 架构构建，支持 AI Agent 直接读取。

## Articles
`;

    for (const article of articles) {
      txt += `
- [${article.title}](${origin}${article.url}): ${article.description} (${article.date})`;
    }

    txt += `

## Tags
Agent-First, GEO, 内容写作, AI优化, AI大模型, 银行业, 金融科技, 数字化转型
`;

    return new Response(txt, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=300'
      }
    });
  } catch (e) {
    return new Response('Error: ' + e.message, { status: 500 });
  }
}

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

Sitemap: https://chaos-for-agent.kingbuildneworld.workers.dev/sitemap.xml`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
