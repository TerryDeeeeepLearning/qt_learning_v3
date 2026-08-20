---
id: tensor-product-multiqubit
title: 多量子位元與張量積
order: 7
track: basics
estMinutes: 14
---

## 動機

真實的量子演算法幾乎都用到不只一個量子位元。這一課要講：多個量子位元合在一起時，狀態空間怎麼組合——而這個組合方式，正是「量子優勢」最常被引用的數學根源。

## 先備知識回顧

單一量子位元狀態 $\alpha|0\rangle+\beta|1\rangle$ 活在 $\mathbb{C}^2$ 裡（第 5 課），測量時用 Born 規則讀出機率（第 6 課）。

## 核心概念與推導

### 1. 張量積：把兩個空間「相乘」

兩個量子位元的合併狀態空間，不是簡單相加，而是**張量積** $\mathbb{C}^2 \otimes \mathbb{C}^2 = \mathbb{C}^4$。基底變成：

$$
|00\rangle,\ |01\rangle,\ |10\rangle,\ |11\rangle
$$

如果兩個量子位元分別是 $|\psi_1\rangle=\alpha_1|0\rangle+\beta_1|1\rangle$ 和 $|\psi_2\rangle=\alpha_2|0\rangle+\beta_2|1\rangle$，它們的合併狀態（若彼此獨立）是：

$$
|\psi_1\rangle\otimes|\psi_2\rangle = \alpha_1\alpha_2|00\rangle+\alpha_1\beta_2|01\rangle+\beta_1\alpha_2|10\rangle+\beta_1\beta_2|11\rangle
$$

### 2. 維度是指數成長的

$n$ 個量子位元的狀態空間維度是 $2^n$，不是 $2n$。20 個量子位元就有 $2^{20}\approx 100$ 萬維，300 個量子位元的維度就已經超過可觀測宇宙中的原子數量。這個**指數成長**，正是理查・費曼（Richard Feynman）在 1982 年提出「用量子系統模擬量子系統」構想時的核心觀察——古典電腦要存下這麼大的狀態向量本身就不可行，但量子系統可以直接「是」這個狀態。

### 3. 不是所有多量子位元態都能拆開

並非每個 $\mathbb{C}^4$ 裡的態都能寫成 $|\psi_1\rangle\otimes|\psi_2\rangle$ 這種「乘積態」的形式。寫不成這種形式的態，就叫**糾纏態**——下一課的主題。

## 應用例子

論文裡常看到「$n$ 量子位元系統」這樣的描述，背後就是在說一個 $2^n$ 維的複數向量空間。量子演算法設計的一大核心問題，就是如何用**多項式數量**的量子閘（不是指數數量），操作這個指數大的空間，來完成古典電腦做不到（或做得很慢）的計算——這也是後面 QFT、量子機器學習等主題共通的設計思路。

## 小結

- $n$ 個量子位元的狀態空間是單一位元空間的 $n$ 次張量積，維度 $2^n$
- 維度隨量子位元數指數成長，是量子計算「潛力」的數學來源
- 並非所有多量子位元態都能拆成單一位元態的乘積——拆不開的就是糾纏態

### 檢核題

3 個量子位元的狀態空間維度是多少？

<details>
<summary>看答案</summary>

$2^3=8$ 維，基底是 $|000\rangle,|001\rangle,\dots,|111\rangle$ 共 8 個。

</details>

## 來源

1. Nielsen, M. A. & Chuang, I. L., *Quantum Computation and Quantum Information* — 第 1、2 章對多量子位元系統與張量積的標準介紹。
2. Feynman, R. P., *"Simulating Physics with Computers"*, International Journal of Theoretical Physics (1982) — 量子計算領域公認的奠基性論文，提出用量子系統模擬量子系統的構想。
3. IBM Quantum, *Qiskit Textbook*，"Multiple Qubits and Entangled States" 章節。
