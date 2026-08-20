---
id: quantum-gates-circuits
title: 量子閘與電路基礎
order: 10
track: core
estMinutes: 15
---

## 動機

前面九課把數學和物理基礎都打完了。從這一課開始進入「核心」篇：讀懂論文裡的電路圖，看懂每個符號代表哪個酉算子。

## 先備知識回顧

酉算子保持內積不變、代表量子態的演化（第 4 課）；多量子位元狀態活在張量積空間（第 7 課）。

## 核心概念與推導

### 1. 電路圖的讀法

量子電路圖裡，每條橫線代表一個量子位元隨時間演化，方塊代表施加某個酉算子（量子閘），從左讀到右。這只是把「一串酉算子依序作用在態上」畫成圖形，沒有更多。

### 2. 常見單量子位元閘

- **Pauli-X**：$|0\rangle \leftrightarrow |1\rangle$，古典 NOT 閘的量子版本。
- **Hadamard $H$**：$H|0\rangle = \frac{1}{\sqrt2}(|0\rangle+|1\rangle) = |+\rangle$，把基底態變成等權重疊加態，是幾乎所有量子演算法開頭都會用到的閘。
- **相位閘 $S,T$**：只改變 $|1\rangle$ 分量的相位，不改變機率大小（第 11 課會細講）。

### 3. 多量子位元閘：受控操作

**CNOT（受控 NOT）**是最重要的雙量子位元閘：如果控制位元是 $|1\rangle$，就對目標位元做 $X$；如果控制位元是 $|0\rangle$，目標不變：

$$
\text{CNOT}: |1\rangle|0\rangle \mapsto |1\rangle|1\rangle
$$

把 $H$ 作用在第一個量子位元、接著對兩個位元做 CNOT，正是製造第 8 課提到的 Bell 態 $|\Phi^+\rangle$ 的標準電路：

$$
|00\rangle \xrightarrow{H\otimes I} \frac{1}{\sqrt2}(|00\rangle+|10\rangle) \xrightarrow{\text{CNOT}} \frac{1}{\sqrt2}(|00\rangle+|11\rangle)
$$

### 4. 通用性（Universality）

有一組特定的量子閘（例如 $\{H, T, \text{CNOT}\}$）可以組合出任意精度逼近任何酉算子——這叫**通用閘集**。這是為什麼硬體廠商只需要把少數幾種閘做得非常精準，理論上就能執行任意量子演算法。

## 應用例子

上面「$H$ 接 CNOT 做出 Bell 態」的電路，是幾乎每一篇量子計算入門教材、每一個量子計算框架（Qiskit、Cirq 等）的官方教學裡都會出現的第一個非平凡電路，通常被稱為 Bell 態製備電路，用來驗證硬體是否能正確產生糾纏。

## 小結

- 電路圖是一串依序作用的酉算子，從左讀到右
- $H$ 閘製造等權重疊加，是幾乎所有演算法的起手式
- CNOT 是最基本的雙量子位元閘，$H$+CNOT 可以製造 Bell 態
- 通用閘集（如 $H,T,\text{CNOT}$）理論上能逼近任意酉算子

### 檢核題

對 $|10\rangle$（控制位元是 $|1\rangle$，目標位元是 $|0\rangle$）做 CNOT，結果是什麼？

<details>
<summary>看答案</summary>

$|11\rangle$。因為控制位元是 $|1\rangle$，目標位元被翻轉：$|0\rangle \to |1\rangle$。

</details>

## 來源

1. Nielsen, M. A. & Chuang, I. L., *Quantum Computation and Quantum Information* — 第 4 章對量子閘、電路模型與通用性的完整介紹。
2. IBM Quantum, *Qiskit Textbook*，"Single Qubit Gates"、"Multiple Qubits and Entangled States" 章節，含 Bell 態製備電路範例。
3. Barenco, A. et al., *"Elementary Gates for Quantum Computation"*, Physical Review A (1995) — 通用閘集的奠基性論文之一。
