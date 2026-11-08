---
title: "AI递归进化"
date: 2026-11-08
description: "腾讯混元团队发布Terminal-RSI论文：基于Qwen3.8-27B，通过递归自我重写（RSR）和递归策略精炼（RPR）交替进行，训练出终端Agent。两个循环后，Terminal-Bench成功率从57%提升到74%。本文从银行Agent训练角度解读这套技术逻辑。"
tags: ["腾讯混元","Terminal-RSI","RSI","终端Agent","递归自我重写","强化学习","银行Agent"]
schema_type: Article
references:
  - title: "Terminal-RSI: Recursive Self-Improving Terminal Agents via Recursive Self-Rewrite and Policy-Refine (arXiv:2610.22192, 2026-10)"
    url: "https://arxiv.org/html/2610.22192v1"
    source: "arXiv"
  - title: "Scaling Trajectories for Complex Tasks through Recursive Self-Rewrite (arXiv:2610.02826, 2026-10)"
    url: "https://arxiv.org/pdf/2610.02826.pdf"
    source: "arXiv"
  - title: "用阿里当基座，腾讯混元实现了'小RSI'（36氪/钛媒体，2026-10-19）"
    url: "https://36kr.com/p/4032278617822855"
    source: "36氪"
  - title: "What Does Terminal-RSI Reveal About AI Self-Improvement? (Cryptogram, 2026-11-08)"
    url: "https://cryptogramplatform.com/ai-tooling/what-does-terminal-rsi-reveal-about-ai-self-improvement/"
    source: "Cryptogram Platform"
---

# AI递归进化

**腾讯混元团队发布Terminal-RSI论文：基于Qwen3.8-27B，训练终端Agent实现递归自我改进。**

**核心流程：Base → RSR-1 → RPR-1 → RSR-2 → RPR-2，两个"重写+精炼"循环。**

**RSR（递归自我重写）：把成功轨迹提炼成高质量训练数据，只更新actor。**

**RPR（递归策略精炼）：PPO强化学习，actor和critic一起训练，critic从上一阶段继承。**

**效果：Terminal-Bench 2成功率从57%提升到74%，Terminal-Bench 4从1.5%提升到9.1%。**

## 一、什么是Terminal-RSI

1. **RSI是什么**：Recursive Self-Improvement（递归自我改进）——AI系统通过训练自己产生的数据来持续改进，不需要人类标注新数据。
2. **Terminal-RSI是什么**：腾讯混元团队提出的一个具体实现。它训练的是"终端Agent"——给AI一个沙盒和任务说明，它要像工程师一样在命令行里查看仓库、安装依赖、修改代码、运行测试，最后看沙盒里的状态能不能通过验证。
3. **基座模型**：用的是阿里开源的Qwen3.8-27B，不是腾讯自己的混元。最终产物叫Terminal-RSI-27B。
4. **任务池**：3000个自策终端任务，三个不同harness（环境）解决了759个任务。

## 二、两个阶段交替进行

### RSR（Recursive Self-Rewrite，递归自我重写）

1. **做什么**：先让模型在不同harness下尝试解决任务，收集成功的轨迹（trajectory）。然后把这些成功轨迹"重写"成通用沙盒下可用的高质量轨迹。
2. **三个角色**：
   - Planner：从成功轨迹中提取有用的操作步骤，写成runbook（操作手册）
   - Critic：筛选轨迹是否有"验证器泄露"或"解决方案泄露"——比如AI作弊了，直接看了答案
   - Executor：按照合格的runbook，在新沙盒里重新执行任务
3. **只更新actor**：RSR阶段只微调执行任务的策略（actor），不动critic。
4. **效果**：训练集从2001条成功轨迹扩展到11094条高质量轨迹。

### RPR（Recursive Policy-Refine，递归策略精炼）

1. **做什么**：用PPO强化学习进一步精炼策略。RSR让模型学会了"怎么做"，RPR让模型学会"怎么做得更好"。
2. **critic继承是关键**：RSR阶段后模型的actor变了，历史轨迹也变了。如果直接重置critic，会丢掉"什么情况更接近成功"的经验。所以RPR从上一阶段继承critic。
3. **TB-GAE**：Turn-Boundary Skip-Observation GAE——在交互轮次之间应用衰减，同时保留token级别的基线。
4. **第二轮降学习率**：第二个RPR阶段，actor学习率降为之前的1/5——先大步学，再小步精修。

## 三、效果数据

1. **Terminal-Bench 2**：pass@3从57.0%提升到74.2%
2. **Terminal-Bench 4**：从1.5%提升到9.1%（提升6倍）
3. **自策Terminal-Bench Hard**：从39.0%提升到63.0%
4. **Software Terminal-Bench**：从3.0%提升到6.0%
5. **Long-Horizon Terminal-Bench**：过程奖励从0.21提升到0.29

## 四、这不是"AI自己进化"

1. **人类设计了框架**：RSR和RPR的流程、harness设计、任务池构建、critic继承策略——都是人类设计的。AI在框架内改进，不是自己发明了改进方法。
2. **基座是别人的**：用的是Qwen3.8-27B，不是腾讯从零训练的。
3. **任务池是人类选的**：3000个任务是人类策展的，不是AI自己生成的。
4. **所以叫"小RSI"**：在27B模型、3000个任务的规模上实现的自我改进，不是AGI级别的无限递归。但它验证了这条路是走得通的。

## 五、对银行Agent的启示

1. **银行也需要终端Agent**：银行的运维、风控、数据分析——很多工作是在命令行里完成的。给AI一个沙盒，让它查日志、跑分析、处理告警——这就是银行版的Terminal Agent。
2. **RSR的思路可以复用**：银行专家处理问题的经验，可以提炼成runbook。比如"反洗钱告警怎么排查"——先让专家在真实系统里跑一遍，把操作步骤提炼成SFT数据，再让模型学习。
3. **RPR的思路可以复用**：模型学会了基本操作后，用RL进一步精炼——比如"处理告警时先查什么再查什么效率更高"，用奖励信号优化。
4. **交替循环**：先收集成功案例（RSR），再用RL精炼（RPR），再收集更多案例，再精炼——循环改进。银行的Agent也可以这样迭代。
5. **critic继承的思路**：不要每次训练都从零开始。上一阶段的"经验"（critic）要保留，在这个基础上继续改进。

## 六、三个冷静判断

1. **27B模型，不是大模型**：这个规模在银行内部部署是可行的——不需要几万张卡。但效果也有限——复杂任务成功率还是个位数（Terminal-Bench 4只有9.1%）。
2. **3000个任务，规模不大**：银行的场景远比这复杂。但作为一个方法验证，足够了。
3. **终端场景是窄场景**：命令行操作、代码任务——这是结构化的。银行的很多场景（客户沟通、风险判断）是非结构化的，这套方法能不能直接迁移，还不好说。

## 七、和本站其他文章的呼应

1. **和DeepMind智能经济学呼应**：DeepMind讨论"AI越强，银行组织越没变"。Terminal-RSI展示的是AI在特定技术场景下的自我改进——但银行组织怎么用这个能力，还是要靠人。
2. **和HarnessMM决策复用呼应**：HarnessMM讲Agent决策能复用，RSR讲成功轨迹能重写——本质上都是"把成功经验沉淀下来再利用"。
3. **和BILL承保案例呼应**：BILL用100+个Agent做承保，Terminal-RSI是训练Agent的方法。一个是用Agent，一个是训练Agent——银行要两头都抓，既要会用，也要会练。

## 结语

Terminal-RSI的核心逻辑其实不复杂：先让模型在不同环境下试，收集成功经验，把经验提炼成训练数据（RSR），再用强化学习把经验打磨得更精细（RPR），然后再来一轮。这套思路对银行Agent训练有直接参考价值——银行的专家经验沉淀、Agent迭代训练，都可以用这个"重写+精炼"的循环。但要清醒：这是"小RSI"，在窄场景、小模型上验证的方法，不是AI自己觉醒了。银行用的时候，要选对场景，不要一上来就想全自动化。先从运维、数据分析这些窄场景开始试，跑通了再逐步扩大范围，不要贪大求全。

（口径说明：事实来自arXiv论文、36氪/钛媒体报道、Cryptogram分析；银行场景映射为作者分析。）
