---
title: "给 AI 装上"长跑"的循环：LongHorizon-Harness 与 DeepSeek Harness 深度对比"
date: 2026-10-07
description: "模型决定智能体在一轮里能做什么，harness 决定它能不能把一件事干完。LongHorizon-Harness（阿里高德团队开源）用"管理者—执行者—审计员"三权分立的长程循环，让 Claude Code 等后端连续工作数十小时不丢状态；DeepSeek Harness 则把模型、工具、UI、循环全部做成可替换插件。文末给出金融机构落地路线。"
tags: ["LongHorizon-Harness","DeepSeek Harness","智能体","长程任务","MEA循环","插件化","Agent框架","金融科技"]
schema_type: Article
references:
  - title: "GitHub：LongHorizon-Harness-cn（中文翻译版 README）"
    url: "https://github.com/yangshun2005/LongHorizon-Harness-cn"
    source: "GitHub（AMAP-ML/LongHorizon-Harness 中文版）"
  - title: "arXiv：LongHorizon-Harness: Advancing Long-Horizon Agents for Real-World Tasks（2608.01964）"
    url: "https://arxiv.org/abs/2608.01964"
    source: "arXiv"
  - title: "PyPI：lh-harness 0.1.7"
    url: "https://pypi.org/project/lh-harness/"
    source: "PyPI"
  - title: "DeepSeek 官网：DeepSeek Harness developer preview——Everything is a plugin"
    url: "https://www.deepseek.com/harness/en/"
    source: "DeepSeek"
  - title: "DeepSeek Harness 项目官网：OpenClaw/Hermes/OpenHands 对比"
    url: "https://deepseekharness.dev/"
    source: "DeepSeek Harness"
  - title: "GitHub：deepseek-ai/deepseek-harness"
    url: "https://github.com/deepseek-ai/deepseek-harness"
    source: "GitHub（DeepSeek）"
  - title: "稀土掘金：Agent 做到一半崩了？阿里开源长程 Agent 工具 LongHorizon-Harness（2026-08-04）"
    url: "https://juejin.cn/post/7670034485262352399"
    source: "稀土掘金"
  - title: "CSDN：DeepSeek Harness 完全入门，读懂真正"万物可插件"的新一代 Agent（2026-08-17）"
    url: "https://blog.csdn.net/u013970991/article/details/163811390"
    source: "CSDN博客"
  - title: "腾讯云开发者社区：DeepSeek 开源了 Harness，但先别急着换掉你手里的框架（2026-09-29）"
    url: "https://developer.cloud.tencent.cn/article/2753412"
    source: "腾讯云开发者社区"
  - title: "腾讯云ADP：从 DeepSeek Harness 看企业级 Agent——为什么"能运行"之后，还要"可治理、可生产"（2026-08-14）"
    url: "https://adp.tencent.com/zh/blog/deepseek-harness-enterprise-agent-governance-production"
    source: "腾讯云ADP"
  - title: "阿里云帮助中心：DeepSeek Harness——构建插件化智能体（2026-09-08）"
    url: "https://help.aliyun.com/zh/ecs/user-guide/aigc-practice/"
    source: "阿里云帮助中心"
  - title: "CSDN：DeepSeek Harness 与 WorkBuddy 和 Codex/Claude Code 等 Agent 对比（2026-09-25）"
    url: "https://blog.csdn.net/solihawk/article/details/163996402"
    source: "CSDN博客"
---

# 给 AI 装上"长跑"的循环：LongHorizon-Harness 与 DeepSeek Harness 深度对比

先讲一个几乎所有用过 AI 编程或 AI 办公工具的人都遇到过的场景：你给智能体布置了一个"大活"——整理一份跨部门的数据报告、把几十个文件改一遍、在桌面上操作几个软件完成一条业务流水线。前半小时它干得漂亮，然后要么上下文越拖越长开始胡说，要么中途断了一次从头再来，要么它跟你说"做完了"，你打开一看，第一步就错了。

问题不在模型笨，而在**没有人给这个智能体设计"长跑"的循环**。

**模型决定了一个智能体在一轮里能做什么，harness 则决定它能不能把一件事干完。** 2026 年 8 月前后，两个名字几乎同时出现在开发者视野里：阿里高德团队开源的 LongHorizon-Harness，和 DeepSeek 开源的 DeepSeek Harness（dsh）。它们都叫 harness，但解决的是两个不同的问题——把两者放在一起看，恰好补全了"让 AI 真正干活"的完整拼图。

**LongHorizon-Harness 的核心是"规划—执行—验证—检查点—恢复"的 MEA 循环，管理者、执行者、审计员三权分立。** 它不训练新模型，也不替代你现有的 Claude Code 或 Codex，而是在它们下面垫一层执行基础设施。

**DeepSeek Harness 的核心是"万物皆插件"：模型、工具、技能、会话、沙箱、存储、循环、调度、UI 全部可以自由装卸替换。** 官方给了一个公式：Model + Harness = Agent，意思是它想当"Agent 的操作系统"。

**更关键的是，两者不是竞争关系而是上下层关系：LongHorizon-Harness 官方支持用 DeepSeek Harness 作为它的执行后端。** 这篇文章就把这两个"循环"拆开讲透：各自是什么、有什么优势、适合什么场景、怎么配合用，以及金融机构可以怎么落地。

## 一、LongHorizon-Harness：给智能体装上"长跑配速系统"

先说 LongHorizon-Harness（下称 LH-Harness）。它是阿里高德团队（AMAP-ML）开源的"面向计算机使用代理的循环工程"系统，一条命令安装，MIT 许可，论文发表于 arXiv（2608.01964），还登上过 Hugging Face Daily Papers 周榜第一。中文翻译版正是你发我的那个仓库。

### 它解决什么问题：AI 的"单轮聪明"与"长程健忘"

单轮对话里，模型很聪明；连续几十个步骤的任务里，模型会犯三类错误：**上下文污染**（越做越长，开头的要求被遗忘）、**自说自话**（声称做了某件事，实际没做或做错了）、**一崩到底**（中途失败后没有"从哪里继续"的记忆）。

LH-Harness 的回答是：**别让模型自己管理任务，把任务状态搬出来，由一套独立的循环来管。**

### 核心机制：MEA 循环与三权分立

它的循环可以浓缩成一句话：**规划 → 执行 → 验证 → 检查点或恢复 → 重复，直到任务真正完成。** 循环内部有三个明确分工的角色：

| 循环责任 | 角色 | 干什么 |
|---|---|---|
| 🧭 状态与下一步 | **管理者（Manager）** | 每一轮根据"原始目标 + 已验证进度 + 失败证据 + 剩余工作"重新构建任务状态，决定下一个**有界的小步骤** |
| ⚡ 执行 | **执行者（Executor）** | 以**全新上下文**开始，在桌面应用或命令行里完成这一个小步骤——不背着上一轮的记忆，避免污染 |
| 🔍 事实核查 | **审计员（Auditor）** | **只读**地独立检查真实环境（文件、界面、日志、测试），**绝不轻信执行者的自述** |

一句话概括这套设计：**只有被独立验证过的结果，才被允许进入持久任务状态；被拒绝的结果不算进度，只算证据。** 当上下文刷新、操作失败或交付物没通过检查时，下一轮从"原始目标 + 最后一个已验证检查点"重新出发。

用大白话比喻：管理者是"教练"（定下一步练什么），执行者是"运动员"（上场完成动作），审计员是"裁判"（看录像判分，不信运动员自己说跳过了 2 米）。教练可以换、运动员可以换，但**裁判只认事实**——这一条，恰好命中了我上一篇越狱文章里最担心的"智能体自说自话"问题。

### 兼容性：不绑死任何模型和后端

LH-Harness 通过一个轻量级 **AgentAdapter** 适配层连接现有代理，保留各代理原生的执行循环，只是在外围加上状态管理。目前已支持：

- **模型**：Claude、GPT、Qwen 等，以及各后端暴露的其他模型；
- **代理后端**：Claude Code、Codex CLI、OpenCode、**DeepSeek Harness（dsh）**（v0.1.5 起支持，第一阶段 CLI），以及自定义 AgentAdapter 实现；
- **角色分配**：管理者、执行者、审计员**可以各自用不同的模型或后端**——比如用便宜模型干脏活、用强模型做判断；
- **执行环境**：本地，支持可插拔的 Environment 协议；GUI（桌面应用）与 CLI（终端）混合。

### 效果：数百个真实任务上的可测量收益

官方公布了三组基准数据（骨干模型均为 Qwen 3.7-Plus，执行后端均为 Claude Code，只换 harness）：

| 基准 | 指标 | 裸 Claude Code | LH-Harness | 增益 |
|---|---|---|---|---|
| WeaveBench（114 个任务） | PassRate | 51.8 | **80.7** | **+28.9** |
| WeaveBench | Overall | 0.702 | **0.835** | +0.133 |
| OSWorld 2.0（108 个任务） | 完整任务完成率 | 2.8 | **8.3** | **约 3 倍** |
| OSWorld 2.0 | 部分完成 | 21.5 | **35.2** | +13.7 |
| Terminal-Bench 2.1 | 成功率 | 69.7 | **77.2** | +7.5（且 Token 减少 24%） |

任务覆盖 Web 前端、数据分析与可视化、运维调试、文档演示、商业金融、行政合规等 15 个领域——也就是说，**收益不是挑出来的几个 demo，而是几百个真实任务的平均提升**。

### 上手体验

一条命令安装（`uv tool install lh-harness` 或 `pip install lh-harness`），`lh-harness init` 生成配置，`lh-harness web` 打开浏览器工作台——可以在线启动任务、给每个角色选后端和模型、中途批准请求、发指令、停止或重启。断点续跑是它的招牌能力：**干到一半关掉，下次接着来，不会失忆。**

## 二、DeepSeek Harness：想当"Agent 的操作系统"

再看 DeepSeek Harness（dsh）。2026 年 8 月 13 日 DeepSeek 把它开源并开放开发者预览，口号只有一句：**Everything is a plugin（万物皆插件）**。

### 它解决什么问题：Agent 框架的"出厂即定型"

传统 Agent 框架往往是"一体化封闭设计"：功能固定，想换任务循环、换上下文策略、换界面，都得改底层源码；工具调用靠 Function Call 一个 API 一个 API 硬编码，换平台就重写。DeepSeek Harness 的颠覆点是：**把模型的"外壳"彻底拆掉，所有能力都做成插件。**

官方列出的可插拔清单包括：**模型、工具、技能、会话、沙箱、存储、循环、调度、UI**。想换模型？换一个插件。想把工具接到内部系统？写一个插件。想把 Web 界面换成 CLI？换 UI 插件。官方用 npx `@deepseek-ai/dsh web` 一条命令即可启动，并提供 **Standard、PTC、Minimal、Creative 四种预设运行模式**。

### 定位：运行时底座，而不是应用

有个比喻很到位：**传统 Agent 是出厂配置固定的成品电脑，DeepSeek Harness 是配件全可替换的组装主机。** 它不直接提供问答或编码能力，而是提供"让 Agent 跑起来"的整套基础设施——模型接入、工具调度、安全沙箱、会话管理、子智能体编排、可观测性、Web UI，全部插件化。CSDN 上有人把它比作"乐高底盘"：给定 Model + Harness，你组装出你自己的 Agent。DeepSeek 还配了一篇 88 页的论文，用数学论证这套插件化架构的可靠性。

### 现状与边界（重要）

要诚实说明三点：**第一**，它是开发者预览版 v0.1，官方明确表示未来会有破坏兼容性的变更——所以"先别急着把生产系统换上去"。**第二**，它面向的是开发者和 Infra 团队，偏向"搭运行时"的人，而不是直接用 Agent 干活的业务用户。**第三**，它更擅长做"底座"，长任务的状态管理、验证、恢复这些"跑步纪律"，它不替你管——那是 LH-Harness 的活。

## 三、直接对比：它们差在哪、怎么配合

把两个 harness 放同一张表里看：

| 维度 | LongHorizon-Harness | DeepSeek Harness |
|---|---|---|
| 一句话定位 | 长程任务的"执行纪律层"：管状态、管验证、管恢复 | Agent 的"运行时底座"：管组装、管插拔、管生态 |
| 核心哲学 | 任务状态外部化，三权分立，只有独立验证的事实才进状态 | 万物皆插件，模型/工具/会话/循环/UI 全部可替换 |
| 关键机制 | MEA 循环（管理者/执行者/审计员）+ 检查点续跑 | 插件内核（基于 Cordis）+ 四种预设运行模式 |
| 对模型的态度 | 不训练、不替换，套在现有模型/后端外面 | Model + Harness = Agent，模型本身也是可换插件 |
| 后端兼容 | 适配 Claude Code / Codex / OpenCode / dsh，可角色混用 | 自己是底座，也可被 LH-Harness 当后端调用 |
| 强项场景 | 几十小时跨应用长任务、桌面+CLI+Web 混合、断点续跑 | 定制 Agent 产品、企业内嵌、多模型切换、换 UI |
| 成熟度 | v0.1.7（2026-08），GitHub 1477+ Star，有完整基准 | v0.1 开发者预览（2026-08-13），迭代中 |
| 许可证 | MIT | 开源（开发者预览） |

**三个关键差异，值得记住：**

1. **一个管"跑得久"，一个管"装得活"。** LH-Harness 解决的问题是"干到一半怎么办"——状态、验证、恢复；dsh 解决的问题是"想要什么样的 Agent 就组装成什么样"——插件、替换、生态。前者是长跑教练，后者是改装车间。

2. **一个面向"用"，一个面向"造"。** LH-Harness 的默认用户是"手里已经有 Claude Code / Codex 的人"；dsh 的默认用户是"要造一个自己的 Agent 运行时的人"（AI Infra 团队、框架开发者）。

3. **它们天然可以叠起来用。** LH-Harness 从 v0.1.5 起就支持 `--agent deepseek_harness`，把 dsh 当作执行后端跑 `dsh --profile headless`。也就是说：**用 dsh 当"发动机"，用 LH-Harness 当"自动驾驶 + 维修队 + 裁判"**——一个负责组装动力，一个负责长跑纪律，这可能是 2026 年最省事的组合拳。

## 四、应用场景图谱：各回各家，各干各活

**LongHorizon-Harness 适合的场景**（特征是：任务长、跨应用、怕失忆、要可信）：

- **数据分析与报表流水线**：从数据库取数 → 清洗 → 生成图表 → 写进 PPT/文档 → 复核，几十步跨工具，中途断电也能续。
- **系统运维与调试**：调查日志、网络、性能故障，边查边修边验证，每一步都有审计记录。
- **跨应用办公自动化**：浏览器查资料 → 终端跑脚本 → 桌面软件做产物 → 再回终端验证，全程同一套状态管理。
- **任何"隔夜任务"**：睡觉前启动，早上验收——这是它最打动人的使用方式。

**DeepSeek Harness 适合的场景**（特征是：要定制、要集成、要换）：

- **搭建企业级 Agent 产品**：把银行内部的数据源、审批流、知识库做成插件，组装出专属客服/风控/办公 Agent。
- **多模型路由与灰度**：生产环境想在不同模型之间切换、对比，插件化让换模型变成改配置。
- **定制交互形态**：要 Web UI、要 CLI、要嵌进现有产品，UI 作为插件整体替换。

## 五、金融机构怎么用：把"循环纪律"变成"行为治理"

作为银行风险管理从业者，我看这两个 harness 的第一反应不是"效率提升"，而是它们**恰好回应了越狱文章里暴露的两类治理缺口**：

- **审计员只读验证 = 人类复核的自动化化身。** 智能体最大的风险是"自说自话"（声称完成、实际没做）。LH-Harness 的 Auditor 角色只信环境事实、不信自述，相当于把"人工复核"制度化进了执行循环。银行上智能体做监管报表、贷前尽调材料这类高可信要求的任务时，这个机制比任何"提示词约束"都可靠。
- **三权分立 = 操作风险的最小权限设计。** 管理者定方向、执行者动手、审计员只读——权限天然隔离，和银行"经办、复核、授权"分离的内控逻辑同构。这比把全部权限塞给一个智能体，安全一个量级。

落地路线建议三步走：

1. **先跑通"隔夜任务"**：选一个低频、跨工具、结果可验证的银行场景（如月度市场数据汇编），用 LH-Harness + 现有后端跑一周，看"审计员验证 + 断点续跑"的实际收益。
2. **再用 dsh 做内网集成**：把银行内网的数据接口、报表模板、审批规则封装成 dsh 插件，形成"银行专用 Agent 底盘"，为多场景复用打基础。
3. **最后叠加治理层**：把 dsh 插件化底座 + LH-Harness 循环纪律，纳入行内的 AI 智能体准入与审计框架——对应金监总局《指导意见》关于智能体权限、审计、可解释的要求。

## 结语

回到开头的比喻：**模型决定智能体"一轮"能跑多快，harness 决定它"一场马拉松"能不能跑完、跑完的每一步有没有裁判见证。** LongHorizon-Harness 提供的是长跑的纪律与记忆，DeepSeek Harness 提供的是赛车的改装车间。两个都开源、都在快速迭代、都值得上手试——而它们叠加起来的那套"组装 + 长跑 + 裁判"的组合，也许正是企业级智能体从"demo 好看"走向"生产可靠"最务实的一条路。
