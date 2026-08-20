---
id: qft-derivation
title: 量子傅立葉轉換：從 DFT 到 QFT
order: 12
track: core
estMinutes: 18
---

## 動機

這一課是整條主線的匯流點：把「經典 DFT」（第 9 課）跟「相位閘與受控操作」（第 11 課）合在一起，正式推導量子傅立葉轉換。這是理解 Shor 演算法、量子相位估計、乃至許多量子機器學習演算法的共同基礎。

## 先備知識回顧

- 第 9 課：DFT 定義 $X_k = \sum_n x_n e^{-2\pi i kn/N}$，且 DFT 是酉變換
- 第 11 課：受控相位閘 $\text{CPHASE}(\theta)$，只在雙方都是 $|1\rangle$ 時作用

## 核心概念與推導

### 1. QFT 的定義：把 DFT 直接搬到量子態上

量子傅立葉轉換對計算基底態 $|j\rangle$（$j=0,\dots,N-1$，$N=2^n$）的定義是：

$$
\text{QFT}|j\rangle = \frac{1}{\sqrt N}\sum_{k=0}^{N-1} e^{2\pi i jk/N}|k\rangle
$$

跟第 9 課的 DFT 公式比較：**指數項一模一樣**（只差一個正負號的慣例），差別在於 DFT 是對一串「古典數字」做運算，QFT 是對一個量子態的「機率幅」做運算——而且因為 $|j\rangle$ 是疊加在一個量子暫存器裡，QFT 可以同時對指數多個 $j$ 的疊加做變換，這是它跟古典 FFT 最本質的不同（但也帶來一個重要限制：QFT 之後直接測量，讀出的仍然只是一個古典結果，怎麼設計演算法讓這個結果有意義，是另一門學問，下一課會看到具體例子）。

### 2. 電路推導：從 $H$ 到受控相位閘

把 $j$ 用二進位展開 $j = j_1j_2\cdots j_n$（$j_1$ 是最高位），QFT 的輸出可以寫成一個漂亮的乘積形式：

$$
\text{QFT}|j\rangle = \frac{1}{\sqrt N}\bigotimes_{l=1}^{n}\left(|0\rangle + e^{2\pi i\, 0.j_l j_{l+1}\cdots j_n}|1\rangle\right)
$$

其中 $0.j_lj_{l+1}\cdots j_n$ 是二進位小數。這個乘積形式直接告訴我們電路怎麼搭：

1. 對第一個量子位元做 $H$，得到 $|0\rangle+e^{2\pi i\,0.j_1}|1\rangle$ 的疊加（相位裡只有 $j_1$ 這一位）
2. 用受控相位閘，把後面每一位 $j_2,j_3,\dots$ 依序、以遞減的角度「疊加」進這個相位裡（這正是第 11 課受控相位閘 $\text{CPHASE}(\theta)$ 派上用場的地方）
3. 對每個量子位元重複這個「$H$ + 一串受控相位閘」的模式，最後再做一次量子位元順序反轉（SWAP），就得到完整的 QFT 電路

這個電路總共只需要 $O(n^2)$ 個量子閘（$n=\log_2 N$），而古典 FFT 對 $N$ 個數字需要 $O(N\log N)$ 次運算——如果把 $N$ 個古典數字想成量子態裡 $n=\log_2 N$ 個量子位元的疊加，QFT 用多項式數量的閘，處理了指數大的資料結構。這正是它被視為量子演算法「加速潛力」代表作之一的原因，但要注意：這個加速只發生在「輸入已經是疊加態、且只需要讀出全域統計特徵（如週期）」的情境，不是任意情境下都適用。

### 3. QFT 也是酉算子

因為 QFT 的定義完全由 $H$ 跟受控相位閘（都是酉算子，見第 4、10、11 課）組合而成，QFT 本身也保證是酉算子——這對應到第 9 課提過「DFT（正規化後）是酉變換」，兩者在數學結構上是一致的。

## 應用例子

QFT 電路的這個標準構造，最早由 Don Coppersmith 在 1994 年的技術報告中提出（常被稱為「approximate QFT」，因為實作上會捨棄角度過小、對結果影響可忽略的受控相位閘，換取電路深度的降低），是目前絕大多數量子計算框架（包含 Qiskit）內建 QFT 元件所依據的標準電路設計。

## 小結

- QFT 的定義跟古典 DFT 在指數項上完全對應，差別在作用對象是量子態的機率幅
- QFT 電路可以拆解成 $H$ 閘加上一連串受控相位閘，只需要 $O(n^2)$ 個閘
- QFT 本身是酉算子，這件事直接繼承自組成它的 $H$ 和受控相位閘都是酉算子
- QFT 的加速潛力來自對疊加態進行全域統計轉換，不是任意情境都適用

### 檢核題

$n=3$（也就是 $N=8$）時，QFT 電路裡總共需要幾個 Hadamard 閘？

<details>
<summary>看答案</summary>

3 個——每個量子位元各做一次 $H$，對應電路推導裡「對每個量子位元重複 $H$ + 受控相位閘」的步驟。

</details>

## 來源

1. Nielsen, M. A. & Chuang, I. L., *Quantum Computation and Quantum Information* — 第 5 章對 QFT 定義與電路構造的完整推導，是本課主要依據。
2. Coppersmith, D., *"An Approximate Fourier Transform Useful in Quantum Factoring"*, IBM Research Report RC19642 (1994) — QFT 標準電路構造的原始技術報告。
3. IBM Quantum, *Qiskit Textbook*，"Quantum Fourier Transform" 章節，含電路圖與程式碼實作對照。
