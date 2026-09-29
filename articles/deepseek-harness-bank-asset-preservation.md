---
title: "DeepSeek Harness 能不能直接用在银行资产保全上——官方安全通告划的红线，与三处结构性错配"
date: 2026-09-29
description: "DeepSeek Harness 是 DeepSeek AI 于 2026-08-13 开源的官方 agent harness（MIT、239,580 star、基于 Cordis 的 everything-is-a-plugin 架构），但其官方 SAFETY.md 自述『未经过安全审计，不得视为安全或生产就绪』。本文基于 GitHub API、官方 API 文档、HuggingFace 模型卡、arXiv 论文与金发〔2026〕8号监管原文，论证银行资产保全不能直接使用该 harness，拆解三处结构性错配（抽象层、输入形态、确定性），并给出五步适配清单与一条合规红线清单。"
tags: ["DeepSeek", "agent harness", "资产保全", "不良资产", "押品管理", "安全审计", "私有化部署", "银行AI治理", "智能体"]
schema_type: "Article"
references:
  - title: "deepseek-ai/deepseek-harness（GitHub 仓库，官方一手）"
    url: "https://github.com/deepseek-ai/deepseek-harness"
    source: "DeepSeek AI"
  - title: "DeepSeek Harness — SAFETY.md（官方安全通告）"
    url: "https://github.com/deepseek-ai/deepseek-harness/blob/master/SAFETY.md"
    source: "DeepSeek AI"
  - title: "DeepSeek API Docs — Models & Pricing（当前模型、上下文、定价）"
    url: "https://api-docs.deepseek.com/quick_start/pricing"
    source: "DeepSeek AI"
  - title: "DeepSeek API Docs — JSON Output（含『可能返回空内容』的官方警告）"
    url: "https://api-docs.deepseek.com/guides/json_mode"
    source: "DeepSeek AI"
  - title: "DeepSeek API Docs — Tool Calls（strict 模式为 Beta 及其 schema 子集限制）"
    url: "https://api-docs.deepseek.com/guides/tool_calls"
    source: "DeepSeek AI"
  - title: "DeepSeek Harness 官方文档 — Configure models（自定义网关、协议与 compat 开关）"
    url: "https://deepseek-harness.github.io/deepseek-harness/en/guide/providers"
    source: "DeepSeek AI"
  - title: "DeepSeek-V4.1-Flash 模型卡（HuggingFace，MIT 许可与参数）"
    url: "https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash"
    source: "DeepSeek AI"
  - title: "A Programming Paradigm for Spatiotemporal Composibility（Cordis 设计论文，arXiv:2608.25512）"
    url: "https://arxiv.org/abs/2608.25512"
    source: "arXiv"
  - title: "《关于银行业保险业人工智能安全开发应用的指导意见》（金发〔2026〕8号）"
    url: "https://www.nfra.gov.cn/"
    source: "国家金融监督管理总局"
---

# DeepSeek Harness 能不能直接用在银行资产保全上——官方安全通告划的红线，与三处结构性错配

**DeepSeek Harness 确实是官方产品——2026-08-13 开源、MIT 许可、239,580 star、基于 Cordis 的"everything-is-a-plugin"架构。但它自己的 `SAFETY.md` 写明：未经过安全审计，不得视为安全或生产就绪。所以"能不能直接用"这句话，官方已经替我们答了一半。**

**真正的错配不在模型能力，而在抽象层。55 个官方插件包里，`fs`／`shell`／`terminal`／`subprocess`／`ssh`／`lsp`／`ptc-runtime` 面向的是代码工程；能直接复用到案件、押品、诉讼节点的，接近于零。**

**三处硬约束与资产保全正面冲突：Files API 只收图片不收 PDF/DOCX，而资产保全的原材料恰恰是法律文书与卷宗；JSON Output 官方承认"可能返回空内容"；thinking 模式默认开启且温度类参数被钳制。**

**结论是一句话：能借它的插件机制，不能借它的安全边界。** 把 dsh 当插件框架用，安全边界由银行自建层承担——这既是技术判断，也是金发〔2026〕8号下唯一站得住的姿势。

## 一、先把这个名字说清楚

很多讨论里"DeepSeek harness"是个含糊说法。**它确实存在，而且是官方开源项目**，这些都能在仓库元数据里直接核到（PRIMARY，GitHub API 于本文核验日取得）：

| 项 | 值 |
|---|---|
| 仓库 | `deepseek-ai/deepseek-harness` |
| 官方描述 | **DeepSeek Harness: Everything is a Plugin.** |
| 创建时间 | **2026-08-13T11:56:32Z** |
| 最近推送 | 2026-09-29（本文核验当日，仍在活跃开发） |
| Star / Fork | **239,580 / 28,780** |
| 许可 | **MIT** |
| topics | `ai-agents` `cordis` `dsh` `dsh-plugin` |
| 底层框架 | **Cordis**，设计论文《A Programming Paradigm for Spatiotemporal Composibility》（arXiv:2608.25512） |

启动方式是 `npx @deepseek-ai/dsh web`，默认在 `http://127.0.0.1:3080` 起 Web UI（PRIMARY，README 原文）。

**但有两个必须同时读的事实**。README 在标题下方第一段就写着：DeepSeek Harness 处于 **developer preview**，并且用加粗强调"**THERE WILL BE COMPATIBILITY-BREAKING CHANGES**"（PRIMARY，README 原文）。

而仓库根目录有一个 `SAFETY.md`，README 要求"运行本项目前请阅读安全通告"。它的第一段是（PRIMARY，`SAFETY.md` 原文）：

> DeepSeek Harness is experimental developer-preview software. **It has not undergone a security audit and must not be treated as secure or production-ready.**

**一个 239,580 star 的项目，同时在 README 里说"会有破坏性变更"、在安全通告里说"没做过安全审计"。这两句话必须一起拿给合规看。** 只讲前者是选择性披露。

## 二、官方自己划的三条红线

`SAFETY.md` 里对接入方最要命的不是"实验性"这三个字，而是后面两段（PRIMARY，原文）：

> The project can execute model-generated code and commands, load third-party plugins, and access the network, processes, credentials, and files made available to it.

> Sandboxing, approval prompts, and permission controls **can reduce risk, but they do not guarantee isolation or prevent damage**. Even correctly enforced restrictions cannot protect resources that the project is allowed to access. **Do not rely on DeepSeek Harness as the sole security control for untrusted workloads.**

把它翻成银行的语言：**这个 harness 的设计前提就是"它能执行模型生成的代码和命令、能加载第三方插件、能碰到你给它的凭据和文件"**。而沙箱、审批弹窗、权限控制**只降低风险、不保证隔离**；即便限制全部正确执行，也保护不了项目已被允许访问的资源。

**对资产保全的直接后果**：押品估值影像、征信报告、诉讼卷宗、当事人身份证号与银行卡号——**这些正是"项目被允许访问的资源"**。官方在此明确说不要把它当作不可信工作负载的唯一安全控制。

顺带把监管侧的对应条款摆出来（PRIMARY，金发〔2026〕8号《关于银行业保险业人工智能安全开发应用的指导意见》，2026-06-18 发布）：

- **（十六）高风险应用准入**：涉及"资金交易、**资产评估**、信贷审批、承保理赔、**风险管理**等，以及"与客户利益直接相关、直接影响金融合约达成"的生成式 AI 场景应用，应被视为高风险应用
- **（二十五）智能体系统安全**：持续监控模型行为，防范"**提示词注入、思维链注入、多模态攻击、上下文污染**"等威胁
- **（二十二）可解释性**：可解释性不足的 AI 技术应用于高风险场景时，**仅能作为辅助工具**
- **（二十四）数据红线**："姓名、身份证号、手机号、银行卡号等个人信息和隐私数据**不得用于生成式人工智能模型训练和优化**"
- **（五）模型准入**：对生成式 AI 模型实施准入管理；"**外部引入的生成式人工智能模型需经过网信部门备案**"

**把两侧拼起来，结论没有回旋余地**：资产保全落在（十六）的高风险应用里，而 DeepSeek Harness 官方自述未过安全审计、且其安全机制不被官方承认为可靠隔离。一个高风险应用不能建在一个自己声明"不要当作唯一安全控制"的基础上。

**这不是"先小范围试点"能解决的**——（二十二）已经把"可解释性不足者仅能作辅助工具"写死了，一个没有通过安全审计的运行时不可能提供可解释性保障。

## 三、错配之一：抽象层——55 个插件说明了什么

这是本文最实的一段观察。`packages/` 目录下共有 **55 个插件包**（PRIMARY，GitHub API 目录列举于本文核验日）。按用途粗分：

**面向代码工程的（占比最大）**：`fs`、`shell`、`terminal`、`subprocess`、`ssh`、`lsp`、`pty-runtime`、`computer-use`、`browser-use`、`document`、`attachment`、`compaction`、`context`、`plan`、`subagent`、`todo`

**治理与基础设施的**：`sandbox`、`guard`、`hooks`、`credentials`、`identity`、`storage`、`session`、`telemetry`、`runtime-diagnostics`、`schedule`、`jobs`、`workflow`、`mcp`、`skill`、`llm`、`api`、`web`、`sdk`、`core`、`boot`、`preset`、`bundle`

**结论很直白**：这个 harness 的世界模型是"**工作区文件 + 命令执行 + 计划与委派**"。官方文档的示例任务是"Summarize this repository and identify its main packages"（PRIMARY，官方 quickstart 原文）。

而资产保全的世界模型是**案件、债权、押品、诉讼节点、催收工单、时效台账**。`fs` 与 `shell` 在这里没有对应物——押品台账不是工作区文件，案件流转不是 shell 命令。

**这意味着"直接用"在字面意义上不成立**：不是配置项没调对，而是**它没有"查询押品系统""生成调解方案草稿""推进诉讼节点"这类工具**。这些工具必须由银行自己写。

**好消息是扩展点是干净的**（PRIMARY，官方开发文档）：插件是一个导出 `apply` 函数的 TypeScript 模块，通过 `ctx.tools.register(defineTool({...}))` 注册能力，`parameters` 负责参数推断与校验，`output.schema` 声明规范值、`output.render` 转成模型可见内容，参考文档里还列了 policy hooks、后台任务与 UI 卡片。

**换句话说：能力可扩展，边界不可继承。** 你能把银行工具接进去，但你接进去的东西是否安全、是否留痕、是否可回退，全部由你自己写——而这恰好是官方明说不负责的那部分。

## 四、错配之二：输入形态——只收图片的 Files API

资产保全的原始材料是什么？**法律文书、借款合同、担保合同、法院判决书、卷宗、催收记录、押品评估报告。** 这些绝大多数是 PDF 或 DOCX。

而官方 Files API 的支持范围是（PRIMARY，官方文档）：**JPEG、PNG、GIF、WebP**。

**这是一条硬墙**。资产保全的输入必须先经过 OCR 或格式转换才能进入系统，而**转换本身就是一个新的错误来源**——扫描件 OCR 的数字与日期错误、表格跨页断裂、印章与手写批注丢失。**这些错误会一路流到下游的判定环节。**

更麻烦的是它与（一）里那条"格式与口径"判据的冲突：站内已有的资产保全任务分型把"材料完整性判断"列为**最值得评估微调的窄分类型**，因为它四项判据可同时成立。**但如果材料要先过一道有损的 OCR，那这个任务的错误就不再可归因到"模型输出"这一层**——你无法区分是模型判错、还是 OCR 就没读出来。

**适配含义**：材料摄取必须自建，并且**必须保留原件与 OCR 结果的逐项对应关系**，让判定结论能回指到原文位置。

## 五、错配之三：确定性——三处官方承认的松动

资产保全与零售智能体支付共享一个硬约束：**同一个输入必须映射到同一个结果**。而 DeepSeek 的官方文档在三个地方承认了不确定性（全部 PRIMARY，出处见文末 references）：

**其一，结构化输出可能为空。** JSON Output 指南原文：

> When using the JSON Output feature, **the API may occasionally return empty content.**

这一条对银行特别致命。押品台账核对、材料齐备性检查、时效监控，全部建立在"结构化抽取出一个字段"之上。**返回空内容不是报错，是一次静默失败**——而静默失败在流程／工具型任务里是最难发现的一类缺陷。

**其二，strict 模式是 Beta，且 schema 子集受限。** 要启用需把 `base_url` 切到 `/beta`，且所有 function 都要 `strict: true`；同时**每个 object 的全部 properties 必须都列入 `required`、`additionalProperties` 必须为 `false`**，而 `minLength`／`maxLength`／`minItems`／`maxItems` **不被支持**（PRIMARY，Tool Calls 指南）。

**后果**：银行真实的风控校验——金额区间、日期先后、比例阈值、枚举取值——**大部分无法表达在这个 schema 子集里**，只能退回到 harness 侧自己校验。**这直接削弱了"用模型自身的约束来保证正确性"这条捷径。**

**其三，思考模式会削弱可复现性，而它是默认开的。** 官方定价页写明两个模型都"Supports both non-thinking and thinking (**default**) modes"（PRIMARY）。而思考模式下**不支持 `temperature`／`presence_penalty`／`frequency_penalty`**，且 `top_p` 被钳制在 0.95–1.0 区间，超出部分按边界处理；非思考模式下 `top_p` 固定为 1.0、用户传值被忽略（PRIMARY，Thinking Mode 指南）。

**也就是说：想要批处理可复现，就必须显式关掉思考；而关掉思考这件事，在走 OpenAI 兼容网关时不会自动生效。** 官方配置文档为此专门给了一个开关——针对"除非被告知否则就会思考"的模型（例如 OpenSeek 兼容网关后面的 DeepSeek V4），需要设 `compat.thinkingFormat: deepseek`，`off` 才会真正发出 `thinking: {type: disabled}`（PRIMARY，harness providers 文档）。

**这一条是本文最实用的单点发现**：它不是理论问题，是一个真实的、会导致"我明明关了思考、账单却还是按思考模式走"的生产事故来源。

**还有一个连带约束**：带 `tools` 时，`reasoning_content` 必须在后续所有请求中完整回传，**否则 API 返回 400**（PRIMARY，Thinking Mode 指南）。任何做会话裁剪或改写的中间层都会踩到它。

## 六、启示：harness 是运行时，不是产品——以及这一轮的新变化

**第一层启示，是本文最想传达的判断**：**harness 是一个运行时，不是一个产品。** 官方给的是运行时底座与插件机制，不给业务语义、不给安全边界、不给合规结论。**银行采购的标的其实是"插件 + 边界 + 留痕"，而不是那个 239,580 star 的仓库。**

**第二层启示，来自一个反直觉的对比。** 站内已有文章引用过"上下文管理在 harness 里的价值随窗口增大而衰减"这组数据（arXiv:2609.20804：上下文管理带来的增益在 32k 窗口下是 35.7pp，到 128k 只剩 2.7pp；T0 溢出率从 78.7% 降到 8.7%）。而 DeepSeek 当前两个模型都是 **1M 上下文**（PRIMARY，官方定价页）。

**按那组数据的趋势，1M 窗口会让 `compaction`／`context` 这类插件的边际价值大幅下降。** 这听起来是利好，但**不能直接这么推**——原因有两层，都有一手依据：

- **推论本身超出了那组数据的测试范围。** 那组实验覆盖的是 32k–128k，**没有 1M 的实测点**。窗口继续放大后检索质量怎么变，是未测区间。（本文推论，非论文结论）
- **而 DeepSeek 自己的数据指向相反方向**：V3.2 技术论文写明，因为只支持 128K，**"约 20% 以上的测试用例超出该限制"**，不做上下文管理时得分为 **51.4**（PRIMARY，arXiv:2512.02556）；V4 技术论文给出 1M 上下文下的 MRCR 83.5、CorpusQA 62.0，而对照的 Opus-4.6 是 92.9 与 71.7（PRIMARY，arXiv:2606.19348）。

**所以真正的结论是：1M 窗口降低了"装不下"的风险，但没有降低"读不准"的风险。** 窗口变大改变的是失败方式，不是失败有无——**这恰恰是 harness 不能省的原因**：上下文管理从"截断"变成了"定位"。

**第三层启示来自一个容易被忽略的细节。** DeepSeek 官方公布的 agent 基准分数，**其框架是 DeepSeek Harness 的 minimal 模式**，并注明 effort 为 max、`top_p=0.95`、`temperature=1.0`（PRIMARY，官方 Change Log 脚注）。

**这意味着官方自己承认：那些成绩是"模型 + harness 配置"的联合结果。** 这一点对银行极其有用——它意味着厂商的分数不能直接当基线，因为基线里已经含了一个厂商自己调的 harness。**你自己的 harness 才是基线的一部分。**

## 七、合规与自部署的现实

**许可层面是好消息。** DeepSeek-V4.1-Flash 的模型权重与仓库均为 **MIT License**（PRIMARY，HuggingFace 模型卡原文："This repository and the model weights are licensed under the MIT License"）。552B 参数 MoE 架构，prefill 激活 8B、decode 激活 16B，另有 196B Engram 参数；上下文 1M，最大输出 384K（PRIMARY，官方新闻与模型卡）。

**但 V4-Pro 的许可状态本文不下结论**：不同来源存在冲突（HF 仓库存在且有第三方称 MIT，另有来源称 V4-Pro"仅提供 API 商业服务"）。**这一项标注为未解决，落地前必须直接查证仓库 license 字段。**

**自部署不是"有 MIT 就能装"。** 官方在 V4.1-Flash 发布公告里写明，若需大规模部署且具备相应资源（**2,000 张 GPU 加存储集群**）欢迎联系（PRIMARY，官方新闻原文）。这说明 552B 规模的自建是一笔实质的基建投入，不是"下载权重跑起来"。

**更关键的是模型标识会漂移。** 官方定价页至今仍并列列出 `deepseek-flash` 与 `deepseek-v4-pro` 两个模型（PRIMARY），但发布公告写明：**自 2026-09-14 04:00 UTC 起，所有 `deepseek-v4-pro` 请求将被转发到 V4.1-Flash 并按其费率计费，"直至 V4.1-Pro 发布"**（PRIMARY，官方新闻原文）。此前 `deepseek-v4-flash`、`deepseek-v4-flash-vision-exp` 也已被下线并路由到 V4.1-Flash；更早的 `deepseek-chat`／`deepseek-reasoner` 于 2026-07-24 停用。

**一个把 `deepseek-v4-pro` 写进配置文件的银行，会在某天早上醒来发现跑的是另一个模型，而自己什么都没改。** **这是本文认为最容易被忽略、也最容易造成评估失效的运维风险**——它不在模型卡上，在公告里。

**关于 API 数据与训练**：开放平台服务协议（2026-04-22 发布、2026-04-29 生效）**第 4 条不含训练许可条款**，即 API 侧的输入输出不用于模型训练；这与面向网页／App 的用户协议（其中含训练条款与退出机制）**不是同一份文件**（PRIMARY，协议文本）。**银行若用 API，这是有利事实；但必须确认所用的是开放平台服务协议而非用户协议，并把这一条写入供应商尽调报告。**

**关于备案**：DeepSeek 已有生成式 AI 服务备案号 `Beijing-DeepseekChat-202404280016` 与算法备案号 `网信算备110108970550101240011号`（PRIMARY，公开备案信息）。**但该备案是否覆盖 V4／V4.1 系列模型，本文未能核实——标注为未验证。** 金发〔2026〕8号第（五）条要求"外部引入的生成式人工智能模型需经过网信部门备案"，**这一条是否因为模型升级而需要重新备案，应向 DeepSeek 或属地网信办直接核实。这是本文认为落地前必须先解决、且不能靠技术手段绕过的问题。**

**最后一条现实**：公开报道中，国有大行已有基于 DeepSeek 的私有化部署落地（PRIMARY 为监管文件，SECONDARY 为媒体报道）。但**本文未能找到任何公开的、针对资产保全／不良资产／催收清收／诉讼这一具体场景的 DeepSeek 落地案例**——**标注为未验证**。

**这意味着：银行资产保全的同行经验，在公开范围内是空白的。** 好处是没有现成的坑要踩，坏处是第一个踩的人没有参照系。

## 八、适配清单：五步

假设结论是"用它的机制、不用它的边界"，那么要做的是下面五件事。**顺序不能换。**

**第一步：把安全边界从 dsh 里拿出来，另建一层。** 不要在 dsh 的沙箱与权限控制上建立控制——官方明说它们不保证隔离。**银行需要的是自己控制的执行面**：独立的工具网关负责鉴权与调用留痕，dsh 只拿到"调用网关"的权限，不直接接触业务系统与数据。**这一层的验收标准是：dsh 整体被攻破时，波及范围止于网关。**

**第二步：把 55 个官方插件当参考清单，而不是依赖清单。** 需要自己写的是业务工具层：押品台账核对、案件节点流转、时效监控、法律文书与调解方案草稿、追索线索归集。**每一个都要用 `ctx.tools.register(defineTool({...}))` 注册，并在 `parameters` 里做足校验**——因为 strict 模式用不上（Beta + schema 子集受限），**校验责任完全落在 harness 侧**。

**第三步：材料摄取自建，并保留原件到结论的可回指链路。** 绕开 Files API 只收图片的限制（OCR 或格式转换），**并且必须让每一条判定都能回指到原件的页码与位置**。否则一旦上游转档出错，你无法把错误归因回"模型判错"还是"材料没读出来"。

**第四步：把确定性开关显式化，并写进配置基线。** 至少四件事：批处理类任务**显式关闭思考模式**；走 OpenAI 兼容网关时设 `compat.thinkingFormat: deepseek`（否则 `off` 不生效）；**给模型 ID 加上"漂移检测"**——因为 `deepseek-v4-pro` 已被公告转发到 V4.1-Flash；**以及对 `reasoning_content` 回传做中间层保护**，否则会撞 400。

**第五步：在隔离环境里做评测，不要在生产数据上做第一次运行。** 官方推荐用一次性的虚拟机或容器、以最小权限运行（PRIMARY，`SAFETY.md` 的 responsible use 段）。**对银行的具体含义是：评测集用脱敏后的历史案件，评测环境与生产网络物理隔离，评测结论留档并接受（十七）项的人工监督与紧急停用要求。**

**一句提醒**：这五步里，第一步和第四步最容易被跳过，因为它们不产生演示效果。**而恰恰是这两步，决定了（二十二）项下你能不能主张这个系统是"高风险场景的辅助工具"而不是"自动化决策者"。**

## 九、结论

**"银行资产保全能不能直接用 DeepSeek Harness"的答案，分两层。**

**第一层是采购层的：不能。** 不是因为模型能力不够，而是因为**官方安全通告自己划了红线**——未过安全审计、不得视为生产就绪、沙箱不保证隔离、不要当作唯一安全控制。资产保全落在金发〔2026〕8号第（十六）条的高风险应用里，押品、诉讼材料与当事人身份信息正是第（二十四）条划定的不可用于训练优化的那类数据。**一个高风险应用不能建在这样的运行时之上，这不是保守，是合规底线。**

**第二层是工程层的：可以借。** 它的插件机制干净（`apply(ctx)` + `ctx.tools.register`）、协议适配务实（三种协议可选、自建网关可接、compat 开关覆盖了企业网关最常见的不兼容）、MIT 许可与 Anthropic 格式端点让私有化与多模型切换都留了门。**它值得借鉴的是"everything-is-a-plugin"这个架构判断——把可替换的与不可替换的分开，这是对的。**

**但真正决定成败的不是架构判断。** 资产保全的护城河从来不是 agent 有多聪明，而是：**它做的每一个动作，能不能被回溯到一个人、一个依据、一个时间点。** DeepSeek Harness 提供的是让 agent 动起来的能力，不提供让动过之后还能说清的能力。

**落到一句可执行的话**：**把 DeepSeek Harness 当作一个可以被替换的插件框架引入，把安全边界、留痕与回退这三件事全部自建——并且在合同与备案上确认它能进这道门。技术可行性从来不是这件事的瓶颈。**

---

*作者毕超，金融行业风险管理从业者。本文仅代表作者个人观点，不构成任何机构立场。*

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "DeepSeek Harness 能不能直接用在银行资产保全上——官方安全通告划的红线，与三处结构性错配",
  "datePublished": "2026-09-29",
  "description": "基于 GitHub 仓库原文、官方 SAFETY.md 与 API 文档、HuggingFace 模型卡、arXiv 论文与金发〔2026〕8号监管原文，论证银行资产保全不能直接使用 DeepSeek Harness，拆解抽象层、输入形态、确定性三处错配，并给出五步适配清单。",
  "keywords": ["DeepSeek", "agent harness", "资产保全", "不良资产", "押品管理", "安全审计", "私有化部署", "银行AI治理", "智能体"],
  "author": {
    "@type": "Person",
    "name": "毕超",
    "jobTitle": "金融行业风险管理从业者"
  }
}
</script>
*（内容由AI生成，仅供参考）*

## 常见问题

Q: DeepSeek Harness 到底是什么？是不是就是个壳？
A: 它是 DeepSeek AI 于 2026-08-13 开源的**官方 agent harness**，MIT 许可，基于 Cordis 框架，官方描述是"Everything is a Plugin"，核验日 star 数 239,580。**不是壳**——它有 55 个官方插件包，覆盖文件、命令执行、上下文压缩、计划、子智能体、sandbox、guard、hooks、凭据、身份、会话、遥测等。**但它的能力全部指向软件工程任务**（官方示例任务是总结一个代码仓库），没有案件、押品、诉讼节点这类业务工具——那些必须自己写。
Q: 既然官方自己说没做安全审计，是不是就不能用了？
A: **不能作为生产运行时直接用，但可以借它的插件机制。** 关键在于读懂官方警告的适用范围：它说的是"不要把它当作不可信工作负载的**唯一**安全控制"，而不是"不可使用"。**正确的姿势是：安全边界由银行自建一层工具网关承担，dsh 只拿到调用网关的权限，不直接接触业务系统与数据。** 官方推荐用一次性虚拟机或容器、最小权限运行，这个建议本身是合理的。
Q: 最容易被忽略的运维风险是什么？
A: **模型标识会静默漂移。** 官方定价页至今并列列出 `deepseek-flash` 与 `deepseek-v4-pro`，但公告写明自 2026-09-14 04:00 UTC 起，**所有 `deepseek-v4-pro` 请求转发到 V4.1-Flash 并按其费率计费**，直至 V4.1-Pro 发布。此前 `deepseek-v4-flash` 等旧名同样被下线重定向，更早的 `deepseek-chat`／`deepseek-reasoner` 已于 2026-07-24 停用。**把别名写死在配置文件里，等于把基线交给公告的更新节奏。** 适配方案里必须包含模型 ID 的漂移检测。
Q: Files API 只支持图片，会带来多大麻烦？
A: **这是资产保全的硬墙。** 官方 Files API 支持 JPEG／PNG／GIF／WebP，而资产保全的原始材料是法律文书、借款与担保合同、判决书、卷宗、评估报告，绝大多数是 PDF 或 DOCX，必须先 OCR 或转档。**问题不止是麻烦，而是错误可归因性**：材料完整性判断原本是站内分型里最值得做微调的窄分类型（可度量、有稳定标注、可回退、可归因四项判据同时成立），但一旦转档有损，错误就无法区分是"模型判错"还是"材料没读出来"，**第四项判据直接失效**。所以必须自建摄取层，并保留原件到结论的逐项回指链路。
Q: 为什么说"thinking 默认开启"是个陷阱？
A: 因为关掉它这件事在不同路径上行为不同。官方两个模型都是默认 thinking，而思考模式下**不支持 `temperature`／`presence_penalty`／`frequency_penalty`**，`top_p` 被钳制在 0.95–1.0。想让批处理可复现就得显式关思考——**但走 OpenAI 兼容网关时，把 `reasoningEfforts.off` 留空等于什么都不发，模型照样思考**。官方为此给了 `compat.thinkingFormat: deepseek`，设置后 `off` 才会真正发出 `thinking: {type: disabled}`。**这是一个会导致"明明关了思考、账单仍按思考模式走"的真实事故源。** 另有一条连带坑：带 `tools` 时 `reasoning_content` 必须完整回传，否则 API 返回 400，任何做会话裁剪的中间层都会踩到。
Q: 这些判断的数据可靠吗？哪些是推不出来的？
A: 本文全部关键事实来自一手源并已在正文标注出处：仓库元数据与 55 个插件包清单（GitHub API）、`SAFETY.md` 与 README（仓库原文）、模型与定价与 JSON Output 与 Tool Calls 限制（DeepSeek 官方 API 文档）、MIT 许可与参数（HuggingFace 模型卡）、Cordis 架构（arXiv:2608.25512）、1M 上下文下的检索质量（arXiv:2606.19348、2512.02556）、监管条款（金发〔2026〕8号原文）。**明确未验证的有三项**：DeepSeek 的备案是否覆盖 V4／V4.1 系列；V4-Pro 的许可状态（不同来源冲突，本文不下结论）；**以及是否存在资产保全／催收／诉讼场景的公开 DeepSeek 落地案例——未能找到**。另有一处本文推论而非论文结论：1M 窗口下上下文管理插件的边际价值，arXiv:2609.20804 的实验只覆盖到 128k，该区间未有实测。
