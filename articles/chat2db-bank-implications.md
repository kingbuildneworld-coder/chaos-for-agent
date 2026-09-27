---
title: "Chat2DB 尽调笔记：一份附加条件的许可证、一条只到 127.0.0.1 的信任边界，以及 AI 接入数据库控制面后的七条风控启示"
date: "2026-09-26"
description: "以 Chat2DB 的 GitHub 元数据快照、README、LICENSE 与 SECURITY.md 四份原文为唯一事实来源，逐条解读这份 5.3.0 起改用修改版 Apache 2.0 的本地优先 AI 数据库客户端：它为何不是 OSI 意义上的开源许可、GitHub 为何标注 NOASSERTION、行内内部使用与对外提供的分界在哪里、信任边界为何只到 127.0.0.1，并据此给出银行侧的许可证与安全模型两项尽调清单、七条风控启示，以及法务合规、信息科技、数据风控三条线的 90 天行动清单。"
tags: ["金融科技", "AI治理", "大模型", "智能体", "风险管理", "银行AI", "开源合规", "信息科技风险", "数据治理", "数据库安全", "供应商风险"]
schema_type: "Article"
references:
  - title: "OtterMind/Chat2DB（GitHub 仓库，含仓库元数据快照）"
    url: "https://github.com/OtterMind/Chat2DB"
    source: "GitHub（项目方）"
  - title: "Chat2DB Community 许可证原文（LicenseRef-Chat2DB，5.3.0 起）"
    url: "https://github.com/OtterMind/Chat2DB/blob/main/LICENSE"
    source: "爱獭科技（杭州）有限公司"
  - title: "Chat2DB Security Policy（信任边界与支持的部署边界）"
    url: "https://github.com/OtterMind/Chat2DB/blob/main/SECURITY.md"
    source: "项目方"
  - title: "Chat2DB README（功能、数据库支持、部署形态、5.4.0-beta.1 早期预览）"
    url: "https://github.com/OtterMind/Chat2DB/blob/main/README.md"
    source: "项目方"
# 注：本文件未写入 AIGC 隐式标识块。按现行标识要求，AIGC 元数据需包含 Label、ContentProducer、
#     ProduceID、PropagateID、ReservedCode1、ReservedCode2 等字段，其中 ProduceID / ReservedCode
#     须由标识服务平台逐篇签发，不能由作者或生成工具自行推定或编造。因此本文件暂留空位，须由作者
#     在取得平台签发的标识值后补充完整，方可发布。
---

**Chat2DB 是一个本地优先的 AI 数据库客户端，但在银行语境里它不只是"又一个 SQL 工具"——它被接在了数据库访问链路的控制面上**

**它从 5.3.0 起改用一份修改版 Apache 2.0：行内内部使用通常可行，而只要让集团外主体获得其实质能力，就可能需要书面商业授权**

**GitHub 把它标注为 NOASSERTION，包元数据标识为 LicenseRef-Chat2DB——它不是 OSI 意义上的开源许可，而是 source-available**

**SECURITY.md 把信任边界写得很直白：单用户、本地优先、仅支持绑定 127.0.0.1 或 ::1，多用户与 LAN／公网部署不被支持**

**最后一条同样重要：28,268 stars 是元数据的时点快照，说明关注度高，不说明它已达到企业级成熟度**

---

> **素材说明**：本文事实来源仅 4 份已归档文本：`repo-metadata.json`（**GitHub 仓库元数据**，数字与时间为**时点快照**）、`README.md`（**项目方自述**）、`LICENSE`（**许可证原文**）、`SECURITY.md`（**项目方安全策略原文**）。**许可条款与信任边界内容均为原文引述并标明节次；文中"启示""推论""建议"为本文分析，不构成监管要求、合规意见或法律意见。**

## 一、它是什么：项目方自述的能力清单

以下均出自 README 与仓库元数据，**属项目方口径**，本文不做独立验证。

| 维度 | 项目方自述 |
|---|---|
| 形态 | 免费跨平台数据库客户端（Windows／macOS／Linux），**完全在本机运行**；提供桌面、Web／Docker、HTTP API 与 CLI |
| 数据库 | **40+ 数据库**（MySQL、PostgreSQL、Oracle、SQL Server、ClickHouse、MongoDB 等）；新增 JDBC 数据库**仅需配置、无需改代码** |
| 工作台与 AI | 编辑、补全、格式化、执行、保存 SQL 与**执行历史**；元数据浏览、DDL／DML、**就地编辑数据**、导入导出、图表；**自带模型**，自然语言生成、解释、优化 SQL |
| 版本分层 | Community 为完整本地客户端；**商业 Pro 与 Enterprise 增加托管 AI 服务、账号、云存储与多设备同步、协作与治理功能** |
| 早期预览 | **5.4.0-beta.1** 增加**可选的本地 agent 运行时**，含 **skills、外部 MCP 服务器、文件与终端工具**，需选择 **Pi Agent** 启用；README 明确它**既不是稳定版也不是常规 Beta 版** |
| 元数据快照 | **28,268 stars、3,048 forks、开放 issue 235、主语言 Java**；创建 **2023-06-20**，最近推送 **2026-09-24**，未归档 |

**本文分析**：它不是"更聪明的查询编辑器"，而是一条**人—AI—数据库**的直连通道。README 讲能力，SECURITY.md 讲边界，LICENSE 讲许可范围——**三份文件回答三个不同问题，任何一项都不能替代另外两项。**

## 二、为什么银行该关注：控制面变了

DBA 与分析师本来就在用 SQL 客户端，这类工具长期被当作**个人工作台**——装在自己电脑上、用自己名下的账号，追责路径清楚：**是人操作了数据库。**

但 README 自述的能力改变了这个前提：AI 可以**生成并执行** SQL；CLI **支持 MCP**；5.4.0-beta.1 还带来**文件与终端工具**。**本文分析**：三者叠加后，工具从"人在键盘前操作"变成"**程序化地执行数据库动作**"，于是进入了原本属于账号权限、堡垒机、变更管理与审计日志的地盘。

LICENSE 第 4 节把这些能力定义为 **"Community Core Capabilities"**，覆盖**数据库连接与凭据管理、SQL／DDL／DML 执行、数据编辑、导入导出、AI 功能、CLI、MCP、HTTP API、插件**等（原文转述）。**本文分析**：这恰好是一张**控制面清单**，而每一项银行都已有对应制度——**工具同时覆盖全部条目时，它就不再是"终端软件采购"，而是需要定性、定权限、定留痕的对象。**

## 三、第一号尽调事项：许可证

### 3.1 版本分界线

| 版本区间 | 适用许可 |
|---|---|
| **Community 5.3.0 及以后** | **修改版 Apache 2.0，附附加条件**；包元数据可标识为 `LicenseRef-Chat2DB` |
| **5.3.0 以前的全部发布**（含 0.3.7 及更早历史 tag） | **Apache License 2.0** |

> **…licensed under a modified version of the Apache License 2.0, with the additional conditions below.** … **This License applies only to Chat2DB Community version 5.3.0 and later. It does not change the license of any earlier release.**（LICENSE 首段，原文引述）

**本文分析**：**"我们用的是 Apache 2.0 版本"只在版本号低于 5.3.0 时成立**，混用两个区间的结论最容易被内部审计发现。

### 3.2 它不是 OSI 意义上的开源许可

三处标识指向同一结论：**GitHub 元数据**的 `license` 为 `key: "other"`、**`spdx_id: "NOASSERTION"`**、`url` 为 `null`；**LICENSE** 说明**"these terms may be identified as `LicenseRef-Chat2DB`. That identifier refers only to this root `LICENSE` file and does not create a separate license."**；**README** 自称**"a source-available license based on the Apache License 2.0 with additional conditions"**。

第 8 节写明：除附加条件外**"all other rights and restrictions follow the Apache License 2.0"**，冲突时**"these additional conditions control"**；Apache 2.0 的专利授权、免责担保与责任限制条款被并入。

**本文分析**：**因此本文不把它称作"开源软件"**——它是以 Apache 2.0 为基础、**附加了使用范围限制的 source-available 许可**，而附加条件直接决定银行能不能把它对外提供。

### 3.3 允许做什么

第 1 节 "Permitted Use" 允许：**a. personal self-use, or self-hosted use by an educational, academic research, or non-profit organization; and b. Internal Use by you and Your Organization, including internal use of the desktop application, Web interface, Docker image, HTTP API, CLI, MCP, plugins, and reusable modules.** 同节还允许**以 Source 形式**再分发软件或修改，条件是保留本 License 及所有适用的版权、署名与第三方声明。

第 2 节把 "Internal Use" 往外扩了一格：允许**Authorized Personnel** 处理外部方拥有或提供的数据并向其交付**"reports, analyses, migration results, or other non-interactive outputs"**，前提是该方**未获得凭据、接口、控制或任何可重复的自动化访问，也未获得操作、配置、调用、集成该软件及其核心能力的能力**（原文引述）。**本文分析**：替客户做数据分析并交付报告，本身不构成"对外提供"。但紧接着的两句最容易被低估：

> An Independent External Party providing business requirements, data, or acceptance criteria **does not by itself** make the use external. However, **shared accounts, human intermediaries, proxy interfaces, prompts, agents, workflows, plugins, scheduled requests, or similar arrangements do not qualify for this exception when they give the party repeatable or practical control** over the Software or its Community Core Capabilities.（第 2 节，原文引述）

**本文分析**：给外部方一份报告可以；**但给一个提示词模板、一个 agent、一个工作流、一个插件或一个定时任务，只要带来"可重复的或实际的"控制，就不在例外之内。** 这与 5.4.0-beta.1 的 agent 运行时正面相撞——**能力越强，越容易把"内部使用"做成"对外提供"。**

### 3.4 禁止做什么

第 3 节开篇是 **"Unless Chat2DB has expressly authorized you in writing, you may not:"**（原文引述），随后六项：

| 禁止事项 | LICENSE 表述要点 |
|---|---|
| **External Product or Service** | 使外部方能**直接或间接**操作、配置、调用、集成或自动化使用核心能力，**包括通过 Web UI、HTTP API、CLI、MCP、嵌入模块、提示词、agent、工作流、代理等接口**（第 4 节定义） |
| **Managed Delivery** | 为外部方部署、配置、定制、托管、运维、维护、升级或持续管理，**使其获得核心能力** |
| **Object-form 分发** | 除 Source 形式外，**不得分发安装包、二进制、归档、容器镜像、部署 chart、补丁、配置等使外部方得以 Object 形式部署或使用的材料** |
| **Embedded Product Use** | 把软件、前端、HTTP API、CLI、MCP、插件、可复用模块或衍生实现**并入提供给外部方的产品**，且该产品提供实质性核心能力 |
| **白标／OEM** | 提供软件或其衍生作品的**白标或 OEM 版本** |
| **移除标识** | **不得**移除、遮蔽或修改官方前端展示或官方发行版中的 logo、版权信息、许可声明与署名 |

第 3 节末段把常见规避路径逐条堵住：**"These conditions apply whether the offering is paid or free, whether access is direct or indirect, whether accounts exist, whether there is one tenant or many tenants"**，且无论运行在共享实例、专用实例、**客户自有云账号**或其他拓扑；**"The identity of the payer, account owner, infrastructure owner, distributor, or operator does not change the result."**（原文引述）

**本文分析**：**免费不算、间接不算、没有账号不算、单租户不算、跑在客户自有云账号里也不算。** 判断只有一个：**集团外主体是否获得了核心能力。**

### 3.5 定义里最要命的几处

| 术语 | LICENSE 定义要点 | 本文分析 |
|---|---|---|
| **Your Organization** | 你，以及**控制你、受你控制或与你处于共同控制之下**的实体；**Control** 指直接或间接持有**超过 50% 表决权益**，或据以指导其管理与政策的权力 | **参股未过半数、合资但不受同一控制、以及外部合作机构，都不在其中** |
| **Authorized Personnel** | 仅代表 Your Organization 行事的**员工与个人承包商**；**客户、供应商、渠道伙伴、分销商与独立服务提供者不因商业关系而成为 Authorized Personnel** | **外包厂商员工通常不满足该定义** |
| **Independent External Party** | Your Organization 之外、且不属于 Authorized Personnel 的个人或组织 | **边界由控制关系定义，不由物理或网络位置定义** |

### 3.6 两条容易忽略的条款与银行要点

**贡献**：第 6 节写明 **"Chat2DB may use the contribution for commercial purposes and may include it in future Chat2DB releases made available under different license terms."**（原文引述）**本文分析**：行内研发若把修改回馈上游，**这实质上是一次"允许对方以不同许可条款再发布"的授权**。**标识**：第 5 节不授予商标与商号使用许可，并要求修改后附**显著声明**。

**银行要点（本文分析）**：**内部使用通常可行**（第 1 节 b 项已覆盖桌面、Web、Docker、HTTP API、CLI、MCP、插件与可复用模块）；但**"内部"的边界由控制关系决定**，一旦让集团外主体（客户、外部厂商、渠道伙伴、不在同一控制下的关联方）获得实质能力，就可能需要书面商业授权（`https://chat2db.ai`）；此外**必须锁版本**。

## 四、第二号尽调事项：安全模型与部署边界

SECURITY.md 的表述非常直接：

> **Chat2DB Community is a single-user, local-first application. The operating system user who starts Chat2DB is the trusted operator. Community does not provide user accounts, tenant isolation, or authorization boundaries between multiple users.**（原文引述）

> **Supported Community deployments must keep the HTTP service available only on the local machine. Bind host access to `127.0.0.1` or `::1` and do not expose the service directly to other users or untrusted networks.** … **Multi-user, shared-server, LAN-exposed, and Internet-facing Community deployments are not supported.**（原文引述）

**本文分析**：**这不是"它不安全"的自认，而是明确的信任边界声明**——受支持范围被画在**单机、单人**上，因此**它不应被当成部门级共享服务**；越界后失去的不只是配置，还有该模型本身。

**Out of scope** 列出四类超出边界的情形：主动安装恶意驱动、同账号控制、**覆盖 loopback-only 配置**造成的多用户或远程部署、已具文件系统权限后修改本地存储。**本文分析**：它是**部署合规的验收条件**，而非免责声明——**越界部分不再受该项目的安全承诺覆盖。**

**驱动即代码**：SECURITY.md 写明 **"Custom JDBC drivers are executable Java code. Installing a custom driver is equivalent to installing a plugin or running third-party software."**，受信任操作者主动装上的驱动在边界内，**但必须来自其信任的来源**；**"A vulnerability remains in scope when an untrusted party or untrusted input can install, replace, select, or execute a driver without the operator's explicit intent."**（原文引述）

**"本地优先"不等于本地内容可信**：SECURITY.md 写明 **"Local-first does not mean that all processed content is trusted."**，导入的配置与归档、SQL 文件、数据库内容、**AI responses**、下载数据等**都须按不可信数据处理**，处理过程**不得导致代码执行、文件系统逃逸、凭据泄露、未授权网络访问或受信任应用文件被修改**（原文引述）。**本文分析**：**模型输出与一份外来 SQL 文件同级。**

**凭据加密与密钥保管**（README 自述）：**数据源密码与 AI 模型 API Key** 使用 **AES-256-GCM**、以**逐安装密钥**加密，默认密钥文件为 `~/.config/chat2db-community/encryption.key`；README 要求**单独备份**并在升级与容器重建中保留——**替换或丢失将使已存储凭据不可读**；**Web／无头启动无有效密钥即失败，只有 Desktop 模式会自动创建缺失密钥**。

**本文分析**：**逐安装密钥把备份与保管责任留给了运维方**——丢失密钥等于丢失全部存量凭据，且两类凭据共用同一密钥，**一次密钥事件会同时影响两者。**

## 五、它能解决银行的哪些痛点（本文分析）

先限定范围：**下表的痛点对应关系是本文基于 README 自述能力所作的推论**，能力本身属项目方口径；
而第四节的信任边界决定了这些能力**只应落在"个人桌面工具"这一侧**，不宜被当作部门级或企业级平台。

| README 自述能力 | 对应的银行痛点 | 现实落点（本文分析） |
|---|---|---|
| **40+ 数据库**；新增 JDBC 数据库**仅需配置、无需改代码** | 大型银行数据库形态林立（核心库 Oracle／DB2、数据平台 ClickHouse／Elasticsearch、缓存 Redis、文档 MongoDB、大数据 Hive 等），DBA 常同时维护四五种客户端 | **客户端收敛**：一次安全评审即可覆盖多类库；新数据平台接入不必等新工具上线 |
| **SQL 工作台**：编辑、补全、格式化、执行、保存、**执行历史** | 日常取数、核对、排查反复手写 SQL；执行过的语句难以复现 | 提升单人效率；**执行历史**可作个人排查依据（但见第六节，它不等于审计轨迹） |
| **AI 助手**：自然语言**生成、解释、优化** SQL，且**自带模型** | ① 取数需求排队；② 遗留 SQL 与存储过程的原开发者已离职，**看不懂、不敢改**；③ 性能问题定位慢 | **"解释"与"优化"比"生成"更贴近银行的真实痛点**——银行通常不缺会写 SQL 的人，缺的是能读懂十年前那段 SQL 的人 |
| **元数据浏览 + ER 图** | 新接手一套系统时，摸清**表结构与表间关系**耗时；变更前需评估影响面 | 快速"看得见"；但**它不是元数据中心**——没有血缘、没有影响分析、没有版本管理 |
| **就地编辑数据 + 导入导出** | 跑批前的抽样核对、迁移中的数据比对、小规模数据修正 | **最需要克制的一项能力**：对生产库的旁路写入是重大风险，应限定只读账号或仅用于非生产环境 |
| **仪表盘与图表** | 临时分析、口径讨论时缺一个快速可视化手段 | 适合**个人或小组的临时分析**；**不是企业级 BI**（无权限体系、无血缘、无调度） |
| **CLI 且支持 MCP** | 让行内智能体在**受控前提下**读库、查元数据，而不是把库凭据散落到各处脚本 | **价值与控制风险同时最高**的一项：须建成**独立受控通道**（专用只读账号、目标库白名单、调用留痕）；并注意许可证已把 MCP 列入 Community Core Capabilities |
| **AES-256-GCM + 逐装密钥**加密凭据与模型 Key | 数据库口令、模型 API Key 散落在配置文件与脚本中**明文留存** | 静态加密可缓解；但**密钥的备份与轮换是运维方责任**，密钥丢失等于存量凭据不可解 |

**它解决不了什么（同样重要）：**

- **不是多用户平台**——SECURITY.md 明确无账号、无租户隔离、无多用户间的授权边界，**不应作为部门共享服务**
- **不是数据治理、血缘或元数据中心**
- **不是企业级 BI 与调度工具**
- **不是变更管控工具**——AI 生成的 SQL 若要写生产，仍须走既有变更与审批流程
- **不解决对外数据服务**——那既需要商业授权，也需要另建受控网关
- 5.4.0-beta.1 的文件与终端工具属**早期预览**，**不应在生产使用**

**一句话收束**：它擅长的是**"让一个懂 SQL 的人更快、更省力、更能读懂历史包袱"**；
它不擅长、也不应被要求承担**"让不懂 SQL 的人自助取数"或"成为行内统一数据平台"**。
放在前者，收益明确、风险可控；推到后者，就会同时撞上许可证边界、信任边界与治理缺口。

## 六、七条风控启示（本文分析）

**一、AI 生成 SQL 直接对生产库执行，是新的变更控制问题。** 谁批准、是否复核、出错如何回滚？**推论：AI 路径只授只读或最小权限账号，生产写入走既有变更流程。**

**二、MCP 与 agent 运行时把"建议"升级为"执行"。** LICENSE 把 **MCP、prompt、agent、workflow、proxy** 列为接口形态。**推论：接口的通达范围必须在启用前定义**：可调用哪些库、是否可写、以什么身份调用。

**三、"自带模型"意味着数据出口由你决定，也由你负责。** **推论：模型端点必须限定在已批准清单内，并在网络层做出口控制**，否则生产数据会被发往未受控的外部 API。

**四、凭据治理要新增"逐安装加密密钥"这一个对象**：保管人、备份、权限、轮换与销毁，以及密钥丢失预案。

**五、JDBC 驱动须做白名单与来源可信管理**：驱动即代码，**"谁能装、从哪装、如何验证"须写进流程并留审批记录。**

**六、执行历史可算部分审计轨迹，但不能默认满足审计要求。** 须确认留存期限、能否导出、能否被本地修改；本地存储并非按防篡改设计，SECURITY.md 亦把"同账号下修改本地存储"列为超界。

**七、供应商风险按既有要求评估。** LICENSE 定义 **"Chat2DB" 即爱獭科技（杭州）有限公司**。**推论：按既有信息科技外包与供应商风险管理要求**评估主体资质、支持响应能力与**商业授权取得路径**；**Community 与商业版是两条产品线**。

## 七、把"个人效率工具"与"生产级平台"划清界限（本文分析）

两个极端结论都不对：**因为 28,268 stars 就认定它是成熟企业级方案，或因为许可证有附加条件就否定它。**

| 维度 | 实际定位（项目方自述） | 生产级平台需要具备（本文推论） |
|---|---|---|
| 使用者 | **单用户**；启动它的操作系统用户即受信任操作者 | 账号、角色与多用户授权边界 |
| 部署 | **只绑定 loopback**；多用户、共享服务器、LAN 暴露与公网**均不被支持** | 受控的共享部署与服务目录 |
| 数据 | 本机存储；**AI 响应等均为不可信数据** | 集中存储、分类分级、防篡改留痕 |
| 能力暴露 | **不得**让外部方获得实质能力，否则需商业授权 | 对外提供以明确授权与合同为基础 |

**本文立场**：**当个人效率工具用，门槛很低；当部门级共享服务或对外交付物用，须先补上右列空白**——这由 LICENSE 第 3 节与 SECURITY.md 的边界共同决定。

## 八、90 天行动清单

**法务／合规线**：① **锁版本与供应商尽调**——把 **5.3.0 作为许可分界线**写入软件清单，并按既有信息科技外包与供应商风险管理要求评估生产者主体；② **用途定性**——逐场景回答"是否会让集团外主体获得核心能力"；③ **控制关系核查**——按"超过 50% 表决权益"口径梳理 "Your Organization" 范围；④ **授权路径**——对确需对外提供能力的场景，评估取得商业授权的可行性；⑤ **标识与贡献**——禁止移除官方标识，衍生代码回馈上游前先审第 6 节。

**信息科技线**：⑥ **部署基线**——强制 loopback 绑定，**禁止 LAN 暴露**；⑦ **出口控制**——模型端点限定为已批准清单，并在网络层限制目的地址；⑧ **驱动白名单**——建立 JDBC 驱动来源与验证清单；⑨ **密钥管理**——为逐安装密钥指定保管人、备份位置、权限与轮换销毁流程；⑩ **版本隔离与日志对接**——早期预览与 Beta 通道同生产环境隔离，并确认执行历史能否导出、留存多久。

**数据与风控线**：⑪ **数据边界**——明确哪些数据源可接入、哪些库表禁止，把 **AI 响应按不可信数据**处理写入规范；⑫ **权限最小化**——AI 路径只使用只读或最小权限账号；⑬ **变更控制**——把"AI 生成并执行的语句"纳入变更管理，明确批准人、复核与回滚预案；⑭ **留痕与审计**——界定审计所需字段（执行者、时间、语句、目标库、结果、批准记录）；⑮ **使用范围**——不得作为部门级共享服务部署。

**最应先动的是①③⑥⑫**：①决定机构是否知道自己在用哪份许可；③决定"内部"边界；⑥决定部署是否踩出支持范围；⑫决定 AI 能否写生产库。

## FAQ

**Q1：Chat2DB 是开源软件吗？**

A1：**不是 OSI 意义上的开源许可。** GitHub 元数据把 license 标注为 **NOASSERTION**；LICENSE 说明包元数据可标识为 `LicenseRef-Chat2DB`，该标识**仅指向根 LICENSE 文件、不构成单独许可**；README 自称 **"source-available license based on the Apache License 2.0 with additional conditions"**。需注意 **5.3.0 以前的版本仍适用 Apache License 2.0**。

**Q2：只在行内自建自用，也需要商业授权吗？**

A2：按第 1 节，**"Internal Use by you and Your Organization" 属允许用途**，明确包括桌面、Web、Docker、HTTP API、CLI、MCP、插件与可复用模块。**触发商业授权的是"外部方获得核心能力"这一事实**；第 3 节还强调，付费与否、有无账号、单租户或多租户、部署在共享或专用实例乃至客户自有云账号，**都不改变判断结果**；具体场景须由法务定性，**本文不构成法律意见**。

**Q3：SECURITY.md 说"多用户部署不被支持"，是否说明它不安全？**

A3：**不是。** 它划定的是**信任边界**：Community 是单用户、本地优先应用，启动它的操作系统用户即受信任操作者；**不提供用户账号、租户隔离或多用户间的授权边界**；受支持的部署须只在本机提供服务并绑定 `127.0.0.1` 或 `::1`；**多用户、共享服务器、LAN 暴露与公网部署均不被支持**。**这是适用范围声明，不是漏洞声明**——真正的约束是**越界部署不被该安全模型覆盖**。

**Q4：执行历史能直接当审计轨迹用吗？**

A4：**不能默认可以。** README 把"执行历史"列为工作台功能之一，但**功能存在不等于满足审计要求**；SECURITY.md 把"已具文件系统权限后直接修改本地存储"列为**超出边界**。若作为审计证据，须先确认留存期限、导出能力与集中日志对接。

## 事实来源

1. **`repo-metadata.json`（GitHub API 仓库元数据，时点快照）**：所引 **28,268 stars、3,048 forks、创建 2023-06-20、最近推送 2026-09-24、未归档**，以及 `license` 的 **`spdx_id: "NOASSERTION"`（`key: "other"`、`url: null`）**，**均为时点快照**。
2. **`README.md`（项目方自述）**：所引 40+ 数据库、自带模型、部署形态、MCP 支持、5.4.0-beta.1 早期预览与密钥配置，以及 "source-available license" 的自称，**均属项目方口径，未独立验证**。
3. **`LICENSE`（许可证原文，本文最重要的一份来源）**：所引第 1、2、3 节、第 4 节关于 Your Organization、Authorized Personnel、Community Core Capabilities 等定义、第 5 节标识、第 6 节贡献与第 8 节，**均为原文引述或原文转述**；许可人为 **爱獭科技（杭州）有限公司**。
4. **`SECURITY.md`（项目方安全策略原文）**：所引单用户／本地优先模型、不提供用户账号与租户隔离及多用户间授权边界、loopback 绑定要求、多用户与 LAN 暴露与公网部署不受支持、自定义 JDBC 驱动即 Java 代码、不可信数据范围（含 **AI responses**）与 Out of scope，**均为原文引述或原文转述**。

**本文推论／作者分析部分（非来源表述）**：第一、二、七节的定位判断；**第五节"能解决哪些痛点"的全部对应关系与"解决不了什么"清单**；第三节 3.5、3.6 的银行要点；第四节各处"本文分析"；**第六节七条风控启示**；第八节行动清单与 FAQ 中标注为本文分析的部分。**不构成监管要求、合规意见或法律意见。**

*（内容由AI生成，仅供参考）*
