---
id: unitary-operators
title: 酉算子與旋轉
order: 4
track: basics
estMinutes: 12
---

## 動機

「量子閘」在數學上就是一個酉算子。論文裡看到 $U$、$R_z(\theta)$ 這些符號時，背後的規則其實跟第一課的「乘 $i$ = 轉 90 度」是同一件事，只是從單一複數升級成整個態向量的旋轉。

## 先備知識回顧

上一課的 Hermitian 算子 $A^\dagger=A$，這一課會用到共軛轉置 $A^\dagger$ 的概念，但規則不一樣。

## 核心概念與推導

### 1. 酉算子的定義

一個算子 $U$ 若滿足：

$$
U^\dagger U = U U^\dagger = I
$$

就稱為**酉（unitary）算子**。關鍵性質：酉算子保持內積不變，也就是保持「長度」與「夾角」：

$$
\langle U\phi|U\psi\rangle = \langle\phi|\psi\rangle
$$

這正是量子力學要求的——量子態的演化（除了測量）必須保持機率總和為 1，而酉算子正好保證了這件事。

### 2. 為什麼說酉算子是「旋轉」

在實數空間裡，保持長度不變的線性變換就是旋轉（或鏡射）。酉算子是這個概念在複數空間的推廣：它把整個向量空間做一次「不失真」的旋轉。第一課提到乘上 $e^{i\theta}$ 是把一個複數轉 $\theta$ 度，而 $U=e^{i\theta}$（把它想成 $1\times1$ 的酉「矩陣」）正好符合 $U^\dagger U = e^{-i\theta}e^{i\theta}=1$——單一複數的酉算子，就是純旋轉。

### 3. 常見的單量子位元酉算子

$$
X=\begin{pmatrix}0&1\\1&0\end{pmatrix},\quad
R_z(\theta) = \begin{pmatrix} e^{-i\theta/2} & 0 \\ 0 & e^{i\theta/2}\end{pmatrix}
$$

$R_z(\theta)$ 這個名字就直接告訴你它在做什麼：繞著 Bloch 球的 $z$ 軸轉 $\theta$ 角。

## 應用例子

任何量子電路，不管多複雜，中間每一步（測量之前）都是一個酉算子在作用。在 Qiskit 這類框架的文件裡，每個量子閘的定義都會附上一個酉矩陣，工程師在選擇要用哪個閘時，本質上就是在選擇要對態向量做哪一種「旋轉」。

## 小結

- $U^\dagger U = I$ 的算子稱為酉算子，保持內積（長度、夾角）不變
- 量子態的演化必須是酉的，這保證機率總和守恆
- 酉算子是「乘 $e^{i\theta}$ 轉角度」這個概念在向量空間的推廣
- $R_z(\theta)$ 等旋轉閘的命名直接對應它們在 Bloch 球上的幾何動作

### 檢核題

驗證 Pauli-$X$ 確實是酉算子（提示：$X$ 也是 Hermitian，$X^\dagger=X$，還需要驗證 $X^2=I$）。

<details>
<summary>看答案</summary>

$X^\dagger = X$（因為 $X$ 是實數對稱矩陣）。而 $X^2 = \begin{pmatrix}0&1\\1&0\end{pmatrix}\begin{pmatrix}0&1\\1&0\end{pmatrix} = \begin{pmatrix}1&0\\0&1\end{pmatrix} = I$。所以 $X^\dagger X = X \cdot X = I$，確認 $X$ 是酉算子。（順帶一提：同時是 Hermitian 又是酉算子，是 Pauli 矩陣的特殊性質，不是所有酉算子都這樣。）

</details>

## 來源

1. Nielsen, M. A. & Chuang, I. L., *Quantum Computation and Quantum Information* — 第 2 章對酉算子與量子演化公設的推導。
2. IBM Quantum, *Qiskit Textbook*，"Single Qubit Gates" 章節 — 各種旋轉閘的矩陣定義與 Bloch 球幾何對應。
3. Preskill, J., *Lecture Notes for Physics 219: Quantum Computation*, Caltech。
