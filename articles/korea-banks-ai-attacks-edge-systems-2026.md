---
title: "韩国五家银行连环遭“AI 辅助”攻击：边缘系统如何成为金融网络安全最薄弱一环"
date: 2026-10-08
description: "2026年9月底至10月初，韩国至少7家金融机构在数日内连环遭黑客攻击，约6.6万人信息泄露，新韩银行2.5万余人、耶佳蓝储蓄银行约4万人为重灾区。攻击全部绕过核心网银系统，集中打击贷款代理人查询、员工移动办公等边缘系统，且涉嫌使用开源 AI 渗透工具 ARTEX。本文复盘事件全貌，拆解攻击路径，并从资产盘点、暴露面收敛、纵深防御、AI 攻防对等、数据保护五方面提出对中国银行业的借鉴措施。"
tags: ["韩国银行","网络攻击","ARTEX","AI攻防","边缘系统","数据泄露","金融网络安全","纵深防御"]
schema_type: Article
references:
  - title: "韩多家银行被黑疑涉AI 李在明要求彻查（韩联社/人民网韩国频道，2026-10-08）"
    url: "http://korea.people.com.cn/n1/2026/1008/c407366-40810698.html"
    source: "人民网韩国频道"
  - title: "Shinhan, Kookmin, Hana data breaches fuel concerns over AI-powered cyberattacks in financial sector（2026-10-03）"
    url: "https://www.koreatimes.co.kr/www/tech/2026/10/419_420000.html"
    source: "The Korea Times"
  - title: "No panic or bank runs after sweeping cyberattacks on Korean lenders（2026-10-06）"
    url: "https://m.ajupress.com/view/20261006163546567"
    source: "Aju Press"
  - title: "AI-Powered Cyber Attacks Target Major South Korean Banks: October 2026 Data Breach Analysis and Response（2026-10-06）"
    url: "https://www.rescana.com/post/ai-powered-cyber-attacks-target-major-south-korean-banks-october-2026-data-breach-analysis-and-response"
    source: "Rescana"
  - title: "South Korean Financial Sector Hit by Coordinated Cyberattacks（2026-10-04，含 10-05 更新）"
    url: "https://cyber.netsecops.io/articles/south-korean-financial-sector-hit-by-coordinated-cyberattacks/"
    source: "CyberNetSec"
  - title: "Unknown Threat Actor Uses AI-Driven ARTEX to Target South Korean Finance（2026-10-07）"
    url: "https://www.crowdstrike.com/en-us/blog/unknown-threat-actor-uses-artex-to-target-south-korean-finance"
    source: "CrowdStrike"
  - title: "ARTEX AI Pentesting Tool Used in Data Theft Attacks on South Korean Financial Firms（2026-10-08）"
    url: "https://thehackernews.com/2026/10/artex-ai-pentesting-tool-used-in-data.html"
    source: "The Hacker News"
  - title: "AI-linked hacks hit Korean banks through loan-agent sites（2026-10-06）"
    url: "https://www.americanbanker.com/news/ai-linked-hacks-hit-korean-banks-through-loan-agent-sites"
    source: "American Banker"
---

# 韩国五家银行连环遭"AI 辅助"攻击：边缘系统如何成为金融网络安全最薄弱一环

**2026 年 9 月底至 10 月初，韩国至少 7 家金融机构在数日内连环遭黑客攻击，累计约 6.6 万人信息泄露：新韩银行 25,727 名客户、耶佳蓝储蓄银行约 4 万名客户，KB国民银行、韩亚银行、BNK釜山银行、现代资本等相继中招。** 韩国总统李在明 10 月 4 日下令彻查，金融监督院对新韩银行启动现场检查（至 10 月 20 日），全行业进入紧急安全审查。

**这轮攻击最值得警惕的共性：所有得手的入侵都绕过了银行重兵防守的核心网银系统，精准打击贷款代理人查询、员工移动办公支持、外部销售支持等"边缘系统"——那些与互联网直连、却未获得与核心系统同等安全投入的辅助系统。** 攻击流量来自美国、日本、新加坡、越南、英国等多国 IP，呈分布式扫描特征，并涉嫌使用开源 AI 渗透工具 ARTEX 自动化完成侦察、漏洞发现与攻击路径规划。

**ARTEX 事件本身是一个分水岭：一个本用于防御的开源 agentic 渗透测试工具（2026 年 7 月 26 日发布于 GitHub，多 LLM 智能体架构，可连接 ChatGPT、Claude、DeepSeek），被用于真实攻击并疑似出现在攻击服务器页面标题中。** CrowdStrike 已确认该活动为"近期发布的开源 agentic 渗透工具被滥用"，但同时强调尚未归属任何已命名威胁组织，韩国警方仍在调查。

**对中国银行业的镜鉴是结构性的：数字化转型中，线上贷款合作方系统、员工移动办公、API 暴露面、外包人员系统正在复制同样的风险格局——"以 AI 防御 AI"不再是一句口号，而是监管与市场的共同选择。** 下文先复盘事件，再拆解攻击路径，最后给出五方面借鉴措施。

## 一、事件复盘：一场针对"软肋"的协同攻击

### 1. 受影响机构与规模（截至 2026-10-07 多源交叉核验）

| 机构 | 受影响规模 | 攻击目标 | 泄露数据类型 |
|---|---|---|---|
| 新韩银行（Shinhan） | 25,727 名客户 | 贷款代理人专用查询服务（9/29–30 发生） | 姓名、电话、年收入、计算贷款额度；含 66 例身份证号、97 例连接信息（CI） |
| 耶佳蓝储蓄银行（Yegaram） | 约 40,000 名客户 | 储蓄银行业务系统 | 客户个人信息（单一最大受害者） |
| KB国民银行（Kookmin） | 119 名客户（另有口径：99 客户+20 现任及离职员工） | 员工移动办公支持系统（9/30 晚发现异常访问） | 姓名、电话、地址、加密身份证号 |
| 韩亚银行（Hana） | 89 名客户 | 外部销售支持系统 | 含身份证号 |
| 现代资本（Hyundai Capital） | 146 名房贷代理人 | 合作方/代理人系统 | 代理人个人信息 |
| BNK釜山银行 | 11 名外包员工 | 外包人员管理系统 | 外包员工个人信息 |
| Welcome 储蓄银行 | 在列（规模未详） | 储蓄银行业务系统 | 客户个人信息 |
| 友利银行、NH农协银行 | 遭攻击，未确认信息被窃 | — | — |

合计口径约 66,000–68,000 人（各报道略有差异）；银行核心网银/手机银行交易系统均未被突破。

### 2. 时间线与监管响应

- 9 月 29–30 日：攻击发生，新韩银行 9 月 30 日晚识别异常并阻断；
- 10 月 2 日：KB、韩亚、BNK 相继确认泄露，金融监督院与金融安全院启动全行业排查；
- 10 月 4 日：总统李在明指示"高度重视、彻底调查、全力应对"；金融委员会（FSC）召开紧急会议；
- 10 月 5–6 日：媒体确认 7 家机构、近 7 万人受影响；金融监督院对新韩银行现场检查（至 10 月 20 日）；警方网络恐怖调查组立案；
- 10 月 7–8 日：CrowdStrike、The Hacker News 发布 ARTEX 技术分析。

## 二、攻击路径拆解：为什么"边缘系统"成了突破口

### 1. 攻击者的策略：避开铁拳，打软肋

多家安全机构的分析（CyberNetSec、Rescana）一致指出：攻击者对韩国银行 IT 架构有清晰理解——**核心银行系统与互联网隔离、防护厚重，而贷款代理人网站、员工移动办公平台等辅助系统直接暴露在公网，且往往由不同团队管理、补丁滞后、与内网数据库存在信任通道**。攻击者选择的就是这条"更软的路径"。

对应 MITRE ATT&CK 的典型链路：
- **T1190 利用公网暴露应用**：对贷款代理查询、移动办公等 Web 应用实施漏洞利用，获取初始立足点；
- **T1087/T1046/T1595.002 自动化侦察**：账户发现、网络服务扫描、漏洞扫描——多国 IP 分布式扫描支持"自动化批量探测"的判断；
- **T1213/T1530/T1005 数据收集**：从信息仓库与本地系统提取客户/员工数据；
- **T1041 经 C2 通道外传**。

### 2. ARTEX AI：开源防御工具如何被武器化

- **它是什么**：开源 agentic 渗透测试系统，2026 年 7 月 26 日发布于 GitHub，由安全工程师以"Autumn"名义开发；planner 智能体将目标拆解为任务，worker 智能体调用真实工具（shell 命令、HTTP 请求、端口扫描）执行并互相检索日志；通过 API 连接 ChatGPT、Claude、DeepSeek 等外部 LLM；GitHub 页面标注"仅供个人学习与研究，不得用于对线上系统的真实测试"（摘自 CrowdStrike/The Hacker News/Global Banking & Finance 报道）。
- **攻击中的证据**：与攻击相关的服务器 HTML 页面标题出现"ARTEX-自主渗透测试控制台"字符串（韩国金融安全院确认）；CrowdStrike 观察到攻击者将 ARTEX 与 LLM 结合使用，活跃期与攻击时间吻合。
- **需要如实区分的口径**：ARTEX 由中国安全工程师开发是已报道事实；但"攻击者是谁"尚无司法定论——CrowdStrike 明确未归属任何已命名威胁组织，警方调查仍在进行；工具被滥用不等于开发者参与攻击（SBS 援引 WSJ 亦如此表述）。

### 3. 为什么这是"分水岭"

传统攻击的侦察、漏洞验证、数据搬运依赖人工与脚本，门槛高、速度慢；ARTEX 这类 agentic 工具把"规划—执行—验证—再规划"闭环自动化，显著降低了攻击者的技能与时间成本，并支持多目标并行。这正是监管提出"以 AI 应对 AI 攻击"战略的现实背景。

## 三、对中国银行业的借鉴建议措施

1. **资产盘点：把"边缘系统"纳入核心管控**。立即建立完整的互联网暴露面资产清单——线上贷款合作方查询平台、员工移动办公、邮件网关、API 网关、外包人员系统、营销活动页面全部入册；与核心系统同等级的安全审查、补丁周期与上线安全测试（SAST/DAST/渗透测试），消灭"低优先级系统的信任通道"这一结构性漏洞。
2. **暴露面收敛与访问控制**。坚持最小暴露原则：能不开公网就不开，能用专线/VPN 就不用公网；所有公网应用前置 WAF 并开启日志审计；服务账号遵循最小权限，Web 应用对后端数据库的访问严格限定于业务必需字段——本次泄露中"贷款查询系统可触达身份证号、连接信息"本身就是权限过大的信号。
3. **纵深防御：切断横向移动**。假设边缘系统必然失守：核心系统与公网区强隔离，Web 服务器到数据库的流量单向受控；对异常出站流量（如 C2 外传）设告警；对外部扫描行为（多国 IP 批量探测、对 `/loan_agent/`、`/mobile_support/` 等路径的异常访问）建立威胁狩猎规则。
4. **以 AI 防御 AI**。把红队工具（同类 agentic 渗透测试、LLM 辅助漏洞挖掘）引入日常安全测试与攻防演练；用 AI 强化检测——日志异常分析、UEBA 用户行为基线、SOAR 自动化响应，把"发现—研判—处置"从小时级压缩到分钟级；建立模型/AI 应用自身的供应链安全审查（ARTEX 教训：开源 AI 工具的许可、来源与声明边界必须核验）。
5. **数据保护与客户救济**。敏感字段（身份证号、收入、贷款额度、连接信息）默认加密存储、最小化留存、查询脱敏；对"年收入+贷款额度+手机号"这类高价值组合数据实施专项访问审计。事件后第一时间：阻断路径、评估范围、按监管要求上报，并主动向受影响客户提供二次欺诈监控、免费换卡/信用保护与赔偿承诺（参照 KB 的"全额赔偿"表态）。

## 结语

韩国这轮攻击没有攻破任何一家银行的核心系统，却让约 6.6 万人数据裸露——这恰恰是最值得中国银行业警醒的隐喻：**金融安全的下一个战场不在"护城河内"，而在那些你以为是边角料的系统里。** 当开源 AI 工具把攻击成本降到个人可及，银行的每一段暴露面、每一个外包账号、每一次越权查询，都可能成为下一次事件的入口。把边缘系统当作核心系统来管，把 AI 既当对手又当队友，是这轮"邻国事故"留给我们的最小成本课程。

（注：事件事实与引语均来自文末列出信源并标注日期；受影响人数、ARTEX 使用证据等以各信源口径为准；攻击者归属仍在韩国警方调查中，本文不预设结论。）
