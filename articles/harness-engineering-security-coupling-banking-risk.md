---
title: 银行风险管理部门的 Harness Engineering 安全：大模型、数据与信息系统安全如何耦合
date: 2026-09-13
description: 以英格兰银行 harness engineering 技术说明为锚，拆解银行风险管理部门如何通过驾驭层把大模型安全、数据安全、信息系统安全在运行时耦合为统一的授权、边界与证据链。
tags: ["Harness Engineering","大模型安全","数据安全","银行风险管理","AI治理"]
schema_type: Article
---

# 银行风险管理部门的 Harness Engineering 安全：大模型、数据与信息系统安全如何耦合

> 署名：金融行业风险管理从业者

## 一、风险管理部门为什么突然要聊 Harness Engineering

过去两年，银行对话式智能风控、反欺诈、贷款审查、贷后监测里的智能体（Agent）大多处于"试点成功、规模难产"的状态。行业统计显示超过 80% 的金融机构已启动 Agent 试点，但不足三成完成规模化。卡点不在模型推理能力，而在一个此前很少被提起的词：**可控、可审计的 Agent Harness（驾驭层）**。

2026 年 9 月 2 日，英格兰银行（Bank of England）前沿 AI 信息共享论坛发布了一份关于 **harness engineering** 的技术说明，与 FCA、英国财政部、国家网络安全中心（NCSC）及系统重要性金融机构共同讨论，聚焦点直白而朴素——**cyber defence（网络防御）**。它没有创设任何新的监管期望，却把整个行业的注意力从"模型有多聪明"拉回"系统有多受控"。

为什么这张"技术说明"会击中银行风险管理部门？因为风险管理部门是全行唯一一个**同时天然接触大模型安全、数据安全、信息系统安全三个领域**的部门：反欺诈要用大模型，反洗钱要处理敏感客户数据，监管报送要对接核心信息系统的真实交易——三个安全的交汇点，恰好就是 Agent 真正开始"动手"的地方。

> 一句话概括范式转移：**模型负责推理，Harness 负责约束**。安全不再是大模型上线后打的补丁，而是写进 Agent 运行环境的出厂配置。

## 二、什么是 Harness：上下文、工具、执行流与控制

AI Harness 是让模型"干活"的软件与运行环境的总和，英格兰银行技术说明将其概括为四类要素：

- **上下文（Context）**：模型能读到什么，谁来维护，超时如何过期；
- **工具（Tools）**：模型能调用哪些外部动作，每个动作的权限边界在哪；
- **执行流（Execution Flow）**：多智能体编排时授权是否会因"工作转移"而失守；
- **控制（Controls）**：哪些决策自动放行，哪些必须阻塞并升级到人工。

对受监管机构，KLA 在解读中给这套设计补上三个"审计三问"：**谁有权授权某个动作（who may authorize）？哪个边界在强制这条授权（which boundary enforces）？一次运行后留下了什么证据（what evidence survives）？** 这三个问题正是风险管理部门对任何一笔业务动作都要回答的合规三连，只是现在被平移到了机器身上。

英格兰银行把主旨拆成了六个主题，可转译为受监管 Agent 架构的设计问题：

| 监管主题 | 银行架构层面的设计问题（KLA 解读） |
| --- | --- |
| Harness design | 每一个"有后果的动作（consequential action）"在何处被检查 |
| Component choices | 内部组件与供应商组件分别由谁持有控制权 |
| Orchestration | 工作流在 Agent 间移交时，授权是否仍被限制在边界内 |
| Sensitive context | 每个 Agent 可访问哪些工具、记录与环境 |
| Embedded controls | 哪些决策会阻塞执行、哪些必须转人工 |
| Validation and scale | 评审人员能否按预期规模验证结果并闭环修复 |

对银行风险管理场景，这张表的落点非常具体：早期预警信号由 Agent 起草，风险处置（查控账户、核销、贷后交叉核验）由 Agent 执行——每一步都是一次"从模型能力到运营责任"的交接。**模型开始动手的那一刻，就是安全边界必须生效的那一刻**（图 1）。

![Harness 层将模型输出约束为可控的外部动作](https://mermaid.ink/svg/pako:eNpdVNtq20AQ_ZVFeU3IrrSzu_JDIZiAAi6F4oRA1Ye91gHZLrZFKSH_3pmV17Gqh5F2NJdzzoz0Xvl9iNWCVWnY__Ebezix1fd-x9hxdL8O9veGff3RV_2obC36EbRxaL2s-zElbtDPRehHw3mTPW1f_aRsxlarKRHaWl-ns3uGx8ZirpZcoTMJQI_08ZL77Xmdc01qsSyIZHMWhAh01FjQeOqooSYMgif0q1QqxF2YUeiwWmcPu3g8sjn81upIVoUz_JFzpzGolQmxGSM9PhtPQUrha-2sKMhbHqkEoC3Il-vXjFxGbrNFuRQYnZ_jfxScSzk99v0OayqNIEBysg3APJhgYSnNOREgvkrLhlABeUSkKTgvLkgentfdNLnGmBJ9BpE5qFq3uTFKSbNpYpoHTy1NckQbSAhIDbKCulHlrYzOnguWxo-vj8upca10kVAFSbJZ1INaKt9mLZ0ohbQDRW0UMtYJROZ9AaFFK0lIGz7bvDxNO0KkEbeKhZ4GyIgDTL2uds0EIgnJyFJ50sJMikDWOwU93yNcZXZ394XWMt87cuKk84Ho0pn0njnoPjlenmbnh-X6_GWIyxJBTSBlAj9h1oQEket7vJkmrxnndMA5oXVktZMtDS7QyFSS-SsK5zITg-Pp7xBZx9LbMCxuPIAV4tbvh_1hcZNS-gxBUCWI03UVVN2yahsPW_sW8EfxXp02cZt_GSimHYdT9fHxD1d2Sgk)

## 三、耦合之一：大模型安全 × Harness

大模型接入银行系统后，威胁面从"编个假答案"升级到"真的动手做坏事"。OWASP 中国区 Agent 安全威胁清单里排在最前的几个，恰好都发生在模型与工具的交界处：

- **提示注入（Prompt Injection）**：外部数据源（网页、邮件、客户上传件）里的恶意指令劫持 Agent 的意图；
- **工具滥用与越权（Tool Misuse / Excessive Agency）**：模型拿到超范围权限，把"读"当成"写"来用；
- **幻觉驱动的危险决策**：模型在权限合法的情况下，基于臆造的数据发起真实操作。

单独靠模型侧护栏（system prompt、输出过滤、红队评测）无法根治以上问题，因为它们都发生在"模型意图 → 现实动作"的转换瞬间。这正是 Harness 的战场。英格兰银行解读中给了银行安全工程师一个教科书级的例子：

> 一个安全 Agent 发现应用仓库存在依赖漏洞。**读取**经批准的快照、**提议**补丁、**部署**补丁，是三种授权差异极大的动作——应当分别定义权限，并把"生产变更"指派给银行的变更责任人，而不是让 Agent 全链路自循环。

落地时，工具层要建立**命令级、参数级的白名单授权**而非"某个 Agent 拥有一把通配钥匙"：可调用哪些工具、工具可访问哪些对象、能否写、能否跨环境执行，全部进入策略引擎（Policy Engine）。高影响动作（账户查控、监管报送、批量数据修改）纳入"人工审批"（Decision Desk），形成英国央行主题五"Embedded controls"的要求。

验收上有一个 KLA 建议的"拒绝演示"非常值得采纳：让 Agent 提出合法补丁、同时请求一个超出其职权范围的部署，**期待它被审批环节拒绝**——然后去核对下游系统，确认没有发生任何写入。**仅有一张策略决策记录，并不能证明下游写入真的被阻断**。这条原则把这个耦合从"纸面设计"钉死为"可接受的运行事实"。

## 四、耦合之二：数据安全 × Harness

大模型给数据安全带来的结构性变化是：**LLM 成为一个全新的、主动的、难以审计的数据出口**。任何一个 Agent 的每一次工具调用、每一次上下文组装，都可能把数据带出它本不该去的边界。

《数据安全法》《个人信息保护法》《金融数据安全数据安全分级指南》、央行"最小必要"原则共同构筑了银行数据安全的底座，而 Harness 是把这些要求落到每个 Agent 身上的执行器，落点有三：

1. **分类分级与场景隔离（Sensitive Context）**：英格兰银行主题四"敏感上下文"直指这一点——每个 Agent 可访问哪些工具、哪些记录、哪些环境，必须显式声明。风险条线的反洗钱情报库、反欺诈规则库、客户 PII，与开发环境、模型评测环境严格划界；同一模型在"行内生产库"与"外部知识库"之间不得有隐式穿透通道。
2. **脱敏与最小化**：天然语言交互决定了"字段级脱敏"常被模型"自愈"绕过，因此脱敏必须放在 harness 的上下文组装管线里做，而不是靠模型自觉。进入上下文的特征、示例、检索片段，都要经过"敏感字段剥离 → 映射替换 → 有效期控制"的处理链。
3. **DLP 与数据血缘**：Agent 产出的增量数据（新的规则建议、画像片段）要有归属与任期，能溯源到"是哪条证据、哪次运行、哪个模型版本"产生的。KLA 配套的 Lineage Explorer（血缘追踪）与 Evidence Room（证据室）本质上就是把银行早已习惯的"数据血缘管理"延伸到"模型推理痕迹"。

一句话：**数据安全管的不是模型，而是模型所处的数据管道**——而这条管道由 Harness 全权接管。

## 五、耦合之三：信息系统安全 × Harness

第三条线是银行最熟悉、却最容易在 AI 时代被忽略的：**信息系统安全**。Agent 不是一个悬浮的推理进程，它运行在 K8s 集群、向量数据库、消息队列和一堆供应商 SDK 之上，而它调用的编排框架、模型 API 网关、工具插件统统属于供应链的一部分。

英格兰银行主题二"Component choices"与主题三"Orchestration"专门敲打这件事：**内部组件与供应商组件各自由谁持有控制权？** 一个外部 Agent 若保留一条不受限的替代执行路径（备用凭据、直连网络路由、绕过策略网关的 SDK 直接调用），就可以绕过 checkpoint。因此 Harness 的控制设计必须覆盖：

- **凭证与密钥隔离**：Agent 运行时不持有"能读一切"的全局凭据，采用短时、最小化、按策略网关签发的临时凭证；
- **网络隔离**：Agent 与工具之间的调用走受控的服务网格/策略网关，禁止直连外部路由；
- **供应链核查**：模型厂商 API、向量库、编排框架、客户端 SDK 纳入第三方组件清单（SBOM/CBOM），版本与漏洞跟踪进入既有信息科技风险管控；
- **可观测与应急**：推理轨迹、工具调用、决策记录成为全量日志的一部分，供安全运营中心（SOC）与事件响应（IR）复用——**日志不是留给审计看的，是留给救援用的**。

这里的耦合点在于：当一次真实的安全事件发生时，风险管理部门必须能回答"是模型被注入、是数据被越权读取、还是信息系统的凭证泄露"，而三者的取证材料来自**同一条 harness 证据链**。三类安全在事件取证上是同构的。

## 六、三者在 Harness 上的耦合机制

把三条线并起来看，耦合不是"三个安全团队各自给 Agent 打补丁"，而是它们共享同一组运行时原语（图 2）：

![三类安全在 Harness 上耦合为统一证据链](https://mermaid.ink/svg/pako:eNptlE1rGzEQhv-K2EBPCdb3hw-FNi3pwYVSeqt6kLQjx2CvwfZSSsh_74zWHzHxRWhn33nnmdlhX7qy7aGbs66ut3_Lc9od2K_PcWDs5_ffsYtj0NXG0Xtd8O4L4GltiKPLSeCpOb4NHDyLceRcWhZHDTxQ0CgSK4kyyDV2f9jDw0f22Gw9SuNoNPdxtF7haWpBfa0ifUu7AfZ79nVYrgaA3WpYxjigTvqEuuzR3QhLOSLg3dc-s09LGA5Y3FmvyYxzPFUvGg40ET_14VSq-NZ7hVDU62MjW4iGZoJ0WCxJzDXO56uSjUORlQsKaWyBxmENtZ8x0fdEaZ1Wp4gBhyY-lNDSHSRJgxF1htFcENf2Os-owUQPntdrLtm4rHGcilt4R2QkfQZXqM7xDsmdiYQSlK7rKWJdG0_hNAYl7NSWoyYshDY5wFe6gphSvix-XCOphjQJLLeVqtdMdfv6Hg-cIs_KZ_QQsElnpJ-RQcinEG4aXAB1Wx7DJwMBfZuVoGDLDzmf59tgcb5ymuRl7qS0XJoj-0I0-KfGPpHicvCT8zRawmAfGDVBG-6nPTeGdt70Zys5WbW7utz3h39rwCHV1Xo9vyvGJCHuy3a93c3vaq0XCbJMGlE1uHBbI48aCc5ke1ujjhqjvVTmpubpKHFc8cTfSLp71m1gt0mrHn8BL93hGTbtZ9BDTeP60L2-_gcXnUD1)

| 共用原语 | 大模型安全 | 数据安全 | 信息系统安全 |
| --- | --- | --- | --- |
| 身份与授权 | 越权工具调用的拦截点 | 数据访问的最小权限 | 凭证与角色治理 |
| 边界与策略网关 | 高影响动作的人审分界 | 脱敏/最小化的强制点 | 网络与服务网格隔离 |
| 统一证据链 | 推理路径留痕 | 数据血缘与取证 | SOC/IR 日志 |
| 评测与治理 | 红队/回归评测 | 数据合规检查 | 供应链与漏洞跟踪 |

再往上一层，耦合的真正底座是**治理与三道防线**：业务部门（第一道防线）负责"用对"，风险/科技风险部门（第二道防线）负责"管住"，审计（第三道防线）负责"看得清"。Harness 的授权矩阵、审批留痕、证据链，恰好为三道防线提供了同一份、可交叉验证的运行记录——这是传统的"老三样安全"各自为政时做不到的。

## 七、银行风险管理部门的落地路径

耦合不是一次性建设，而是一条可迭代的治理闭环（图 3）：

![五层纵深防护与评测回灌闭环](https://mermaid.ink/svg/pako:eNptVMtu2zAQ_BVCOSZOSYrLhw8B_EQPPbXHKgc-YSOyXcgW0iDIv5dLSYlR2AeaEmdnZ2YFvlf-FGI1J1VqT69-Z7sL-fGzORKy-N1UTa-TqZsemIS8esGb5pg3hsmmNzRqPNJ45JxpeqkQJqOhedVU5XLnaCkRkYYMq2PK-xRZLpdGNL0yzjU9pQ7BySssj6Kpnsls9kSWRQOEiC2YUlcapKIUH2nCvaiREPANiwH7ejbRSm-yNuUcK4XK6HwkneS5JAaNYJuVGIv7K6rqGWNYFiGrQQhzNTKBvBIy1EFSmRWER5fcanQJHn07OzlQWsaxWxFSeBRgZioBKxbrSbViGI8EG0YhqyJkPUzF-KxeBuGuE6mxrRJUfssIT1Eq8DIimVfDPEYFJcsU1FiDU8JZ3ee_RDnmkxy-8nTsMLRfl_ab0v7aFBgcrNS1LoQ68BoByDHAvlxnWZIHbBHD5GpTaLeDK-fF5Ep6_C7QzJBVtDguydKUD8gQ0Qjwz8S4KAPkPpd8t90xns8EizT6thwDVhoTq8ukZRIlFZyYs2wUtCWzRzLRKyo8ecwCF3h0vry1kSxI2rft_I4lEZV58Kf21M3vUkpfkOUI4VGBkzchqxHiKf5uQtYjBITmNdyEbEaIojW1t1m2UyMAy9h_kHZ_fPlVYJDh3eklfioaHmev-3DZzfmfv9OLYM_5kujs2xwIVA-kOsTuYPchXyHv1WUXD-UyCTHZvr1UHx__ANS2W6c)

1. **输入层隔离**：外部内容（网页、邮件、客户上传）打上"不可信来源"标记并隔离，阻断提示注入的初始入口；
2. **工具层最小权限**：命令级白名单、短时凭证、沙箱执行，把越权变成"够不着"而非"靠自觉"；
3. **决策层人工确认**：高影响动作经策略引擎评估，超出自动授权范围的强制升级人工，形成文档化的"拒绝演示"测试基准；
4. **观测层全量留痕**：推理、调用、决策记录进入类 Evidence Room 的证据仓库，支撑事后核查与事件响应；
5. **评测治理回灌**：红队、回归、版本管理定期重跑——**每当模型替换，就要重跑"被阻塞动作"与"审批"两类测试**，并记录模型版本、工具版本、策略版本三元组，让任何一次事故都能还原出当时的配置。

为控制评审负载（BoE 主题六），风险管理部门还应跟踪一批工程度量：待办未解决发现数、审批滞留时长、重复请求率、演练通过率、授权决策准确率、可解释证据完整率、数据泄露事件数。**一个产出发现远超团队消化能力的系统，问题不在模型质量，而在范围、优先级或运营容量。**

这也与此前讨论的"组织级上下文工程"一脉相承：当时我们论证了银行 AI 需要数据、流程、监管、领域、工具五类上下文构成组织级上下文层；今天的结论是——**上下文层负责"让模型懂业务"，Harness 负责"让模型不犯错"，两者共同把 AI 安全从应用层下沉为机构层资产**。

## 八、结论

- **Harness Engineering 是银行 AI 规模化的前提**：模型能力决定了 Agent 能走多远，Harness 决定了银行敢不敢让它走。
- **三类安全在 Harness 上同构耦合**：大模型安全管"意图是否被劫持"，数据安全管"数据是否越界"，信息系统安全管"执行体是否受控"——共享同一套授权、边界、证据链原语。
- **风险管理部门是天然的耦合主持者**：它同时持有三类安全的风险语言、三张合规底稿和经营判断，最适合牵头建设 Agent 的统一驾驭层与质控体系。
- **验收标准可测试**：以"consequential action 级授权矩阵 + 拒绝演示 + 下游系统核查 + 模型变更回归重跑"作为可执行的落地验收，而非停留在架构图上。

英格兰银行把话题从监管要求翻译成了工程语言：**金融 AI 的安全，最终要落到一次动作被授权、被约束、被记录、可还原**。对银行风险管理从业者而言，这正是我们最熟悉的老本行——只是这一次，责任主体是那些替我们"动手"的智能体。
