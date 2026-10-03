---
title: "指标算得对≠机器能推理：上下文图、本体与银行 AI 的真实缺口"
date: 2026-10-03
description: "Atlan 联合创始人 Prukalpa Sankar 推广的一篇长文提出：语义层（指标定义、计算逻辑、原始数据）没有推理能力，而大模型需要上下文图，因此指标优先的范式正在终结。本文完整解读其技术主张——YAML 能声明度量却无法声明逆属性、属性链、对称属性与传递推理，这是能力差异而非程度差异；并对照中国银行业的实际做三点校正。第一，监管已经回答了要不要建：国家金融监督管理总局金发〔2026〕8号（2026-06-18）第十一条明确要求构建核心知识模型、建立知识萃取整合共享机制流程，第八条要求强化元数据管理并构建数据资产地图。第二，瓶颈不是人手：上海银行公开材料主张组建本体攻坚特战队、从业务条线选拔骨干与科技架构师混合编组，并采用最小可行本体策略；该工种在中国银行业不存在任何岗位需求。第三，LLM 没有消除门槛：LLMs4OL 2024 挑战赛中，传统 ML 队伍在同一分类发现子任务（DBO）上 F1 为 0.2109，LLM 队伍仅 0.0164；能力问题正确建模率为 0.91 与 0.84（简单）、0 与 0.66（复杂）；LLM 生成的能力问题仅 40–53% 被领域专家判定为可接受。arXiv:2503.05388 证明“新手 + LLM 草稿”可超过纯新手水平，但交付物为草稿而非可投产本体——迄今仍无已发表研究证明无本体工程训练背景的团队交付过可投产运行的领域本体。本文同时标注作者的商业立场，并给出银行可执行的三步路径与能力问题清单。"
tags: ["语义层", "知识图谱", "上下文工程", "本体", "指标平台", "大模型", "银行AI", "数据治理", "技术风险"]
schema_type: "Article"
references:
  - title: "The Relaunch of OntologyPipeline.com（视频与要点：Contexts Graphs: The Next $1T Opportunity，Session 2 讲者阵容）"
    url: "https://x.com/prukalpa/status/2014577133608480927"
    source: "X / @prukalpa"
  - title: "Context Graphs: A Multi-Dimensional Context Problem（原始长文，含 YAML 与 Turtle 对照、能力问题生成实测）"
    url: "https://jessicatalisman.substack.com/p/context-graphs-and-process-knowledge"
    source: "Jessica Talisman — Intentional Arrangement"
  - title: "国家金融监督管理总局关于银行业保险业人工智能安全开发应用的指导意见（金发〔2026〕8号）"
    url: "https://www.nfra.gov.cn/cn/view/pages/governmentDetail.html?docId=1261784&generaltype=1"
    source: "国家金融监督管理总局"
  - title: "中国银行保险监督管理委员会关于印发银行业金融机构数据治理指引的通知（银保监发〔2018〕22号）"
    url: "https://www.gov.cn/zhengce/zhengceku/2018-12/31/content_5450808.htm"
    source: "中国政府网"
  - title: "金融科技丨上海银行以「本体论+三层约束」巧解银行业AI落地难题（上海市银行同业公会金融科技专业委员会供稿，上海银行人工智能研究课题组）"
    url: "https://www.jfdaily.com/sgh/detail?id=1748693"
    source: "解放日报 / 上观新闻"
  - title: "LLMs4OL: Large Language Models for Ontology Learning（ISWC 2023，Babaei Giglou、D'Souza、Auer）"
    url: "https://link.springer.com/chapter/10.1007/978-3-031-47240-4_22"
    source: "Springer / ISWC 2023"
  - title: "LLMs4OL 2024 Challenge（arXiv:2409.10146，分类发现任务 F1 与关系抽取实测）"
    url: "https://arxiv.org/pdf/2409.10146"
    source: "arXiv"
  - title: "NeOn-GPT（ESWC 2024 Satellite Events，Fathallah 等，LLM 本体构建的能力边界与形式化缺陷）"
    url: "https://link.springer.com/content/pdf/10.1007/978-3-031-78952-6_4"
    source: "Springer / ESWC 2024"
  - title: "When Does Bigger Help? A Controlled Study of LLM Scale for Ontology Learning（arXiv:2608.31118，模型规模对本体学习的影响）"
    url: "https://arxiv.org/abs/2608.31118"
    source: "arXiv"
  - title: "The Industrial Ontologies Foundry（IOF） perspectives（NIST，工业领域本体采纳与复用现状）"
    url: "https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=925879"
    source: "NIST"
  - title: "A Replicated Survey of IT Software Project Failures（IEEE Software，El Emam、Kharshah、Koru，实测失败率与公众认知差距）"
    url: "https://ruor.uottawa.ca/server/api/core/bitstreams/e07b304b-1836-409c-9a7a-8fd3098d9637/content"
    source: "IEEE Software"
---

## 先说结论

那篇长文的**技术主张是对的，我说错了一半**。

它对在：语义层与本体的差别不是"哪个更高级"，而是**能力有无**。它错在：它把这件事讲成了一场路线之争，而银行的问题不是选哪条路线，是**监管已经把路线定成了一条，但没人知道怎么走**。

本文分三部分：先讲清那篇文章的技术内核（用它的代码对照），再讲中国银行业的三点校正，最后给可执行路径。

**关于信源**：本文解读的是 Atlan 联合创始人 Prukalpa Sankar 于 2026 年 1 月推广的一篇长文，原作者为 Jessica Talisman。**作者立场需要先标明**：Prukalpa 是 Atlan 联合创始人，Atlan 的产品定位正是"上下文层"，而文中列出的五个视角里有一项就叫"Universal Context Layer"，由他本人代表。**这不是中立综述，是有商业立场的技术论述。** 但它引用的技术文献与实测数据是真实的，我在第三部分逐条核验了出处。

## 一、技术内核：能力差异，不是程度差异

那篇文章最有力的一段，是两组代码的对照。

**语义层这边**（dbt Semantic Layer / MetricFlow 的真实配置）：

```yaml
semantic_models:
  - name: orders
    defaults:
      agg_time_dimension: order_date
    entities:
      - name: order_id
        type: primary
    measures:
      - name: order_total
        agg: sum
```

它声明了度量、聚合方式、时间维度、实体主键。**这个文件里没有任何位置**可以声明"订单与客户互为逆属性"、"订购商品蕴含购买某商品"、"某商品常与某商品同购"。

**本体这边**：

```turtle
:Alice :placedOrder :Order001 .
:Order001 :hasItem :Item001 .
:Item001 :itemProduct :Laptop .
:Alice :customerLifetimeValue "1250.00"^^xsd:decimal .

# 推理机自动得出：
:Alice a :HighValueCustomer .        # 类推理
:Alice :purchased :Laptop .          # 属性链推理
:Order001 :orderedBy :Alice .        # 逆属性
:Laptop :frequentlyBoughtWith :Mouse . # 对称属性
:Alice :knowsCustomer :Carol .       # 传递推理
```

**关键在于：右侧那五条推论是免费的。** 只要关系声明对了，推理机自己就能推出来。左侧的 YAML 无论怎么扩展，都无法声明这五种关系中的一种——不是写得不够多，是**这个格式里没有对应的语法位**。

文章给了一个很好的一句话总结：

> A semantic layer tells you things like what your revenue is or how many times a web page was visited more reliably, by normalizing text labels in natural language.
>
> Semantic layers are built for analysis, helping humans consume data through BI tools, using natural language. **Ontologies are built for reasoning**, helping systems and AI understand domains well enough to disambiguate data, discover context, make inferences, and support decisions.

**用银行场景检验这个差别。** 一个借款人同时满足三个条件：已逾期、已有生效判决、名下押品处于第三顺位。这是三个关系上的条件联合。指标层能回答"逾期天数是多少"，但"这个案子能不能执行"需要跨关系推理——**那不是 `SUM(...) WHERE ...` 能表达的**。

这条技术判断我认为是成立的。下面要说的是：它在银行业落地时，约束不在技术。

## 二、三点校正

### 校正一：监管已经把路线定完了

那篇文章写作时（2025 至 2026 年初）大概还没看到这份文件。**2026 年 6 月 18 日，国家金融监督管理总局发布金发〔2026〕8号《关于银行业保险业人工智能安全开发应用的指导意见》，科技监管司，索引号 717804719/2026-365。**

我从金融监管总局官网接口取到了原文并逐条核对了条款序号（一至三十二条连续无缺）。**第十一条「推进知识工程建设」原文**：

> （十一）推进知识工程建设。支持金融机构构建企业级知识管理体系。坚持服务业务的价值导向，**构建核心知识模型**，建立**知识萃取、整合、共享**机制流程，建立从知识创建、审核、发布、更新到归档的全流程管理规范。鼓励利用人工智能技术提升知识萃取、表示、融合和对齐能力。

**第八条**还要求：

> 构建企业级**数据模型**和**数据资产地图**，强化**元数据管理**，确保数据可寻可用，不同类型的数据可兼容，数据源头可追溯。

**第二十二条**要求涉及客户权益或有实质性财务影响的关键决策须设人工复核节点，并**完整保留原始数据、推理路径及阈值触发记录**。

**第二十五条**明确列出「防范提示词注入、思维链注入、多模态攻击、**上下文污染**等威胁」。

三点值得注意：

**其一，「上下文污染」这个词已经进了监管文件。** 那篇文章通篇在论证上下文有多重要，而监管在同一时期已经把上下文污染列为需要防范的安全威胁。**语义层的指标定义防不住提示词注入，本体的推理规则可以——因为推理规则会被执行，YAML 声明不会。**

**其二，监管要的不只是模型，是"全流程管理规范"。** 从知识创建、审核、发布、更新到归档，五个环节都有要求。这与那篇文章讲的 PKO（程序与执行的二分）高度契合——**程序是抽象规范，执行是具体实例，两者都需要可追溯。**

**其三，这修正了我此前的一个判断。** 我在本站前几篇文章里写过"FIBO 在金融领域没有部署案例""该领域未经实践验证"。**金发〔2026〕8号改变了这个判断的基础**：不是没人做，而是刚被监管写成了要求。方向不再需要论证。

### 校正二：瓶颈不是人手，是方法

那篇文章末尾问了个问题：*"Are ontologies just another hype cycle?"* 这个怀疑是对的，而且**中国的数据恰好支持这个怀疑，同时又给出了相反的答案**。

**怀疑的一面**：NIST 的工业本体视角报告写道：

> few industrial enterprises are adopting ontologies in their work environment, and most of the projects listed in the table are **still at the level of research and have not been adopted as real-world solutions**.

> **The re-use of these developed ontologies from previous projects is not presently on the horizon**, as most of the available ontologies we have discussed here are **not interoperable**, and classes across the ontologies are frequently redundant or used in multiple different ways.

注意 NIST 指出的放弃原因是**不可复用、不可互操作**，不是缺人。

**答案的一面**：上海银行人工智能研究课题组 2026 年 5 月公开的《本体论+三层约束》是银行自己给出的方法论。其中三条对"缺人"这个假设是直接反驳：

> **（三）构建"桥梁型"人才梯队，打破业技壁垒。** 智能化转型的核心在人。银行需着力培养既懂金融逻辑又懂抽象建模的复合型人才。通过组建**"本体攻坚特战队"**等形式，**从各业务条线选拔骨干与科技架构师混合编组**，进行封闭式实战。

主语是"从各业务条线选拔骨干"，**不是外聘本体工程师**。而且它对短缺的表述是：

> 同时，**既懂金融又懂技术的复合型人才严重短缺**，成为制约转型的瓶颈。

**短缺的是复合型人才，不是本体工程师。** 加上它提出的策略：

> 应摒弃"大而全"的僵化建设思路，采取**联邦化架构与最小可行本体（MVO）**策略。各业务条线先建"域本体"，顶层仅定义核心概念。

以及治理安排：

> 必须成立由**行长牵头的跨部门"业务本体治理委员会"**，涉及风控的争议由**首席风险官裁决**，涉及监管报送由**合规官拍板**，让**业务专家成为立法者**。

**按最小可行本体策略，知识工程编制需求本来就被设计得很小。** 我搜遍了 2025 至 2026 年中国主要银行的招聘信息，找不到任何一家把"本体""语义层""知识图谱""知识表示"写进岗位要求的。人社部 2026 年二季度官方热门岗位榜单里也没有这个方向。对照之下，人工智能工程师需供比 2.62、数字后端工程师 6.43——**这个岗位在任何需供比数据里都不存在，因为它不是一个独立职业**。

银行的实际情况是：这项工作已经被吸收进数据架构、数据治理、业务分析这些岗位。工行 2023 年全集团数据分析师 9,375 人；上海农商行 2024 年成立行业研究院，下设 12 个研究分院、300 余人，"**绘制行业图谱**"是明确职责。

**所以准确的结论是：银行不缺人，缺的是方法。**

### 校正三：LLM 没有消除门槛

如果那篇文章的读者以为"等大模型更强就行了"，这里有实测数据。

**LLMs4OL 2024 挑战赛**（arXiv:2409.10146）的实测结果。这份榜单最值得看的不是某个孤立数字，而是**同一子任务上 LLM 队伍与传统 ML 队伍的直接对照**：

| 子任务 | 队伍 | 方法 | F1 |
|---|---|---|---|
| 分类发现 B.5（DBO） | silp_nlp | 传统 ML（RF / LR / XGBoost） | **0.2109** |
| 分类发现 B.5（DBO） | Phoenixes | LLM（Mistral-7B + DPR 检索） | 0.0164 |
| 分类发现 B.4（GO） | Phoenixes | LLM | 0.0164 |
| 分类发现 B.6（FoodON，零样本） | Phoenixes | LLM | 0.0308 |
| 非分类关系抽取 C.1（UMLS，少样本） | silp_nlp | 传统 ML | 0.0783 |
| 非分类关系抽取 C.1（UMLS，少样本） | Phoenixes | LLM | 0.0273 |
| 术语类型化 A.1（WordNet） | DSTI | 微调 Flan-T5-Small | **0.9716** |

**同一个 DBO 子任务上，传统 ML 拿到 0.2109，LLM+RAG 只有 0.0164——相差 13 倍。** 这是两支队伍各自的配置，不是受控对照实验，但方向明确。

论文自己解释了这个差距的来源——**它不是"LLM 不会生成"，而是两类方法的取舍正好相反**：

> Teams like silp_nlp often exhibit high precision but lower recall… **silp_nlp is adept at avoiding false positives**… However, teams such as RWTH-DBIS and Phoenixes display a different trend, where **recall is relatively higher than precision**. These teams retrieve a larger number of relevant results but **at the cost of precision**, indicating that they tend to capture a broad set of possible answers, including **many false positives**.

中文翻译：silp_nlp 走"少而准"（高精度、低召回），Phoenixes 走"多而全"（高召回、低精度）。**在需要判断"这两个概念谁更抽象"的分类发现任务上，"多而全"会被大量假阳性直接拖垮 F1。** 论文还记录了分类发现并非全无希望——在 Schema.org 子任务（B.2）上 F1 达到 0.6157。

论文记录的另一个实测结论：

> their results in both zero-shot and few-shot **fall shorter than the fine-tuned models** and this suggests that **still fine-tuning is the key to obtain a high performance within OL.**

**所以诚实的读法是：LLM 在"给一堆候选排序或打标签"上可用（术语类型化微调后 F1 0.9716），在"生成一个有层次的分类结构"上不可用。** 这不是模型大小的差距，是任务形态的差距——下面 NeOn-GPT 给出的形式化缺陷正是这个解释的机制层面。

**能力问题（competency questions）的生成质量**（LDK 2025，人工领域专家评判）：

> The questions outputted by the pipeline for both experiments were around 25% for scope and relevance out of the total evaluated, and when within scope, then they were for 69-75% relevant, with quality from an ontological viewpoint varying between **53% and 40%** as acceptable or good CQ for ontologies.

**能力问题的正确建模率：简单的答得对，复杂的塌掉**（arXiv:2503.05388）：

> the proportion of correctly modelled CQs was 0.91 and 0.84 respectively (0.94 and 0.89 by ignoring minor issues), with significantly lower scores for complex CQs (**0 and 0.66** respectively)

**这个 0 是有意义的，因为它出现在最容易的口径上。** 该论文的 Memoryless CQbyCQ 是**故意**把每条能力问题隔离建模、最后再合并，理由是长上下文会干扰模型。也就是说，上面这组数字是**每条问题单独送进去**、互不干扰的情况下测出来的——简单问题 0.91 / 0.84，复杂问题 0 与 0.66。

**换句话说：给 LLM 单独一条简单问题，它大概率答对；单独一条复杂问题，它可能一条都答不对。而银行本体的真实需求恰恰是复杂的那一类**——"已逾期 + 判决生效 + 押品第三顺位"这种三关系条件联合判断。

**NeOn-GPT**（ESWC 2024）给出了更根本的原因——LLM 生成的形式化结构有系统性缺陷：

> Class expressions in LLM-generated ontology are **generally limited to subsumption type and lack conjunction, and disjunction** expression types. … Similarly, **property restriction types are primarily limited to "HasValue" restrictions, the absence of cardinality, existential, and universal restrictions may limit the scope of class membership inferences during the reasoning step.**

**这句话值得反复读。** 它的意思是：LLM 生成的本体退化成了分类法——只有父子层级，没有合取、没有析取、没有基数限制、没有量词限制。**而没有这些，OWL 的推理能力就基本失效了。** 这正是第一部分那五条免费推论所需要的东西。

**模型规模也救不了**（arXiv:2608.31118，2026 年 8 月，13 个模型、四个本体）：

> **the effect of scale is neither monotonic nor uniform across tasks and domains.** … **Non-taxonomic relationship extraction remains difficult across model scales** … These findings show that **model size alone is an insufficient selection criterion for OL.**

**结论**：LLM 适合做候选生成、语法转换、格式检查，不适合替代建模判断。而"判断"这一步，恰好是本体的全部价值所在。

## 三、空白，以及最接近它的那篇论文

把上一部分的数据串起来，会得到一个比"缺人"更结实的论点。但我必须先把一个**对我不利**的事实摆出来，因为整个论证的可信度取决于它是否经得起反例检验。

**最接近这个论点的反例，是 arXiv:2503.05388 自己。** 摘要写得很直接：

> the model OpenAI o1-preview with Ontogenia produces ontologies of sufficient quality to meet the requirements of ontology engineers, **significantly outperforming novice ontology engineers** in modelling ability.

结论段更进一步：

> if cost is not an issue and commercial models can be used, then certainly **novice ontology engineers could benefit from such draft ontologies** generated by those LLMs. These drafts can increase modelling quality, and considerably reduce the effort and time to kick-start a modelling process.

**这是"无本体训练的新手 + LLM 草稿 > 纯新手"的直接证据，本文不能装作没看见。** 但它并不等于本文论点，差别有四处：

**一、产出是 draft，不是可投产交付。** 论文自己的定位是 kick-start a modelling process。评测基准是 10 个本体、100 条能力问题、29 个用户故事，辅以专家定性评估与 OOPS! 缺陷扫描器。

**二、对照组是 novice modeller，不是可用交付。** 论文用的基线是"无本体训练的新手建模者"，并且刻意把设定设计得对 LLM 有利（单条能力问题隔离建模、ontologist persona、Turtle 语法提示）。它证明的是 LLM 能替代新手的**起步劳动**，不是能替代工程师的**判断**。

**三、论文自己列了失败面。** 复杂能力问题正确率 0 与 0.66（上一节已引）；同一实验里较弱的 Llama-3.1-405B 生成的 superfluous elements 比例"接近 40%"；结论段承认 "common mistakes and variability of result quality"，并明确要求 "further tests ... to mitigate the potential leakage effect and bias in LLMs"。

**四、论文的落点仍在人在环内。** 它的做法是"给新手工程师草稿"，不是"让 LLM 独立交付"。人没有被移除，只是被移到了起点。

**所以修正后的论点更窄，但也更硬**：没被证明的，不是"LLM 不能帮人建本体"——这条已被否证；没被证明的是"**一支没有本体工程训练背景的团队，借助 Protégé 加 LLM，交付了一套可投产运行的领域本体**"。arXiv:2503.05388 恰好落在两者之间：**它交付的是草稿，交付者的技能要求是新手。**

其余正面报道仍把人在环内写成方法本身的设计：

- LDK 2025 的框架对象是「**the human ontology engineer and/or domain expert**」
- NeOn-GPT 的定位是「generating **base ontologies for enhancement through human-assisted knowledge engineering**」
- arXiv:2503.05388 确有「merging these partial solutions by **human-in-the-loop integration**」一句——但要读准它的位置：它出现在论文对**适用方法前景**的讨论里，指的是"存在一种有效策略能把这些局部解合并起来"；而它自己的 Memoryless CQbyCQ 与 Ontogenia 都是在流程内**自动**合并的（"all the resulting models, representing CQs, are merged at the end"）。**把这句话当成该论文的策略，是读错了它的主张。**

**没有人报道过"一支没有本体工程师的团队交付了可投产本体"。** 这个空白本身就是发现，而且是论证中最强的一环——因为它不是我的观点，是文献的沉默。而 arXiv:2503.05388 的存在把这个空白照得更清楚，而不是填上它：**它证明的是方法有效、门槛已降到"新手可用"**——于是银行的问题不再是"能不能做"，而是"谁来对结果负责"。

**工具是免费且成熟的。** Protégé 累计下载超过 130 万次、28 个版本、49 位贡献者，开源社区约 27 年维护史。**所以约束不是工具成本。**

**成本可以引用，但只能引工期与人力，不能引单价。** 银行科技项目的公开中标信息里，**找不到任何一条知识图谱、本体或语义层项目的预算或合同金额**——零。学术侧的成本估算工具（如 ONTOCOM）以人月为单位定价，并明确把本体构建、复用、**维护**列为三类独立成本。已知的实施实例是重庆银行的数智尽调平台，规划工期 12 个月、四个阶段，试点 8 家分支机构，累计处理任务近 300 条，产出上百份尽调报告、平均自动化完成率 60%——**而它用的是开源大模型加图数据库，约束逻辑由规则引擎而非本体承担。**

顺带纠正一个流传的数字：有文献称"某研究者估计本体长期维护占成本的 80%"。**这是 2005 年一位 IBM 研究者的个人估计，经数字图书馆文献二次引用流传至今**，不是测量值。同一篇文献的诚实说法是：

> **Information about cost is difficult to obtain, as most efforts are prototypes or commercial developments.**

**最后关于失败率，那篇文章说"大多数尝试构建本体的组织要么失败要么放弃"。我没有找到任何带分母的失败率数据。** 但我找到了一个有用的对照：同一作者群体在通用软件领域的实测——

> The IT project cancellation rate ranged from **11.5 to 15.5 percent**. … although the overall project failure rate is high, **word of a software crisis is exaggerated**.

从业者系统性高估失败率，实测区间大约是民间传说的**一半**。所以关于本体项目，"失败普遍"这个说法应当降级为：**广泛流传但证据薄弱。**

## 四、银行可执行的三步

把上面所有内容压成可执行的动作。**顺序有意义，反了会白建。**

**第一步：先写能力问题，再动任何工具。**

写 10 到 15 条业务方认可的问题，每条标注当前能否回答。这一步不花钱、两个月能出结果，**但它是唯一的止损点**——如果写不出十条业务认可的问题，说明范围划错了，应该回到设计阶段。

几条样例，都必须是"SQL 答不出、只有把码表、生命周期、映射连起来才答得出"的那种：

- 某笔不良案件的全部押品中，处置难度为"无实际处置价值"的有几笔、占比多少
- 进入诉讼阶段的案件里，有几笔尚未指定当事方角色
- 同一押品是否被多个案件同时引用为担保
- 顺位为第三顺位及以上的案件在全部案件中的分布

**第二步：把散落口径收敛成 SKOS 分面码表。**

这一步不需要 OWL，不需要推理机，也不需要 LLM。押品类型、逾期阶段、处置措施、顺位这四套码表用 SKOS 表达，**每套码表内部正交**。成本极低，但它是后面所有推理的前提。

**第三步：只有前两步完成后，才做本体与映射。**

而且要照抄 FIBO 的教训：映射必须**显式标注有损**。我们在实际核查中见过最专业的金融本体组织留下的坑——FIBO 里唯一的违约类 `LoanDefaultProceeding`，其 `skos:definition` 字面写着 `[no definition]`，所在文件成熟度为 `Provisional`；全库 295 个本体中，不良处置领域的核心词（workout、repossess、charge-off、perfection、security interest）**零命中**。

**换句话说：不要指望挂靠一个现成金融本体能省掉业务层的活。** 它的业务层是空的，而且会漂移。

## 五、几个容易踩的坑

**其一，"本体"这个词在中国技术语境里有两个意思。** 中电金信 2026 年金融展讲的"以本体为核"，其本体模型层的六大模块是对象、属性、关系、动作、规则、安全治理——**这是业务语义数据模型，不是 OWL/RDF/SHACL**。读这类材料时要先确认是哪个"本体"。另外招聘关键词里"本体"还指具身智能的机器人本体（蚂蚁集团有个"本体应用研发工程师-具身智能方向"），任何按关键词统计的岗位数字都会被机器人污染。

**其二，"上下文层该由谁拥有"对银行是伪议题。** 那篇文章把"谁拥有上下文层"列为开放的行业辩论。在银行内部，客户数据属银行、模型属科技部门、指标定义属风险与财务条线，**权属是明确的**。真正需要讨论的是两个更具体的问题：**谁有权给这一层赋予业务含义，以及模型输出的责任如何归属。** 后者金发〔2026〕8号第二十二条已经给了答案——涉及客户权益或有实质性财务影响的关键决策，须设人工复核节点，完整保留原始数据、推理路径及阈值触发记录。**"保留推理路径"这条要求，需要的是可追溯性——而上下文图恰好是实现它的手段之一，但不是唯一手段。** 一份完整的血缘记录加模型日志同样能满足这一条。**监管规定的是结果（可追溯），不是手段（某种特定技术架构）。** 这一条的真实含义是：银行必须能回答"这个结论用了哪些数据、经过哪些判断、触发了什么阈值"——**它并未要求银行建本体。** 监管已经用另一种措辞提了同一个要求。

**其三，别把金融科技总投入当成本证据。** 六大行 2023 年金融科技投入合计超过 1,200 亿元，但那是全口径科技投入，与本体建设无关。用它推算本体成本是错的。**能引的是工期与人力编制**（如某行三年 3.939 亿元、60 人团队的科技开发服务框架招标），**不能引单价**。

**其四，也不要期待用更大的模型绕过这个问题。** 上文的实测已经说明，模型规模对本体学习的影响"既不单调也不一致"。

## 六、本文的事实边界

**已核验为原始来源**：金发〔2026〕8号全文（金融监管总局官网接口原始载荷，32 条条款序号连续，第十一条、第八条、第二十二条、第二十五条均为原文引用）；银保监发〔2018〕22号（中国政府网）；JR/T 0335—2025《数字金融 金融元数据编制参考指南》（人民银行，2025-12-23 发布即实施）、JR/T 0218-2021、JR/T 0287—2023；LLMs4OL 系列、NeOn-GPT、arXiv:2608.31118、arXiv:2503.05388、NIST IOF 报告、El Emam 的 IEEE Software 论文。

**本文修订时已定位的一处引述**：原始长文提到"2025 年一篇会议论文称 GPT-4 结合高级提示生成的本体可比于初级本体工程师"。**该文献已定位**：arXiv:2503.05388《Ontology Generation using Large Language Models》（Lippolis、Saeedizade 等，2025-03-07），摘要的逐字表述是 o1-preview 结合 Ontogenia "significantly outperforming novice ontology engineers in modelling ability"。**与原始长文的转述有两处差异**：论文用的是 o1-preview 而非 GPT-4；对照对象是"新手本体建模者"（novice ontology engineers），而非"初级工程师手工编写的本体"。**这条证据已在第三部分按原文处理**——它支持"新手 + LLM 草稿可超过纯新手"，不支持"无训练团队可交付可投产本体"。同一文献里另有一句可靠表述与本文论点同向：「LLMs are a useful tool for **the human ontology engineer**」。

**本文的判断**（非引用）：把金发〔2026〕8号与上下文图技术主张对应起来；"瓶颈是方法而非人手"这一论断及其三条依据；对 FIBO 业务层空白与漂移风险的判断；以及三步路径的排序建议。

**未能核实**：那篇长文提到的若干具体数字（如某数据商的关系规模与检索加速倍数）**只出现在个人博客中，无一手出处，本文不予引用**。Talisman 的书名在官网与出版商页面不一致，疑为 2026 年改名，未找到公告。

**立场声明**：本文解读的长文作者之一同时是 Atlan（一家销售上下文层产品的公司）的联合创始人，且文中列出的五个视角含其本人主张的"Universal Context Layer"。本文已核验其引用的技术文献与实测数据，并在第二部分对其路线性论断提出了三处校正。

*作者毕超，金融行业风险管理从业者。本文仅代表作者个人观点，不构成任何机构立场。*

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "指标算得对≠机器能推理：上下文图、本体与银行 AI 的真实缺口",
  "datePublished": "2026-10-03",
  "description": "Atlan 联合创始人 Prukalpa Sankar 推广的一篇长文提出：语义层（指标定义、计算逻辑、原始数据）没有推理能力，而大模型需要上下文图，因此指标优先的范式正在终结。本文完整解读其技术主张——YAML 能声明度量却无法声明逆属性、属性链、对称属性与传递推理，这是能力差异而非程度差异；并对照中国银行业的实际做三点校正。第一，监管已经回答了要不要建：国家金融监督管理总局金发〔2026〕8号（2026-06-18）第十一条明确要求构建核心知识模型、建立知识萃取整合共享机制流程，第八条要求强化元数据管理并构建数据资产地图。第二，瓶颈不是人手：上海银行公开材料主张组建本体攻坚特战队、从业务条线选拔骨干与科技架构师混合编组，并采用最小可行本体策略；该工种在中国银行业不存在任何岗位需求。第三，LLM 没有消除门槛：LLMs4OL 2024 挑战赛中，传统 ML 队伍在同一分类发现子任务（DBO）上 F1 为 0.2109，LLM 队伍仅 0.0164；能力问题正确建模率为 0.91 与 0.84（简单）、0 与 0.66（复杂）；LLM 生成的能力问题仅 40–53% 被领域专家判定为可接受。arXiv:2503.05388 证明“新手 + LLM 草稿”可超过纯新手水平，但交付物为草稿而非可投产本体——迄今仍无已发表研究证明无本体工程训练背景的团队交付过可投产运行的领域本体。本文同时标注作者的商业立场，并给出银行可执行的三步路径与能力问题清单。",
  "keywords": [
    "语义层",
    "知识图谱",
    "上下文工程",
    "本体",
    "指标平台",
    "大模型",
    "银行AI",
    "数据治理",
    "技术风险"
  ],
  "author": {
    "@type": "Person",
    "name": "毕超",
    "jobTitle": "金融行业风险管理从业者"
  }
}
</script>

## 常见问题

Q: 既然监管已经要求建设核心知识模型，那银行现在该做什么？
A: **先写能力问题，不要先买工具。** 这是唯一有止损作用的步骤。写 10 到 15 条业务方认可的问题，每条标注当前能否回答，输出物是一份"答不了的问题清单"。**如果三个月后写不出十条业务认可的问题，说明范围划错了，此时你已经避免了最大的浪费。** 反过来，如果一上来就采购本体管理平台或启动数据治理项目，你会在还不知道要回答什么问题的情况下先建立一套没人用的资产。第二步才是把散落的口径收敛成 SKOS 码表（押品类型、逾期阶段、处置措施、留置权顺位），这一步成本极低但没有它后面做不了。第三步才做本体与外部标准的映射，且必须显式标注哪些映射有损。
Q: 银行需要招聘本体工程师吗？
A: **目前不需要这个独立岗位。** 我搜遍了 2025 至 2026 年中国主要银行的招聘信息，没有任何一家把"本体""语义层""知识图谱""知识表示"写进岗位要求；人社部 2026 年二季度官方热门岗位榜单里也没有这个方向，对照人工智能工程师需供比 2.62、数字后端工程师 6.43，这个岗位在任何需供比数据里都不存在。**因为它不是一个独立职业，而是被吸收进数据架构、数据治理、业务分析这些岗位的一项能力。** 上海银行人工智能研究课题组的处方也很明确——组建"本体攻坚特战队"，**从各业务条线选拔骨干与科技架构师混合编组**，而不是外聘；并且它明确指出短缺的是"既懂金融又懂技术的复合型人才"，不是本体工程师。而且它采用最小可行本体策略，各业务条线先建"域本体"、顶层只定义核心概念——按这个策略，所需的本体专职编制本来就被设计得很小。**先培养现有团队的能力，比招聘新职业更现实。**
Q: 大模型这么强，能不能让 AI 自动把银行的本体建出来？
A: **目前不能交付可投产本体，但门槛已经降到"新手可用"——这两句话必须一起说，缺一句都是误导。** 先看失败点。LLMs4OL 2024 挑战赛里同一个分类发现子任务（DBO），传统 ML 队伍 F1 **0.2109**，LLM+RAG 队伍只有 **0.0164**——论文自己解释这是"多而全"与"少而准"的取舍差，LLM 队伍召回更高但引入大量假阳性。而术语类型化这类"给候选打标签"的任务则可用，微调后 F1 达 0.9716。更根本的是形式化缺陷：NeOn-GPT 发现 LLM 生成的类表达式"一般仅限于 subsumption 类型，缺少合取与析取"，属性限制"主要局限于 HasValue，缺少基数限制、存在限制与全称限制会限制推理时的类成员推断范围"。**翻译过来就是：LLM 生成的本体退化成了分类法，只有父子层级，而没有这些约束，OWL 推理基本失效——恰好丢掉了上下文图最核心的能力。** 模型规模也救不了：arXiv:2608.31118 用 13 个模型、四个本体测出规模影响"既不单调也不一致"。**但反过来也不该说"没用"**：arXiv:2503.05388 证明 o1-preview 生成的草稿能让无本体训练的新手超过纯新手水平，显著降低起步成本。**准确的结论是——LLM 抬高的是新手的起点，不是交付的责任；降低的是学习成本，不是工程责任。** 迄今为止仍没有任何已发表研究证明，一支没有本体工程训练背景的团队借助工具加 LLM 交付过**可投产运行**的领域本体。LLM 适合做候选生成、语法转换、格式检查；不适合替代建模判断。
Q: 那篇长文说本体项目"大多数失败或放弃"，这是真的吗？
A: **这个说法广泛流传，但证据薄弱——我没有找到任何带分母的失败率数据。** 这本身就是个发现：企业本体项目的成本与失败数据在学术上都很难获取，因为多数是原型或商业机密。NIST 的工业本体报告给出的是定性判断：工业界采用本体的企业"寥寥无几"，且已列出的项目"大多仍处于研究阶段，未被采纳为现实解决方案"；但它指出的障碍是**不可复用、不可互操作**，不是缺人。有一个有用的对照——同一作者群体在通用软件领域做过可复现的实测：IT 项目取消率为 **11.5% 到 15.5%**，并明确指出"软件危机的说法被夸大了"。也就是说，**在有实测数据的邻近领域，实测值大约是民间传说的一半。** 所以关于本体项目，严谨的表述是"失败普遍但未被测量"，而不是引用一个编造的比例。
Q: 我们已经在建数据中台和指标平台了，这些算不算语义层？
A: **算，而且是必要的一步——但它不等于本体，两件事不能互相替代。** 指标平台解决的正是最真实的痛点：同一指标在不同报表里算得不一样。银保监发〔2018〕22号第三十条对此有明确要求：「银行业金融机构各项业务制度应当充分考虑数据质量管理需要，涉及指标含义清晰明确，取数规则统一，并根据业务变化及时更新。」第三十六条还要求「保证同一监管指标在监管报送与对外披露之间的一致性」——并且特别写了「如有重大差异，应当及时向银行业监督管理机构解释说明」。**这是口径治理的技术底座，不是白建。** 但它确实解决不了推理问题：指标定义能回答"逾期天数是多少"，回答不了"这个案子能不能执行"——后者需要在关系上做条件联合判断。需要注意的是，指标平台与本体不是先后关系，而是**可以并行的两层**：SKOS 分面码表用来固化概念与口径，本体用来在这些概念之间建立可推理的关系。等大模型接进来时，前者提供"词准"，后者提供"理得出"。
Q: 我们是中小银行，不在 G-SIB 名单里，这些要求对我们适用吗？
A: **适用，而且更应该早做。** 金发〔2026〕8号是金融监管总局面向银行业保险业的普适性指导意见，不是针对全球系统重要性银行的。BCBS 239（风险数据聚合与风险报告原则）才是主要约束大型国际活跃银行的国际标准——2025 年 11 月 FSB 公布的 G-SIB 名单共 29 家，中国有五家：工商银行（第二档升至第三档）、农业银行、中国银行、建设银行、交通银行。**但 BCBS 239 的三条原则——准确性、完整性、可追溯性——对任何做监管报送的银行都是适用的**，而金发〔2026〕8号是面向行业的监管指导意见——两者效力层级不同，且 BCBS 239 本身并非中国国内法。**对中小银行来说，本体的价值点不在于应付国际标准，而在于两件更实际的事：一是复用既有系统而非重建，二是让现有数据资产能被 AI 用起来。** 上海银行的最小可行本体策略正适合这个场景——各条线先建域本体、顶层只定义核心概念，不追求大而全。
