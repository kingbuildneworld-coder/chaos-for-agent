---
title: "Sibos 2026 深度研究之三：即时支付与 24/7 世界——ISO 20022、跨境提速与互操作"
date: 2026-10-07
description: "本报告研究即时支付与 24/7 世界：Fedwire 2025 年 7 月完成 ISO 20022 切换，2026 年 11 月对齐 CPMI 统一数据要求；CPMI 经 PIE 工作组推动标准协调，快速支付系统互联成跨境提速关键路径；美国 FedNow 与 RTP 双轨并行，存量核心系统仍是最大障碍；花旗 24/7 美元清算连接 50 多个市场 300 余家机构。基于 CPMI、SWIFT、FedPayments 等英文官方信源。"
tags: ["Sibos","即时支付","ISO20022","FedNow","跨境支付","互操作性","CPMI","24/7"]
schema_type: Article
references:
  - title: "Harnessing the Power of ISO 20022: How Harmonized ISO 20022 Data Requirements are Enhancing Payments（2026-05-15）"
    url: "https://fedpaymentsimprovement.org/news/blog/harnessing-the-power-of-iso-20022-how-harmonized-iso-20022-data-requirements-are-enhancing-payments/"
    source: "FedPayments Improvement"
  - title: "BIS CPMI: Fostering ISO 20022 Harmonisation——PIE Task Force 2026 follow-up report"
    url: "https://www.bis.org/pages/cpmi-cross-border-payments-programme/pietf-iso20022-2026.pdf"
    source: "Bank for International Settlements (CPMI)"
  - title: "BIS CPMI Brief 7: Acta non verba——interlinking fast payment systems to enhance cross-border payments"
    url: "https://www.bis.org/publications/cpmi-brief-7-acta-non-verba-interlinking-fast-payment-systems-enhance-cross-border-payments.pdf"
    source: "Bank for International Settlements (CPMI)"
  - title: "BIS CPMI: Harmonisation of ISO 20022——partnering with industry for faster, cheaper, and more transparent cross-border payments"
    url: "https://www.bis.org/cpmi/publ/d211.pdf"
    source: "Bank for International Settlements (CPMI)"
  - title: "BIS CPMI Brief 11: The future of financial messaging——navigating the ISO 20022 migration journey"
    url: "https://www.bis.org/cpmi/publ/brief11.pdf"
    source: "Bank for International Settlements (CPMI)"
  - title: "OpenFedNow Whitepaper: Bridging Legacy Core Banking to Both U.S. Instant Payment Rails——FedNow and RTP"
    url: "https://zenodo.org/records/21114113/files/OpenFedNow_Whitepaper_DualRail_Public.pdf?download=1"
    source: "Zenodo（OpenFedNow 白皮书）"
  - title: "The Eurosystem's comprehensive payments strategy（2026-03-31）"
    url: "https://zentral-bank.eu/press/pubbydate/2026/html/ecb.eurosystemcomprehensivepaymentsstrategy202603.en.html"
    source: "European Central Bank"
  - title: "Citi: Siam Commercial Bank collaborates with Citi to pioneer 24/7 USD clearing for near real-time cross-border payments（2026-07-09）"
    url: "https://www.citigroup.com/global/news/press-release/2026/siam-commercial-bank-citi-24-7-usd-clearing-near-real-time-cross-border-payments-citi-token-services"
    source: "Citi"
  - title: "Swift at Sibos 2026：ISO 20022 Practice（Frank Van Driessche，Fedwire/FedNow ISO 20022 实施）"
    url: "https://www.swift.com/news-events/events/sibos-2026-miami"
    source: "Swift"
---

# Sibos 2026 深度研究之三：即时支付与 24/7 世界——ISO 20022、跨境提速与互操作

**Sibos 2026 即时支付议题的核心是 ISO 20022 全球迁移：Fedwire 已于 2025 年 7 月完成切换，2026 年 11 月再对齐 CPMI 统一数据要求。** 从迈阿密的议程看，即时支付（instant payments）已从"要不要做"进入"怎么做才能全球互操作"的阶段——主角是消息标准（ISO 20022）与快速支付系统互联（FPS interlinking）。

**CPMI 通过 PIE 工作组推动 ISO 20022 统一数据要求，快速支付系统互联成为跨境提速的关键路径。** 巴西的 PIX、美国的 FedNow 与 RTP、欧洲的即时支付都在同一套 ISO 20022 骨架上生长，谁先实现"系统间互联"，谁就先实现 7×24 跨境。

**美国即时支付形成 FedNow 与 RTP 双轨格局，两者同用 ISO 20022，但存量核心系统仍是最大障碍。** 白皮书直言：大部分美国金融机构仍被传统核心银行系统挡在两条快轨之外。

**花旗 24/7 美元清算连接 50 多个市场 300 余家机构，即时跨境支付正从口号变成商业产品。** 结合 SWIFT 区块链账本的代币化存款通道，跨境支付的"营业时间"正在被消灭。

## 一、ISO 20022：全球支付语言的"统一运动"

ISO 20022 是金融消息领域的国际开放标准，以结构化、模型驱动的方式承载支付、证券、贸易与外汇数据。其意义有二：一是**取代碎片化专有格式**（此前各系统用各自的语言通信）；二是**富数据**——随消息传递完整的结构化信息（收款方、用途、法律实体等），为直通处理（STP）、自动化与防欺诈提供原料（ECB 口径；BIS CPMI Brief 11）。

**美国的关键节点：**

- **2025 年 7 月 14 日**：Fedwire Funds Service（美联储大额资金转账系统）完成 ISO 20022 切换，参与者可立即使用 CPMI 支付数据模型处理美元大额电汇（FedPayments Improvement，2026-05）。
- **2026 年 11 月**：Fedwire 将发布新版本，把最初实施与 CPMI 修订后的统一数据要求（harmonised data requirements）对齐——解决"各机构按不同方式实现同一个标准"的碎片化问题。

**全球层面：** CPMI 下设的 PIE 工作组（Payments Interoperability and Extension Task Force）在 2026 年发布跟进报告，对全球市场基础设施与 CPMI 统一数据要求的对齐状态做了扩展审查，覆盖实时全额结算（RTGS）系统运营方（BIS CPMI，2026）。共识是：**统一数据要求本身不消除碎片化——只有全球一致的实施才能**。这与 SWIFT 停止支持 MT 消息格式（跨境支付向 ISO 20022 迁移）的进程互为表里。

## 二、快速支付系统互联：跨境提速的"下一跳"

CPMI 在《Acta non verba》（不止于口号）简报中系统论证了快速支付系统（FPS）互联对跨境支付的价值：把各国即时支付系统（PIX、FedNow、RTP、UPI、SWIFT gpi Instant 等）通过接口或代理互联，让跨境支付享受境内即时支付的体验（BIS CPMI Brief 7）。

对 G20 跨境支付路线图（更便宜、更快、更透明、更可及）而言，FPS 互联被视为**中期最优解之一**——无需重建跨境网络，而是复用各国已建成的即时支付基础设施。标准层面的前提仍是 ISO 20022：PIX、FedNow、RTP 均采用 ISO 20022 消息标准，为互联提供了共同语法（OpenFedNow 白皮书）。

**美国双轨格局：** FedNow（美联储运营）与 RTP（清算所运营）并行，两者都对核心银行系统提出同样的四个实时要求（余额校验、流动性、风险控制、全天候运行），也都使用 ISO 20022。白皮书指出：**阻碍美国机构接入的并非标准，而是遗留核心系统**——这让"即时支付"在美国出现了一个悖论：网络已就绪，银行未就绪（OpenFedNow 白皮书）。

## 三、24/7 美元清算：跨境支付的"营业时间革命"

花旗在本届大会前后推进的 **24/7 美元清算（24/7 USD Clearing）** 是即时跨境支付商业化的代表：与 Citi Token Services 结合，连接 50 多个市场 300 余家金融机构，打破传统结算的截止时间与周末限制（Citi 官方，2026-07-09）。首笔交易由泰国菲利普证券完成。

这条路径与 SWIFT 区块链账本（见本系列第二篇）形成合流：**即时消息 + 代币化存款 + 24/7 清算**，共同把跨境支付从"T+1 营业日内"推向"7×24 分钟级"。

## 四、挑战：速度的代价

1. **欺诈窗口压缩**：即时支付让"撤销交易"几乎不可能，欺诈防控必须前置到发起环节——这正是沃勒在 Sibos 演讲中强调"反欺诈模型要针对代理支付模式重新校准"的现实背景；
2. **流动性管理**：7×24 结算要求参与机构全天候管理日间流动性，央行流动性工具需要配套；
3. **遗留系统迁移成本**：ISO 20022 富数据模型的收益，只有核心系统完成改造才能兑现——美国双轨格局的教训对全球普适；
4. **互联的政治经济学**：FPS 互联涉及汇率、合规、治理差异，BIS 简报坦承"知易行难"（Acta non verba 标题即此意）。

## 五、对中国支付体系的对照

1. **CIPS（人民币跨境支付系统）的 ISO 20022 路线**：与国际标准对齐是降低跨境成本、提升直通率的必要路径，Fedwire 的切换与 2026-11 对齐动作值得跟踪对照；
2. **数字人民币与即时支付互联**：国内快速支付基础设施（网联/银联）与境外 FPS 的互联试验，可参考 CPMI 简报给出的接口/代理两种模式；
3. **"先网络、后银行"的教训**：美国即时支付普及受困于遗留核心系统，提示国内在推进 7×24 时同步解决机构侧系统就绪问题；
4. **跨境合规自动化**：富数据 + AI（LLM 提升制裁筛查准确度，见沃勒演讲）是跨境提速与合规的平衡点，值得作为组合拳推进。

## 结语

Sibos 2026 的即时支付议题传达的讯息很清楚：**标准统一（ISO 20022）与网络互联（FPS interlinking）是 24/7 世界的两条腿**。美国 Fedwire 的切换与对齐、CPMI 的统一数据要求、花旗 24/7 美元清算与 SWIFT 账本的合流，勾勒出跨境支付未来五年的演进路径。对中国而言，CIPS 的标准化、数字人民币的互联试验与机构侧就绪，是同一张时间表上的三个任务。
