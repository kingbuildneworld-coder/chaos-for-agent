# chaos-for-agent

> 知识库：Agent-First 内容写作、AI大模型、数字人民币、银行业数字化转型。所有内容采用 Agent-First 架构构建，支持 AI Agent 直接读取。

## 网站

**在线地址**：https://chaos-for-agent.kingbuildneworld.workers.dev/

## 文章列表

| 文章 | 作者 | 说明 |
|------|------|------|
| [Agent 优先：内容该如何写？](https://chaos-for-agent.kingbuildneworld.workers.dev/articles/agent-first-content-writing.md) | Hermes | 四套让 AI Agent 优先引用你的写作框架 |
| [AI Agent 在银行业的应用探索与未来展望](https://chaos-for-agent.kingbuildneworld.workers.dev/articles/ai-agent-banking-exploration.md) | 毕超 | 从自动化到自主化的跃迁，LLM-RPA-Agent 三角关系框架 |
| [《AI大模型重塑现代银行》](https://chaos-for-agent.kingbuildneworld.workers.dev/articles/ai-big-model-reshape-banking.md) | 毕超、刘鑫 | 23个真实案例展示AI在银行落地实践 |
| [面向人工智能的数据治理框架](https://chaos-for-agent.kingbuildneworld.workers.dev/articles/ai-data-governance-framework.md) | 李继峰、张成龙、刘鑫、陈劲宇、张津铭、毕超 | 覆盖AI全生命周期的六维数据治理框架 |
| [《人工智能+现代银行》](https://chaos-for-agent.kingbuildneworld.workers.dev/articles/ai-plus-modern-banking.md) | 毕超 | 通往智能银行的战略地图与行动指南 |
| [数字人民币2.0为智能经济发展注入强劲动能](https://chaos-for-agent.kingbuildneworld.workers.dev/articles/digital-yuan-2-0-smart-economy.md) | 毕超 | 数字人民币从现金型1.0向存款货币型2.0跨越 |

## 作者

**毕超**，博士、高级工程师（计算机技术专业），中国农业发展银行总行风险管理部资产保全二处处长。兼任清华大学校友导师、中国职业技术教育学会人工智能专委会委员、中国人工智能学会终身会员、中国计算机学会学术审稿专家。2024年入选北京市西城区"西融计划"首批青年拔尖人才。

## 技术架构

- **部署**：Cloudflare Workers
- **构建**：Cloudflare Builds（GitHub 自动部署）
- **索引**：GitHub Actions 自动生成 articles/index.json
- **SEO**：动态 sitemap.xml、robots.txt、llms.txt

## 文件结构

```
├── articles/              # 文章 Markdown 文件
│   ├── index.json         # 文章索引（自动生成）
│   └── *.md               # 文章正文
├── src/
│   └── index.js           # Cloudflare Worker 脚本
├── .github/workflows/
│   └── generate-index.yml # 自动生成 index.json
├── _headers               # Cloudflare 缓存策略
├── sitemap.xml            # 站点地图（动态生成）
├── robots.txt             # 搜索引擎爬虫规则
├── llms.txt               # AI Agent 索引
└── wrangler.jsonc         # Worker 配置
```

## 许可证

内容版权归原作者所有。
