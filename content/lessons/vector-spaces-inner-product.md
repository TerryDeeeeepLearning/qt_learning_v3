---
id: vector-spaces-inner-product
title: 向量空間與內積
order: 2
track: basics
estMinutes: 12
---

## 動機

論文裡的量子態常寫成 $|\psi\rangle$，這個符號背後就是一個複數向量。要看懂「重疊」「正交」「機率幅」這些詞，得先把向量空間和內積這兩個工具準備好——它們是整個量子力學形式系統的地基。

## 先備知識回顧

上一課學到複數 $z=re^{i\theta}$ 可以理解成旋轉，$i$ 代表轉 90 度。這一課會用到複數的**共軛** $\bar{z} = a-bi$（也就是把角度反過來）。

## 核心概念與推導

### 1. 向量空間，快速版

一個（複）向量空間就是一堆向量，滿足「可以相加」「可以乘上一個複數係數」，而且結果還在這個空間裡。量子計算裡最常見的空間是 $\mathbb{C}^2$（單一量子位元）跟它的張量積（多量子位元，下下一課會講）。

用 Dirac 符號，向量寫成 $|\psi\rangle$（ket）。

### 2. 內積：怎麼量「兩個態有多接近」

複數向量空間上的內積 $\langle\phi|\psi\rangle$ 滿足：

$$
\langle\phi|\psi\rangle = \overline{\langle\psi|\phi\rangle}
$$

也就是交換順序要取共軛。這是複數版本特有的規則（實數向量的內積不用管這件事）。$\langle\psi|$ 稱為 bra，是 $|\psi\rangle$ 的**共軛轉置**。

一個向量的「長度」（範數）定義為：

$$
\||\psi\rangle\| = \sqrt{\langle\psi|\psi\rangle}
$$

量子態要求 $\langle\psi|\psi\rangle = 1$，這就是「機率幅平方和等於 1」這句話的來源。

### 3. 正交基底

如果 $\langle i|j\rangle = \delta_{ij}$（相同是 1，不同是 0），這組向量就叫**正交歸一基底**。$|0\rangle=\begin{pmatrix}1\\0\end{pmatrix}$、$|1\rangle=\begin{pmatrix}0\\1\end{pmatrix}$ 就是 $\mathbb{C}^2$ 最常用的一組。

## 應用例子

任何量子態都可以寫成基底的線性組合 $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$，而 $\alpha = \langle 0|\psi\rangle$、$\beta = \langle 1|\psi\rangle$——內積在這裡的角色就是「把一個態投影到某個基底方向，讀出它的係數」。這個投影操作正是量子測量機率（Born rule）的數學基礎，下下下一課會直接用到。

## 小結

- 量子態是複數向量空間裡的向量，用 $|\psi\rangle$ 表示
- 內積 $\langle\phi|\psi\rangle$ 交換順序要取共軛，這是複數空間的特有規則
- 正交歸一基底 $\langle i|j\rangle=\delta_{ij}$ 讓我們可以用內積把態「投影」出係數

### 檢核題

若 $|\psi\rangle = \frac{1}{\sqrt2}|0\rangle + \frac{i}{\sqrt2}|1\rangle$，請計算 $\langle\psi|\psi\rangle$。

<details>
<summary>看答案</summary>

$\langle\psi|\psi\rangle = \left(\frac{1}{\sqrt2}\right)\overline{\left(\frac{1}{\sqrt2}\right)} + \left(\frac{i}{\sqrt2}\right)\overline{\left(\frac{i}{\sqrt2}\right)} = \frac{1}{2} + \frac{1}{2} = 1$。這驗證了它是一個合法的量子態（歸一化）。

</details>

## 來源

1. Nielsen, M. A. & Chuang, I. L., *Quantum Computation and Quantum Information*, Cambridge University Press — 第 2 章「線性代數」對向量空間、內積、Dirac 符號的標準介紹。
2. IBM Quantum, *Qiskit Textbook*，"Linear Algebra" 章節 — 以量子計算為背景重新介紹內積與正交基底。
3. Griffiths, D. J., *Introduction to Quantum Mechanics* — 態向量與內積的物理詮釋。
