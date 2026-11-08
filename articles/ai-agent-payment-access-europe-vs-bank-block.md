---
title: "AI Agent怎么碰钱"
date: 2026-11-09
description: "英美银行封AI Agent，欧洲支付机构却在测试另一条路：Worldline、ING、Visa把Agent纳入支付基础设施，Agent只做搜索推荐，支付授权仍走银行认证。本文对比两条路径，分析银行在Agent时代的角色。"
tags: ["AI Agent","支付","Worldline","ING","Visa","银行授权","Agentic Commerce"]
schema_type: Article
references:
  - title: "Worldline, ING and Visa complete a live agentic payment transaction in Europe (Worldline, 2026-07-02)"
    url: "https://worldline.com/en/home/top-navigation/media-relations/press-release/pr-2026_07_02_01"
    source: "Worldline"
  - title: "Worldline and ING complete a live end-to-end European agentic payment in production (Worldline, 2026-06-02)"
    url: "https://worldline.com/en/home/top-navigation/media-relations/press-release/pr-2026_06_02_01"
    source: "Worldline"
  - title: "UK Banks Ban AI Agents From Accounts Over Rogue Risks (Aetos.AI, 2026-11-08)"
    url: "https://aetos.ai/posts/9c18f1dffcbc3a91"
    source: "Aetos.AI"
  - title: "AI can now shop for you, if you let it (ING, 2026-06-02)"
    url: "https://ing.com/news/2026/ai-can-now-shop-for-you-if-you-let-it.html"
    source: "ING"
---

# AI Agent怎么碰钱

**英美银行在封：HSBC、Barclays、Lloyds、JPMorgan、Morgan Stanley都禁止第三方AI Agent访问客户账户。**

**欧洲支付机构在试：Worldline、ING、Visa/Mastercard把AI Agent纳入支付基础设施，而不是封掉。**

**核心设计：Agent只做搜索和推荐，不碰钱；支付授权还是走银行的认证体系。**

**2026年6月和7月，欧洲已完成两笔真实的端到端Agent支付交易。**

**银行的角色不会消失——Agent再强，最后还是要银行点头授权。**

## 一、两条路径

### 路径一：封

1. **美国**：JPMorgan Chase警告客户不要分享凭证，Morgan Stanley封锁所有第三方Agent，Wells Fargo更新协议让客户为AI行为负责。
2. **英国**：HSBC、Nationwide、NatWest、Barclays、Lloyds五家银行都禁止AI Agent访问客户账户。理由是流氓自动化风险和责任不清。
3. **共同原因**：AI Agent出错了谁负责？客户授权了但Agent越界了怎么办？大规模Agent同时交易会不会影响金融稳定？这些问题没有答案，银行选择先封。

### 路径二：纳入

1. **2026年6月2日**：Worldline和ING在荷兰完成首个欧洲端到端Agent支付——客户让AI助手买音乐会门票，AI推荐选项，客户批准，Mastercard网络完成支付。
2. **2026年7月2日**：Worldline、ING和Visa在德国完成第二笔——客户用Visa Payment Passkeys生物识别认证，ING授权。
3. **核心思路**：不封Agent，而是把Agent放进支付基础设施里，让它在银行可控的范围内活动。

## 二、欧洲路径是怎么设计的

1. **Agent做什么**：搜索产品、比较选项、推荐方案。它知道客户的预算和偏好，但不能自己决定付钱。
2. **客户做什么**：看Agent推荐的选项，明确批准购买。用Visa Payment Passkeys做生物识别认证（指纹或人脸）。
3. **银行做什么**：ING作为发卡行，收到支付请求后走传统授权流程——检查余额、风控、确认是本人认证。银行说行，钱才动。
4. **支付机构做什么**：Worldline处理收单和发卡两端的支付流程，确保Agent发起的交易符合现有支付规范。
5. **关键边界**：Agent不碰钱、不碰凭证、不做最终授权。它只是一个"会说话的购物车"。

## 三、为什么这个设计重要

1. **责任清晰**：Agent推荐，客户批准，银行授权。出了问题各负其责——Agent错了是AI公司的问题，客户批准了是客户的责任，银行授权错了是银行的问题。
2. **不颠覆现有体系**：支付还是走Visa/Mastercard网络，认证还是走银行的3DS/生物识别，授权还是发卡行说了算。Agent只是在前面加了一层。
3. **风控不丢**：银行的反欺诈系统照样跑——Agent发起的交易和人发起的交易一样，要过风控。
4. **可扩展**：这个模式可以复制到任何商家、任何Agent、任何银行。因为它用的是现有支付基础设施，不是另起炉灶。

## 四、对中国银行的启示

1. **封是下策，纳入是上策**：封掉AI Agent，客户还是会想办法用——就像当年封网银一样。不如把Agent纳入可控的支付体系。
2. **数字人民币可能是抓手**：欧洲用Visa/Mastercard，中国可以用数字人民币做Agent支付的底层——给Agent发数字人民币钱包，设定限额和用途，银行监控。
3. **银行的授权角色不能丢**：Agent可以做搜索、推荐、比价，但最后付钱必须银行授权。这是银行的核心价值，也是风控的最后一道防线。
4. **先做小额场景**：音乐会门票、日用品、餐饮——这些小额、低风险的场景先试。大额支付、转账、投资，还是要更严格的认证。
5. **标准要先行**：Agent怎么认证身份？怎么和银行系统对接？出了问题怎么追溯？这些标准要银行和监管一起定，不能等科技公司定完了再追。

## 五、三个冷静判断

1. **欧洲还只是试点**：两笔交易，规模很小。能不能大规模推广，还有很多问题——Agent数量多了怎么办？跨境怎么办？复杂产品怎么办？
2. **银行封也不全是因为安全**：AI Agent会自动把闲置资金转到高收益产品，银行存款会流失。安全是明面上的理由，商业利益是暗地里的。
3. **Meta Muse的下载量不代表信任**：6周1000万人用，但银行和零售商都在封。下载量是一回事，能不能碰钱是另一回事。

## 六、和本站其他文章的呼应

1. **和美国银行封AI助手呼应**：那篇讲美国怎么封，这篇讲欧洲怎么纳入——同一个问题，两种解法。
2. **和OCC监管框架呼应**：OCC把自主支付Agent列为Tier 1最高风险。欧洲路径正好是"人在回路"——Agent不自主支付，客户批准+银行授权，风险降到Tier 2。
3. **和Claude Personal Finance呼应**：Claude只读银行账单，不碰钱。欧洲的Agent能发起支付，但不碰授权——都是"AI做辅助，人做决定"。

## 七、银行落地清单

1. **先做Agent身份认证**：每个Agent要有唯一标识，银行知道是谁在发起交易。
2. **设定Agent限额**：单笔限额、日累计限额、可交易的商户类别——和信用卡限额一个逻辑。
3. **保留人工确认环节**：哪怕是小额，也要客户能看到、能批准、能撤销。
4. **Agent交易单独标记**：在交易流水里标清楚是Agent发起的，方便风控和追溯。
5. **建立Agent黑名单机制**：发现恶意Agent，全网银行都能封掉。

## 结语

AI Agent碰钱这个问题，不会因为银行封就消失。客户需要、商家需要、科技公司在推。与其封，不如想清楚怎么让它安全地碰。欧洲的答案是：Agent做Agent擅长的（搜索、推荐、比较），银行做银行擅长的（认证、授权、风控）。边界划清楚，Agent就能碰钱。银行的角色不是被替代，而是从"人面对的银行"变成"Agent也面对的银行"。

（口径说明：事实来自Worldline、ING官方公告、Aetos.AI、AInvest报道；银行场景映射为作者分析。）
