# 银行资产保全本体骨架（可导入模板）

四段式设计的可运行实现。设计依据与证据见站内文章《别继承 FIBO 的类：银行资产保全扩展层的可落地设计》。

## 文件清单

| 文件 | 内容 | 是否导入 FIBO |
|---|---|---|
| `AnnotationVocabulary.rdf` | 共用注记词：`hasMaturityLevel`、`mappingLoss`、`mappingBasis` | 否 |
| `CollateralScheme.rdf` | 押品分面码表，四个正交分面，10 个押品条目 | 否 |
| `Lifecycle.rdf` | 行内生命周期：案件、逾期阶段、保全措施、顺位、估值记录、当事方角色 | 否 |
| `Mapping.rdf` | 33 条到 FIBO 的显式有损映射 | **是** |

三份行内文件**不导入任何 FIBO 本体**，因此不会有第三方类 IRI 使其失效。只有 `Mapping.rdf` 承担 FIBO 耦合。

## 导入前必做：替换命名空间

所有 IRI 使用占位域名 `bank.example`。替换成贵行真实域名：

```bash
cd ontology/preservation
sed -i '' 's|https://bank\.example/|https://ontology.yourbank.com/|g' *.rdf
```

替换后请核对两处：`owl:versionIRI` 里的日期段（`/20261002/`）应更新为实际发布日；`pres-av:mappingBasis` 里的决策日期同步更新。

## 已验证项

用 `xmllint` 与 `rdflib 7` 对四个文件做过实际解析，不是目测：

```
AnnotationVocabulary.rdf   三元组= 21
CollateralScheme.rdf       三元组=188  SKOS 概念=29
Lifecycle.rdf              三元组=207  类=7  个体=28  数据属性=6  对象属性=6
Mapping.rdf                三元组=241  映射目标=33
合计 657 三元组
```

- 四个文件均为 XML 良构，且能被 RDF 解析器实际加载
- `Lifecycle.rdf` 与 `Mapping.rdf` 无 punning（同名不同时充当类与属性）
- **指向 FIBO 的 `rdfs:subClassOf` 数量为 0**，这是本设计的关键约束
- 33 条映射目标中，25 条声明 `mappingLoss`，8 条在 `mappingBasis` 中明示无损，**缺注记者 0**
- 映射到的 FIBO 概念去重后 12 个，全部逐条核对过 `edmcouncil/fibo @ 9a7b90c`

### 未验证项

**OWL 2 DL 一致性未做推理机验证。** FIBO 的 `ONTOLOGY_GUIDE.md` 要求提交内容通过 OWL 2 DL 一致性检查与约 21 项自动化卫生测试，但该条款的具体明文未能在其文档中找到。导入前请自行跑 HermiT 或 ELK：

```bash
java -jar hermit.jar -i ontology/preservation/*.rdf
```

## FIBO 源版本与升级流程

映射基于 `edmcouncil/fibo @ 9a7b90ccc64ef9df0762121ff058c9d27fd46037`（2026-10-01）。

FIBO 每季度发布，类 IRI 会漂移——2025Q3 到 Q4 一个季度移除 145 个类 IRI，旧 IRI 保留为带 `owl:equivalentClass` 跳转的 deprecated 桩。所以每次升级都要重跑：

```bash
git clone https://github.com/edmcouncil/fibo && cd fibo
for iri in $(grep -o 'https://spec.edmcouncil.org/fibo/ontology/[A-Za-z0-9/]*' \
             ../ontology/preservation/Mapping.rdf | sort -u); do
  path="${iri#https://spec.edmcouncil.org/fibo/ontology/}"
  grep -rq "rdf:about=\"&[^\"]*;$(basename "$path")\"" . \
    && echo "OK   $iri" || echo "DRIFT $iri"
done
```

任何一条报 `DRIFT`，都不是改映射的问题，而是要重新评估该条映射是否还成立。

## 明确不映射的 FIBO 概念

以下 FIBO 概念**故意没有映射**，理由写在各自位置：

- `fibo-fbc-dae-cre:DefaultEvent` —— 是 CDS 信用事件触发器，不是银行信贷违约。证据是结构性的：它同时是 `fibo-der-cds:TriggeringEvent` 的子类，复用会把 CDS 机制拖进保全模型。
- `fibo-loan-ln-ev:LoanDefaultProceeding` —— `skos:definition` 字面写着 `[no definition]`，是未审校的会议记录。
- `fibo-fbc-dae-dbt:CollateralAgreement` —— 在两个命名空间下各有一个定义（`FND/Agreements/Contracts/` 与 `FBC/DebtAndEquities/Debt/`），且后者所在前缀在 2025Q4 迁移中被移除。属 FIBO 自身建模分歧，不应以继承方式引用。
- `fibo-fnd-agr-ctr:ContractThirdParty` —— 定义明确排除缔约方（"not a counterparty to"）。行内角色统一映射到 `ContractParty`。
- `fibo-fnd-arr-asmt:AppraisedValue` —— 是 `MonetaryAmount` 子类，是"值"不是"评估活动"，且本身不含日期。日期语义只在 `CollateralValueAsOfDate` 的额外限制上。

## 许可

本目录文件由贵行自行拥有。文件中引用的 FIBO 类 IRI 来自 `edmcouncil/fibo`，其源码为 MIT 许可（`Copyright (c) 2020 Enterprise Data Management Council`）。

- MIT 允许使用、复制、修改、合并、发布、分发、再许可、销售，无 copyleft，无领域限制。唯一义务是保留版权与许可声明。
- **本目录不链接 FIB-DM。** GPL-3.0 附加在 FIB-DM core 上，不附加在 FIBO 上；FIB-DM 是第三方用专利流程转换出的下游衍生作品，与 OWL 是不同的东西。
- **"FIBO" 是 EDM Council 的注册商标**，MIT 不授予商标权。导入本模板不改变这一点，行内产品名不要使用 FIBO。
- FIB-DM 的 IPLA 对 MIT 范围做了超出 MIT 文本的解释性主张，而 Jayzed 是 FIBO 版权第三方，无权单方面限缩 EDMC 授出的权利。**该问题应由法务向 EDMA 索取书面认定。**

## 与 FIBO 14 项元数据要求的对照

`ONTOLOGY_GUIDE.md` 要求每个本体具备 14 项。本目录的落实情况：

| FIBO 要求 | 本目录做法 |
|---|---|
| DOCTYPE Entity 声明 | 全部文件强制，已通过 xmllint 校验 |
| 直接引入的命名空间 RDF 声明 | 逐文件精确声明，未使用的已移除（符合"不得多声明"） |
| 本体 IRI | `bank.example/ontology/preservation/{模块}/` |
| label | 全部提供 |
| abstract | 全部提供，中英双语 |
| license | 全部提供，标注为模板无担保 |
| 内容语言声明 | 以 RDF 语法本身承载 |
| copyright | 全部提供 |
| 依赖关系 | `owl:imports` 显式列出 |
| 文件缩写与文件名 | 文件名与本体 IRI 末段一致 |
| 全部 imports 语句 | 全部显式，无默认 IRI |
| version IRI | 四个文件均提供，含日期段 |
| 变更记录 | `owl:versionInfo` + Git 历史 |
| 成熟度等级 | `pres-av:hasMaturityLevel`，当前全部 `Provisional` |

**注意 FIBO 的前缀不可从路径推导。** 例如它的 `isLienOn` 前缀是 `fibo-loan-reln-org`，展开为 `LOAN/RealEstateLoans/MortgageOrigination/`，其中 `reln` 段在路径里根本不存在。行内若要自动生成前缀会生成错误结果，因此本目录前缀是人工固定的。

## 成熟度与上线门槛

四个文件全部标 `Provisional`。含义是草稿，承重结构仍可能变。

按 `AnnotationVocabulary.rdf` 里的定义，升级到 `Release` 的门槛是：有回归测试覆盖、有自动化报表依赖、变更走版本化流程。**在升到 Release 之前，不要在自动报表上直接依赖这些文件。**