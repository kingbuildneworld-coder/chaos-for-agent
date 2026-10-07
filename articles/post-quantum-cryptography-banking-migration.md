---
title: "量子时钟滴答作响：后量子密码（PQC）大迁移与银行业的"密码长城"重构"
date: 2026-10-08
description: "量子计算威胁已从理论走向监管指令：美国 EO 14412 强制联邦系统限期迁移后量子密码（PQC），G7 发布金融业迁移关键考量，香港金管局量子准备度指数首评仅 2.3/10。本文梳理 NIST FIPS 203/204/205 标准、BIS Project Leap 央行实测、HKMA/FINMA/德国银行业监管动向与中国抗量子方案，并从银行风险管理视角给出落地五件事与智能体时代的特殊考量。"
tags: ["后量子密码","量子计算","PQC迁移","金融安全","密码学","风险管理","网络韧性","银行业数字化转型"]
schema_type: Article
references:
  - title: "NIST: Announcing Approval of Three Federal Information Processing Standards (FIPS) for Post-Quantum Cryptography（2024-08-13）"
    url: "https://www.nist.gov/news-events/news/2024/08/announcing-approval-three-federal-information-processing-standards-fips"
    source: "NIST（美国国家标准与技术研究院）"
  - title: "NIST NCCoE: Frequently Asked Questions about Post-Quantum Cryptography（含 EO-14412/NSM-8 说明，2026-06-30）"
    url: "https://pages.nist.gov/nccoe-migration-post-quantum-cryptography/FAQ/"
    source: "NIST"
  - title: "GovInfo: Executive Order 14412——Securing the Nation Against Advanced Cryptographic Attacks（2026-06）"
    url: "https://www.govinfo.gov/content/pkg/DCPD-202600417/pdf/DCPD-202600417.pdf"
    source: "GovInfo（美国官方）"
  - title: "BIS: Project Leap——quantum-proofing payment systems（Phase 2 完成，2025-12）"
    url: "https://www.bis.org/project/leap"
    source: "Bank for International Settlements"
  - title: "BIS: Quantum-proofing payment systems（othp107 报告）"
    url: "https://www.bis.org/publ/othp107.pdf"
    source: "Bank for International Settlements"
  - title: "HKMA: 金管局发表量子准备度白皮书及指数 支援银行业迎接量子时代（2026-07-27）"
    url: "https://www.hkma.gov.hk/gb_chi/news-and-media/press-releases/2026/07/20260727-3"
    source: "香港金融管理局"
  - title: "Banca d'Italia（G7 网络专家组）: Preparing for Quantum Technologies——Key Considerations for Financial Sector Participants（2026-05）"
    url: "https://www.bancaditalia.it/media/notizie/2026/G7_Key_Considerations_for_Financial_Sector_Participants_May_2026.pdf"
    source: "意大利央行（G7 CEG）"
  - title: "Deutsche Kreditwirtschaft: Position Paper on the Impact of the Development of Quantum Computers on Cryptography（2026-09-21）"
    url: "https://die-dk.de/media/files/DK_Position_Quantencomputing_20260921.pdf"
    source: "德国银行业委员会"
  - title: "ID Quantique: FINMA's Quantum Computing Guidance——What It Means for Financial Institutions（2026-09-08）"
    url: "https://www.idquantique.com/finmas-quantum-computing-guidance/"
    source: "ID Quantique（转述瑞士 FINMA 指引）"
  - title: "证券时报：全球首个抗量子密码平滑迁移解决方案在沪发布（2026-05-20）"
    url: "https://www.stcn.com/article/detail/3918698.html"
    source: "证券时报"
  - title: "台湾外汇经纪商协会：後量子密碼學（PQC）於金融支付與交易系統之遷移策略與風險管理（含金管会 2026-06 指引，2026-07）"
    url: "https://www.tpefx.com.tw/uploads/download/tw/20260721_17.pdf"
    source: "台湾外汇经纪商协会（金融监管参考）"
  - title: "MAS: MAS Collaborates with Banks and Technology Partners on Quantum Security（2024-08-14）"
    url: "https://www.mas.gov.sg/news/media-releases/2024/mas-collaborates-with-banks-and-technology-partners-on-quantum-security"
    source: "新加坡金融管理局"
---

# 量子时钟滴答作响：后量子密码（PQC）大迁移与银行业的"密码长城"重构

**量子计算机（CRQC）足以破解 RSA 与椭圆曲线等主流公钥密码，"现在收获、以后解密"使今日金融数据可能在未来被批量解密。** 这不是科幻——美国官方对"具备密码分析相关能力的量子计算机"（cryptanalytically relevant quantum computer, CRQC）的定义已写入总统备忘录，全球主要央行和监管机构从 2025 年起密集发布迁移指令。

**NIST 已于 2024 年 8 月批准 FIPS 203/204/205 三项后量子密码标准，全球迁移的技术基准已经就位。** 标准从"讨论"进入"实施"阶段，金融机构面对的已不是"要不要迁"，而是"怎么在期限内迁完"。

**美国 EO 14412 与 G7 金融路线图设定了硬性时间表：高价值联邦资产须在 2030 年前完成迁移。** 行政命令还要求联邦承包商合规——而承包商就是银行、云厂商与支付网络。

**香港金管局量子准备度指数首评 2.3/10：半数受访银行尚无正式 PQC 计划，32% 尚未启动迁移。** 香港是全球首个由监管机构发布银行量子准备度量化指数的地区，2.3 分敲响了整个银行业的警钟：准备度与时间表的差距，就是未来五年的最大技术风险敞口。

## 一、威胁机制：为什么银行必须现在动手

### 什么是 Q-Day 与 CRQC

公钥密码学（RSA、ECC 椭圆曲线）是现代金融系统的地基：TLS 加密、数字签名、证书体系、SWIFT 消息认证、央行清算系统，全部依赖"大数分解与离散对数在经典计算机上极难"这一假设。1994 年的 Shor 算法证明，一台足够强的量子计算机可以在多项式时间内破解这一切。所谓 **Q-Day**，就是 CRQC 落地的那一天——届时的公钥密码体系将从"数学上安全"变为"数学上已破"。

### "现在收获、以后解密"：时间差攻击

比 Q-Day 本身更危险的是**数据回收攻击（harvest now, decrypt later）**：攻击者今天截获并存储加密流量与密文，等未来量子计算机成熟后再批量解密。对银行而言，这直接击中两个软肋：

1. **长时效数据**：房贷、存款、证券账户记录、跨境支付报文，保密期限横跨数十年——今天加密的报文，2035 年可能被批量读出；
2. **身份的不可撤销性**：长期有效的数字证书、密钥对一旦被破解，历史签名可被追溯伪造，涉及法律效力与交易不可否认性。

美国官方对此的定义与政策（NSM-8、EO 14412）之所以强调"立即开始"，正是因为迁移周期（盘点、替换、联调、验证）长达数年，而数据回收攻击今天就在发生。

## 二、标准与时间表：全球监管的"军令状"

### NIST：技术基准已就位

2024 年 8 月 13 日，美国国家标准与技术研究院（NIST）批准三项后量子密码联邦信息处理标准（FIPS）：

- **FIPS 203（ML-KEM）**：基于模块格的关键封装机制，用于密钥交换；
- **FIPS 204（ML-DSA）**：基于格的数字签名；
- **FIPS 205（SLH-DSA）**：无状态哈希签名（抗量子备用方案）。

三项标准共同覆盖"密钥建立 + 数字签名"两大核心需求，全球多数实施（TLS、签名、证书）将以 ML-KEM/ML-DSA 为主。NIST 同时推进 HQC 作为第五个加密算法的选择，第四轮状态报告于 2025 年 3 月发布（NIST）。

### 美国：EO 14412 + NSM-8

2026 年 6 月，白宫签署行政命令 **EO 14412《Securing the Nation Against Advanced Cryptographic Attacks》**（GovInfo 全文）：强制联邦信息系统**加速、政府范围**迁移至 NIST 批准的 PQC 标准；为**高价值资产设定有约束力的期限**（binding deadlines）；指示联邦采购监管委员会（FAR Council）要求承包商遵守 NIST PQC 标准（NIST FAQ）。配套的 NSM-8 备忘录给出迁移指引——国家安全系统须在 2030 年前完成、其余联邦系统 2035 年前完成（NIST FAQ/FR 原文）。

### G7：金融业的"关键考量"

2026 年 5 月，G7 网络专家组（Cyber Expert Group）经意大利央行发布《为量子技术做好准备：金融业参与者关键考量》：**PQC 迁移不是一次简单的替换**——实践中需要盘点密码依赖关系、测试与现有系统的兼容性、并与外部对手方和服务商协调更新。这是目前国际层面最权威的金融业迁移方法论（Banca d'Italia）。

## 三、央行与行业实测：BIS Project Leap 与监管体检

### BIS Project Leap：央行系统的"真金白银"测试

国际清算银行创新枢纽主导的 **Project Leap** 分两阶段验证了支付系统的量子化加固：

- **Phase 1（2023）**：在央行间建立"量子安全混合 VPN"，验证用后量子加密方案保护支付消息传输的可行性；
- **Phase 2（2025 年 7 月启动，12 月完成）**：意大利央行、法国央行与德国央行在欧元区大额实时结算系统 **TARGET2** 上，用后量子密码签名完成流动性转账测试——**全部测试通过**，从实操层面证明"支付系统量子化加固"可行（BIS 官方项目页）。

值得注意的工程现实（技术社区观察）：PQC 签名在部分环节的验证性能代价（约慢 7.5 倍）与签名体积增长，提示生产级迁移需要同步优化报文缓冲与性能预算——可行性已证，工程化仍在路上（sivasub 技术分析，2026-05）。

### 监管"体检"：全球银行业准备度偏低

- **香港金管局（HKMA）**：2026 年 7 月 27 日发布 56 页《香港银行业量子准备度白皮书》与首个**量子准备度指数（QPI）**，首评 **2.3/10**（认知 2.4、规划 2.5、试行 1.8、实务准备 2.3）。调查发现：68% 的银行已认知或积极规划量子时代，但**约半数银行没有正式的 PQC 迁移计划，32% 尚未启动任何迁移步骤**。金管局目标：2030 年指数达到满分 10，并已与香港科技大学合作开发 PQC 工具包（HKMA 官方；PostQuantum/CoinDesk 交叉印证）。
- **瑞士（FINMA）**：2026 年 9 月发布《量子计算》指引（Guidance 05/2026），明确量子相关网络风险"不再是理论问题"；其对 60 家受监管机构的调查显示，多数机构认知充分但行动有限（据 ID Quantique 转述）。
- **德国银行业委员会**：2026 年 9 月 21 日发布立场文件，一个让行业稍安的技术结论——**对称密码（如 AES）对量子攻击有足够防护**，卡片支付中的三重 DES 替换为 AES 已足够；但**非对称密码（RSA/ECC）必须迁移**，工作不能放缓（Deutsche Kreditwirtschaft）。

## 四、中国的进展：混合架构与迁移指引

- **内地**：2026 年 5 月，海光信息联合国泰海通证券、格尔软件在上海发布**全球首个抗量子密码平滑迁移解决方案**——采用"商密+抗量子密码"混合架构，支持传统密码、混合密码与纯抗量子密码的平滑切换，为金融、政务、能源等关键领域提供可落地路线（证券时报，2026-05-20）。
- **台湾地区**：金融监管机构 2026 年 6 月颁布《金融业后量子密码迁移参考指引》，提出七大策略方向与至 2035 年的推动时程（台湾外汇经纪商协会整理）。
- **新加坡**：MAS 早在 2024 年 8 月即与 DBS、汇丰、华侨、大华、SPTel、SpeQtral 签署量子安全合作备忘录，研究量子密钥分发（QKD）在金融服务的应用（MAS 官方）。

## 五、银行落地的五件事与智能体时代的特殊考量

从银行风险管理一线视角，PQC 迁移不是 IT 项目，而是**战略级安全工程**，建议按五步推进：

1. **密码资产盘点（Inventory）**：先回答"我们的 RSA/ECC 用在哪里"——TLS 证书、签名密钥、SWIFT/支付消息认证、内部 PKI、供应商链路，逐项建立依赖清单。这是 G7 关键考量的第一步，也是绝大多数银行尚未完成的工作。
2. **分层优先级（Triage）**：按"数据保密期限 × 系统关键性"排序——长时效数据（账户、报文、监管记录）、高价值资产系统（清算、托管、跨境支付）优先；测试环境、低敏系统靠后。
3. **混合双轨（Hybrid）**：迁移期采用"传统+PQC"混合模式（中国方案即此思路），避免"一刀切切换"的兼容性风险，同时为 TLS 1.3、证书体系预留混合参数协商。
4. **供应商协同（Ecosystem）**：密码替换必须与核心系统厂商、云服务商、支付网络、对手方银行同步升级——单方迁移毫无意义，这正是 G7 强调"与外部对手方协调"的原因。
5. **测试与回退（Test & Rollback）**：在 TARGET2 式真金白银测试之前，先在沙箱验证性能预算（PQC 签名更大、更慢）、证书大小对报文缓冲的影响，并保留回退机制。

**智能体时代的特殊考量**：随着银行把 AI 智能体接入支付、风控与客户服务（见本站 Sibos 系列报告），**智能体之间的身份认证、工具调用签名、TLS 链路**同样依赖公钥密码——一个"能自主操作资金"的智能体，若其签名体系在 Q-Day 被破解，后果远超人类账户被盗。PQC 迁移清单必须把"智能体身份与授权链"纳入盘点范围，与智能体治理框架（最小权限、可观测性）同步设计。

## 结语

量子计算的时钟已经启动：标准就位（NIST FIPS 203/204/205）、时间表发布（EO 14412、G7、HKMA 2030 目标）、央行实测完成（Project Leap）。但银行界的准备度（HKMA 2.3/10）与时间表的差距，是未来五年最大的技术风险敞口之一。**对银行而言，PQC 迁移的本质不是换算法，而是重建"密码长城"的信任体系**——在数据回收攻击已发生的今天，迟一天开始盘点，就多一批无法挽回的加密数据。这不仅是 IT 议程，更是风险管理议程，甚至是董事会议程。
