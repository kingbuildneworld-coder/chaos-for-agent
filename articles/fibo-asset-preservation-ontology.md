---
title: "FIBO 没有资产保全本体：银行不良处置建模的复用边界、自建清单与治理陷阱"
date: 2026-10-02
description: "『用 EDM Council FIBO 做资产保全本体建模』是一个不成立的命题。本文对 edmcouncil/fibo 仓库全部 295 个本体做逐词核查，给出可复用的确切边界（FND/FBC 基础层、Collateral 及其两个子类、CollateralValueAsOfDate、SecuredLoan、LenderLienPosition 的两个具名值、LegalProceeding、Servicer 角色、ECB ACTUS 监管分类映射），以及必须自建的完整清单（违约分级、催收、展期重组、止赎收回、核销、押品运营、查封完善与顺位瀑布）。文中给出 FIBO 委员会自己留下的书面证据——LoanDefaultProceeding 类的 skos:definition 字面写着『[no definition]』，并注明需要领域专家与流程建模；并拆解两个会导致错误结论的陷阱：FIBO 的 default 实为 ISDA 信用事件（CDS 触发机制，非银行信贷违约），以及全库 100 个文件命中的 collections 全部是 OMG Commons 的 SKOS 词汇假阳性。另附四个治理陷阱：Loans 从来不是 OMG 标准（仅四个 FIBO 规格在 2017–2018 年达到正式状态，且 2026 年 6 月全部进入 Pending Request for Retirement）、MIT 与 FIB-DM 商业许可的分层、Provisional 成熟度不可作稳定接口、以及公开案例全部与不良处置无关。"
tags: ["FIBO", "EDMCouncil", "本体建模", "知识图谱", "资产保全", "不良处置", "押品管理", "数据标准", "ASD-STE100", "技术风险"]
schema_type: "Article"
references:
  - title: "LoanDefaultProceeding 类的定义（Fiber 仓库 LoanEvents.rdf 第 137–141 行，含 [no definition] 占位与 SME 说明）"
    url: "https://github.com/edmcouncil/fibo/blob/9a7b90ccc64ef9df0762121ff058c9d27fd46037/LOAN/LoansGeneral/LoanEvents.rdf#L137-L141"
    source: "EDM Council — GitHub"
  - title: "FIBO 仓库 README（11 个 domain 的官方模块清单）"
    url: "https://github.com/edmcouncil/fibo/blob/9a7b90ccc64ef9df0762121ff058c9d27fd46037/README.md"
    source: "EDM Council — GitHub"
  - title: "FIBO LICENSE（The MIT License, Copyright (c) 2020 Enterprise Data Management Council）"
    url: "https://github.com/edmcouncil/fibo/blob/9a7b90ccc64ef9df0762121ff058c9d27fd46037/LICENSE"
    source: "EDM Council — GitHub"
  - title: "OMG Finance 分类规格目录（仅四个 FIBO 规格达正式状态，均为 2017–2018）"
    url: "https://www.omg.org/spec/category/finance/About-finance"
    source: "Object Management Group"
  - title: "OMG TC 工作进行中页面（四个 FIBO 规格全部列入 Pending Requests for Retirement）"
    url: "https://www.omg.org/public_schedule/"
    source: "Object Management Group"
  - title: "FIBO-DM 完整数据模型升级页（FIB-DM 为独立商业许可，治理衍生作品，并明示无官方发布计划）"
    url: "https://fib-dm.com/full-data-model-upgrade/"
    source: "EDM Council / FIB-DM"
  - title: "ASD-STE100 Issue 9 全文 PDF（2025-01-15，434 页；875 个批准词、53 条写作规则、Part 2 词典）"
    url: "https://www.asd-ste100.org/assets/files/ASD-STE100_ISSUE9.pdf"
    source: "ASD (Aerospace, Security and Defence Industries Association of Europe)"
  - title: "ASD-STE100 软件与工具页（STEMG 明示不认可、不认证、不授权任何检查工具）"
    url: "https://www.asd-ste100.org/STEsoftware.html"
    source: "ASD — STEMG"
  - title: "FIBO Marches Forward: A Look Inside State Street's FIBO Proof of Concept（利率互换 PoC，用途为抵押品集中度分析，未接入生产）"
    url: "https://www.waterstechnology.com/data-management/2459451/fibo-marches-forward-a-look-inside-state-streets-fibo-proof-of-concept"
    source: "Water & Technology"
---

## 关于本文的文体

本文按 ASD-STE100 约八成结构规则书写。规则来自 Issue 9 全文：短句、主动语态、禁用名词化、每段一个主题、主题句置于段首、每段不超过六句、禁用模糊限定词、禁用分号与缩写式省略。

必须交代一处边界。**ASD-STE100 的词汇锁只约束英文。** 规则 1.1 要求只使用词典批准词、技术名词与技术动词，而该词典只有 875 个批准词，且不含任何中文词。因此中文写作无法达成词汇级合规。本文达成的是结构级合规，不是词汇级合规。

按规则 1.5 至 1.11，领域词必须申报为技术名词才可使用。以下均为本文申报的技术名词：collateral、lien、perfection、encumbrance、servicer、workout、forbearance、repossession、disposal、write-off、haircut、discount、waterfall、ontology、module、maturity、stub。

## 结论

FIBO 不提供资产保全本体。银行必须自建大部分模型。FIBO 只提供基础层、抵押品分类、留置权顺位，以及监管分类映射。

这不是推断。FIBO 委员会在仓库里留下了书面证据。

## FIBO 唯一的违约类是未完成的桩

`LoanDefaultProceeding` 是全库最接近资产保全的类。它的 `skos:definition` 字面写着 `[no definition]`，并明确记录该工作未做。

该定义原文提到这通常属于抵押贷款服务范畴，通常需要一个部门处理。该定义提到处理违约、协助借款人付款、催收、违约管理、止赎、转售。该定义指出这需要该领域的领域专家。该定义提到违约场景下银行要决定重组、止赎还是对担保物求偿。该定义指出如果要进一步探索违约细节，需要引入其他领域专家，并且必须建模一个流程流。该定义还提到需要在逾期达到一定阈值后转入其他流程的机制，并要求绘制状态图。

该文件同时存在拼写错误，例如 `mortgagte`、`THere`、`nto`、`tha`。这说明它是开发过程的草稿，未经审校。

所在文件 `LOAN/LoansGeneral/LoanEvents.rdf` 的成熟度标记是 `Provisional`，不是 `Release`。

全库 295 个本体中，下列词的出现次数为零：workout、repossess、charge-off、write-off、perfection、security interest、encumbrance。

## 两个会导致错误结论的陷阱

**其一，FIBO 的 default 不是银行违约。**

`FBC/DebtAndEquities/CreditEvents.rdf` 里的 default 指 ISDA 信用事件，用于 CDS 和债券。相关概念包括 failure to pay、bankruptcy、moratorium、repudiation、obligation acceleration。

同一文件中的 grace period、default threshold amount、default interest compounding basis 都属于 CDS 触发机制，与银行信贷流程无关。若把这类概念搬进资产保全本体，会建出错误的违约模型。

**其二，collections 是假阳性。**

全库有 100 个文件命中该词。核查后确认全部来自 OMG Commons 的 SKOS `Collection` 与 `Collections` 词汇，与催收无关。

这意味着用文本搜索判断本体覆盖度，会得出完全错误的结论。搜索命中不等于概念存在。这是本体核查的一个通用陷阱。

## FIBO 可直接复用的部分

**基础层。** FND 与 FBC 提供 party、agreement、legal capacity、location、contract third party。资产保全的当事方与法律能力可直接承接。

**抵押品分类。** `Collateral` 是 Undergoer 的子类，定义为质押给他方以担保义务履行的物。它的子类只有两个：PhysicalCollateral 与 NonPhysicalCollateral，且两者互斥。这是全部押品类型体系，只有两个值。

**抵押品估值。** `CollateralValueAsOfDate` 是 AppraisedValue 的子类，表示某一日期的抵押品评估值。`CollateralValuation` 表示由 Appraiser 提供的评估活动，仅覆盖不动产，成熟度为 Provisional。

**担保结构。** `CollateralAgreement`、`SecuredLoan`、`CollateralizedLoan`、`CollateralizedGuaranty` 均可用。

**留置权顺位。** `LenderLienPosition` 是 Classifier，定义为标记贷款人是否对用作抵押的资产享有优先留置权的分类器。其具名值只有两个：`PrimaryLienPosition` 与 `SubordinateLienPosition`。

银行实务中的第三顺位、第四顺位，以及跨债权人顺位瀑布，FIBO 没有。相关属性 `isLienOn` 没有定义域、没有值域、没有定义。

**法律程序骨架。** `LegalProceeding` 与 `CourtJudgment`，含 `hasJudgementAmount` 与 `CourtOfLaw`。这是骨架，不是保全流程。

**Servicer 是角色，不是流程。** 它是 ContractThirdParty 的子类，定义是代贷款人收取本息的一方。FIBO 没有催收流程、账龄管理或升级机制。

**ACTUS 监管分类。** ECB 资产分类法映射入 FIBO，含 `nonPerformingDate`、`delinquencyPeriod`、`delinquencyRate`。这些是现金流分类器的合同条款参数，不是生命周期状态机。

## 银行必须自建的部分

**违约与处置流程。** 违约分级与阶段流转、催收与账龄管理、展期与重组、止赎与收回、核销与减值、诉讼保全与执行、押品处置。上述各项在 FIBO 中无对应类。

**押品体系。** 押品类型体系需按银行口径重建，因为 FIBO 只有物理与非物理两个值。押品估值方法、折扣率、贷款价值比需要自建。

**押品运营。** 重估周期、押品替换、押品释放、集中度监控需要自建。

**法律权利。** 查封登记与完善、优先顺位瀑布需要自建。FIBO 无 Article 9 式的登记建模，无 blanket lien，无 negative pledge。

## 建议的三层方案

**第一层，复用。** 直接引用 FIBO 类，不修改。范围是基础层、Collateral、CollateralValueAsOfDate、SecuredLoan、LenderLienPosition、LegalProceeding、Servicer、ACTUS。

**第二层，扩展。** 以 FIBO 类为父类，添加银行口径子类。例如 BankCollateral 继承 Collateral，SeniorLienPosition 继承 LenderLienPosition，Senior 是新增值。

**第三层，本地。** FIBO 无对应，全部自建。违约分级、处置流程、押品运营、监管报送映射都放这里。

跨层映射必须显式书写。不要依赖推理机自动推出层级。FIBO 本体不完整，自动推理会产生错误结论。

## 治理陷阱

**其一，Loans 不是 OMG 标准。**

OMG 正式标准只有四个：Business Entities v1.1、Financial Business and Commerce v1.0、Foundations v1.2、Indices and Indicators v1.0。全部发布于 2017 至 2018 年。

2026 年 6 月，这四个标准全部进入 Pending Request for Retirement。Loans 只存在于 EDMA 的季度 GitHub 发布。FIBO v2 终结工作组已于 2020 年 12 月解散。

**其二，许可分层容易误判。**

FIBO 的 OWL 源码是 MIT 许可。FIB-DM 数据模型是独立商业许可，且明确管辖衍生作品。OWL 压缩包下载需要 EDMConnect 会员身份，尽管许可本身是 MIT。

若银行要产出专有衍生模型，需向 EDMA 确认许可边界。仅凭 MIT 不足以自证。

**其三，成熟度不均。**

全库 Release 157 个，Provisional 36 个，Informative 4 个。资产保全相关的 `LoanEvents.rdf` 属于 Provisional。银行不应把 Provisional 类当作稳定接口。

**其四，公开案例全部无关。**

State Street 的 PoC 是利率互换，用途是抵押品集中度分析，从未接入生产。Wells Fargo 参与过更早的 PoC。Central Bank of Ireland 用于监管报送研究。没有公开案例涉及不良资产处置。

## 验证方式

若要把这套约束用于生产文档，先申报技术名词表。没有申报表，词汇级合规不成立。

自动可查的规则包括：批准词表（1.1）、句长（5.1、6.3）、被动语态（3.6）、分号（8.1）、多词名词长度（2.1）、非限定式动词（3.5）。

不可自动检查的规则包括：批准词义（1.3）、技术名词审批（1.8）、主题句（6.5）、每段单一主题（6.5）、风格一致（9.4）。

STEMG 自己说明，检查工具无法判断段落首句是否为主题句。同时 STEMG 不认可、不认证、不授权任何检查工具。

所以这个合规比例只在自动子集内成立。不要对外声明整体合规。

## 本文结论的边界

为免误用，明确标注证据强度。

**可核查的事实。** 本文关于 FIBO 的全部论断均来自 edmcouncil/fibo 仓库提交 `9a7b90ccc64ef9df0762121ff058c9d27fd46037`，覆盖全部 295 个本体文件，逐词核查并核对 `rdfs:label` 与 `skos:definition` 实际内容。文中给出逐条链接供复核。

关于 OMG 标准状态，来源是 OMG 官方 Finance 分类目录与 TC 工作进行中页面。

**核查方法上的一个坑。** FIBO 的本体文件是 RDF/XML 格式，扩展名是 `.rdf`，不是 `.owl`。用 `.owl` 做通配搜索会对全部词汇返回零命中，包括 guarantor 这种必然存在的词。若不复核文件格式，会得到完全虚假的全库覆盖结论。本文初次核查时即踩中此坑，修正后重做。

**待确认项。** FIBO 的 FBC 退役申请标注版本为 v1.1，而 OMG 目录列出的正式版本是 v1.0。本文未能确认这一差异的原因。

**未验证项。** 本文未在任何银行生产环境验证 FIBO 的实际行为。本文不构成对具体银行的实施建议。

**文体边界。** 本文按 ASD-STE100 结构规则书写，但中文无法达成词汇级合规。ASD-STE100 在银行业与本体领域没有先例：有据可查的应用集中在航空航天、国防、船舶、风电、医疗器械。若需用于实际 STE 交付物，须改用英文。

*作者毕超，金融行业风险管理从业者。本文仅代表作者个人观点，不构成任何机构立场。*

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "FIBO 没有资产保全本体：银行不良处置建模的复用边界、自建清单与治理陷阱",
  "datePublished": "2026-10-02",
  "description": "『用 EDM Council FIBO 做资产保全本体建模』是一个不成立的命题。本文对 edmcouncil/fibo 仓库全部 295 个本体做逐词核查，给出可复用的确切边界（FND/FBC 基础层、Collateral 及其两个子类、CollateralValueAsOfDate、SecuredLoan、LenderLienPosition 的两个具名值、LegalProceeding、Servicer 角色、ECB ACTUS 监管分类映射），以及必须自建的完整清单（违约分级、催收、展期重组、止赎收回、核销、押品运营、查封完善与顺位瀑布）。文中给出 FIBO 委员会自己留下的书面证据——LoanDefaultProceeding 类的 skos:definition 字面写着『[no definition]』，并注明需要领域专家与流程建模；并拆解两个会导致错误结论的陷阱：FIBO 的 default 实为 ISDA 信用事件（CDS 触发机制，非银行信贷违约），以及全库 100 个文件命中的 collections 全部是 OMG Commons 的 SKOS 词汇假阳性。另附四个治理陷阱：Loans 从来不是 OMG 标准（仅四个 FIBO 规格在 2017–2018 年达到正式状态，且 2026 年 6 月全部进入 Pending Request for Retirement）、MIT 与 FIB-DM 商业许可的分层、Provisional 成熟度不可作稳定接口、以及公开案例全部与不良处置无关。",
  "keywords": [
    "FIBO",
    "EDMCouncil",
    "本体建模",
    "知识图谱",
    "资产保全",
    "不良处置",
    "押品管理",
    "数据标准",
    "ASD-STE100",
    "技术风险"
  ],
  "author": {
    "@type": "Person",
    "name": "毕超",
    "jobTitle": "金融行业风险管理从业者"
  }
}
</script>

## 常见问题

Q: 既然 FIBO 覆盖不到，那银行做资产保全本体还有什么意义？
A: **意义在基础层，不在业务层。** FIBO 的 FND 与 FBC 提供当事方、协议、法律能力、地点、合同第三方等概念，这套基础对齐了才能与行内其他系统打通，避免每套系统各造一套「客户」「账户」「合同」。**真正需要判断的是投入产出：基础层的复用有独立价值，业务层（违约分级、催收、止赎、核销）无论用不用 FIBO 都要自建。** 所以正确的问题不是「用不用 FIBO」，而是「哪些层值得复用」。按本文的三层方案，第一层直接引用，第二层继承扩展，第三层自建。
Q: 网上说 FIBO 有 Collateral 模块，可以直接用吗？
A: **FIBO 没有 Collateral 模块，这是一个需要纠正的流传说法。** 抵押品概念散落在四个本体中，不构成独立模块。更关键的是覆盖度：`Collateral` 的子类只有 `PhysicalCollateral` 与 `NonPhysicalCollateral` 两个互斥值，这是全部押品类型体系。**留置权顺位只有两个具名值（`PrimaryLienPosition`、`SubordinateLienPosition`），银行实务的第三、第四顺位和跨债权人顺位瀑布都没有。查封登记与完善（perfection）、blanket lien、negative pledge 在全库出现次数为零。** 所以「有 Collateral 类」不等于「有押品管理模型」——前者是资产分类的二元切分，后者是银行业的核心能力。
Q: FIBO 里的 default 能不能直接用来建违约分级？
A: **不能，会建错。** FIBO 的 default 指 ISDA 信用事件，用于 CDS 与债券触发机制，相关概念包括 failure to pay、bankruptcy、moratorium、repudiation、obligation acceleration。同一文件里的 grace period、default threshold amount、default interest compounding basis 都是 CDS 触发参数，**与银行信贷的违约认定标准（逾期天数、还款困难、风险分类下调）不是同一套东西。** FIBO 唯一的银行违约类 `LoanDefaultProceeding` 是未完成的桩，定义为空的。**结论：违约分级必须完全自建，不能从 FIBO 派生。**
Q: 用 grep 搜 FIBO 源码判断覆盖度可靠吗？
A: **不可靠，本次核查给出了两个实例。** 第一，全库有 100 个文件命中 collections，核查后确认全部是 OMG Commons 的 SKOS `Collections` 词汇，与催收完全无关——若据此判断「FIBO 覆盖催收」，结论会完全错误。第二，FIBO 本体文件扩展名是 `.rdf` 而非 `.owl`，用 `.owl` 做通配搜索会对全部词汇返回零命中，包括 guarantor 这种必然存在的词。**正确做法是核对文件格式、逐条读 `skos:definition` 实际内容、并区分真概念与命名空间碰撞。搜索命中不等于概念存在。**
Q: 把资产保全模型挂到 FIBO 上，会不会因为本体不完整而引入错误推理？
A: **会，所以必须显式书写跨层映射。** FIBO 的本体尚不完整——`LoanEvents.rdf` 是 Provisional 成熟度，`LoanDefaultProceeding` 定义为空，还有 `isLienOn` 这类无定义域、无值域、无定义的属性。在这样的本体上依赖推理机自动推出层级，会产生错误结论。**建议做法是三层分离：第一层直接引用不修改，第二层以 FIBO 类为父类显式声明子类，第三层完全自建；层间关系写成显式映射而非交给推理机。** 这样即使 FIBO 后续演进或退役（四个 OMG 规格已在退役流程中），你的自建层也不受影响。
Q: 听说 FIBO 是 OMG 标准，可以直接作为监管报送的报送口径？
A: **不能，这个说法不准确。** OMG 正式标准只有四个 FIBO 规格——Business Entities v1.1、Financial Business and Commerce v1.0、Foundations v1.2、Indices and Indicators v1.0，全部发布于 2017 至 2018 年，且**这四个在 2026 年 6 月已全部进入 Pending Request for Retirement（退役申请流程）**。**Loans 领域从来不是 OMG 标准**，只存在于 EDMA 的季度 GitHub 发布，成熟度 Provisional 占 36 个。**许可上也要分层：OWL 源码是 MIT，但 FIB-DM 数据模型是独立商业许可且明确管辖衍生作品。** 若要用 FIBO 作为监管报送口径，需先解决标准状态、成熟度与许可三个问题，而不是直接引用 OMG 这个名号。
