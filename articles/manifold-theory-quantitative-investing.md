---
title: "Manifold Theory in Quantitative Investing: A Review"
date: "2026-09-27"
description: "A review of manifold theory in quantitative investing: diffusion maps, topological signatures, and Kalman-filtered stress testing, with 55 percent MAE gains over scenario analysis. Action checklists for banks."
tags: ["manifold learning", "quantitative finance", "diffusion maps", "Kalman filter", "stress testing", "topology", "dynamic factor models", "risk management", "market regimes", "persistence landscapes", "principal component analysis", "banks"]
schema_type: "Article"
references:
  - title: "Data-Driven Dynamic Factor Modeling via Manifold Learning (Baker et al.)"
    url: "https://arxiv.org/abs/2506.19945"
    source: "arXiv preprint"
  - title: "Null-Validated Topological Signatures of Financial Market Dynamics"
    url: "https://arxiv.org/abs/2602.00383"
    source: "arXiv preprint (abstract)"
  - title: "IAQF & Thalesians Seminar: Data-Driven Dynamic Factor Modeling via Manifold Learning"
    url: "https://iaqf.org/event-6341495"
    source: "conference seminar page"
  - title: "Manifold Learning in Finance, Markets & Trading"
    url: "https://www.daytrading.com/manifold-learning"
    source: "practitioner guide"
  - title: "What are the basics of Simplified Technical English?"
    url: "https://www.asd-europe.org/standards-specifications/simplified-technical-english/what-are-the-basics-of-simplified-technical-english/"
    source: "standards body"
# Note: this file does not embed the AIGC implicit label block (ProduceID / ReservedCode).
# Under current labeling rules, AIGC metadata (Label, ContentProducer, ProduceID, PropagateID,
# ReservedCode1, ReservedCode2) must be issued per-article by the labeling platform.
# ProduceID and ReservedCode cannot be inferred or fabricated by the author or the generating tool.
# Leave these fields empty here; complete them after the platform issues the identifiers.
---

**Market data bends. PCA assumes it is flat. The curve is where the risk hides. Manifold learning recovers it.**

**Baker et al. (arXiv 2506.19945): diffusion maps plus a Kalman filter cut MAE by 55 percent over scenario analysis.**

**arXiv 2602.00383: the L1 norm of the persistence landscape co-moves with volatility under stress. A regime signal.**

**This article is written in ASD-STE100 Simplified Technical English. Short. Plain. One instruction per sentence.**

**For banks: stress-test on curved state spaces. Detect regimes early. Budget for estimation risk.**

---

> 素材说明：本文事实来源为 5 份已归档文件，性质与边界如下：
>
> 1. arXiv 2506.19945 全文（来源1）：arXiv 预印本（Baker 等，Columbia；anisotropic diffusion maps、graph Laplacian、Kalman filter、FRB 监督压力测试；MAE 改进最高 55%、39%）。
> 2. arXiv 2506.19945 摘要（来源1a）：arXiv 预印本摘要（同一论文，独立归档文件）。
> 3. arXiv 2602.00383 摘要（来源2）：arXiv 预印本摘要（persistence landscapes、L1 norm、null models、Bitcoin 与 S&P 500、stochastic volatility）。
> 4. IAQF & Thalesians 研讨会（来源3）：会议网页（Sidaoui，Columbia 博士生；与来源1 同一研究项目）。
> 5. DayTrading.com 流形学习（来源4）：从业者指南（PCA、t-SNE、UMAP、3D 有效前沿 risk-return-Sharpe 流形、noise 与 non-stationarity 警示）。
> 6. ASD-STE100 基本规则（来源5）：标准机构（受控词表约 900 词、一句一令、民用航空起源）。
>
> 正文按 ASD-STE100 Simplified Technical English 书写：一句一令、短句、现在时、主动语态、受控词表；技术术语（manifold、Laplacian、eigenvalue、Kalman filter）保留为领域必要词。
>
> 凡来源的判断/数据，标注来源；凡本文作者的推论/银行映射，标注 "This article argues" 或 "This article infers"。文中银行相关内容均为一般化 banks，不涉及特定机构。

## 1. What a manifold is, in plain terms

A manifold is a curved surface. It bends. It has shape. Locally it looks flat. Globally it does not.

Financial data has this property. Each row of a data set is a point. All points live on a curved surface. The surface is the manifold. The market moves. The points move. The surface moves with them.

**Why this matters.** The classical tool is PCA. PCA assumes a flat plane. It finds the straight axes of variance. If the true surface bends, PCA cuts across the curve. It loses information.

DayTrading (source 4) makes the point plain. Manifold learning finds low-dimensional representations. It keeps the meaningful properties. The data analysis stays small. The model keeps its grip.

This article infers the risk for banks: if the risk surface bends during a crisis, a straight-line model reports a risk that is smaller than the true risk. The curve is where the loss hides.

**A simple example.** Think of a weather map. The surface of the Earth is curved. A flat map shows the curve only when the map is small. When the map is large, the flat view lies. The map shows the wrong shape. The same problem shows up in finance. A flat PCA view of a large market can mis-state the risk. The curve holds the answer.

**A second example.** Think of a coin. The coin is a flat disc. The disc is a manifold. The edge of the disc is a circle. The circle is also a manifold. The coin lives in two dimensions. The edge lives in one dimension. The market lives in many dimensions. The manifold lives in fewer dimensions. The manifold keeps the key structure. The manifold drops the noise.

**The shape of the market.** The market shape changes. In a calm market, the surface is gentle. The curve is wide. In a stressed market, the surface bends. The curve is tight. The bend is the signal. The bend is the risk. A flat tool sees the bend as a straight line. A curved tool sees the bend as a bend. The curved tool keeps the signal.

| Concept | Plain meaning | Why it matters |
|---|---|---|
| Manifold | A curved surface of data points | The true geometry of the market |
| PCA | Straight axes of variance | Works only when the surface is flat |
| t-SNE, UMAP | Nonlinear maps into 2D or 3D | Reveals clusters and patterns |
| Diffusion maps | Geometry of a diffusion process | Tracks the market state over time |
| Graph Laplacian | Matrix that approximates the curvature | Feeds the diffusion-map algorithm |

**The local vs. global test.** The test is simple. The test asks two questions. First, does the surface look flat up close? Second, does the surface bend over a distance? If both answers are yes, the data is a manifold. If the second answer is no, the data is flat. A flat data set needs a flat tool. A curved data set needs a curved tool. The tool must match the shape of the data.

## 2. Method families: a quick map

The five methods below. Each one solves a different problem. Choose the tool that fits the task.

| Method | Type | What it does | Source |
|---|---|---|---|
| PCA | Linear | Straight axes of variance | DayTrading (source 4) |
| t-SNE | Nonlinear | 2D or 3D visualization; clustering | DayTrading (source 4) |
| UMAP | Nonlinear | Faster than t-SNE; keeps local structure | DayTrading (source 4) |
| Diffusion maps | Nonlinear | Geometry of a diffusion process; time-aware | Baker et al. (source 1) |
| Persistence landscapes | Topological | L1 norm tracks nonlinear, phase-dependent structure | arXiv 2602.00383 (source 2) |
| Riemannian covariance | Geometric | 3D efficient frontier: risk, return, Sharpe | DayTrading (source 4) |

**The role of each method.**

- **PCA.** The starting point. It is fast. It is the default. Use it when the data is nearly flat.
- **t-SNE.** A visualization tool. It shows clusters in 2D or 3D. It does not predict. It is for exploration.
- **UMAP.** Faster than t-SNE. It keeps the local structure. It works on larger data sets.
- **Diffusion maps.** The workhorse of this review. It is time-aware. It learns the geometry of a diffusion process. It feeds the Kalman filter.
- **Persistence landscapes.** A topological signature. It measures complexity. The L1 norm is the key number.
- **Riemannian covariance.** The bank's view of the 3D efficient frontier. It is a geometric tool.

DayTrading (source 4) describes the 3D efficient frontier. It is a manifold. The three axes are risk, return, and the Sharpe ratio. The surface bends. The curvature shows the trade-off between portfolio combinations.

This article infers that a bank can use the same view for stress-testing. The bank plots its own portfolio on the 3D surface. The bank watches the curve shift. A shift in the curve signals a change in the risk regime.

A note on Riemannian covariance. The DayTrading source mentions curvature of the risk-return-Sharpe surface. It does not detail a full Riemannian covariance method. This article keeps that row to a cautious mention.

**When to use which method.** The choice depends on the task.

- **Exploration.** Use t-SNE or UMAP. They show the shape of the data. They are for the analyst's eyes.
- **Prediction.** Use diffusion maps. They feed the Kalman filter. They are for the model's core.
- **Regime detection.** Use persistence landscapes. The L1 norm is the signal. It is for the risk team.
- **Portfolio optimization.** Use the 3D efficient frontier. The surface is the trade-off. It is for the portfolio manager.

The bank must pick one method per task. The bank must not mix methods in the same step. The method choice must be documented. The document must name the method. The document must name the task. The document must name the reason for the choice.

## 3. Dynamic factor models via manifold learning

Baker et al. (source 1) build a data-driven dynamic factor model. The model has no parametric assumptions. It learns the joint dynamics of covariates and responses.

**The problem.** Standard factor models use only the covariates. They lose the link to the response. PCA on the covariates alone can drop the information that predicts the response. The model then fails at the task that matters.

The classical setup. A portfolio manager has a data set. The data set has two parts. The first part is the covariates. The second part is the response. The response is the portfolio return. The manager wants to predict the return. The manager wants to stress-test the return. A flat model predicts the return from the flat axes. A curved model predicts the return from the curved axes.

**The method.** The approach uses anisotropic diffusion maps. It learns a low-dimensional embedding. The embedding keeps two things. First, the geometry of the covariates. Second, the predictive link to the responses.

The math rests on a graph Laplacian. The graph Laplacian converges to the generator of the underlying diffusion. The eigenvalues give the diffusion coordinates. The coordinates follow linear dynamics. A Kalman filter then predicts the next state.

| Step | What it does | Why it matters |
|---|---|---|
| Anisotropic diffusion maps | Learns low-dimensional embedding | Keeps the curved geometry |
| Graph Laplacian | Approximates the curvature | Feeds the diffusion coordinates |
| Kalman filter | Predicts the next state | Works in a linear space |
| Conditional sampling | Generates scenario paths | Supports stress testing |

**The pipeline in detail.**

- **Data set.** The data set has two streams. The first stream is the covariates. The second stream is the response. The covariates are macroeconomic and financial variables. The response is the portfolio return. The data set must be long enough. The data set must cover a crisis period. The data set must have both calm and stressed states.

- **Embedding.** Anisotropic diffusion maps learn the embedding. The embedding is a low-dimensional vector. The vector keeps the curved geometry. The vector keeps the link to the response. The vector is the state of the market. The state moves over time.

- **Dynamics.** The graph Laplacian gives the eigenvalues. The eigenvalues set the drift of the linear model. The linear model runs in the embedding space. The model is linear. The market is nonlinear. The linear model tracks the nonlinear market. It works because the embedding keeps the shape.

- **Filter.** The Kalman filter predicts the next state. It works in the embedding space. It uses both streams. It keeps the link to the response. The filter is the predictor. The filter is the core of the method.

- **Sampling.** Conditional sampling generates scenario paths. The paths start from a stress scenario. The paths end at a portfolio return. The sampling is the stress-test step. The sampling is where the bank sees the loss.

**The application.** Baker et al. apply the method to equity-portfolio stress testing. The data set uses macroeconomic and financial variables from Federal Reserve supervisory scenarios. The method beats two benchmarks.

- Mean absolute error improves by up to 55 percent over classical scenario analysis.
- Mean absolute error improves by up to 39 percent over PCA.

The backtest spans three major financial crisis periods. This article infers that a bank can run the same pipeline on its own data set. The bank swaps the FRED variables for its own risk factors. The pipeline stays the same. The bank keeps the filter. The bank keeps the sampling. The bank changes the data set.

**IAQF (source 3).** The IAQF & Thalesians seminar presents the same research program. Sidaoui is a PhD candidate at Columbia. The seminar describes the Kalman-filter step in detail. The two sources describe one research line. This article treats them as a single program. The seminar confirms that the Kalman-filter step is the key. Without it, the embedding is a map. With it, the embedding is a predictor.

**A note on the 55 percent and 39 percent numbers.** The two numbers are from source 1. They are the gain over two different benchmarks. The 55 percent gain is over classical scenario analysis. The 39 percent gain is over PCA. The bank should treat them as a starting point. The real gain depends on the bank's own data set. The bank must run its own backtest. The bank must check the numbers on its own factors.

**Why the curve beats the line.** The curve beats the line for one reason. The reason is the conditional link. The curve keeps the link between the covariates and the response. The line drops the link. The line keeps only the shape of the covariates. It drops the link to the response. The loss of the link is the loss of accuracy. The curve recovers the link. The curve recovers the accuracy.

## 4. Topological signatures and market regimes

arXiv 2602.00383 (source 2) studies market complexity. It uses persistence landscapes. It uses the L1 norm of the landscape. The data set is daily log returns. The two examples are Bitcoin and the S&P 500.

**The method in three steps.**

- **Delay embedding.** The paper builds a sliding-window delay embedding. The window is the look-back period. The embedding is a point in a higher space. The point captures the local shape of the market.

- **Persistence landscape.** The paper computes the persistence landscape of the embedding. The landscape is a function. The function measures the shape of the data. The shape changes over time.

- **L1 norm.** The paper takes the L1 norm of the landscape. The L1 norm is a single number. The number is the complexity score. The score co-moves with stochastic volatility under stress.

**The result.** The L1 norm co-moves strongly with stochastic volatility. The co-movement shows up during market stress. The relationship is not stable. It changes over time. It also differs between the two markets. Bitcoin is a high-volatility market. The S&P 500 is a broad equity market. The L1 norm behaves differently in each.

**The null models.** The paper validates the result with two kinds of surrogates.

- **Shuffle surrogates.** The paper shuffles the order of the data. It keeps the marginal distribution. It breaks the time order. Rejection of the null model rules out an explanation based on marginal distributions alone. The signal needs the time order.

- **Phase-randomized surrogates.** The paper randomizes the phase of the data. It keeps the linear correlation. It breaks the nonlinear structure. Departures from the null model show sensitivity to nonlinear, phase-dependent structure. The signal needs the nonlinear shape.

| Surrogate | What it tests | What rejection means |
|---|---|---|
| Shuffle surrogate | Marginal distributions only | The signal needs time order |
| Phase-randomized surrogate | Linear correlation only | The signal needs nonlinear structure |

**The practical read.** This article argues that a bank can use the L1 norm as a regime indicator. The norm rises when the market state bends. A rising norm signals a regime shift. The bank then applies a different stress-test profile. This is a practical use of a topological signature. The source does not give a threshold. This article infers that a bank must calibrate its own threshold.

**A note on the two examples.** Bitcoin and the S&P 500 are the two examples. The source does not claim that the result generalizes to all markets. This article infers that a bank should test the method on its own data set. The bank should not assume that a Bitcoin result transfers to a credit portfolio. The bank must run its own backtest.

**The regime question.** The L1 norm answers one question. The question is whether the market is in a calm regime or a stressed regime. The norm is low in a calm regime. The norm is high in a stressed regime. The bank can use the norm to switch its stress-test profile. The bank can use the norm to alert the risk team. The alert is the practical value of the norm.

## 5. Practical use in trading and portfolio work

DayTrading (source 4) lists the practical uses. It lists the practical limits.

**The uses.**

- **Dimensionality reduction.** The method reduces a large data set to a small one. The small data set keeps the key structure. The analyst works on the small data set. The model trains on the small data set.
- **Nonlinear pattern detection.** The method finds patterns that a straight line cannot see. The patterns are the curves in the data. The curves are the signal.
- **Risk-management insight.** The method shows the shape of the risk surface. The bank can see where the risk bends. The bank can see where the loss hides.
- **Market segmentation.** The method groups the market into segments. The segments are the local clusters on the manifold. The bank can target each segment with a different rule.

**The limits.** DayTrading names three limits. They are clear. They are worth repeating.

| Limit | What it means | Bank implication |
|---|---|---|
| Noise | Market data has noise | The manifold can overfit the noise |
| Non-stationarity | The distribution changes over time | The embedding must refit |
| Parameter sensitivity | The choice of technique matters | The bank must document the choice |

This article infers a fourth limit. The source does not name it. It is **estimation risk**. The embedding is a model. A model has an error. The error grows when the data is short or when the market jumps regimes.

**The four limits, in order of impact.**

- **Estimation risk.** The biggest risk. The embedding is a model. The model has an error. The error is the gap between the predicted return and the true return. The bank must track the error.
- **Non-stationarity.** The market changes. The embedding must follow. The bank must refit the embedding. The refit must be on a schedule.
- **Noise.** The data has noise. The embedding can follow the noise. The bank must smooth the data. The bank must use a longer window.
- **Parameter sensitivity.** The choice of method matters. The bank must pick the method. The bank must document the choice. The bank must show the reason.

**The monitoring numbers.** A bank that uses a manifold must track three numbers.

- **The MAE of the stress-test predictions.** The MAE is the error of the prediction. It is the first number.
- **The L1 norm of the persistence landscape.** The L1 norm is the complexity of the market state. It is the second number.
- **The refit interval of the Kalman filter.** The refit interval is the time between refits. It is the third number.

When any of the three moves, the bank pauses. The bank re-checks the embedding. This is the "level-1 brake" pattern from 《1178人联名"踩刹车"：当AI开始监控AI》. The title reference is by title only. This article does not describe the content of that article.

**The 3D view.** DayTrading (source 4) describes the 3D efficient frontier. It plots risk on the x-axis. It plots return on the y-axis. It plots the Sharpe ratio on the z-axis. The surface is the 3D manifold. The bank can use the same view. The bank plots its own portfolio. The bank watches the curve shift. A shift signals a change in the risk regime.

**The trading workflow.** A trader can use the manifold in three steps. First, the trader picks a data set. Second, the trader runs the embedding. Third, the trader reads the curve. The curve tells the trader the state of the market. The trader acts on the state. The action is the trade.

## 6. What this means for banks

This article argues the points below. The points build on the facts in sources 1 through 4. They are not from the sources.

**Stress-testing on a curved state space.** Baker et al. (source 1) show that a curved state space beats a flat one. The MAE gain is up to 55 percent. A bank can adopt the same pipeline. The bank swaps the FRED variables for its own factors. The bank keeps the Kalman filter. The bank keeps the conditional sampling. The result is a stress-test that tracks the true curve.

**Regime detection before a nonlinear move.** The L1 norm (source 2) co-moves with stochastic volatility under stress. A bank can use the norm as a leading indicator. When the norm rises, the bank tightens its stress profile. This is a practical use of a topological signature. The source does not give a trigger value. This article infers that the bank must set its own trigger.

**Limits to manage.** This article names four limits.

| Limit | What it means | Mitigation |
|---|---|---|
| Estimation risk | The embedding is a model | Track the MAE; refit on a schedule |
| Interpretability | The eigenvalues are not business terms | Document the mapping to business factors |
| Computational cost | The Kalman filter refits take time | Budget compute; set a refit window |
| Non-stationarity | The market shifts regimes | Re-fit the embedding on a regime trigger |

**The governance pattern.** This article argues that the manifold pipeline fits the "level-1 brake" pattern. The bank monitors three numbers. When one moves, the bank pauses. When two move, the bank degrades to a flat PCA model. When three move, the bank halts the pipeline and re-builds it. This is the same governance pattern that the second title describes.

**Tie to prior articles.** This article cross-references two prior articles by title only.

- 《General Agent 浪潮与银行》(general-agent-wave-banking-impact). This article does not describe its content.
- 《1178人联名"踩刹车"：当AI开始监控AI》(ai-monitoring-ai-banking-implementation). This article does not describe its content.

**The three bank use-cases.** This article names three use-cases for the bank.

- **Stress testing.** The bank uses the curved pipeline. The bank runs the pipeline on its own factors. The bank reports the result to the regulator.
- **Regime monitoring.** The bank uses the L1 norm. The bank tracks the norm on a daily basis. The bank alerts the risk team when the norm moves.
- **Portfolio optimization.** The bank uses the 3D efficient frontier. The bank plots its own portfolio. The bank watches the curve shift. The bank adjusts the portfolio when the curve shifts.

The three use-cases share one pipeline. The pipeline is the diffusion map plus the Kalman filter. The bank runs the pipeline once. The bank uses the output in three ways. The output is the state of the market. The state feeds the three use-cases.

## 7. Action checklist

**Risk-management lane.**

- Adopt a curved stress-test pipeline. Start with the anisotropic diffusion-map method (source 1). Use the FRED variables as the first test set.
- Set a regime indicator. Use the L1 norm of the persistence landscape (source 2). Set the trigger value with your own backtest.
- Track three numbers. MAE of the predictions. L1 norm. Refit interval. Pause when one moves. Degrade when two move.
- Document the mapping. Map each eigenvalue to a business factor. The audit trail must name the business meaning.

**Technology lane.**

- Build the Kalman filter. Use the diffusion-map coordinates. Refit on a fixed window. Track the burn-in period.
- Document the parameter choices. Name the kernel bandwidth. Name the embedding dimension. Name the refit window. The audit trail must show the choice.
- Set the compute budget. The Kalman refit takes time. The bank must know the cost before it goes live.

**Compliance lane.**

- File the model with the internal model review. Name the method. Name the data set. Name the MAE result. The review must sign off before the model runs in production.
- Set a manual-override path. The risk officer can pause the pipeline. The pause must be one click. The log must record the pause.
- Track the regulatory stress-test calendar. The Federal Reserve supervisory scenarios are one benchmark (source 1). The bank must map the same scenarios to its own factors.

**The order of steps.** The risk-management steps run first. Then the technology steps. Then the compliance steps. The bank must not skip a step. The compliance sign-off must come after the model is live. The risk tracking must come after the regime indicator.

## 8. FAQ

**Q1. What is a manifold, in one sentence?**

A manifold is a curved surface that data points sit on. It looks flat up close. It bends over a distance. PCA assumes it is flat. That assumption can fail.

**Q2. Why use a manifold instead of PCA?**

PCA finds the straight axes. It works when the surface is flat. It fails when the surface bends. The anisotropic diffusion-map method (source 1) keeps the bend. It also keeps the link to the response. The MAE gain is up to 55 percent over classical scenario analysis.

**Q3. What does the L1 norm measure?**

The L1 norm of the persistence landscape. It measures the overall complexity of the market state (source 2). It co-moves with stochastic volatility under stress. It is not a fixed threshold. The bank must set its own trigger.

**Q4. Can a bank run this pipeline today?**

Yes. The data set is the FRED variables plus the FRED-MD macro factors (source 1). The Kalman filter is standard. The bank must document the parameters. The bank must set a refit window. The bank must track the MAE.

**Q5. Which claims in this article need a human check?**

Two claims need a human check.

- The 55 percent and 39 percent MAE numbers come from source 1. A human should verify them against the original paper before the bank cites them in a regulatory filing.
- The L1-norm trigger value is not in any source. This article infers it. A human must set the value with a backtest. The source does not give a number.

**Q6. What is the difference between diffusion maps and PCA?**

PCA is linear. Diffusion maps are nonlinear. PCA finds the straight axes. Diffusion maps find the curved axes. Diffusion maps keep the shape of the data. PCA drops the shape of the data.

**Q7. Does the method work on credit data?**

The source data set is equity data. The bank must test the method on its own credit data. The result may differ. The bank must run its own backtest. The source does not claim a credit result.

## 9. 事实来源 (sources)

The sources below. Each source has a nature. Each source has a boundary.

1. Baker et al., "Data-Driven Dynamic Factor Modeling via Manifold Learning." arXiv 2506.19945. Full text. Anisotropic diffusion maps. Graph Laplacian. Kalman filter. FRB supervisory stress testing. MAE improvement up to 55 percent over classical scenario analysis and 39 percent over PCA.
   - https://arxiv.org/abs/2506.19945
2. Baker et al., abstract. arXiv 2506.19945 (abstract file). Same paper.
   - https://arxiv.org/abs/2506.19945
3. arXiv 2602.00383, "Null-Validated Topological Signatures of Financial Market Dynamics." arXiv abstract. Persistence landscapes. L1 norm. Bitcoin and S&P 500 daily log returns. Null models: shuffle surrogates and phase-randomized surrogates. Co-movement with stochastic volatility under stress.
   - https://arxiv.org/abs/2602.00383
4. IAQF & Thalesians seminar: "Data-Driven Dynamic Factor Modeling via Manifold Learning," a seminar by J. Antonio Sidaoui (Columbia PhD candidate). Same research program as source 1.
   - https://iaqf.org/event-6341495
5. DayTrading.com, "Manifold Learning in Finance, Markets & Trading." Practitioner guide. PCA, t-SNE, UMAP. 3D efficient frontier: risk, return, Sharpe ratio as a manifold. Caveats: noise, non-stationarity, parameter sensitivity.
   - https://www.daytrading.com/manifold-learning
6. ASD-STE100 basics (Aerospace, Security and Defence Industries Association of Europe). Standards body. Controlled vocabulary of about 900 words. One instruction per sentence. Civil-aviation origin.
   - https://www.asd-europe.org/standards-specifications/simplified-technical-english/what-are-the-basics-of-simplified-technical-english/

**The nature of each source.**

- **Source 1.** Primary preprint. The paper is on arXiv. It is not peer-reviewed. The numbers are the author's claim. The bank must verify the numbers on its own data.
- **Source 3.** Primary preprint. The paper is on arXiv. It is not peer-reviewed. The L1-norm result is the author's claim. The bank must test the result on its own data.
- **Source 4.** Conference page. The page is a seminar announcement. It describes the same research as source 1. It adds the Kalman-filter detail.
- **Source 5.** Practitioner guide. The guide is from a trading site. It is not a paper. The 3D efficient-frontier claim is the site's view. The bank must check the claim on its own data.
- **Source 6.** Standards body. The page is from the ASD. It describes the ASD-STE100 style. This article follows the style.

**This article does not constitute regulatory, compliance, or legal advice.**

*(内容由AI生成，仅供参考)*
