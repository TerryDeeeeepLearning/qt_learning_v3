---
id: hermitian-eigen
title: 矩陣、Hermitian 算子與特徵分解
order: 3
track: basics
estMinutes: 15
---

## 動機

論文裡講「可觀測量 (observable)」時，背後一定對應一個 Hermitian 矩陣；講「這個算子的特徵值就是可能的測量結果」時，用的就是這一課的工具。這是連接「數學算子」跟「物理量測」的橋樑。

## 先備知識回顧

上一課的內積 $\langle\phi|\psi\rangle$ 會在這裡用來定義「共軛轉置」。

## 核心概念與推導

### 1. 共軛轉置（Adjoint）

一個矩陣 $A$ 的共軛轉置 $A^\dagger$，是先取轉置再對每個元素取共軛：

$$
(A^\dagger)_{ij} = \overline{A_{ji}}
$$

### 2. Hermitian 算子

如果 $A^\dagger = A$，稱 $A$ 為 **Hermitian（厄米）算子**。這類算子有兩個關鍵性質：

- **特徵值一定是實數**——這正是物理上必要的：測量結果是我們讀得出來的實際數字（例如能量、自旋方向），不能是複數。
- **不同特徵值對應的特徵向量互相正交**——這讓特徵向量可以直接當作一組正交基底。

### 3. 特徵分解（Spectral Decomposition）

任何 Hermitian 算子都可以寫成：

$$
A = \sum_i \lambda_i |i\rangle\langle i|
$$

其中 $\lambda_i$ 是實數特徵值，$|i\rangle$ 是對應的正交歸一特徵向量。這個式子的意思是：「先把輸入態投影到 $|i\rangle$ 方向，再乘上權重 $\lambda_i$，最後全部加起來」。

## 應用例子

量子計算最常見的 Hermitian 算子是 **Pauli 算子**，例如：

$$
Z = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}
$$

$Z$ 的特徵值是 $+1$ 和 $-1$，對應的特徵向量正好是 $|0\rangle$ 和 $|1\rangle$。這就是為什麼在量子計算文獻裡，「測量 $Z$」跟「在計算基底上測量」是同一件事——$Z$ 這個 Hermitian 算子的特徵分解，直接對應到 $|0\rangle,|1\rangle$ 這組基底跟 $\pm1$ 這兩個可能的讀數。

## 小結

- $A^\dagger=A$ 的算子稱為 Hermitian，特徵值必為實數
- Hermitian 算子的特徵向量可以組成一組正交基底
- 特徵分解 $A=\sum_i \lambda_i|i\rangle\langle i|$ 把「算子」跟「基底＋可能讀數」連在一起
- Pauli-$Z$ 是最常見的例子，特徵值 $\pm1$ 對應 $|0\rangle,|1\rangle$

### 檢核題

Pauli-$X = \begin{pmatrix}0&1\\1&0\end{pmatrix}$ 是不是 Hermitian？它的特徵值是多少？

<details>
<summary>看答案</summary>

是 Hermitian（實數對稱矩陣，轉置等於自己，取共軛不變）。特徵值是 $+1$ 和 $-1$，對應的特徵向量是 $|+\rangle=\frac{1}{\sqrt2}(|0\rangle+|1\rangle)$ 和 $|-\rangle=\frac{1}{\sqrt2}(|0\rangle-|1\rangle)$。

</details>

## 來源

1. Nielsen, M. A. & Chuang, I. L., *Quantum Computation and Quantum Information* — 第 2 章對 Hermitian 算子、譜定理（spectral theorem）的完整推導。
2. Preskill, J., *Lecture Notes for Physics 219: Quantum Computation*, Caltech（公開講義）— 對可觀測量與特徵分解的物理詮釋。
3. IBM Quantum, *Qiskit Textbook*，"Linear Algebra" 章節中的 Pauli 算子介紹。
