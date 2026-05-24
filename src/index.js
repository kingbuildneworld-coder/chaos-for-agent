export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 文章列表页
    if (url.pathname === '/' || url.pathname === '/index.html') {
      // 从 GitHub raw 获取最新 index.json
      const indexUrl = 'https://raw.githubusercontent.com/kingbuildneworld-coder/chaos-for-agent/main/articles/index.json';
      
      try {
        const resp = await fetch(indexUrl, { cf: { cacheTtl: 300 } });
        const articles = await resp.json();

        let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
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
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      } catch (e) {
        return new Response('Error loading articles: ' + e.message, { status: 500 });
      }
    }

    // 其他路径（/articles/*）直接 serve 静态文件
    const assetUrl = `https://raw.githubusercontent.com/kingbuildneworld-coder/chaos-for-agent/main${url.pathname}`;
    const resp = await fetch(assetUrl);
    
    if (resp.ok) {
      const contentType = url.pathname.endsWith('.md') ? 'text/markdown; charset=utf-8' : 'text/html; charset=utf-8';
      return new Response(resp.body, {
        headers: { 'Content-Type': contentType }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};