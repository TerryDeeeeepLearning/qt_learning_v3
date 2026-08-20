---
id: phase-and-unitary-gates
title: 相位與量子閘的酉表示
order: 11
track: core
estMinutes: 12
---

## 動機

QFT 電路裡最關鍵的元件是**受控相位閘**。要看懂它為什麼長那個樣子，得先把「相位閘」跟「相位反衝（phase kickback）」這兩個概念搞清楚——這一課直接為下一課的 QFT 推導鋪路。

## 先備知識回顧

第 1 課：全域相位不影響測量結果，但相對相位會影響干涉。第 10 課：$H$、CNOT 等基本閘的定義。

## 核心概念與推導

### 1. 相位閘

相位閘只改變 $|1\rangle$ 分量的相位，不動 $|0\rangle$，也不改變機率大小：

$$
P(\theta) = \begin{pmatrix} 1 & 0 \\ 0 & e^{i\theta} \end{pmatrix}
$$

常見特例：$S=P(\pi/2)$，$T=P(\pi/4)$。作用在疊加態上：

$$
P(\theta)\left(\alpha|0\rangle+\beta|1\rangle\right) = \alpha|0\rangle + \beta e^{i\theta}|1\rangle
$$

單獨測量這個態，$|α|^2,|βe^{iθ}|^2=|β|^2$ 完全沒變——相位「看不見」，但一旦這個量子位元之後跟別的量子位元互動（例如做 CNOT 或再做一次 $H$），相位差就會透過干涉顯現在機率分布上。

### 2. 受控相位閘

$\text{CPHASE}(\theta)$（也常寫成 $\text{CP}(\theta)$ 或 $\text{CR}_k$）是雙量子位元閘：只有當兩個量子位元都是 $|1\rangle$ 時，才乘上 $e^{i\theta}$：

$$
\text{CPHASE}(\theta): |11\rangle \mapsto e^{i\theta}|11\rangle
$$

### 3. 相位反衝（Phase Kickback）

如果目標量子位元本身處於某個相位閘的特徵態，受控操作會把「應該加在目標上」的相位，反過來「踢」到控制位元上。這個機制是量子相位估計（quantum phase estimation）演算法的核心，而相位估計正是 Shor 演算法背後真正在做的事——下下一課會看到 QFT 如何在這個框架裡扮演關鍵角色。

## 應用例子

在量子電路的實作文獻與框架（如 Qiskit）中，CPHASE／CR 系列閘幾乎必然出現在任何牽涉「頻率」「週期」「相位估計」的演算法電路圖裡，QFT 電路正是其中最直接的例子——下一課會直接看到它。

## 小結

- 相位閘只改變 $|1\rangle$ 分量的相位，單獨測量看不出差異
- 受控相位閘 $\text{CPHASE}(\theta)$ 只在雙方都是 $|1\rangle$ 時作用
- 相位反衝機制讓相位資訊透過受控操作「轉移」到控制位元上，是量子相位估計的核心原理

### 檢核題

$P(\pi)$ 這個相位閘，其實就是哪一個你已經學過的 Pauli 算子？

<details>
<summary>看答案</summary>

$P(\pi) = \begin{pmatrix}1&0\\0&e^{i\pi}\end{pmatrix} = \begin{pmatrix}1&0\\0&-1\end{pmatrix} = Z$（Pauli-$Z$，第 3 課提過的那個）。

</details>

## 來源

1. Nielsen, M. A. & Chuang, I. L., *Quantum Computation and Quantum Information* — 第 4 章相位閘定義、第 5 章量子相位估計中的相位反衝機制。
2. Kitaev, A. Y., *"Quantum measurements and the Abelian Stabilizer Problem"*, arXiv:quant-ph/9511026 (1995) — 量子相位估計演算法的奠基性論文。
3. IBM Quantum, *Qiskit Textbook*，"Phase Kickback" 與 "Quantum Phase Estimation" 章節。
