---
title: "别继承 FIBO 的类：银行资产保全扩展层的可落地设计"
date: 2026-10-02
description: "上一版文章建议『以 FIBO 类为父类添加银行口径子类』。本文用源码证据推翻该建议并给出替代设计。核心依据：FIBO 类 IRI 在 2025Q3→2025Q4 一个季度内移除 145 个（含CollateralAgreement 本身），旧 IRI 保留为带 owl:equivalentClass 跳转的 deprecated 桩——继承它不会报错，而是静默绑死在已废弃的分类轴上；且 FIBO 对 Release 级类无任何向后兼容承诺，类 IRI 不带版本号。本文给出三段式可落地设计：押品分类用 SKOS 分面 Concept Scheme（因FIBO 的 Collateral 只有物理/非物理二叉，单继承无法表达银行需要的法律性质、登记状态、估值方式、处置难度四个维度）；映射沿用 FIBO 自己的 ACTUS 范式（owl:imports + owl:NamedIndividual + cmns-dsg:denotes someValuesFrom 限制，全文不使用 rdfs:subClassOf）；顺位编码由银行自有，并显式声明映射有损。文中给出全部可落地 OWL 片段与经核实的 FIBO 精确 IRI，并标注三个必须避开的语义陷阱：CollateralAgreement 在两个命名空间下重复定义且其中一个已被移除、ContractThirdParty 的定义明确排除缔约方、AppraisedValue 是金额而非评估活动因而不含日期语义。"
tags: ["FIBO", "本体建模", "知识图谱", "SKOS", "资产保全", "押品管理", "不良处置", "数据标准", "语义web", "技术风险"]
schema_type: "Article"
references:
  - title: "CorporateATions.rdf 中的 owl:deprecated + owl:equivalentClass 跳转写法（命名空间迁移的信号机制）"
    url: "https://github.com/edmcouncil/fibo/blob/9a7b90ccc64ef9df0762121ff058c9d27fd46037/BE/Corporations/Corporations.rdf#L76-L79"
    source: "EDM Council — GitHub"
  - title: "CONTRIBUTING.md：FIBO 成熟度等级定义（Release / Provisional / Informative）"
    url: "https://github.com/edmcouncil/fibo/blob/9a7b90ccc64ef9df0762121ff058c9d27fd46037/CONTRIBUTING.md#L108-L122"
    source: "EDM Council — GitHub"
  - title: "ONTOLOGY_GUIDE.md：本体 IRI 格式、前缀格式、DOCTYPE ENTITY 强制要求、14 项必备元数据"
    url: "https://github.com/edmcouncil/fibo/blob/9a7b90ccc64ef9df0762121ff058c9d27fd46037/ONTOLOGY_GUIDE.md"
    source: "EDM Council — GitHub"
  - title: "ACTUSContractTermMapping.rdf：以 owl:NamedIndividual + cmns-dsg:denotes someValuesFrom 桥接外部分类法（FIBO 自有先例）"
    url: "https://github.com/edmcouncil/fibo/blob/9a7b90ccc64ef9df0762121ff058c9d27fd46037/ACTUS/ACTUSContractTermMapping.rdf"
    source: "EDM Council — GitHub"
  - title: "LoanEvents.rdf：LoanDefaultProceeding 的空定义、8 个类中 5 个无 skos:definition、成熟度 Provisional"
    url: "https://github.com/edmcouncil/fibo/blob/9a7b90ccc64ef9df0762121ff058c9d27fd46037/LOAN/LoansGeneral/LoanEvents.rdf#L137-L141"
    source: "EDM Council — GitHub"
  - title: "OMG Finance 分类目录（四个 FIBO 规格的正式状态与年份）"
    url: "https://www.omg.org/spec/category/finance/About-finance"
    source: "Object Management Group"
  - title: "FIBO 仓库 LICENSE（The MIT License, Copyright (c) 2020 Enterprise Data Management Council）"
    url: "https://github.com/edmcouncil/fibo/blob/9a7b90ccc64ef9df0762121ff058c9d27fd46037/LICENSE"
    source: "EDM Council — GitHub"
---

## 结论先行

不要继承 FIBO 的类。用平行分类法加显式映射。

映射的写法照抄 FIBO 自己接ACTUS 的做法：`owl:imports` 双向依赖，加 `owl:NamedIndividual` 加 `cmns-dsg:denotes someValuesFrom` 限制。不写 `rdfs:subClassOf`。

本文给出全部可落地 OWL，父类 IRI 均已逐条核实。

## 我上一版的建议是错的

上一篇文章的第二层写的是"以FIBO 类为父类，添加银行口径子类"。该建议基于一个我当时没有验证的隐含假设：FIBO 的类 IRI 稳定。

**它不稳定。**

2025Q3 到 2025Q4 一个季度内，类 IRI 从 15,876 个降到 15,806 个，**移除 145 个，新增 75 个**。移除项包含基础类的整体命名空间迁移：

```
fibo-be-le-lp;LegalEntity            移除
fibo-be-corp-corp;JointStockCompany  移除
fibo-be-ge-ge;hasJurisdiction        移除
fibo-fbc-dae-dbt;CollateralAgreement  移除
```

最后一行是重点。**`CollateralAgreement` 恰在我上一版列���"可复用"清单里的那一项，它自己就在这次迁移中被移除了。**

### 失效是静默的

旧 IRI 没有被删除，而是保留为带跳转的 deprecated 桩：

```xml
<owl:Class rdf:about="&fibo-be-corp-corp;JointStockCompany">
    <owl:deprecated rdf:datatype="&xsd;boolean">true</owl:deprecated>
    <owl:equivalentClass rdf:resource="&fibo-be-le-cb;JointStockCompany"/>
</owl:Class>
```

全库共89 处 `owl:deprecated`，分布在 79 个文件。这些旧 IRI 在 HTTP 上仍返回 200，跳转是活的。

`owl:equivalentClass` 的含义是**两个 IRI 逻辑上同一类**。所以银行写：

```xml
<owl:Class rdf:about="https://bank.example/ontology/preservation/BankJointStockCompany">
  <rdfs:subClassOf rdf:resource=".../fibo-be-corp-corp;JointStockCompany"/>
</owl:Class>
```

推理机**不会报错**。它会正常解析，然后把这个类绑死在一���已被维护者显式标记为"不应复用"的轴上。失败方式是静默的，这比直接报错更危险。

ONTOLOGY_GUIDE 里确实有一条卫生检查，第 304 行：

> Deprecated resources should not be used — If a resource is `owl:deprecated`, then it should not be reused

但这是写给 FIBO 贡献者的 CI 检查，不是对使用者的承诺。

### 另外三条硬约束

**类 IRI 不带版本号。** 唯一的版本标识是本体级 `owl:versionIRI`，而 `owl:versionInfo` 是空的。无法 pin 某个类。

**无向后兼容承诺。** 仓库里没有 CHANGELOG，没有发布历史文件，没有兼容性保证。唯一一条"FIBO v2 保持向后兼容"的说法，描述的是 2020 年 12 月已解散的终结工作组。

**无稳定性的正面表述。** `CONTRIBUTING.md` 对 Release 的定义只有"通过了最严格的完整性、一致性、正确性测试"——**没有任何稳定承诺**。我原本准备引用的"Provisional 可能无预告变更"这句话**在仓库里不存在**。Provisional 的定义只有"未达到 Release 级别的审查与测试"，既无承诺也无警告。

顺带一个治理发现：**FIBO 官方对成熟度等级有两套不一致的描述。** `CONTRIBUTING.md` 说 Informative 是"已被明确否决"，官网页面说 Informative 是"已被视为废弃"。银行若要引用等级语义，两处都该存档。

## FIBO 自己就不做子类化

这是决定架构的关键证据。

ACTUS 是欧洲央行的资产分类法。FIBO 接它的方式，四种假设全部不成立：

- 不是把 ACTUS 导入 LOAN
- 不用 SKOS
- 不用 `closeMatch` 或 `broader`
- 不写 `rdfs:subClassOf`

实际做法是：**把 ACTUS 顶层域与 FIBO 并列，建一个专门的映射模块，双向 `owl:imports`，然后把每个 ACTUS 数据字典条目声明为 `owl:NamedIndividual`，用匿名限制把 FIBO 概念作为 `someValuesFrom` 填进去。**

```xml
<owl:NamedIndividual rdf:about="&fibo-actus-act;ACTUSContractTerm-BDC">
    <rdf:type>
        <owl:Restriction>
            <owl:onProperty rdf:resource="&cmns-dsg;denotes"/>
            <owl:someValuesFrom rdf:resource="&fibo-fnd-dt-bd;BusinessDayConvention"/>
        </owl:Restriction>
    </rdf:type>
</owl:NamedIndividual>
```

映射模块 `ACTUS/ACTUSContractTermMapping.rdf` 里的谓词统计：`owl:Restriction` 57 个，`owl:NamedIndividual` 48 个，`rdf:type` 48 个，`owl:imports` 33 个。**`skos:exactMatch`、`skos:closeMatch`、`skos:broadMatch`、`skos:narrowMatch`、`skos:relatedMatch`、`skos:broader`、`skos:broaderTransitive` 零命中。**

报告原文的结论句：

> Note: **no `rdfs:subClassOf` edge to a FIBO class is ever asserted for these.** The FIBO concept appears only as a filler inside a restriction on the `rdf:type` of a named individual.

所以银行扩展层的正确形态是**镜像 FIBO 自己的先例**，而不是镜像一般 OWL 教程。

## 三个必须避开的语义陷阱

在给出设计之前，先确认三处会静默污染模型的地方。

### 陷阱一：CollateralAgreement 在两个命名空间下重复定义

它有两个 IRI，不是一个：

- `https://spec.edmcouncil.org/fibo/ontology/FND/Agreements/Contracts/CollateralAgreement` —— 有 label、definition、注解，`subClassOf WrittenContract`
- `.../FBC/DebtAndEquities/Debt/CollateralAgreement` —— 无label、无 definition，仅增加两条限制

**这不是"公理累积"，是 FIBO 自身的建模分歧。** 而且后者的前缀 `fibo-fbc-dae-dbt` 恰好在 2025Q4 迁移中被移除。

银行必须二选一。建议选 FND 那个——它有定义、是 `WrittenContract` 的子类、有 `explanatoryNote` 说明与主合同的优先级关系。

**教训：不要通过 `rdfs:subClassOf` 引用它。** 无论选哪个，都是绑定一个可能被移除的 IRI。

### 陷阱二：ContractThirdParty 的定义明确排除缔约方

```
ContractParty:      "legally competent party that has entered into a binding
                     agreement, accepting and conceding obligations,
                     responsibilities, and benefits as specified"

ContractPrincipal:  "party that originates a contract and is identified as the
                     first party to that contract, in the event that the
                     contract distinguishes any party as such"

ContractThirdParty: "party that is indirectly involved in, but NOT a
                     counterparty to, an agreement"
```

银行对手方要用 **`ContractParty`**。`ContractPrincipal` 编码的是发起方/第一方，会破坏对称性。`ContractThirdParty` 恰好定义为"不是缔约方"，用它承载对手方是定义级矛盾。

这三个类在 `Contracts.rdf` 里紧邻（第 357–363 行与 366–370 行），极易误选。

顺带确认：`PartyToContract` 不存在。`NaturalPerson` 不存在。`Individual` 不存在。全库唯一的 `rdfs:subClassOf Party` 是 `Person`。

### 陷阱三：AppraisedValue 是金额，不是评估活动

```
AppraisedValue → MarketValue → MonetaryAmount
```

它是**一个值**，而且**本身不含日期**。日期语义只存在于 `CollateralValueAsOfDate`，靠额外加一条 `hasDateOfAssessment some ExplicitDate` 限制获得。

FIBO 把估值拆成两个概念：`CollateralValuation`（活动，LOAN 域）与 `CollateralValueAsOfDate`（活动产出的金额，FBC 域）。

**继承 `AppraisedValue` 拿不到日期。** 这是设计押品估值模型时最容易踩的一脚。

还有一个不一致：`CollateralValuation` 的 definition 写"real property"，但公理用的是 `allValuesFrom Collateral`（任意押品）。**定义比公理窄，不要依赖散文。**

## 设计：四段结构

### 第一段：押品分类用 SKOS 分面，不用 OWL 类树

根本原因是 FIBO 的 `Collateral` 只有二叉划分：

```xml
<owl:Class rdf:about=".../Debt/PhysicalCollateral">
  <rdfs:subClassOf rdf:resource=".../Debt/Collateral"/>
</owl:Class>
<owl:Class rdf:about=".../Debt/NonPhysicalCollateral">
  <rdfs:subClassOf rdf:resource=".../Debt/Collateral"/>
  <owl:disjointWith rdf:resource=".../Debt/PhysicalCollateral"/>
</owl:Class>
```

只有两个子类，互斥。这就是全部押品类型体系。

而银行需要的是**分面**：按法律性质、按登记状态、按估值方式、按处置难度。一个押品同时在这四个维度上各有一个值。单继承树无法表达——无论怎么挂，都只能选一个主轴。

这正是 SKOS Concept Scheme 的适用场景。**注意这不是"SKOS 用错了地方"**：FIBO 不用 SKOS 是因为它要的是类层级断言，不是分类法；银行要的是多维码表，用 SKOS 才对。

```xml
<owl:Ontology rdf:about="https://bank.example/ontology/preservation/CollateralScheme/">
  <owl:imports rdf:resource="http://www.w3.org/2004/02/skos/core#"/>

  <!-- 分面一：法律性质 -->
  <skos:ConceptScheme rdf:about="https://bank.example/ontology/preservation/CollateralScheme/">
    <skos:hasTopConcept>
      <skos:Concept rdf:about=".../scheme#"/>
    </skos:hasTopConcept>
  </skos:ConceptScheme>

  <skos:ConceptProperty rdf:about=".../v/legalNature"/>
  <skos:ConceptProperty rdf:about=".../v/registrationStatus"/>
  <skos:ConceptProperty rdf:about=".../v/valuationMethod"/>
  <skos:ConceptProperty rdf:about=".../v/disposalDifficulty"/>

  <skos:Concept rdf:about=".../c/realEstate">
    <skos:prefLabel xml:lang="zh">不动产</skos:prefLabel>
    <skos:broader rdf:resource=".../scheme#"/>
    <skos:related>
      <skos:Concept rdf:about=".../v/legalNature/realProperty"/>
    </skos:related>
    <skos:related>
      <skos:Concept rdf:about=".../v/registrationStatus/registered"/>
    </skos:related>
    <skos:related>
      <skos:Concept rdf:about=".../v/disposalDifficulty/low"/>
    </skos:related>
  </skos:Concept>

  <skos:Concept rdf:about=".../v/legalNature/realProperty">
    <skos:prefLabel xml:lang="zh">不动产</skos:prefLabel>
  </skos:Concept>
</owl:Ontology>
```

这样银行口径的"房产"、"车贷质押"、"应收账款保理"是**码表条目**，不是类。它们不需要继承任何 FIBO 类，因此不需要承担 IRI漂移风险。

### 第二段：映射照抄 ACTUS 范式

银行自建概念与 FIBO 概念之间，用 `denotes` 限制桥接。这是本设计中最关键的一段。

```xml
<owl:Ontology rdf:about="https://bank.example/ontology/preservation/AssetPreservation/">
  <owl:imports rdf:resource="https://spec.edmcouncil.org/fibo/ontology/FBC/DebtAndEquities/Debt/"/>
  <owl:imports rdf:resource="https://spec.edmcouncil.org/fibo/ontology/FND/Agreements/Contracts/"/>
  <owl:imports rdf:resource="https://spec.edmcouncil.org/fibo/ontology/LOAN/LoansGeneral/Loans/"/>
  <owl:imports rdf:resource="https://www.omg.org/spec/Commons/Designators/"/>
  <owl:imports rdf:resource="https://www.omg.org/spec/Commons/Organizations/"/>
  <owl:imports rdf:resource="http://www.w3.org/2004/02/skos/core#"/>

  <!-- 银行自建码表条目，通过 denotes 指向 FIBO 的物理/非物理二分 -->
  <owl:NamedIndividual rdf:about="https://bank.example/collateral/c/realEstate">
    <rdf:type>
      <owl:Restriction>
        <owl:onProperty rdf:resource="https://www.omg.org/spec/Commons/Designators/denotes"/>
        <owl:someValuesFrom rdf:resource="https://spec.edmcouncil.org/fibo/ontology/FBC/DebtAndEquities/Debt/PhysicalCollateral"/>
      </owl:Restriction>
    </rdf:type>
  </owl:NamedIndividual>

  <owl:NamedIndividual rdf:about="https://bank.example/collateral/c/receivables">
    <rdf:type>
      <owl:Restriction>
        <owl:onProperty rdf:resource="https://www.omg.org/spec/Commons/Designators/denotes"/>
        <owl:someValuesFrom rdf:resource="https://spec.edmcouncil.org/fibo/ontology/FBC/DebtAndEquities/Debt/NonPhysicalCollateral"/>
      </owl:Restriction>
    </rdf:type>
  </owl:NamedIndividual>
</owl:Ontology>
```

**关键点：映射方向是外部码表指向 FIBO，不是继承。** 银行条目是 `owl:NamedIndividual`，FIBO 类只作为限制里的 `someValuesFrom` 出现。FIBO 类被移除或改名时，受影响的是这条映射语句，而不是银行的类层级。

这与 ACTUS 的方向性一致：ACTUS 模块不被 LOAN 导入，核心 FIBO 模块不导入 ACTUS，依赖方向是外部分类法指向FIBO，核心不受影响。

### 第三段：顺位编码与有损映射

FIBO 的 `LenderLienPosition` 是一个 `Classifier`，其下只有两个具名个体：

```xml
<owl:NamedIndividual rdf:about=".../Loans/PrimaryLienPosition">
  <rdf:type rdf:resource=".../Loans/LenderLienPosition"/>
  <skos:definition>first position in the order of seniority in which the law
    recognizes lenders' claims against a property</skos:definition>
</owl:NamedIndividual>
```

只有第一顺位与次级顺位两个值。银行实务的第三、第四顺位，以及跨债权人顺位瀑布，FIBO 没有。

**银行自建顺位分类，不继承 FIBO 的 Classifier。** 因为需要序数，而 FIBO 的 Classifier 是无序的。

```xml
<owl:Class rdf:about="https://bank.example/ontology/preservation/LienPriorityClass">
  <skos:definition>Ordinal seniority of a bank's secured claim against a specific
    asset, as recognised under the governing jurisdiction.</skos:definition>
</owl:Class>

<owl:NamedIndividual rdf:about="https://bank.example/ontology/preservation/priority/1">
  <rdf:type rdf:resource="https://bank.example/ontology/preservation/LienPriorityClass"/>
  <skos:notation>1</skos:notation>
</owl:NamedIndividual>

<owl:NamedIndividual rdf:about="https://bank.example/ontology/preservation/priority/2">
  <rdf:type rdf:resource="https://bank.example/ontology/preservation/LienPriorityClass"/>
  <skos:notation>2</skos:notation>
</owl:NamedIndividual>
```

**映射是有损的，必须声明为有损。** 银行的第 3、4顺位映射到 FIBO 的 `SubordinateLienPosition`，全部塌缩成一个值。这条映射必须显式标注损失：

```xml
<owl:AnnotationProperty rdf:about="https://bank.example/ontology/preservation/mappingLoss"/>
<owl:AnnotationProperty rdf:about="https://bank.example/ontology/preservation/mappingBasis"/>

<owl:NamedIndividual rdf:about="https://bank.example/ontology/preservation/mapping/priority3toSubordinate">
  <rdf:type>
    <owl:Restriction>
      <owl:onProperty rdf:resource="https://www.omg.org/spec/Commons/Designators/denotes"/>
      <owl:someValuesFrom rdf:resource="https://spec.edmcouncil.org/fibo/ontology/LOAN/LoansGeneral/Loans/SubordinateLienPosition"/>
    </owl:Restriction>
  </rdf:type>
  <bank:mappingLoss>ordinal information beyond rank 2 is not representable in FIBO</bank:mappingLoss>
  <bank:mappingBasis>bank policy decided 2026-10; supersedes nothing</bank:mappingBasis>
</owl:NamedIndividual>
```

**把有损映射静默应用是这套设计最容易出的事故。** 一旦标注了 `mappingLoss`，推理与应用至少知道这里有信息损失。

### 第四段：生命周期完全自建，不碰 FIBO

FIBO 在这一段是空的。逐词核查 295 个本体，下列词零命中：

```
workout / repossess / charge-off / write-off / perfection
security interest / encumbrance / Delinquen* / Arrears*
ChargeOff* / Impair* / NonPerform* / PastDue* / DaysPastDue
Cure* / Lateness
```

`LoanEvents.rdf` 的全部内容是 8 个类、5 个对象属性、2 个数据属性、0 个具名个体。8 个类中 5 个没有 `skos:definition`。

与不良处置相关的全部可用位：

```xml
<owl:Ontology rdf:about="https://bank.example/ontology/preservation/Lifecycle/">
  <!-- 完全自建，不继承任何 FIBO 类 -->

  <owl:Class rdf:about="https://bank.example/ontology/preservation/DelinquentStage">
    <skos:definition>Bank-defined arrears stage, independent of any FIBO concept.</skos:definition>
  </owl:Class>

  <owl:NamedIndividual rdf:about=".../stage/M1">
    <rdf:type rdf:resource=".../DelinquentStage"/>
    <skos:notation>M1</skos:notation>
  </owl:NamedIndividual>

  <!-- FIBO 的 inDefault 只是一个 xsd:boolean 标记，无分级、无日期 -->
  <!-- 因此映射只能到布尔层，阶段信息全部留在银行侧 -->
  <owl:NamedIndividual rdf:about=".../mapping/stageToInDefault">
    <rdf:type>
      <owl:Restriction>
        <owl:onProperty rdf:resource="https://www.omg.org/spec/Commons/Designators/denotes"/>
        <owl:someValuesFrom rdf:resource="https://spec.edmcouncil.org/fibo/ontology/LOAN/LoansGeneral/LoanEvents/inDefault"/>
      </owl:Restriction>
    </rdf:type>
    <bank:mappingLoss>FIBO inDefault is xsd:boolean; bank stages M1-M4 collapse to true/false</bank:mappingLoss>
  </owl:NamedIndividual>
</owl:Ontology>
```

FIBO 侧与不良处置相关的全部可用位只有这些：`LoanPhase`（`LifecycleStage` 的子类，只有 `LoanPaidInFull` 与 `RepaymentPhase` 两个子类）、`inDefault`（布尔）、`isDeferred`（布尔）、`LoanDefaultProceeding`（定义为空的桩）、`LegalProceeding` 与 `CourtJudgment`（骨架）。

**顺带说清 FIBO 的 default 不可复用。** `CreditEvents.rdf` 里的 `DefaultEvent` 是 CDS 触发事件——证据是结构性的，不是编辑性的：`DefaultEvent` 同时是 `ObligationSpecificCreditEvent` 的子类，而后者既是 `CreditEvent` 的子类，又是 `fibo-der-cds:TriggeringEvent` 的子类（声明在 `DER/CreditDerivatives/CreditDefaultSwaps.rdf`）。`TriggeringEvent` 是 CDS 保护触发概念。复用它会把 CDS 机制拖进资产保全模型。

同模块的 `hasGracePeriod` 也是 CDS 语义，且**没有 `rdfs:domain`**。LOAN 域下不存在宽限期概念。

## 模块必备的 14 项元数据

若银行模块要与 FIBO 交互，建议直接满足 FIBO 自己的发布标准。`ONTOLOGY_GUIDE.md` 要求每个本体（**不论成熟度等级**）都包含：

1. 所用每个命名空间的 DOCTYPE Entity 声明
2. 所直接引入的每个命名空间的 RDF 命名空间声明
3. 本体 IRI
4. label（英文，拼写完整的本体名）
5. abstract
6. license（FIBO 全部为 MIT）
7. 内容语言声明（OWL）
8. copyright 声明
9. 依赖关系：引用到的其他域/模块链接
10. RDF/XML 文件的缩写与文件名
11. 全部相关 `imports` 语句
12. version IRI
13. 变更记录，对应引入改动的版本链接
14. 本体自身的成熟度等级

另有一条硬性要求，容易被忽略：**DOCTYPE ENTITY 声明是强制的**，且不得设默认 IRI。原文称之为"publication perspective 的 stopper"。

**关于前缀的一个坑**：FIBO 的模块缩写**不能从路径机械推导**。例如 `isLienOn` 所在的前缀是 `fibo-loan-reln-org`，展开为 `LOAN/RealEstateLoans/MortgageOrigination/`——其中 `reln` 这一段在路径里根本不存在。银行若要自动生成前缀，会生成错误结果。

## 许可边界要写清

从 OWL 派生专有模型，按 MIT 文本是允许的。MIT 明确授予"use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies"，无copyleft，无领域限制，唯一义务是保留版权与许可声明。

三点必须写进银行的技术决策文档：

**其一，GPL-3.0 附加在 FIB-DM core 上，不附加在 FIBO 上。** FIB-DM 是 Jayzed Data Models 用专利 CODT 流程从 FIBO 机械转换出的 PowerDesigner 概念数据模型，是**下游衍生作品**。银行从 OWL 派生完全不触碰 GPL-3.0。若改用 FIB-DM core，copyleft 问题才是实质性的。

**其二，"FIBO" 是注册商标，MIT 不授予商标权。** 银行可以在自有模型中引用 FIBO 类，但不能把 "FIBO" 用进自己的产品名或品牌。

**其三，存在一个未解冲突。** Jayzed 的 IPLA 对 MIT 范围做了一个超出 MIT 文本的解释性主张（主张 Licensee 对 FIB-DM 衍生作品的处理应与 FIBO 衍生作品一致）。Jayzed 是 FIBO 版权的第三方，无权单方面限缩 EDMC 授出的权利。**该问题应由银行法务向 EDMC 索取书面认定，不要依赖任何二手描述——包括本文。**

## 一个必须记录的核查方法坑

FIBO 的本体文件是 RDF/XML，扩展名是 `.rdf`，**不是 `.owl`**。

用 `--include='*.owl'` 做全库搜索会返回零命中，包括 `guarantor` 这种必然存在的词。若照此报告"该类不存在"，会得出完全虚假的覆盖度结论。

同理，命名空间碰撞会产生假阳性：全库有 100 个文件命中 `collections`，核查后确认**全部**来自 OMG Commons 的 SKOS `Collection` 与 `Collections` 词汇，与催收无关。

**搜索命中不等于概念存在。** 这两条是本次核查中实际踩到的，不是理论提醒。

## 本文结论的边界

**已核实的事实。** 全部 FIBO 类 IRI、命名空间前缀、继承链、定义文本来自 `edmcouncil/fibo` 提交 `9a7b90ccc64ef9df0762121ff058c9d27fd46037`（2026-10-01），295 个 `.rdf` 文件、16,674 条声明、7,048 个不同局部名，逐词核查并核对 `rdfs:label` 与 `skos:definition` 实际内容。IRI 漂移数据来自季度标签间的类 IRI 差分。

**本文的判断。** 四段结构、有损映射声明方式、以及"不继承"的建议，是分析结论，不是 FIBO 的官方指引。

**待确认项。** `hasParameterMapping` 的声明类型在不同来源间有出入——经核实为 `owl:DatatypeProperty`，非 `owl:AnnotationProperty`；本文按前者书写。另有 `cmns-txt` 命名空间的完整 IRI 未在 FIBO 前缀表中出现，需查 OMG Commons 补齐；ACTUS 示例中使用的 `fibo-fnd-dt-bd`、`fibo-fnd-acc-csf` 两个前缀也不在前缀表中，若要复用 ACTUS 映射模块需先核实。

**未验证项。** 本文未在任何银行生产环境验证。OWL 片段为最小可落地示例，未做推理机一致性验证——FIBO 的 `ONTOLOGY_GUIDE.md` 要求提交内容通过 OWL 2 DL 一致性检查与约 21 项自动化卫生测试，但**该要求的具体条款未在报告中找到明文**，银行应按OWL 2 DL 规范自行校验。

**未做的事。** 没有推荐替代基础。若需要评估 CDM（FINOS，Apache 2.0）或确认 SBVR、Commons 的退役状态，那是独立的技术选型问题，本文不涉及。

*作者毕超，金融行业风险管理从业者。本文仅代表作者个人观点，不构成任何机构立场。*

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "别继承 FIBO 的类：银行资产保全扩展层的可落地设计",
  "datePublished": "2026-10-02",
  "description": "上一版文章建议『以 FIBO 类为父类添加银行口径子类』。本文用源码证据推翻该建议并给出替代设计。核心依据：FIBO 类 IRI 在 2025Q3→2025Q4 一个季度内移除 145 个（含CollateralAgreement 本身），旧 IRI 保留为带 owl:equivalentClass 跳转的 deprecated 桩——继承它不会报错，而是静默绑死在已废弃的分类轴上；且 FIBO 对 Release 级类无任何向后兼容承诺，类 IRI 不带版本号。本文给出三段式可落地设计：押品分类用 SKOS 分面 Concept Scheme（因FIBO 的 Collateral 只有物理/非物理二叉，单继承无法表达银行需要的法律性质、登记状态、估值方式、处置难度四个维度）；映射沿用 FIBO 自己的 ACTUS 范式（owl:imports + owl:NamedIndividual + cmns-dsg:denotes someValuesFrom 限制，全文不使用 rdfs:subClassOf）；顺位编码由银行自有，并显式声明映射有损。文中给出全部可落地 OWL 片段与经核实的 FIBO 精确 IRI，并标注三个必须避开的语义陷阱：CollateralAgreement 在两个命名空间下重复定义且其中一个已被移除、ContractThirdParty 的定义明确排除缔约方、AppraisedValue 是金额而非评估活动因而不含日期语义。",
  "keywords": [
    "FIBO",
    "本体建模",
    "知识图谱",
    "SKOS",
    "资产保全",
    "押品管理",
    "不良处置",
    "数据标准",
    "语义web",
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

Q: 为什么不直接继承 FIBO 的类？那样不是更省事？
A: **因为 FIBO 的类 IRI 会漂移，而且漂移是静默的。** 2025Q3 到 Q4 一个季度移除 145 个类 IRI，包括 `CollateralAgreement`、`LegalEntity`、`JointStockCompany` 等基础类。旧 IRI 保留为带 `owl:equivalentClass` 跳转的 deprecated 桩，全库 89 处，HTTP 仍返回 200。**`owl:equivalentClass` 让新旧 IRI 逻辑上同一类，所以继承一个 deprecated IRI 不会报错——推理机正常解析，然后把你的类绑死在一条被维护者标记为"不应复用"的轴上。** 加上类 IRI 不带版本号、`owl:versionInfo` 为空、仓库无 CHANGELOG 无向后兼容承诺，你无法把模型钉在任何一个版本上。平行码表加显式映射把这些影响限制在映射表内部。
Q: FIBO 自己接 ACTUS 的时候用了什么机制？能照抄吗？
A: **能，而且这正是本设计的模板。** FIBO 把 ACTUS 顶层域与FIBO 并列，建 `ACTUS/ACTUSContractTermMapping.rdf` 专门映射模块，`owl:imports` 双向依赖，然后把 48 个 ACTUS 数据字典条目声明为 `owl:NamedIndividual`，用 `cmns-dsg:denotes someValuesFrom <FIBO 概念>` 的匿名限制做桥接。**全部不使用 `rdfs:subClassOf`，也不使用任何 SKOS 匹配属性**——`skos:exactMatch`、`skos:closeMatch`、`skos:broadMatch` 等在 ACTUS 模块中零命中。方向也很关键：ACTUS 模块不被 LOAN 导入，核心 FIBO 模块不导入 ACTUS，依赖是外部指向内部，核心不受影响。
Q: 押品分类为什么不用 OWL 类树而用 SKOS？
A: **因为 FIBO 的类树表达不了银行需要的维度。** FIBO 的 `Collateral` 只有 `PhysicalCollateral` 与 `NonPhysicalCollateral` 两个互斥子类，这就是全部押品类型体系。而银行需要按法律性质、登记状态、估值方式、处置难度四个维度同时分类，一个押品在四个维度上各有一个值。**单继承树无论怎么挂都只能选一个主轴**，要加维度就得造组合类，很快退化成不可维护的深树。SKOS Concept Scheme 正是为多维码表设计的。注意这不是"SKOS 用错地方"：FIBO 不用 SKOS 是因为它要类层级断言；银行要多维码表，用 SKOS 才对。
Q: `ContractThirdParty` 和 `ContractParty` 有什么区别？该用哪个？
A: **用 `ContractParty`。** `ContractThirdParty` 的定义原文是 "party that is indirectly involved in, **but not a counterparty to**, an agreement"——明确排除缔约方。拿它承载银行对手方是定义级矛盾。`ContractParty` 的定义是 "legally competent party that has entered into a binding agreement, accepting and conceding obligations, responsibilities, and benefits as specified"，语义正确。`ContractPrincipal` 也不要随便用——它编码"发起方/第一方"，只在合同明确指定第一方时才成立，用作通用对手方槽位会破坏对称性。这三个类在 `Contracts.rdf` 里紧邻（357–363 行与 366–370 行），极易误选。另外 `PartyToContract` 这个类在 FIBO 中不存在。
Q: 从 FIBO 派生专有模型，MIT 许可够用吗？
A: **从 OWL 派生够用，但有三处必须写进决策文档。** MIT 明确授予 use、copy、modify、merge、publish、distribute、sublicense、sell，无 copyleft、无领域限制，唯一义务是保留版权与许可声明。**但要注意**：GPL-3.0 附加在 FIB-DM core 上，不附加在 FIBO 上——FIB-DM 是 Jayzed 用专利 CODT 流程转换出的下游衍生作品，从 OWL 派生不触碰 GPL-3.0，改用 FIB-DM core 才有copyleft 问题。第二，"FIBO" 是注册商标，MIT 不授予商标权，不能用进自己的产品名。第三，Jayzed 的 IPLA 对 MIT 范围做了超出 MIT 文本的解释性主张，而 Jayzed 是第三方，无权单方面限缩 EDMC 授出的权利——**这一个问题应由法务向 EDMC 索取书面认定，不要依赖二手描述。**
Q: 顺位编码怎么和 FIBO 的两个值对齐？
A: **不要把银行的顺位继承 FIBO 的 `LenderLienPosition`。** 那个类是个 `Classifier`，无序，且只有两个具名个体 `PrimaryLienPosition` 与 `SubordinateLienPosition`，没有第三、第四顺位，也没有跨债权人顺位瀑布。银行需要序数，所以自建 `LienPriorityClass`（或用 SKOS `skos:notation` 表达序数），**不继承**。映射是有损的：第 3、4 顺位全部塌缩到 `SubordinateLienPosition`。**这条映射必须显式标注损失**，例如加 `mappingLoss` 注记说明"序数信息在 FIBO 中不可表达"，并记录映射依据与日期。静默应用有损映射是这套设计最容易出的事故——推理与应用至少要知道这里丢过信息。
Q: 有没有更稳的替代基础？FIBO 会不会消失？
A: **FIBO 不会消失，但会持续漂移，所以不要绑定它。** OMG 的退役流程只撤销 OMG 的标准地位，不动代码本身——退役流程的最后一步是"从 OMG 已采纳技术清单中移除"。EDMA 自己给出的替代指引是"改用持续更新的 GitHub 版 FIBO"。所以风险不是消失，是**无版本保证的持续变动**。需要评估替代基础（如 FINOS 的 CDM，Apache 2.0，有 `Loan extends InstrumentBase` 与证券融资押品覆盖，其发布说明含显式的向后不兼容变更章节）是独立的选型问题，本文不展开。有一点须注意：**FIBO 的四个 OMG 规格已进入退役流程，而退役方与季度发布方在 2025-10-01 后是同一法人实体**——所以"改用另一个 OMG 标准"不构成对冲。
