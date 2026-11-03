---
title: "银行该养多少Agent"
date: 2026-11-03
description: "DeepMind 108页工作论文《Organizing Intelligence》提出组织规模定律：像模型有scaling law一样，组织也有scaling law。分三个阶段——单人最优、有限规模、无限规模。当Agent协调能力超过阈值，越大越好，打破科斯天花板。本文从银行视角分析：银行该养多少AI Agent团队，最优规模是多少。"
tags: ["DeepMind","Organizing Intelligence","Agent团队","组织设计","银行AI","科斯天花板","多智能体"]
schema_type: Article
references:
  - title: "Organizing Intelligence (Google DeepMind working paper, 108 pages, 2026-10-29)"
    url: "https://institute.deepmind.com/essays/the-economics-of-intelligence/"
    source: "Google DeepMind"
  - title: "The Economics of Intelligence (DeepMind Institute, 2026-10-29)"
    url: "https://institute.deepmind.com/essays/the-economics-of-intelligence/"
    source: "Google DeepMind / Imas, Koh, Legg"
  - title: "本站：AI越强银行越没变——DeepMind经济学框架"
    url: "https://bi-chao.com/articles/deepmind-economics-intelligence-competence-vs-coordination-bank"
    source: "bi-chao.com"
---

# 银行该养多少Agent

**DeepMind 108页工作论文《Organizing Intelligence》提出：像模型有scaling law一样，组织也有organizational scaling law。**

**组织规模分三个阶段：单人最优、有限规模、无限规模。当Agent协调能力超过阈值，每个新成员都比上一个更高效，越大越好。**

**Coasean ceiling（科斯天花板）被打破后，公司规模只受市场大小限制——这对银行意味着什么？**

**论文给出了一个具体公式：协调能力低于1时，最优公司规模随协调能力下降而缩小；超过1时，规模无限扩张。**

**银行现在养AI Agent团队，不是越多越好——要看协调能力在哪个阶段。**

## 一、组织规模定律

1. **三阶段**：
   - 阶段1（单人最优）：协调能力太差，Agent之间配合一塌糊涂，不如单干。
   - 阶段2（有限规模）：小团队分工有效，但人多了协调不过来，人均产出在某个规模后开始下降。这是人类社会一直以来的状态。
   - 阶段3（无限规模）：协调能力超过阈值后，每个新加入的Agent都让团队更高效，规模越大越好。
2. **数学机制**：论文用了一个"有点ad hoc"的公式——人均产出 = 能力 × 分工收益 × "向同事学习"项 × 注意力分裂惩罚。当平均协调能力低于1，人均产出在最优规模后递减；当超过1，人均产出随规模递增。
3. **O-ring模型**：公司能力由最弱环节决定（Kremer的O-ring理论），一个弱环节拖垮整条链。AI Agent团队也是如此——一个Agent出错会传染给整个流程。
4. **AI和人类的关键区别**：人类专家供给固定，工资随稀缺上涨；AI Agent一旦达到某个能力，就能按算力成本无限复制。当AI匹配人类能力，人类工资就锚定在算力成本上。

## 二、四个阶段下银行的人力配置

论文算了一个数值例子（14个人，2种角色：专家和协调者）：

1. **Minimal AGI阶段**：AI公司偏好约7个副本。14个人全部就业，但专家工资从4.15降到2.90，协调者从2.41降到1.30。AI公司开始进入小市场。
2. **Supercompetent阶段**：AI公司还是约7个副本。专家在小市场组队生存，协调者在深度市场指挥AI，赚0.48，专家赚0.39。
3. **Supercooperative阶段**：深度市场集中成一个巨型AI公司。1个协调者失业（AI协调让人类协调者多余）。
4. **ASI阶段**：两个协调者都失业。专家还在小市场和AI公司一起工作。

## 三、对银行的具体启示

1. **不是Agent越多越好**：在协调能力不足时（阶段1和2），盲目堆Agent数量会导致协调成本超过分工收益。银行今天养AI Agent团队，先从小规模开始——3-5个Agent协作一个流程，比上百个Agent混战更有效。
2. **找到最优规模**：论文说协调能力低于1时，最优公司规模有个甜点。银行该测：一个风控AI团队，几个Agent协作时人均产出最高？超过几个后开始内耗？
3. **协调者不会马上失业**：即使在Supercooperative阶段，论文算的是1个协调者失业（不是2个）。人类协调者在判断、方向设定、跨团队对齐上仍有价值。银行要培养能指挥AI Agent团队的"人机混合协调者"。
4. **深度市场最先被冲击**：金融是DeepMind说的"深度标准化市场"——标准化、量大、需求可吸收大规模产出。风控规则执行、信贷初审、报表生成这些标准化流程，最先被Supercooperative AI冲击。
5. **关系型业务最后被替代**：客户关系、复杂谈判、需要信任的顾问业务，属于"关系型部门"——人的参与本身就是价值。这些岗位在ASI阶段也安全。

## 四、银行落地清单

1. **先做小试点**：选一个标准化流程（比如贷后监控），用3-5个Agent协作，测人均产出随Agent数量的变化曲线。找到甜点规模。
2. **测协调能力**：不要只测单个Agent的能力，要测多Agent协作——交接时丢不丢上下文、会不会重复劳动、错误会不会传染。这些才是决定你能养多大团队的关键。
3. **人类协调者定位**：在AI Agent团队里，人类的角色不是做具体任务，而是设方向、审结果、在Agent卡住时介入。这个角色在Supercompetent阶段最值钱。
4. **不要提前All-in**：论文强调Supercooperative阈值"是否以及何时被跨越是个实证问题"。在阈值到来之前，银行保持小而精的AI团队，不要盲目扩张成百个Agent的大军。
5. **关注entry-level岗位**：论文Theorem 2说，entry-level员工最接近机器能匹配的能力，所以最先被替代。银行的初级风控、初级信贷分析岗位，要提前规划转型路径。

## 五、三个冷静判断

1. **论文不是预测，是模型推演**：DeepMind自己说"这些场景不是经验预测，而是基于模型假设的结果"。银行不要把论文里的数字当圣经。
2. **协调能力是黑箱**：论文说今天AI协调得很差，但没说什么时候会突破阈值。银行该做的是积累自己的多Agent协作经验，等阈值到来时已经知道怎么组织。
3. **组织能力是护城河**：论文说"组织本身就是超级智能体"。银行几十年沉淀的跨部门协作能力、风险制衡机制，在AI时代是难以复制的资产。

## 结语

DeepMind这108页论文最实用的贡献，是告诉银行：养AI Agent团队不是越多越好，要算协调能力的账。在协调能力突破阈值之前，小团队高效协作胜过百个Agent混战。银行现在该做的，是在真实业务里测出自己的组织规模曲线，找到最优甜点，而不是被"千军万马Agent"的叙事忽悠着盲目扩张。

（口径说明：数学模型和数值例子来自DeepMind《Organizing Intelligence》工作论文2026年10月29日版本；银行场景映射为作者分析。）
