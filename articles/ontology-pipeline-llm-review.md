---
title: "本体构建方法论综述：Talisman 六阶段管线与 LLM 参与构建的实证，以及银行场景仍缺的三块"
date: 2026-10-02
description: "本文综述两篇 2025–2026 年的本体构建方法论文，并对照我们已交付的银行资产保全本体骨架，找出三处仍然缺失的环节。第一篇是 Jessica Talisman 的 Ontology Pipeline 框架（六阶段：受控词表、元数据标准、分类法、叙词表、本体、知识图谱，每阶段绑定具体 W3C 标准），第二篇是 ICEIS 2025 的《Pipeline for Ontology Construction Using a Large Language Model》，它把 ChatGPT 塞进 Noy & McGuinness 的 Ontology Development 101 七步法做经验报告，记录了每一步的失效模式。两篇都不提供 SHACL 形状的可复用模板，也不涉及能力问题。对照我们 657 三元组的银行本体骨架，识别出三块缺口：能力问题缺失、SHACL 约束缺失（我们的 mappingLoss 校验规则目前只是注释而非机器约束）、以及元数据标准与叙词表两层被跳过。本文同时说明我们为什么不用 LLM 生成 FIBO 映射——论文实证了 ChatGPT 会编造不存在的本体。"
tags: ["本体建模", "知识图谱", "SKOS", "SHACL", "能力问题", "LLM", "FIBO", "语义层", "技术风险", "方法论"]
schema_type: "Article"
references:
  - title: "Pipeline for Ontology Construction Using a Large Language Model: A Smart Campus Use Case（ICEIS 2025, pp. 97-104, DOI 10.5220/0013096000003929）"
    url: "https://www.scitepress.org/Papers/2025/130960/130960.pdf"
    source: "SCITEPRESS"
  - title: "The Ontology Pipeline（框架原文，2025-01 首发）"
    url: "https://jessicatalisman.substack.com/p/the-ontology-pipeline"
    source: "Jessica Talisman — Intentional Arrangement"
  - title: "The Ontology Pipeline, Refreshed（2026-03 加入治理与 AI 协作两个维度）"
    url: "https://jessicatalisman.substack.com/p/the-ontology-pipeline-refreshed"
    source: "Jessica Talisman — Intentional Arrangement"
  - title: "Ontology Pipeline Studio（配套工具，含各阶段技术栈的明确说明）"
    url: "https://jessicatalisman.substack.com/p/ontology-pipeline-studio"
    source: "Jessica Talisman — Intentional Arrangement"
  - title: "Ontology Pipeline 书籍页（Technics Publications, 2026，SKOS/Dublin Core/RDFS/SHACL/SPARQL 各阶段绑定标准）"
    url: "https://technicspub.com/ontology-pipeline/"
    source: "Technics Publications"
---

## 为什么写这篇

我们已经在本站发表过两轮关于本体建模的文章，主题是"用 FIBO 建模银行资产保全"，结论是"FIBO 不覆盖这个领域，必须自建"。随后我们交付了一套可导入的本体骨架。

那套骨架做完之后有两个问题没解决。一是我们自己知道有缺口，但没查清业界有没有现成答案。二是我们凭什么叫自己那套方法是对的——如果只是"我们这么选了"，那和拍脑袋没区别。

这两件事都需要外部文献来校准。本文综述两篇方法论文，并对照我们自己的产出，明确列出仍然缺失的部分。

**两篇文献都没有直接给出银行场景的答案。** 但它们各自暴露了不同的东西：一篇讲清了这套系统该怎么分层，另一篇实证了用大模型参与构建会在哪里翻车。

## 第一篇：Talisman 的 Ontology Pipeline 框架

### 基本事实

Talisman 是人，不是机构。**Jessica Talisman, MLS**，25 年职业生涯，做过 Adobe（架构支撑 Digital Experience 生态的 RDF 知识图谱）与 Amazon（信息架构与分类法）。

| 项 | 内容 |
|---|---|
| 框架首发 | 2025 年 1 月，Substack《Intentional Arrangement》 |
| 书籍 | *Ontology Pipeline: A Framework for Building Knowledge Infrastructures*，Technics Publications，2026 |
| 刷新版 | 2026 年 3 月，新增治理与 AI 协作两个维度 |
| 配套工具 | Ontology Pipeline Studio，2026 年 9 月 |
| 方法论来源 | 自述来自六家机构十年实施的归纳 |

框架已注册为商标 `Ontology Pipeline®`。

### 六个阶段与顺序约束

| 阶段 | 做什么 | 绑定技术 |
|---|---|---|
| 1 受控词表 | 对齐标签、定义、同义词 | — |
| 2 元数据标准 | 结构性 / 描述性 / 管理性元素 | **Dublin Core Terms** 应用配置文件 |
| 3 分类法 | 父子层级 | **SKOS** |
| 4 叙词表 | 层级外的等价、横切、匹配关联 | **SKOS**（需要独立标签记录处用 SKOS-XL） |
| 5 本体 | 类、属性、逻辑推理 | **RDF Schema** + 精简 OWL 框架 |
| 6 知识图谱 | 前五者综合，可查询 | **SPARQL** |

第 5 阶段另外复用了 PROV-O、FOAF、Schema.org、DCAT，并以**能力问题（competency questions）** 作为系统设计的启发式，以 **SHACL 形状** 承载类与属性无法表达的规则。

### 三个值得采纳的判断

**分层可诊断。** 她指出知识图谱最常见的失败是「不按阶段建，最后变成查不出问题在哪一层的黑盒」。分层给了每层独立控制面。

**治理不是文档。** 刷新版里最锋利的一句是「本体部署那天就是它开始漂移的那天。维护不是项目末尾的阶段，维护就是项目本身。」

**AI 的边界划得清楚。** 她强调是「用机器加速人的工作，而不是把建模判断交给机器」——让机器提候选、标不一致、跑推理机、拿能力问题测 SPARQL 查询。

### 一个书目上的坑

`bookpage` 与 technicspub 对书名不一致：前者作 *A Framework for Building Knowledge Infrastructures*，后者作 *A Framework for Knowledge Engineering*。**大概率是 2026 年改过书名，但我没找到改名公告。若要引用，请以版权页为准。**

## 第二篇：ICEIS 2025 的 LLM 本体构建管线

### 基本信息

| 项 | 内容 |
|---|---|
| 标题 | Pipeline for Ontology Construction Using a Large Language Model: A Smart Campus Use Case |
| 作者 | Daniel Lichtnow (UFSM)、Ana Marilza Pernas Fleischmann (UFPel)、Leonardo Vianna do Nascimento (IFRS)、Guilherme Medeiros Machado (LyRIDS, 巴黎)、José Palazzo Moreira de Oliveira (UFRGS PPGC) |
| 出处 | ICEIS 2025 第 27 届，波尔图，Volume 2，pp. 97–104，SCITEPRESS |
| DOI | 10.5220/0013096000003929 · CC BY-NC-ND 4.0 |
| 形态 | Short Paper / 经验报告 |

**页数已核实：PDF 确为 6 页**，与引用的 97–104（8 页）不符，但 ICEIS 短论文本就是 6 页，不构成版本问题。

论文自己划清了边界：

> Our work intends **not** to create a new methodology for ontology construction, but to explore how these tools can assist in the ontology-building process, **acknowledging that they may not fully automate it**.

骨架是 Noy & McGuinness 的 *Ontology Development 101* (2001)，走步骤 1 至 6，**跳过步骤 7（实例创建）**。用旧方法论是为了保证一定程度的可复现性。

### 七条经验教训（原文要点）

**其一，LLM 不能是唯一知识来源。** 要求它给概念有用，尤其步骤 3 识别术语；但必须从外部资源提供定义。做法是简化的 RAG——把论文里的定义塞进提问。

**其二，LLM 会编造不存在的本体。** 原文：*initial responses from ChatGPT even included non-existent ontologies*。所以问过之后必须再检索核实。他们建议未来用 ChatGPT Search 配合 Chain-of-Verification。

**其三，给术语设数量目标。** 步骤 3 他们任意要求了 100 个术语，并诚实标注这个做法需要进一步评估。

**其四，步骤 4 的正确顺序是：先分类、再建层级、再增量修正。**

**其五，无状态是本体任务的真问题。** 原文：「*ChatGPT operates in a stateless manner, it does not retain a memory or a persistent state between individual interactions. This is a problem for ontology construction (**certainly a task that takes many days**).*」对策是尽量用同一会话；另开会话即归零。提到 Letta 作为可能解法。

**其六，先生成 OWL/RDF 再关联已有本体，这一步需更多打磨。** 他们试过链接到 DBPedia、SSN 本体，LLM 有时能给对关系，但集成这些本体是持续性挑战。

**其七，协作受阻。** 希望多人共享同一会话共同定义本体，但 ChatGPT 不支持多人交互同一会话。

### 三个步骤的具体故障

**步骤 4 的 Places 类**记录最详细。ChatGPT 超出要求，自行把地点概念分成八类（Smart Buildings、Campus Facilities、Recreational Areas、Innovation and Learning Spaces、Administrative Offices、Event Spaces、Student Housing、Campus Grounds）。核心错误是**把 Classroom 当作 Buildings 的子类**。三轮修正才压住，原文列明：

> (i) Smart Classrooms and Classrooms are not buildings; (ii) Laboratories, Offices, and Administrative Offices are not subclasses of Building; (iii) replace "Parking Management" with "Parking"

一个操作性要点：**必须把先前生成的术语列表一起给 ChatGPT，再要求它建类与子类。**

**步骤 5** 偏离了 OD101 原文建议（用步骤 2 的术语定义属性），改用步骤 3 的全部术语建层级后，让 ChatGPT 为每个类生成属性。首次生成**遗漏了与其他个体之间的关系类属性**，于是引用 OD101 原文要求按内在、外在、关系三类重做。

**步骤 6** 三个障碍：单次响应约 4096 字符上限；**另开会话导致回退**（`SmartRoom` 又变回 `Building` 子类）；最终用 Protégé 手工修正。

### 一处需要澄清

**SPARQL 在文中只出现一次，且不在步骤 1–6 的实践里**——它在相关工作综述中提到他人把自然语言转成 SPARQL，紧接着说「*A detailed analysis revealed that the generated results contain mistakes, of which some are subtle*」。这篇论文**没有**报告自己生成 SPARQL 的情况。

**Competency questions 全文零命中**，这篇论文完全没涉及。

### 作者自述的方法论缺陷

他们承认：**本应做有无管线的对照实验，但做不了**——因为 Smart Campus 这个案例没有可比对的既有本体。

## 对照我们已交付的骨架

我们的银行资产保全本体骨架 `ontology/preservation/` 共 657 三元组：

| 文件 | 内容 | 导入 FIBO |
|---|---|---|
| `AnnotationVocabulary.rdf` | `hasMaturityLevel`、`mappingLoss`、`mappingBasis` | 否 |
| `CollateralScheme.rdf` | 押品分面码表，四个正交分面，29 个 SKOS 概念 | 否 |
| `Lifecycle.rdf` | 案件、6 个逾期阶段、8 项保全措施、顺位 1–6、7 类角色 | 否 |
| `Mapping.rdf` | 33 条到 FIBO 的显式有损映射 | **是** |

按 Talisman 的六阶段对照：

| 阶段 | 我们的状态 |
|---|---|
| 1 受控词表 | 有（押品分面码表） |
| 2 元数据标准 | **缺** |
| 3 分类法 | 有（SKOS 分面） |
| 4 叙词表 | **缺**（只有 `skos:related`，没有 SKOS-XL 的完整关联结构） |
| 5 本体 | 有（OWL + FIBO 映射） |
| 能力问题 | **缺** |
| SHACL 形状 | **缺** |
| 治理 | 部分（有 maturity 标注，无变更管理流程） |

**两篇文献都没有提供 SHACL 形状的可复用模板，也没有一份涉及能力问题。** 这两块不是我们遗漏了答案，是两个来源都没有答案，得自己写。

## 三块缺口的性质不同

**其一，SHACL 约束——我们有规则，但只是散文。**

`AnnotationVocabulary.rdf` 里把 `mappingLoss` 的语义写成注释：「缺注记者视为有损并失败」。这是**给人看的**。而我们明明有 33 条可被机器检验的映射目标。

这一条本该是 SHACL 形状：强制每条映射目标必须带 `mappingLoss` 或明示无损的 `mappingBasis`。我们目前的做法是**用一个技术校验脚本在构建时检查**（33 条目标，25 条声明有损，8 条明示无损，缺注记 0）——但那只在构建时生效，进不了运行时。

**其二，能力问题——一个都没有。**

我们所有验证都是技术性的：XML 良构、RDF 可加载、指向 FIBO 的 `subClassOf` 为 0、映射注记覆盖率。**没有一条问题是业务会问的。**

Talisman 明确把能力问题列为系统设计的启发式，ICEIS 那篇完全没碰。这个缺口最实操：一份写不出问题清单的本体，无法回答"它够不够"。

**其三，元数据标准与叙词表两层被跳过。**

我们没有 Dublin Core 配置文件做资产元数据。押品码表只有 `skos:related`，而 Talisman 强调叙词表阶段要用 SKOS-XL 编码等价、横切、匹配关联——**这正是 `skos:related` 不够用的地方**，我们当时以为它够用了。

## 我们为什么不用 LLM 生成 FIBO 映射

ICEIS 那篇给了直接依据。ChatGPT 在步骤 2 会**编造不存在的本体**（原文原话），而我们做的正是步骤 2 类工作——找现成本体、核实可复用性。

我们当时是逐条 `grep` clone 源码核实 FIBO 的 IRI、前缀、继承链与定义文本。当时把这当作严谨，现在看这是**必须的**：在同等场景下 LLM 会直接编出看似合理的 `fibo-xxx` 前缀与类名。

论文还印证了另一点：LLM 在**层级推理（isa 关系）**上最容易出错，在**枚举与汇总**上最可靠。这与我们遇到的完全一致——FIBO 的类名、IRI、前缀这类"查得到的事实"能给出方向，而"哪个类该是哪个类的子类""这四条映射哪些有损"这类判断必须人来定。

### 一个被论文暴露的实际风险

论文指出 ChatGPT 无状态，且**另开会话会导致层级回退**（`SmartRoom` 变回 `Building` 子类）。

我们的映射是逐条写入文件而非依赖对话上下文，结构上免疫。但反过来说：**如果将来有人靠对话记忆维护这 33 条映射，而不落到文件里，就会出现论文描述的那种回退。**

建议在 README 里加一条硬约束：**映射的权威来源是 `Mapping.rdf` 文件，不是任何对话记录。**

## 一处流程交代

综述 ICEIS 那篇时，我第一次的 PDF 提取失败了——文件被工具的 UTF-8 解码路径损坏，82,289 个字节替换为 U+FFFD，85 个 FlateDecode 流全部无法解压，论文正文一个字符都取不出。

重新用 `curl` 下载原始字节后得到 224,692 字节、零污染的文件，34,866 字全部可提取。**本文引用的 ICEIS 内容全部来自这次干净提取**，包括经验教训七条的原文表述。

这个细节值得记一笔，因为它就是论文本身的教训在实际工作中重演了一遍：**工具链的隐式状态损坏不会报错，只会静默返回空结果。**

## 本文结论的边界

**已核实的事实。** Talisman 框架内容来自其 Substack、官网、Studio 公告等免费公开材料。ICEIS 论文内容来自干净重新下载的 PDF（224,692 字节），七条经验教训为原文要点，步骤 4、5、6 的故障描述为原文引述。

**本文的判断。** 三块缺口的识别、与我们骨架的对照、以及"必须补 SHACL 而非维持构建时脚本"的建议，是分析结论，不是两篇文献的直接结论。

**未能核实的。** Talisman 书籍正文我没有访问（付费出版），本文关于其技术栈绑定的信息来自 Studio 公告与书籍页营销材料。书中是否有更细的实现规范说明，无法确认。另，Talisman 框架在银行业、金融业、语义网领域是否有任何实际部署案例，我没有查到——本文不主张它已被该领域验证。

**一处待确认。** Talisman 的书名在官网与出版商页面不一致（Building Knowledge Infrastructures vs Knowledge Engineering），疑为 2026 年改名，未找到公告。引用请以版权页为准。

*作者毕超，金融行业风险管理从业者。本文仅代表作者个人观点，不构成任何机构立场。*

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "本体构建方法论综述：Talisman 六阶段管线与 LLM 参与构建的实证，以及银行场景仍缺的三块",
  "datePublished": "2026-10-02",
  "description": "本文综述两篇 2025–2026 年的本体构建方法论文，并对照我们已交付的银行资产保全本体骨架，找出三处仍然缺失的环节。第一篇是 Jessica Talisman 的 Ontology Pipeline 框架（六阶段：受控词表、元数据标准、分类法、叙词表、本体、知识图谱，每阶段绑定具体 W3C 标准），第二篇是 ICEIS 2025 的《Pipeline for Ontology Construction Using a Large Language Model》，它把 ChatGPT 塞进 Noy & McGuinness 的 Ontology Development 101 七步法做经验报告，记录了每一步的失效模式。两篇都不提供 SHACL 形状的可复用模板，也不涉及能力问题。对照我们 657 三元组的银行本体骨架，识别出三块缺口：能力问题缺失、SHACL 约束缺失（我们的 mappingLoss 校验规则目前只是注释而非机器约束）、以及元数据标准与叙词表两层被跳过。本文同时说明我们为什么不用 LLM 生成 FIBO 映射——论文实证了 ChatGPT 会编造不存在的本体。",
  "keywords": [
    "本体建模",
    "知识图谱",
    "SKOS",
    "SHACL",
    "能力问题",
    "LLM",
    "FIBO",
    "语义层",
    "技术风险",
    "方法论"
  ],
  "author": {
    "@type": "Person",
    "name": "毕超",
    "jobTitle": "金融行业风险管理从业者"
  }
}
</script>

## 常见问题

Q: 我们为什么不采用 Talisman 的六阶段管线作为方法论？
A: **因为我们已经在实践中踩过它警告的坑，反着走了。** 她的第1 阶段是受控词表、第 3 阶段才是分类法，理由是「你不能在未定义的词表上建分类法」。而我们的实际顺序是：先查 FIBO 能不能用（得出不能用的结论），再设计银行自己的码表，最后建本体。**我们是先做了她的第 3、5 阶段，再回头补第 1 阶段。** 这个顺序在实践中可行，是因为我们的码表很小（10 个押品条目、4 个分面），词表治理的负担不重。但如果押品条目扩到几百个、且分散在多个业务条线，按她的顺序做是对的。**六阶段不是教条，是针对"词汇混乱"这种具体病症的处方。**
Q: SHACL 具体能补上什么？我们的映射校验不是已经有脚本了吗？
A: **区别在于生效时机与强制力。** 我们现有的脚本是构建时检查，跑一次就结束，不进运行时。SHACL 是数据进仓库时的运行时闸门。**具体能表达的是这样的规则：凡是通过 `denotes` 映射到 FIBO 概念的对象，必须至少带一条 `mappingLoss` 或明示无损的 `mappingBasis`；违反就拒绝，而不是记一条警告。** 这条规则用现在的脚本实现要自己写校验逻辑，用 SHACL 是一个形状文件。对银行场景有意义——押品数据要持续入库，人不可能每次手工核 33 条映射的注记完整性。
Q: 能力问题该怎么写？给几个例子？
A: **问业务会问、且必须查图才能答的问题。** 例如：某笔不良案件的全部押品中，处置难度为"无实际处置价值"的有几笔、占比多少；进入诉讼阶段的案件里，有几笔尚未指定当事方角色；同一押品是否被多个案件同时引用为担保；顺位为第三顺位及以上的案件在全部案件中的分布。**这类问题的特点是：SQL 答不上来，只有把码表、生命周期、映射三层连起来才答得出。** 反例是"押品有哪些类型"——那只是查码表，不需要本体。目前我们一条都没有。
Q: ICEIS 那篇论文的结论适用于金融业吗？
A: **不适用，而且差距很大。** 那篇是 Smart Campus 案例，领域概念简单（教室、实验室、停车），且论文自己承认**无法做有无管线的对照实验**，因为没有可比对的既有本体。金融业的差异在于：领域本体已有大量既有资产（FIBO、CDM、监管报送口径），核心难点不是"从零建模"而是"与既有资产对接并管理漂移"。**ICEIS 那篇里 LLM 的失效模式（编造不存在的本体、层级推理出错）在我们场景下后果更严重——因为错误的对接会指向一个看似存在的标准。** 可迁移的是它对"无状态"和"上下文丢失"的分析，不可迁移的是它对 LLM 能力的乐观程度。
Q: 那这两篇文献有没有推翻我们之前的结论？
A: **没有一条推翻。** 我们之前的结论是：FIBO 不覆盖资产保全，业务层必须自建，映射有损必须显式标注。这两篇文献都不涉及 FIBO，也没有针对金融业不良处置的覆盖，所以既不支持也不反对我们的结论。**它们改变的是"方法是否充分"，不是"FIBO 是否有覆盖"。** 补充一点：ICEIS 那篇实证了 LLM 会编造不存在的本体，这反向支持了我们当时逐条 grep 源码核实 FIBO IRI 的做法——在同场景下凭 LLM 输出写映射是会出事的。
Q: 既然文献没给答案，那这三块缺口该怎么补？
A: **缺口三（叙词表关联）最快，用 SKOS-XL 换掉 `skos:related` 即可，不需要新增概念。** 缺口一（SHACL）次之，一条形状文件，能把构建时脚本升格为运行时闸门。**缺口二（能力问题）最难但最关键——它不是技术活，是逼着我们回答"这套本体到底能回答什么业务问题"。** 如果写不出十条业务方认可的问题，那说明这套本体的范围划错了，应该回到设计阶段而不是继续往前建。**我建议按这个顺序：先做叙词表，再做 SHACL，最后停下来写能力问题。** 前两项是补工程债，第三项是补设计验证——顺序反了会白建。
