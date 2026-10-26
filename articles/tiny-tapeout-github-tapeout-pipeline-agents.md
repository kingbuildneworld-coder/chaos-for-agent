---
title: "把流片做成一次 git push：Tiny Tapeout 的 GitHub 流水线深度解读，以及它对智能体工程化的启示"
date: "2026-10-26"
description: "Tiny Tapeout 是 Matt Venn 发起的开源拼车流片平台，它在 GitHub 组织 TinyTapeout 下维护 420 个仓库：设计者用模板仓库提交 Verilog 或 Wokwi 设计，GitHub Actions 调用 LibreLane 自动生成 GDS 版图、跑测试和文档，再由平台把数百个小设计拼进同一颗芯片。截至 2026 年 9 月，它已制造 4000 个项目、完成 24 颗芯片，社区 Discord 5000 人，预计 2026 年 10 个班次约 3000 个项目、2027 年 17 个班次约 4000 个项目；2025 年 Efabless 倒闭后，它转向 IHP、GF180（wafer.space）和 SkyWater 等多条产线。本文拆解其仓库结构、提交流水线、多工厂策略与风险，并讨论“模板 + CI 闸门 + 拼车共享”对 AI 智能体写硬件、以及企业智能体工程化的启示。"
tags: ["Tiny Tapeout", "开源芯片", "流片", "GitHub Actions", "LibreLane", "IHP", "GF180", "智能体", "工程化"]
schema_type: "Article"
references:
  - title: "Tiny Tapeout GitHub 组织"
    url: "https://github.com/TinyTapeout"
    source: "GitHub"
  - title: "Tiny Tapeout 官网"
    url: "https://tinytapeout.com/"
    source: "tinytapeout.com"
  - title: "Tiny Tapeout FAQ"
    url: "https://tinytapeout.com/faq/"
    source: "tinytapeout.com"
  - title: "ttihp-verilog-template 提交模板"
    url: "https://github.com/TinyTapeout/ttihp-verilog-template"
    source: "GitHub"
  - title: "Updating the community at ORConf, Ghent, Belgium"
    url: "https://tinytapeout.com/news/orconf-2026/"
    source: "Tiny Tapeout，2026-09-18"
  - title: "TTIHP26b shuttle closed with 123 designs"
    url: "https://tinytapeout.com/news/ttihp26b-closes"
    source: "Tiny Tapeout，2026-09-21"
  - title: "Our 21st chip, TTGF26b, closes"
    url: "https://tinytapeout.com/news/ttgf26b-closes/"
    source: "Tiny Tapeout，2026-06-23"
  - title: "Efabless shuts down - Tiny Tapeout will continue"
    url: "https://www.tinytapeout.com/news/efabless-shutsdown"
    source: "Tiny Tapeout，2025-03-01"
  - title: "wafer.space GF180 — first functional tapeout confirmed"
    url: "https://tinytapeout.com/news/wafer-space-gf180"
    source: "Tiny Tapeout，2026-04-30"
  - title: "GF180MCU Run 3 is Here!"
    url: "https://wafer.space/news/run3-announcement"
    source: "wafer.space，2026-08-01"
---

**Tiny Tapeout 把“做一颗真芯片”压缩成了一套 GitHub 操作：复制模板仓库、写 Verilog 或在浏览器里画电路、推送代码，GitHub Actions 自动生成可制造的版图，然后在网页上提交到下一个流片班次（来源1、3、4）。**

**它的核心经济模型是“拼车”：把几百个只有约 1000 个逻辑门大小的小设计拼进同一颗芯片，分摊掩膜和晶圆成本；每个参与者拿到一块装有这颗芯片的开发板，用复用器激活自己的那一块（来源2、3）。**

**规模已经不小：截至 2026 年 9 月，制造了 4000 个项目、完成 24 颗芯片，Discord 社区 5000 人；预计 2026 年 10 个班次约 3000 个项目，2027 年 17 个班次约 4000 个项目（来源5）。**

**它也经历过生死考验：2025 年 3 月主要制造伙伴 Efabless 停业，Tiny Tapeout 转向 IHP 130nm、wafer.space 的 GF180 和重新开放的 SkyWater 130nm，现在同时运营三条产线（来源8、9、2）。**

**对智能体工程化的启示（本文分析）：模板仓库定义边界、CI 自动判定“能不能交”、拼车分摊昂贵的最后一步——这套结构正适合让 AI 智能体去写硬件，也值得企业在部署智能体时照搬。**

---

> 素材说明：本文依据 Tiny Tapeout 官方 GitHub 组织页、官网、FAQ、提交模板和官方新闻（来源1–9），以及 wafer.space 官方公告（来源10）。价格以官方计算器为准，本文不引用具体报价。凡来源事实标注编号；推论标注“本文分析”。

## 一、Tiny Tapeout 是什么

| 维度 | 内容 | 来源 |
|---|---|---|
| 定位 | 教育项目，让数字和模拟设计以更低成本、更容易地做成真芯片 | 来源4 |
| 起点 | 约 4 年前，首批 152 个项目提交到 Google MPW7 抽签班次，每块 100×100 微米 | 来源7 |
| GitHub 组织 | 420 个仓库，675 名关注者，主要语言 Verilog、Python、Tcl | 来源1 |
| 当前开放班次 | SKY26d（SkyWater）、GF26c（GF180） | 来源2 |
| 最近关闭班次 | TTIHP26b：123 个设计，IHP 0.13 微米，芯片预计 2027-06-25 到货、2027-08-16 发货 | 来源6 |
| 荣誉 | 创始人 Matt Venn 获 2026 年欧洲开源奖 | 来源2、5 |
| 赞助方 | SwissChips、Tillitis、Texplained、ChipFoundry、wafer.space、IHP | 来源5 |

## 二、GitHub 组织里有什么：四类仓库

420 个仓库看起来很多，但按用途可以分成四类（来源1，分类为本文整理）：

1. **提交模板**：按工艺和设计方式分开，如 `ttihp-verilog-template`、`ttihp-wokwi-template`、`ttsky-verilog-template`、`ttsky-analog-template`、`ttgf-verilog-template`，还有社区贡献的 Chisel 模板。其中 IHP Verilog 模板被复刻 219 次（来源1、2、3、4）。
2. **班次仓库**：每个班次一个仓库，如 `tinytapeout-sky-26d`、`tinytapeout-gf-26c`、`tinytapeout-gf-26d`，以及汇集历届精选设计的 `tinytapeout-boat-26`，采用 Apache-2.0 许可（来源1、5）。
3. **芯片基础设施**：`tt-multiplexer`（把几百个设计接到同一组引脚上的复用器）、`breakout-pcb`、`tt-demo-pcb`、`tt-micropython-firmware`（开发板上 RP2040 的固件）、IHP 开源 PDK 的复刻（来源1）。
4. **教学与工具**：`siliwiz`（在浏览器里画晶体管、学半导体原理，220 星）、`vga-playground`（VGA 项目练习场）、官网 `tinytapeout_www`、`tt-shuttle-stats`（来源1）。

## 三、从代码到芯片：一条完整的流水线

### 3.1 设计者这一侧

按 IHP Verilog 模板的说明，设计者要做的只有四步（来源4）：

- 把 Verilog 文件放进 `src` 目录；
- 编辑 `info.yaml`，重点填 `source_files` 和 `top_module`；
- 在 `docs/info.md` 写说明；
- 改写 `test` 目录下的测试平台。

之后 GitHub Actions 会自动用 LibreLane 生成 ASIC 文件。模板里有四个工作流徽章：gds、docs、test、fpga（来源4）。

### 3.2 CI 就是验收标准

- 小设计的 GDS 工作流通常约 5 分钟完成；**GDS 工作流失败的项目不能提交到班次**（来源3）。
- 如果运行到 20–25 分钟以上，或者在布局、布线阶段失败，通常是面积不够；可以在 `info.yaml` 里把 `tiles` 改成 `"1x2"` 先试，不用先付费（来源3）。
- 文档工作流要求必须填写 author、title、description、how_it_works、how_to_test、language 六个字段（来源3）。
- 为某一工艺“硬化”的设计不能提交到另一工艺的班次，例如为 sky130A 生成的版图提交到 IHP 班次会被拒绝（来源3）。

### 3.3 平台这一侧

- 设计者在 app.tinytapeout.com 创建提交；截止日前可以随时更新，但每次都要重新提交（来源3）。
- 价格取决于面积、班次和数字或模拟；个人早鸟价每个班次限量（来源2）。
- 制造需要 6–9 个月，加上组装、测试和发货，**最长约 1 年**（来源3）。
- 每人只拿到 1 颗芯片，装在开发套件上；套件由演示板和载有芯片的转接板组成，可通过 Tiny Tapeout Commander 交互（来源3）。

### 3.4 一块“tile”能放什么

| 规格 | 内容 | 来源 |
|---|---|---|
| 面积（TT04–TT10） | 约 160×100 微米，约 1000 个逻辑门；可购买更多 tile | 来源3 |
| 引脚 | 时钟、复位、8 输入、8 输出、8 双向 | 来源3 |
| 时钟 | 至少 50MHz | 来源3 |
| 模拟 | 模拟项目为 1×2 或 2×2 tile，每班次数量有限 | 来源3 |

能力上限不止于此：RISC-V 外设众包竞赛收到 44 份作品，最大的设计达到 60,000 个标准单元；TTIHP26b 中有人在一块 tile 上做出了完整的 FPGA（来源5、6）。

## 四、从单一依赖到三条产线

| 时间 | 事件 | 来源 |
|---|---|---|
| 2025-03-01 | Efabless 停业；TT10 和后续 SkyWater 班次暂停，宣布转向已有合作的 IHP 130nm，并寻找 GF180 路径 | 来源8 |
| 2026-04-30 | 与 wafer.space 合作的首个 GF180 流片确认功能正常 | 来源9 |
| 2026-06-23 | 第 21 颗芯片 TTGF26b 关闭；TTGF26a 提前两周售罄 | 来源7 |
| 2026-09-21 | TTIHP26b 关闭，123 个设计 | 来源6 |
| 2026-10 | SKY26d、GF26c 开放提交 | 来源2 |

wafer.space 自身也在降低门槛：GF180MCU 第 3 轮推出 0.5×0.5 的四分之一槽位，4.9 平方毫米，1000 颗裸片最低 2000 美元（来源10）。

**本文分析**：Efabless 事件是这个项目最重要的一课——平台价值在于流水线和社区，而不是某一家代工厂。它能活下来，是因为模板、CI 和提交系统都是自己的，换工艺只是换一套模板和 PDK。

## 五、风险与局限（本文分析，部分有来源）

- **周期长**：最长约 1 年才能拿到芯片，不适合快速迭代（来源3）。
- **面积小**：默认 tile 约 1000 个门，复杂设计需要多付面积费用（来源3）。
- **每人一颗**：想要更多芯片只能买更多开发套件，部分 GF180 班次是板上芯片，无法拆下（来源3）。
- **工艺老**：130nm 和 180nm 适合教学、原型和小型控制逻辑，不适合高性能计算。
- **条款**：不同工艺和班次的条款不同，提交即视为同意服务条款，参与前需逐条阅读（来源2）。

## 六、对智能体工程化的启示（本文分析）

**本节全部为本文分析。** 本站长期关注智能体落地，Tiny Tapeout 的结构恰好是一个“适合交给 AI 智能体”的工程范本。

### 6.1 模板仓库就是智能体的“边界”

智能体最怕开放式任务。Tiny Tapeout 的模板把世界压缩成固定接口：24 个引脚、一个 `top_module`、一份 `info.yaml`、一套测试目录。智能体只需在 `src` 里写 Verilog、在 `test` 里写测试，其他一律不动。企业部署智能体也一样：先给它一个“模板仓库”——固定的输入输出、固定的文件位置、固定的工具——再谈能力。

### 6.2 CI 就是判官：能不能交，由机器说了算

“GDS 工作流失败就不能提交”是一条硬规则，不靠人工判断。这正是让智能体自我迭代的关键：它可以反复修改、推送、读日志，直到四个工作流全部变绿。对银行等受监管行业，可以照搬为：**任何智能体产出的方案、文书或代码，必须先通过机器可判定的检查（格式、规则、红线、测试）才能进入人工审批**，人只审“通过了闸门”的那部分。

### 6.3 先试后买：把昂贵的最后一步放在最后

改 `tiles` 参数就能先看能不能布线，不用先付费；真正花钱的只有流片本身。智能体工作流也应如此：把模拟、仿真、测试这些便宜的步骤让智能体无限次跑，把付款、签署、对外发送这些不可逆动作放在最后一步，并且必须人工确认。

### 6.4 拼车模式：共享最昂贵的基础设施

几百人分摊一套掩膜，个人才付得起流片。企业内部同样有“掩膜级”的昂贵资源：私有化大模型算力、评测集、合规审查能力。由中心团队建“班次”，各业务条线按需“上车”，比每个部门各自建一套更经济。

### 6.5 不要绑死单一供应商

Efabless 倒闭后 Tiny Tapeout 能继续，是因为它把代工厂当作可替换的后端。企业智能体同理：模型、推理框架、向量库都应可替换，评测和流程才是自己的资产。

### 6.6 智能体写硬件的现实门槛

AI 写 Verilog 已不罕见，但芯片的特殊之处在于：**错误要等一年才暴露，而且不可修改**。因此“测试平台写得多严”比“代码写得多快”更重要。模板要求的 test 工作流、FPGA 工作流，以及社区的 Tiny Tapeout Explorer（能在浏览器中提取网表并仿真）是智能体参与硬件设计的最低保障（来源4、5）。

## 七、结语

**本文分析**：Tiny Tapeout 真正开源的不只是芯片设计，而是一整套“把高风险、高成本、长周期的事情工程化”的方法：用模板收窄问题，用 CI 做判官，用拼车摊成本，用多产线去风险。这套方法放在 AI 智能体时代更有价值——它恰好就是让智能体可靠工作的环境。

## 常见问题

Q: Tiny Tapeout 是什么？

A: Tiny Tapeout 是一个开源拼车流片平台，把数百个小型数字或模拟设计拼进同一颗芯片制造，设计者通过 GitHub 模板仓库提交设计，GitHub Actions 自动生成版图（来源2、3、4）。

Q: 提交一个 Tiny Tapeout 设计需要哪些步骤？

A: 复制对应工艺的模板仓库，把 Verilog 放进 src、填写 info.yaml 和 docs/info.md、改写测试平台；GitHub Actions 用 LibreLane 生成 GDS，工作流通过后在 app.tinytapeout.com 提交到班次（来源3、4）。

Q: 多久能拿到芯片？

A: 制造约需 6 到 9 个月，加上组装、测试和发货，最长约 1 年；例如 TTIHP26b 预计 2027 年 6 月 25 日到货、8 月 16 日发货（来源3、6）。

Q: Efabless 倒闭后 Tiny Tapeout 怎么样了？

A: 2025 年 3 月 Efabless 停业后，Tiny Tapeout 作为独立公司继续运营，转向 IHP 130nm、wafer.space 的 GF180 和 SkyWater 130nm 等产线（来源8、9、2）。

Q: Tiny Tapeout 对企业智能体有什么启示？

A: 用模板仓库限定智能体的边界，用机器可判定的 CI 闸门决定产出能否进入人工审批，把不可逆的昂贵步骤放到最后并人工确认，共享昂贵基础设施并避免绑定单一供应商（本文分析）。

## 事实来源

1. **Tiny Tapeout GitHub 组织页**（来源1）：仓库数量、关注者、置顶仓库、近期更新仓库与语言。
2. **Tiny Tapeout 官网**（来源2）：开放班次、提交模板列表、定价方式、欧洲开源奖。
3. **FAQ**（来源3）：tile 规格、引脚、时钟、制造周期、开发套件、CI 规则与常见错误。
4. **ttihp-verilog-template**（来源4）：提交步骤、LibreLane、四个工作流。
5. **ORConf 2026 社区更新**（来源5）：项目与芯片数量、社区规模、2026–2027 年计划、BOAT 精选芯片、赞助方。
6. **TTIHP26b 关闭公告**（来源6）：123 个设计、到货与发货时间。
7. **TTGF26b 关闭公告**（来源7）：项目起源与 MPW7 历史。
8. **Efabless 停业公告**（来源8）。
9. **wafer.space GF180 首次流片公告**（来源9）。
10. **wafer.space GF180MCU 第 3 轮公告**（来源10）。

**本文推论部分（非来源表述）**：第二节仓库分类、第五节部分内容、第六节全部内容与结语。

**本文不构成投资建议、技术选型建议或合规意见。**

*（内容由AI生成，仅供参考）*
