---
title: "新加坡 MAS 落地 AI 风险管理指引：四大期望、一年过渡期与全球四大监管框架横向对照"
date: 2026-10-10
description: "新加坡金管局（MAS）于2026年10月7日发布《人工智能风险管理指引》，适用于所有金融机构与全部AI形态（含生成式与智能体），2027年10月7日生效、分阶段至2028年10月。本文逐条拆解四大监督期望（董事会高管监督、全生命周期管理与AI用例清单、第三方AI问责、风险比例化），梳理配套手册与SAFR，并与中国金发8号文、美国SR 26-2、欧盟AI Act横向对照，给出银行跨境合规建议。"
tags: ["新加坡MAS","AI风险管理","金融监管","第三方AI","SR26-2","AI治理","智能体","银行业"]
schema_type: Article
references:
  - title: "MAS Sets Out Supervisory Expectations on Responsible AI Adoption by Financial Institutions（官方新闻稿，2026-10-07）"
    url: "https://www.mas.gov.sg/news/media-releases/2026/mas-sets-out-supervisory-expectations-on-responsible-ai-adoption-by-financial-institutions"
    source: "Monetary Authority of Singapore"
  - title: "Guidelines on Artificial Intelligence Risk Management（咨询文件，MAS，2025-11）"
    url: "https://www.mas.gov.sg/-/media/mas-media-library/publications/consultations/bd/2025/final_consultation_paper_on_guidelines_on_ai_risk_management_forrelease.pdf"
    source: "Monetary Authority of Singapore"
  - title: "MAS Issues AI Risk Management Guidelines for Financial Institutions（OpenGov Asia，2026-10-07）"
    url: "https://opengovasia.com/mas-issues-ai-risk-management-guidelines-for-financial-institutions/"
    source: "OpenGov Asia"
  - title: "Singapore sets AI risk guidelines for financial institutions（Asia Asset Management，2026-10-09）"
    url: "https://www.asiaasset.com/regulation-compliance/singapore-ai-risk-financial-institutions/"
    source: "Asia Asset Management"
  - title: "Revised Guidance on Model Risk Management（Federal Reserve SR 26-2，2026-04-17）"
    url: "https://www.federalreserve.gov/supervisionreg/srletters/sr2602.htm"
    source: "Federal Reserve Board"
  - title: "Federal Banking Agencies Issue Revised Guidance on Model Risk Management（Sullivan & Cromwell，2026-04-29）"
    url: "https://www.sullcrom.com/insights/memo/2026/April/OCC-Fed-FDIC-Issue-Revised-Guidance-Model-Risk-Management"
    source: "Sullivan & Cromwell LLP"
  - title: "Safeguards for Agentic Finance at Runtime（SAFR，MAS）"
    url: "https://www.mas.gov.sg/-/media/mas-media-library/development/fintech/ai-safr/safr.pdf"
    source: "Monetary Authority of Singapore"
  - title: "MAS Partners Industry to Develop AI Risk Management Toolkit（Operationalisation Handbook，2026-03-20）"
    url: "https://www.sgpc.gov.sg/api/file/getfile/Media%20release_MAS%20Partners%20Industry%20to%20Develop%20AI%20Risk%20Management%20Toolkit%20for%20the%20Financial%20Sector.pdf"
    source: "Singapore Press Centre"
---

# 新加坡 MAS 落地 AI 风险管理指引：四大期望、一年过渡期与全球四大监管框架横向对照

**新加坡金融管理局（MAS，金管局）于 2026 年 10 月 7 日正式发布《人工智能风险管理指引》（Guidelines on AI Risk Management），适用于新加坡所有金融机构（FIs）与全部 AI 形态——包括生成式 AI 以及自主性不断增强的智能体系统。** 指引将于 2027 年 10 月 7 日生效，并分阶段实施至 2028 年 10 月。

**指引确立四大监督期望：董事会和高管层强化监督并明确问责、在 AI 全生命周期识别评估管理风险并建立用例清单、对第三方 AI 的使用继续承担责任、按风险比例化方式落地。** 其中"可沿用现有治理结构、不必专门新设 AI 委员会"等表述，明显吸收了 2025 年 11 月公开咨询的反馈。

**MAS 同时明确：将于 2027 年再次咨询业界，确定是否需要针对智能体（agentic AI）出台额外指引；此前已配套发布落地操作手册（Operationalisation Handbook）、行业 AI 风险管理工具包，以及面向智能体金融的运行时防护框架 SAFR。**

**把视野拉开，本文将 MAS 指引与中国金发〔2026〕8 号文、美国新版模型风险管理指引 SR 26-2、欧盟《AI 法案》横向对照——对有跨境业务的银行而言，四套框架需要一张统一的合规映射图。** 下文先核验事实，再逐条拆解，最后给出落地建议。

## 一、事件核验：发布背景与适用范围

1. **时间线**：MAS 于 2025 年 11 月就指引草案公开征求意见；2026 年 3 月 20 日联合行业发布 AI 风险管理工具包与操作手册；2026 年 10 月 7 日正式发布最终指引及反馈回应文件。
2. **国际背景**：指引发布同期，金融稳定理事会（FSB）也就金融机构负责任采用 AI 的良好实践开展咨询——MAS 指引与 FSB 方向一致。
3. **适用范围**：覆盖所有金融机构（银行、保险、资管、支付等）与所有 AI 技术形态；机构需同时在**企业整体（enterprise）与单个用例（individual use case）两个层面**管理 AI 风险。
4. **方法论定位**：指引采用原则导向（principles-based）、风险比例化（risk-proportionate）方式，允许机构根据自身 AI 使用规模、性质与风险重要性，选择最合适的达标路径。

## 二、四大监督期望逐条拆解

### 1. 强化监督、明确问责

金融机构应确保董事会和高管层对 AI 风险实施有效监督，包括设定清晰的角色与职责、风险偏好，以及风险管理框架、政策与程序。**两个务实安排值得注意：一是可沿用现有治理结构，只要其能提供充分监督与跨部门协调；二是不要求机构仅为达标而专门设立 AI 委员会。** 这降低了中小机构的合规负担，也避免"为设委员会而设委员会"的形式主义。

### 2. 全生命周期识别、评估与管理

机构应识别自身 AI 用途、按适当颗粒度维护**用例清单（inventories）**、评估各用例的风险重要性，并在整个生命周期应用比例化控制，具体包括：**数据治理、测试、人工监督（human oversight）、网络安全、运行监测与变更管理六类控制。** MAS 特别提示，随着可自主运行、调用工具的智能体系统增多，机构应定期检视这些控制；并将于 2027 年就是否需要智能体专项指引再次咨询业界。

### 3. 第三方 AI 风险管理

**核心原则是"机构对其交付服务中使用的 AI 持续负责，无论该 AI 由谁开发、运营或提供"——这明确覆盖了"嵌入式 AI"（把第三方 AI 能力嵌在采购的系统里）这一以往的模糊地带。** 机构应从第三方获取充分保证、评估第三方 AI 是否适合预期用途，并在存在现实约束或保证缺口时部署补偿性控制；**若风险无法纳入本机构风险偏好，应考虑限制、暂停或替换该第三方 AI 服务。**

### 4. 风险比例化应用

当 AI 工具或服务的性能不佳、不可用不太可能对机构、客户或其他方（含其他金融机构）造成重大影响时，机构可仅以基础政策与程序管理其 AI 使用；控制的范围与复杂度应与实际风险敞口相匹配。**这一条为低风险场景和中小机构留出了"轻量达标"通道。**

## 三、时间表与配套工具

1. **生效与过渡**：指引 2027 年 10 月 7 日生效，可分阶段实施——文件第 3–4 节（监督与生命周期）自 2027 年 10 月 7 日起达标，第 5–6 节（第三方与比例化）于 2028 年 10 月 7 日前达标，给出约一至两年准备期。
2. **操作手册**：按四部分组织，与指引对齐——范围与监督、AI 风险管理（用途识别、风险重要性评估、用例台账）、生命周期控制、能力建设。
3. **SAFR（Safeguards for Agentic Finance at Runtime）**：定位为智能体金融的运行时防护，位于智能体与其所操作系统之间，**在动作执行前评估每一项拟议操作**，与支付、结算、合规引擎、核心系统并行工作，按"单个智能体动作"粒度限制危害的跨机构传导与系统性放大。
4. **行业工具包**：MAS 联合行业开发，帮助机构把原则性要求操作化。

## 四、全球四大 AI 金融监管框架横向对照

| 维度 | 中国·金发〔2026〕8号文 | 新加坡·MAS AI RM 指引 | 美国·SR 26-2 | 欧盟·AI 法案 |
|---|---|---|---|---|
| 发布时间 | 2026年6月 | 2026年10月7日 | 2026年4月17日 | 已生效、分阶段适用 |
| 文件性质 | 指导意见（32项） | 监督指引（原则导向） | 修订模型风险管理指引 | 法规（风险分级） |
| 治理责任 | 董事会统筹、谁使用谁负责 | 董事会/高管监督，可沿用现有结构 | 董事会与高管治理控制 | 提供者/部署者义务 |
| 适用对象 | 银行保险机构 | 所有金融机构、全部 AI 形态 | 主要面向 300 亿美元资产以上机构 | 按风险等级分类 |
| 生命周期 | 全生命周期、评估退出 | 用例清单+六类控制 | 开发实施、验证监测 | 高风险全流程义务 |
| 第三方 | 自主可控、来源审查 | 机构持续问责、补偿性控制 | 新增供应商/第三方专节 | 供应链义务 |
| 智能体/生成式 | 纳入并要求稳妥 | 覆盖，2027年再出专项咨询 | 暂不在本次范围 | 高风险含信贷、招聘 |
| 关键时点 | 已要求落实 | 2027/10、2028/10 分阶段 | 已发布、非强制执法口径 | 借贷高风险义务 2027/12/2 |

需要说明：**美国 SR 26-2 由美联储、OCC、FDIC 联合发布，取代 2011 年的 SR 11-7 及 SR 21-8，保留了 SR 11-7 的概念架构（开发实施使用、验证监测、治理控制），新增供应商与第三方产品专节，采取风险比例化方法；据公开解读，其主要适用于 300 亿美元资产以上机构，生成式与智能体 AI 暂未纳入本次修订范围。**

## 五、对银行业的深度分析（风险管理视角）

1. **治理设计应"重实效、轻牌子"。** MAS"不必新设 AI 委员会、可沿用现有结构"与中国部分机构争相设立 AI 委员会的热闹形成对照。银行应优先确保治理职能有效运转、跨部门协调顺畅，而非追求组织形式上新——这与平安银行办法强调的"有名有实"方向一致。
2. **用例清单是所有后续工作的起点。** 四套框架都隐含一个前提：机构必须先摸清"自己在用多少 AI、在哪里、风险多大"。建议银行建立统一 AI 用例台账，字段至少含业务用途、模型来源（自研/开源/第三方/嵌入式）、数据敏感度、人工干预点、风险等级与责任部门。
3. **第三方与嵌入式 AI 是当前最大盲区。** 银行大量 AI 能力随外部系统、SaaS、模型 API 进入，MAS 的"持续问责+补偿性控制+无法纳入偏好即替换"给出了完整处置链条；银行应重检采购合同的审计权、模型说明义务与退出条款，并把第三方 AI 纳入外包与集中度风险管理。
4. **比例化原则要落到差异化控制。** 对低风险、影响有限的场景用轻量流程，对授信决策、面客服务、资金操作等高风险场景用全套控制——平均用力既浪费资源、又会在关键处失守。
5. **智能体监管仍在窗口期，应提前对标。** MAS 的 SAFR"执行前逐动作评估"与我此前分析的 VERA、HOP"探索与提交分离"高度一致；银行可提前在智能体平台内建运行时关卡，待 2027 年各法域细则落地时平滑衔接。
6. **跨境机构应建"一张合规映射图"。** 四套框架原则趋同（治理、生命周期、第三方、比例化），但口径与时点不同；跨境银行宜以最严要求为基线设计统一控制体系，再按各法域差异裁剪，避免重复建设与合规套利。

## 结语

MAS 指引的价值，不仅在于又多了一套规则，而在于它用"原则导向 + 风险比例 + 明确过渡安排"给出了一份可操作的 AI 风险治理底稿，并坦率地把智能体这一未解课题留到 2027 年继续打磨。**全球 AI 金融监管正在收敛出共同语法：治理要实、清单要清、第三方要管、控制要与风险匹配。** 对银行风险管理者而言，真正的功课是把这套语法转译成本机构的台账、合同条款、控制动作与跨境合规地图，在明确的边界内把 AI 的红利兑现为可核验、可审计的业务价值。

（注：本文事实与引语均来自 MAS 官方文件及文末列出的监管资料与权威解读，标注日期；各框架适用门槛、时点等以官方原文为准，文中已分别说明，不构成法律或投资意见。）
