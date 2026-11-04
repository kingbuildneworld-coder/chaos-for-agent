---
title: "OCC给银行AI定级"
date: 2026-11-05
description: "2026年11月4日美国货币监理署发布Bulletin 2026-54，首个银行AI审查框架。核心原则：按后果评风险，不按技术复杂度。自主支付Agent、实时信贷决策列为最高风险。框架延伸到外部AI Agent。本文从银行视角解读这个四级风险框架。"
tags: ["OCC","AI监管","银行风险","风险分级","自主支付Agent","金融监管","Agentic AI"]
schema_type: Article
references:
  - title: "OCC Issues Supervisory Framework on Bank Use of Super Intelligence (Bulletin 2026-54, 2026-11-04)"
    url: "https://regmonitoring.com/updates/occ-occ-issues-supervisory-framework-on-bank-use-of-b3f419"
    source: "Office of the Comptroller of the Currency / Reg Monitoring"
  - title: "OCC Gives Bank Examiners 4 AI Risk Tiers, Payment Agents Top (FourWeekMBA, 2026-11-04)"
    url: "https://fourweekmba.com/ai-occ-gives-bank-examiners-4-ai-risk-tiers-payment-agents-top/"
    source: "FourWeekMBA"
  - title: "US Bank Regulator Issues First AI Framework as Banks Battle Rogue Agents (Decrypt, 2026-11-04)"
    url: "https://decrypt.co/382560/us-bank-regulator-issues-first-ai-framework-banks-battle-rogue-agents"
    source: "Decrypt"
---

# OCC给银行AI定级

**2026年11月4日美国货币监理署（OCC）发布Bulletin 2026-54，首个银行AI审查框架。**

**核心原则：按后果评风险，不按技术复杂度。一个简单但直接动钱的Agent，比一个复杂但内部用的模型风险更高。**

**四个风险等级：Tier 1最高风险包括自主支付Agent、实时信贷决策、欺诈冻结释放、市场准入——都是低/不可逆转的直接行动。**

**框架延伸到外部AI Agent：通过银行渠道连接的外部AI Agent也在监管范围内，银行要对外部Agent行为负责。**

**这不是新规则，是给审查员的操作手册：现有银行义务不变，只是告诉审查员怎么看银行的AI。**

## 一、为什么现在出这个框架

1. **银行在和"流氓Agent"作战**：10月22日Axios报道，JPMorgan、Bank of America、Citi都在限制员工和第三方AI Agent访问。银行高管称情况"令人恐惧"——当一个自主Agent拿到客户账户访问权，谁在控制它？
2. **OCC的回应**：不是禁止AI，而是给审查员一个统一框架来评估银行的AI用例。22页框架，覆盖支付、欺诈检测、客户服务等银行业务，也延伸到外部AI Agent。
3. **按后果不按技术**：OCC明确说，不用模型大小、复杂度来评风险。一个小模型但能直接发钱，和一个大模型但只做内部分析，前者风险高得多。这是务实的做法。

## 二、四个风险等级

1. **Tier 1（Critical）——最高风险**：直接行动、低或不可逆转。OCC的例子包括：自主支付Agent（能自己发起转账）、实时信贷决策（直接决定贷不贷款）、欺诈冻结释放（直接解冻账户）、市场准入（直接交易）。这些操作一旦出错，损失不可逆。
2. **Tier 2（High）**：AI辅助承保、Agent发起客户沟通、AML警报处置、内部代码或数据访问变更的代码辅助。这些影响重大但有一定缓冲。
3. **Tier 3（Medium）**：内部分析、客户服务辅助等——影响可控但仍需监控。
4. **Tier 4（Low）**：低风险内部用途，如文档总结、内部知识检索。

## 三、对中国银行的启示

1. **支付Agent是最高风险**：OCC把自主支付Agent列为Tier 1。中国银行如果做AI支付、AI转账、AI自主扣款，要按最高标准治理——有人审批、有急停、有日志。
2. **实时信贷决策要分级**：AI直接决定贷不贷，是Tier 1。银行不能因为AI效率高就跳过人工复核——OCC明确把"低/不可逆转"作为最高风险标准。
3. **外部Agent要管**：框架覆盖通过银行渠道连接的外部AI Agent。中国银行未来也会遇到客户用外部AI助手管理账户的情况——银行要能识别、认证、控制这些外部Agent的权限。
4. **代码辅助也在Tier 2**：AI帮银行工程师改核心系统代码或访问数据，列为High。这和高盛限制交易员用Claude Code的逻辑一致——AI碰代码和数据，风险比写邮件高得多。

## 四、和香港框架的对比

1. **香港HKMA**：从治理原则出发——意图锚定问责、急停机制、五个核心要素。是"应该怎么做"的框架。
2. **美国OCC**：从风险分级出发——按后果分四级，告诉审查员"怎么查"。是"怎么查"的操作手册。
3. **共同点**：都认为Agent自主行动是核心风险，都要求外部Agent准入，都强调人工监督不能只是走形式。
4. **差异**：香港是讨论文件（征求意见），美国是直接给审查员的操作框架（已经生效）。美国走得更快。

## 五、三个冷静判断

1. **这不是新规则，是新标尺**：OCC说现有银行义务不变——安全稳健、消费者保护、反洗钱这些要求一直适用。框架只是告诉审查员：用这些标尺去量银行的AI。银行不需要为AI单独建一套合规，要把AI纳入现有风险管理框架。
2. **风险分级是好思路**：不是所有AI都要最高标准治理。文档总结和自主支付Agent风险差几个数量级。银行应该给自己的AI用例分级，按等级配控制措施。
3. **中国银行该自己做分级**：OCC的四级框架可以参考，但中国银行应该根据自己的业务实际——支付、信贷、理财、反洗钱——建立自己的AI用例风险分级表。不要等监管来给你定级。

## 六、银行落地清单

1. **做一张AI用例风险表**：把银行所有AI应用列出来，按OCC四级框架自己先分一遍。哪些是Tier 1（自主支付、实时信贷、欺诈释放）？哪些是Tier 4（文档总结、内部检索）？不要漏。
2. **Tier 1必须有人审+急停**：最高风险的AI用例，上线前必须有人审批、能随时急停、有完整日志。不能因为效率高就跳过人审。
3. **外部Agent准入**：如果银行开放API给外部AI助手，要建立认证机制——外部Agent是谁授权的？能做什么操作？权限范围多大？能随时撤销吗？
4. **代码辅助分级**：AI帮工程师写代码碰核心系统和数据，是Tier 2。银行要区分——AI写营销文案和AI改核心交易系统，控制标准完全不同。
5. **定期演练**：OCC框架要求审查员看银行能不能实际控制AI。银行要定期演练急停——不是在PPT里写"有急停机制"，而是真的按一次停止流程，看多快能停下来。

## 结语

OCC这份框架最有价值的不是技术细节，而是一个原则：按后果评风险。AI再聪明，如果只是帮客服写个回复，风险低；如果能自己转钱出去，风险最高。中国银行做AI，先把用例按后果分四级——哪些能让AI自主做，哪些必须人审，哪些根本不能让AI碰。分级表做出来，治理就有了抓手。

（口径说明：事实来自OCC Bulletin 2026-54及FourWeekMBA、Decrypt、Reg Monitoring报道；银行场景映射为作者分析。）
