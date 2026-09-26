# chaos-for-agent

> 知识库：Agent-First 内容写作、AI大模型、数字人民币、银行业数字化转型。
> 内容以 Markdown 为源、服务端渲染为 HTML，并同时向 AI Agent 暴露 Markdown 原文。

## 网站

**正式地址**：https://bi-chao.com/

> 说明：`chaos-for-agent.kingbuildneworld.workers.dev` 是同一 Worker 的默认域名。
> 对外引用、结构化数据与 sitemap **一律使用 `bi-chao.com`**，避免双域名稀释实体。

## 文章列表（节选）

| 文章 | 作者 | 说明 |
|------|------|------|
| [Agent 优先：内容该如何写？](https://bi-chao.com/articles/agent-first-content-writing) | Hermes | 四套让 AI Agent 优先引用你的写作框架 |
| [AI Agent 在银行业的应用探索与未来展望](https://bi-chao.com/articles/ai-agent-banking-exploration) | 毕超 | 从自动化到自主化的跃迁，LLM-RPA-Agent 三角关系框架 |
| [《AI大模型重塑现代银行》](https://bi-chao.com/articles/ai-big-model-reshape-banking) | 毕超、刘鑫 | 23个真实案例展示AI在银行落地实践 |
| [面向人工智能的数据治理框架](https://bi-chao.com/articles/ai-data-governance-framework) | 李继峰、张成龙、刘鑫、陈劲宇、张津铭、毕超 | 覆盖AI全生命周期的六维数据治理框架 |
| [数字人民币2.0为智能经济发展注入强劲动能](https://bi-chao.com/articles/digital-yuan-2-0-smart-economy) | 毕超 | 数字人民币从现金型1.0向存款货币型2.0跨越 |

全部文章见 https://bi-chao.com/ 或 https://bi-chao.com/sitemap.xml

## 作者

**毕超**，博士、高级工程师（计算机技术专业），中国农业发展银行总行风险管理部资产保全二处处长。兼任清华大学校友导师、中国职业技术教育学会人工智能专委会委员、中国人工智能学会终身会员、中国计算机学会学术审稿专家。2024年入选北京市西城区"西融计划"首批青年拔尖人才。

## 技术架构

- **部署**：Cloudflare Workers（入口 `src/index.js`、配置 `wrangler.jsonc`）
- **构建**：Cloudflare Builds 监听 GitHub，push 到 `main` 即自动部署
- **派生文件**：GitHub Actions（`.github/workflows/sync-site.yml`）在内容变更后重生成并回推
- **内容发现**：动态 `sitemap.xml`、`robots.txt`、`llms.txt`、`ai-manifest.json`、`feed.xml`

### 内容管线

```
作者提交 articles/*.md
   ↓
GitHub Actions: sync-site.yml
   python3 scripts/generate_site.py       # 6 个派生文件
   python3 scripts/generate_og_images.py  # assets/og/*.png 分享图
   → 回推 main → Cloudflare Builds 自动部署 → 清理 Cloudflare 缓存
```

### ⚠️ 两条必须遵守的约定

1. **不要手工修改派生文件**。以下 7 项由 `sync-site.yml` 独占，手改会在下次同步时产生冲突或被覆盖：

   ```
   articles/index.json   feed.xml   sitemap.xml
   ai-manifest.json      llms-full.txt   llms.txt
   assets/og/
   ```

   要改内容请改 `articles/*.md`；要改派生逻辑请改 `scripts/generate_site.py`。

2. **`robots.txt` 与 `src/index.js` 的 `renderRobots()` 必须保持一致**。
   线上实际返回的是 Worker 的输出，仓库里的 `robots.txt` 只是留档副本。

3. **注意**：修改 `sync-site.yml` 本身**不会**触发它（`on.push.paths` 未包含
   `.github/workflows/**`）。改完工作流需要手动 `workflow_dispatch` 或等下一次内容推送才会生效。

### Agent 访问接口

| 能力 | 用法 |
|---|---|
| Markdown 原文 | 文章 URL 后加 `.md`，或发送 `Accept: text/markdown` |
| 站内搜索（JSON） | `/search?q=关键词&format=json` |
| 全站索引 | `/llms.txt` |
| 全量语料（约 1.37MB） | `/llms-full.txt` —— 仅在确实需要全量时读取 |
| 站点地图 / 订阅 | `/sitemap.xml`、`/feed.xml` |

> 关于 `llms.txt` 的定位：它主要服务 coding agent 与文档消费者。
> Google 官方明确表示 Search 不使用 llms.txt，它**不是**提升 AI Overviews 收录的手段。

## 文件结构

```
├── articles/                    # 文章 Markdown（唯一内容源）
│   ├── index.json               # 文章索引（派生，勿手改）
│   └── *.md                     # 文章正文
├── assets/og/                   # OG 分享图 PNG（派生，勿手改）
├── scripts/
│   ├── generate_site.py         # 生成 6 个派生文件
│   └── generate_og_images.py    # 生成 OG 分享图（需 Pillow + CJK 字体）
├── src/
│   └── index.js                 # Cloudflare Worker：渲染 / JSON-LD / 搜索 / 404
├── .github/workflows/
│   └── sync-site.yml            # 内容同步工作流
├── _headers                     # ⚠️ 未生效：脚本型 Worker 不读取此文件，规则应写入 src/index.js
├── about.md                     # 关于页内容源
├── robots.txt                   # 留档副本（线上由 Worker 输出，见上文约定 2）
├── wrangler.jsonc               # Worker 配置
└── README.md
```

## 许可证

内容版权归原作者所有。站点声明为 CC BY-NC-ND 4.0。
