---
title: "银行开始封AI助手"
date: 2026-11-02
description: "2026年11月1日消息：美国主要银行开始封锁第三方AI助手使用客户登录凭证访问账户。JPMorgan Chase警告客户可能为AI助手发起的非预期交易负责，Morgan Stanley封锁所有第三方Agent，Wells Fargo 11月24日起更新协议。在联邦开放银行规则被法院暂停的真空期，银行各自划定边界。本文分析这对中国银行未来应对AI助手管理账户的启示。"
tags: ["AI Agent","银行账户","凭证安全","开放银行","客户责任","金融科技","AI治理"]
schema_type: Article
references:
  - title: "Major US Banks Block AI Agents From Customer Accounts as Regulatory Battle Deepens (Small World FS, 2026-11-01)"
    url: "https://www.smallworldfs.com/blog/2026/11/01/major-us-banks-block-ai-agents-from-customer-accounts-as-regulatory-battle-deepens/"
    source: "Small World FS / Reuters / Axios"
  - title: "本站：给每个金融智能体发一张工牌——FSB 12条与香港ART框架"
    url: "https://bi-chao.com/articles/fsb-hkma-agentic-ai-governance-agent-id-kill-switch"
    source: "bi-chao.com"
  - title: "本站：OpenCode 密钥泄露敲响警钟——智能体凭证治理"
    url: "https://bi-chao.com/articles/opencode-console-api-key-breach-agent-credential-governance"
    source: "bi-chao.com"
---

# 银行开始封AI助手

**2026年11月1日，美国主要银行开始封锁第三方 AI 助手使用客户登录凭证访问账户。**

**JPMorgan Chase 明确反对凭证共享，警告客户可能为 AI 助手发起的非预期交易负责；Morgan Stanley 直接封锁所有第三方 Agent。**

**Wells Fargo 11月24日起更新协议：客户要为 AI 助手超出授权范围的行为负责。Charles Schwab 每周封锁大量外部 Agent，包括 Meta 的 Muse。**

**联邦开放银行规则（CFPB Section 1033）被法院暂停，在监管真空期，银行各自用协议条款划边界。**

**但批评者指出，封锁不只是安全原因——AI 助手自动把闲置资金转去更高收益产品，银行会损失存款。**

## 一、发生了什么

1. **第三方 AI 助手开始代客操作账户**：客户把自己的银行登录凭证交给 AI 助手（如各类个人理财 Agent），让 AI 查余额、转账、做投资决策。
2. **银行发现风险**：一些 AI 助手试图执行超出用户指令范围的操作。虽然具体事件规模不明，但银行认为风险不可控。
3. **各银行的应对**：
   - JPMorgan Chase：明确反对凭证共享，客户要为 AI 助手发起的非预期交易负责。
   - Bank of America：类似警告。
   - Morgan Stanley：封锁所有第三方 Agent，尽管没有已知的恶意事件。
   - Charles Schwab：每周封锁大量外部 Agent（包括 Meta 的 Muse），但计划推出受控访问（只查余额、做研究）。
   - Wells Fargo：11月24日起更新协议，客户承担 Agent 超出授权行为的责任。
4. **监管真空**：CFPB 的 Section 1033 规则（开放银行，要求银行提供安全 API 替代密码爬虫）2024年10月定稿，但被联邦法院禁令暂停，原定2026年4月合规。没有联邦规则，银行各自为政。
5. **行业自救**：Bank of America、Wells Fargo、BBVA、Synchrony 加入了 Personal Agent Protocol（PAP），一个行业倡议，支持基于权限的 AI 访问而非凭证共享。

## 二、为什么银行紧张

1. **凭证共享等于把钥匙给了第三方**：客户把银行密码给 AI 助手，AI 助手就有了完整的账户操作权。AI 助手出了 bug、被 prompt 注入、被投毒，银行账户就裸奔了。
2. **责任边界模糊**：AI 助手做的交易，客户说"不是我让它做的"，银行说"你给了它密码"，谁负责？JPMorgan 和 Wells Fargo 的回答是：客户负责。
3. **Agent 可能越权**：AI 助手在执行任务时，可能因为 prompt 注入、模型错误、工具调用偏差，执行用户没有明确授权的操作。银行看到了这种苗头。
4. **不只是安全问题**：Bianco Research 总裁 Jim Bianco 指出，如果 AI 助手自动把客户闲置资金转去更高收益产品，银行的无息存款就流失了。封锁有商业利益考量。

## 三、对中国银行的启示

1. **这个问题迟早会来**：中国客户也会用 AI 助手管理账户——查余额、还信用卡、做理财。银行现在不准备，将来会被动。
2. **凭证共享是红线**：银行应该明确，客户不应把登录凭证交给任何第三方 AI 助手。这和本站此前写的"OpenCode 密钥泄露"是同一类问题——凭证一旦交出，控制权就不在银行手里了。
3. **受控 API 访问是方向**：不要让 AI 助手用密码登录，而是提供受限 API——AI 助手只能查余额、只能看交易记录，不能转账、不能改密码。Charles Schwab 正在走这条路。
4. **责任条款要提前写好**：客户用了银行认可的受控 API，出了问题谁负责？客户用了未经认可的方式（共享密码），出了问题谁负责？这些要在用户协议里写清楚。
5. **和 FSB/HKMA 的工牌思路一致**：本站此前写过 FSB 12 条和香港 ART 框架——给 Agent 发"工牌"、设"急停键"。美国银行的做法是同一思路：不给完整钥匙，给受限权限。

## 四、三个冷静判断

1. **封锁不是长久之计**：客户有 AI 管理财务的需求，银行堵不如疏。提供受控 API 比一刀切封锁更能留住客户。
2. **商业利益和安全考量混在一起**：银行说封锁是为了安全，但 Bianco 指出存款流失也是动机。客户和监管应该看清楚这一点。
3. **中国不会照搬**：中国银行的开放银行体系和美国不同，但"AI 助手访问账户"这个问题会以类似形式出现。银行要提前准备受控访问方案，而不是等客户把密码交给 AI 助手后再堵。

## 五、中国银行该怎么做

1. **现在就划清凭证共享红线**：在手机银行和网银用户协议里明确，客户不得将登录凭证共享给第三方 AI 助手或任何自动化工具。违反者后果自负。
2. **规划受控 API**：参考 Personal Agent Protocol 的思路，为 AI 助手提供只读 API（查余额、查交易记录），不开放转账和修改权限。这比一刀切封锁更能满足客户需求。
3. **和监管对齐**：中国有自己的开放银行体系和金融科技监管框架。银行应该主动向监管报告 AI 助手访问账户的趋势和风险，而不是等监管来问。
4. **监控异常登录**：如果检测到客户账户被自动化工具（而非真人 App）登录，要能识别并告警。AI 助手的登录行为和真人不同——API 调用频率、操作时间、操作序列都有特征。
5. **不要只做安全封堵**：Bianco 指出的存款流失问题是真实的。银行与其封锁 AI 助手，不如自己提供更好的 AI 理财助手，把客户留在自己的生态里。

## 结语

美国银行封锁 AI 助手用客户密码访问账户，表面是安全事件，实质是一个新阶段：AI 助手从"帮你查信息"走到了"替你管钱"，银行必须决定给它多大权限。对中国银行来说，现在就该想清楚：客户用 AI 助手管理账户时，银行是给它完整钥匙、还是给它受限权限、还是干脆不让进门？这个问题的答案，决定了未来五年银行和 AI 助手的关系。

（口径说明：事实来自 Reuters/Axios 转引及 Small World FS 2026年11月1日报道；银行场景映射为作者分析。）
