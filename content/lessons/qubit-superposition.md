---
id: qubit-superposition
title: 量子位元與疊加態
order: 5
track: basics
estMinutes: 12
---

## 動機

前面四課把數學工具都準備好了（複數、內積、Hermitian、酉算子），這一課開始正式進入物理：量子位元到底是什麼、疊加態怎麼寫、怎麼想像。

## 先備知識回顧

量子態是歸一化的複數向量 $\langle\psi|\psi\rangle=1$（第 2 課），演化由酉算子描述（第 4 課）。

## 核心概念與推導

### 1. 量子位元的一般形式

一個量子位元（qubit）的狀態寫成：

$$
|\psi\rangle = \alpha|0\rangle + \beta|1\rangle,\qquad |\alpha|^2+|\beta|^2=1
$$

這就叫**疊加態**——量子位元不是「非 0 即 1」，而是同時帶有 $|0\rangle$ 和 $|1\rangle$ 兩個分量，直到被測量（下一課）才會「決定」讀出哪一個。

### 2. Bloch 球：把疊加態畫出來

因為全域相位不影響物理（第 1 課提過），$\alpha,\beta$ 這兩個複數其實只有 2 個自由度是「有意義的」，可以改寫成：

$$
|\psi\rangle = \cos\frac{\theta}{2}|0\rangle + e^{i\phi}\sin\frac{\theta}{2}|1\rangle
$$

這正好對應球面上的一個點：$\theta$ 是緯度（從北極 $|0\rangle$ 到南極 $|1\rangle$），$\phi$ 是經度（相位）。這顆球叫 **Bloch 球**，是視覺化單一量子位元狀態最標準的方式。

### 3. 疊加不是「機率上不知道」

一個常見誤解是把疊加態當成「電腦不知道現在是 0 還是 1，只是機率各半」。但疊加態帶有**相位**這個額外自由度，正是這個相位讓不同疊加態之間可以互相干涉（加強或抵消）——這在古典的「機率不確定」裡是不存在的機制，也是量子演算法能超越古典演算法的根源之一。

## 應用例子

實際的量子位元有很多種物理實現方式：超導電路、離子阱、光子等。不同硬體平台的「$|0\rangle$」「$|1\rangle$」對應到不同的物理自由度（例如超導電路裡是不同的能階），但數學描述完全一樣，都是這一課的 $\alpha|0\rangle+\beta|1\rangle$。這也是為什麼量子計算的理論論文通常不需要指定硬體平台——數學形式是共通的。

## 小結

- 量子位元狀態 $|\psi\rangle=\alpha|0\rangle+\beta|1\rangle$，$|\alpha|^2+|\beta|^2=1$
- Bloch 球用 $(\theta,\phi)$ 兩個角度視覺化單一量子位元的狀態
- 疊加態的關鍵不是「機率不確定」，而是帶有可以互相干涉的相位

### 檢核題

$|+\rangle = \frac{1}{\sqrt2}(|0\rangle+|1\rangle)$ 在 Bloch 球上的 $\theta,\phi$ 各是多少？

<details>
<summary>看答案</summary>

$\theta=\pi/2$（赤道，$\cos(\pi/4)=\sin(\pi/4)=1/\sqrt2$），$\phi=0$（沒有額外相位）。它剛好在 Bloch 球赤道上、面對 $x$ 軸正方向的那一點。

</details>

## 來源

1. Nielsen, M. A. & Chuang, I. L., *Quantum Computation and Quantum Information* — 第 1 章對量子位元與 Bloch 球的標準介紹。
2. Krantz, P. et al., *"A Quantum Engineer's Guide to Superconducting Qubits"*, Applied Physics Reviews (2019) — 高引用的綜述論文，說明量子位元在真實硬體上的物理實現。
3. IBM Quantum, *Qiskit Textbook*，"The Atoms of Computation" 與 "Representing Qubit States" 章節。
