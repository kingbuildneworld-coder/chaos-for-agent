---
title: "Sibos 2026 深度研究之二：代币化与"智能货币"——从 SWIFT 区块链账本到互操作性之争"
date: 2026-10-07
description: "本报告聚焦代币化与"智能货币"：稳定币、代币化存款与批发型 CBDC 构成三支柱；SWIFT 区块链账本 2026 年 7 月上线、17 家银行跨六大洲试点，渣打-汇丰首笔跨境代币化存款、花旗打通中东与东南亚、西门子 FX 代币化存款等里程碑密集落地；BIS 与央行界强调"货币单一性"与互操作性。基于 SWIFT、BIS、ECB、IMF 及银行官方英文信源，剖析现状、监管立场与挑战。"
tags: ["Sibos","代币化","智能货币","稳定币","代币化存款","CBDC","SWIFT账本","互操作性"]
schema_type: Article
references:
  - title: "Swift's blockchain ledger ready for use as 17 banks set to pioneer tokenised cross-border payments（2026-07-09）"
    url: "https://www.swift.com/news-events/press-releases/swifts-blockchain-ledger-ready-use-17-banks-set-pioneer-tokenised-cross-border-payments-trusted-global-infrastructure"
    source: "Swift"
  - title: "Building the digital payment stack of the future——Swift blockchain-based ledger"
    url: "https://www.swift.com/payments/payment-innovation/blockchain-based-ledger"
    source: "Swift"
  - title: "Standard Chartered and HSBC execute first live tokenised deposit transaction on Swift's blockchain-based ledger（2026-08-19）"
    url: "https://www.sc.com/en/press-release/standard-chartered-and-hsbc-execute-first-live-tokenised-deposit-transaction-on-swifts-blockchain-based-ledger"
    source: "Standard Chartered"
  - title: "HSBC and BNP Paribas Trial FX Tokenised Deposit With Swift（2026-09-07）"
    url: "https://fintechmagazine.com/news/hsbc-and-bnp-paribas-trial-fx-tokenised-deposit-with-swift"
    source: "FinTech Magazine"
  - title: "Citi moves tokenised deposits on Swift ledger with FAB and OCBC（2026-09-03）"
    url: "https://www.financexmagazine.com/post/citi-moves-tokenised-deposits-on-swift-ledger-with-fab-and-ocbc"
    source: "FinanceX Magazine"
  - title: "Citi And DBS Execute First Tokenized Cross-Border Deposits Via SWIFT（2026-09-07）"
    url: "https://menafn.com/1111631142/Citi-And-DBS-Execute-First-Tokenized-Cross-Border-Deposits-Via-SWIFT"
    source: "MENAFN"
  - title: "Mizuho and UBS Execute Cross-Border Trials on Swift's Shared Ledger（2026-10-02）"
    url: "https://www.fintechobserver.com/mizuho-and-ubs-execute-cross-border-trials-on-swifts-shared-ledger-to-advance-24-7-tokenized-settlements/"
    source: "Japan FinTech Observer"
  - title: "BIS speech: Pushing the monetary frontier——stablecoins and tokenised deposits（2026-08-28）"
    url: "https://www.bis.org/speeches/20260828-pushing-monetary-frontier-stablecoins-and-tokenised-deposits"
    source: "Bank for International Settlements"
  - title: "BIS speech: Anchoring trust in money——innovation beyond stablecoins（Project Agorá，2026-06-28）"
    url: "https://www.bis.org/speeches/20260628-anchoring-trust-money-innovation-beyond-stablecoins_1.pdf"
    source: "Bank for International Settlements"
  - title: "Deutsche Bank White Paper: Digital Money——a perspective on stablecoins, tokenised deposits, and CBDCs（2026）"
    url: "https://flow.db.com/files/documents/more/publications/white-papers-guides/2026/DB-Digital-Money-WP-2026-30pp-Web-Secured.pdf"
    source: "Deutsche Bank"
  - title: "ECB: Money in the digital age——digital euro, tokenisation and the role of central banks（2026-10-06）"
    url: "https://www.ecb.europa.eu/press/key/date/2026/html/ecb.sp261006~0da978f159.en.html"
    source: "European Central Bank"
  - title: "Bank of England: Modernising money and markets——speech by Sarah Breeden（2026-05-19）"
    url: "https://www.bankofengland.co.uk/speech/2026/may/sarah-breeden-speech-at-city-week-the-future-of-money-in-a-digital-world"
    source: "Bank of England"
  - title: "Chainlink: Sibos 2026 Recap——CCIP 2.0 and Swift ledger connectivity（2026-10-01）"
    url: "https://chain.link/blog/sibos-2026-recap"
    source: "Chainlink"
---

# Sibos 2026 深度研究之二：代币化与"智能货币"——从 SWIFT 区块链账本到互操作性之争

**Sibos 2026 的代币化议题从"概念验证"走向"真实部署"，稳定币、代币化存款与批发型 CBDC 构成"智能货币"三支柱。** 德意志银行在本届大会发布的《数字货币》白皮书给出了清晰的分类框架：稳定币是对发行方储备的债权、典型用于加密流动性与美元流动性；代币化存款是记账在可编程平台上的银行存款负债，通过央行账户完成银行间结算；批发型 CBDC 是央行发行的代币化央行货币，用于金融机构间结算与代币化资产的钱券对付（DvP）（德银白皮书）。

**SWIFT 区块链账本 2026 年 7 月 9 日上线，17 家银行跨六大洲试点代币化存款跨境支付。** 这是传统金融基础设施首次以"许可制区块链账本 + 现有消息体系"的组合规模化承载代币化资产——从启动开发到上线仅用九个月（Swift 官方新闻稿）。

**渣打与汇丰 8 月 19 日完成首笔跨境代币化存款交易，花旗随后打通中东与东南亚走廊。** 进入 9 月，HSBC 与 BNP Paribas 为西门子完成首笔企业司库 FX 代币化存款，瑞穗与瑞银在日元/瑞郎走廊完成双边试验——几乎每周一个里程碑。

**BIS 与央行界强调"货币单一性"与互操作性：代币化存款若困于孤岛，就难以成为可规模化的货币形态。** 这是本届大会"智能货币"议题的题眼：技术可行性已被证明，剩下的竞争是标准与治理。

## 一、什么是"智能货币"：一张表看懂三种形态

德银白皮书用一张表界定了三者的发行方、责任与近期用途：

| 数字货币类型 | 发行方/责任 | 典型轨道 | 近期主要用途 |
|---|---|---|---|
| 稳定币 | 发行方（储备资产背书） | 公链/私有链 | 加密流动性、跨境试验、美元流动性（BIS 估计 2026 年 4 月初市值约 3150 亿美元） |
| 代币化存款 | 商业银行（存款负债） | 银行间 DLT 或与 RTGS 集成 | 代币化资产结算、7×24 跨境支付 |
| 批发型 CBDC | 央行 | 央行 DLT 或 RTGS 集成 | 代币化资产 DvP、代币化存款的锚 |
| 零售型 CBDC | 央行（经 PSP 分发） | 钱包/零售支付设施 | 数字欧元等区域支付、普惠与韧性 |

关键区别在**结算最终性**：代币化存款是"账户型银行负债"，付款借记付款人余额、贷记收款人余额，银行间结算仍通过央行账户在后台完成——这保证了"货币单一性"（claims redeemable at par with central bank money with finality）（BIS，2026-08-28 演讲）。

## 二、2026 年里程碑编年史：从上线到真实交易

**7 月 9 日：SWIFT 区块链账本上线。** 17 家银行（含 ANZ、BNP Paribas、BNY、花旗、DBS、FAB、FirstRand、汇丰、瑞银、富国、渣打等）准备试点代币化存款跨境支付，实现 7×24 支付可用与更好的流动性效率（Swift 官方）。账本采用 Consensys 的 Linea 风格 zk-EVM 架构，以 Chainlink CCIP 作为跨链互操作层（traceegroup 分析；Chainlink 官方 Sibos 回顾确认 CCIP 2.0 发布）。

**8 月 19 日：首笔真实跨境交易。** 渣打与汇丰宣布成功完成**首笔银行间跨境代币化存款交易**：通过 SWIFT 区块链账本发行、转让、记录并结算代币化存款，验证了"独立开发的银行基础设施之间"的互操作性（渣打官方新闻稿）。Rosa & Roubini 分析指出，这是"代币化银行货币互操作性决定其未来"的关键证据。

**9 月 2 日：花旗连通中东与东南亚。** 花旗成为首家在 SWIFT 新区块链上转移客户资金的美国银行，与阿布扎比第一银行（FAB）和华侨银行（OCBC）完成美元跨境结算——分别是 SWIFT 账本在中东与东南亚的首笔交易，且发生在传统截止时间之外（FinanceX Magazine）。

**9 月 7 日：企业司库首单。** HSBC 与 BNP Paribas 为西门子完成首笔**带 FX 的跨境代币化存款**：资金从西门子在法国法巴的欧元账户，移动到英国汇丰的英镑账户——历史上首笔为企业司库执行的多银行 FX 代币化存款（FinTech Magazine）。

**9 月 7 日：周末支付。** 花旗与 DBS 完成首笔新加坡—美国"周末代币化跨境支付"，通过 SWIFT 账本在几分钟内结算——直接挑战传统跨境支付的营业时间限制（MENAFN）。

**10 月 2 日：日元/瑞郎走廊。** 瑞穗与瑞银在 SWIFT 共享账本上完成双边试验，验证日元与瑞郎两种主要储备货币的代币化存款互操作（Japan FinTech Observer）。

## 三、央行与 BIS 的立场：繁荣之下，四条红线

1. **货币单一性（Singleness of Money）优先**：BIS 明确，代币化存款模型"以央行货币结算"才能保证单一性——任何脱离央行货币锚的"私钱"设计都被视为风险源（BIS，2026-08-28）。
2. **互操作性决定成败**：BIS 警告，大多数法币稳定币"各自为政"地流通，代币化存款若困在内部体系就是"孤岛创新"；SWIFT 账本的价值恰在于把互操作做成基础设施（Swift/BIS 口径一致）。
3. **原子结算与合规内嵌**：BIS 在 Project Agorá 中验证，代币化存款与央行储备在同一共享平台原子结算跨币种批发支付是可行的——预筛查、制裁检查、可审计痕迹可以"按设计内嵌"（integrity by design）（BIS，2026-06-28）。
4. **多货币体系而非单一替代**：英国央行 Sarah Breeden 主张"多元货币体系"——传统存款、代币化存款、受监管稳定币与（潜在的）零售 CBDC 并存竞争，基础设施确保各形态"同等稳健、可随时兑换"（BoE，2026-05）。欧洲央行 10 月 6 日最新演讲则强调：代币化的收益（原子结算、自动化、流动性效率）只有在代币化市场能获得充足央行流动性时才充分兑现（ECB，2026-10-06）。

## 四、结构性挑战：技术已通，治理未定

- **结算最终性分层**：代币化存款的"最终性"依赖央行结算——那么它比稳定币强在"合规锚"，弱在"创新自由度"；两类资产在跨境场景的边界仍待监管明确。
- **互操作标准之争**：平台专属 vs 跨系统互操作标准，与代理式商业的标准之争同构；Swift 账本抢占的是"公共层"身位。
- **稳定币监管竞速**：稳定币市值约 3150 亿美元（BIS 2026-04 估计），其发行、储备、赎回机制在全球主要司法辖区加速立法，与代币化存款形成"影子竞争"。
- **流动性设计**：代币化市场需要央行流动性供给机制（如抵押便利），否则 7×24 结算会放大流动性风险（ECB 观点）。

## 五、对中国市场的启示

1. **数字人民币的"可编程货币"身位**：批发型 CBDC 与代币化存款的组合，国内数字人民币双层架构早有类似设计，可对照 BIS"原子结算+合规内嵌"思路完善跨境场景；
2. **香港与内地代币化试验可对表 Swift 账本**：关注 SWIFT 账本的治理、隐私与最终性设计，作为国际标准参与的参照系；
3. **互操作性布局要提前**：国内支付基础设施（CIPS、网联、银联）与境外代币化轨道的连接方式，是下一轮国际支付标准竞争的关键卡位点；
4. **银行产品储备**：代币化存款对跨境贸易融资、供应链金融的改造（7×24、DvP、可编程），值得国内大行提前做产品级预研。

## 结语

Sibos 2026 的"智能货币"议题给出了一个明确的时间表：**2026 年是代币化存款从"试点"到"商用"的元年**——SWIFT 账本上线、首笔跨境交易、企业司库首单、周末支付接连落地。技术可行性不再是问题，剩下的竞争在标准、治理与流动性设计。对中国而言，数字人民币的双层架构与 SWIFT 账本形成有趣的对照实验：谁先把"可编程货币"的信任机制建好，谁就定义下一个十年的国际支付规则。
