---
id: measurement-postulate
title: 測量公設與機率詮釋
order: 6
track: basics
estMinutes: 10
---

## 動機

每個量子電路圖的最後都有一個測量符號。這一課要講清楚：測量到底在數學上做了什麼、機率從哪裡來、為什麼測量之後態會「改變」。

## 先備知識回顧

第 2 課的內積可以把態投影到某個基底方向；第 5 課的疊加態 $\alpha|0\rangle+\beta|1\rangle$ 是這一課要「讀出」的對象。

## 核心概念與推導

### 1. Born 規則

對計算基底 $\{|0\rangle,|1\rangle\}$ 測量狀態 $|\psi\rangle=\alpha|0\rangle+\beta|1\rangle$，讀到結果 $i$ 的機率是：

$$
P(i) = |\langle i|\psi\rangle|^2
$$

所以讀到 0 的機率是 $|\alpha|^2$，讀到 1 的機率是 $|\beta|^2$。這就是為什麼疊加態要求 $|\alpha|^2+|\beta|^2=1$——它剛好是所有可能結果的機率總和。

### 2. 測量會讓狀態「塌縮」

測量之後，如果讀到結果 $i$，狀態會立刻變成 $|i\rangle$ 本身，之前的疊加資訊消失。這叫**投影測量（projective measurement）**：

$$
|\psi\rangle \xrightarrow{\text{測到 } i} |i\rangle
$$

這件事解釋了一個常見的實作細節：量子電路裡「測量」通常放在最後一步，因為測量之後疊加態就沒了，繼續做酉演化也無法回復。

### 3. 為什麼相位在測量時「看不見」

Born 規則只看 $|\langle i|\psi\rangle|^2$，也就是只看**大小**，不看相位角度本身。這解釋了第 1 課提過的「全域相位不影響測量結果」——但也正因為相位在單獨測量時看不見，量子演算法必須設計成讓相位先透過干涉「轉換成大小的差異」，才能在最後被測量讀出來。這是理解 QFT、Grover 等演算法設計邏輯的關鍵前提。

## 應用例子

在 IBM Quantum 這類真實硬體上執行電路時，同一個電路通常會重複執行上千次（稱為 shots），因為單次測量只能得到一個 0 或 1，必須靠多次重複統計出 $P(0), P(1)$ 的實驗分布，才能驗證理論預測的機率是否正確。

## 小結

- Born 規則：$P(i) = |\langle i|\psi\rangle|^2$
- 測量會讓態塌縮到對應的基底向量，疊加資訊消失
- 測量只讀出機率幅的大小，相位要靠干涉先轉換成大小差異才能被讀出

### 檢核題

若 $|\psi\rangle = \frac{\sqrt3}{2}|0\rangle + \frac{1}{2}|1\rangle$，測到 $0$ 和 $1$ 的機率各是多少？

<details>
<summary>看答案</summary>

$P(0) = \left(\frac{\sqrt3}{2}\right)^2 = \frac{3}{4}$，$P(1) = \left(\frac{1}{2}\right)^2 = \frac{1}{4}$，總和為 1，符合歸一化。

</details>

## 來源

1. Nielsen, M. A. & Chuang, I. L., *Quantum Computation and Quantum Information* — 第 2 章測量公設（Born rule）的完整推導。
2. IBM Quantum, *Qiskit Textbook*，"Measurement" 章節，並說明 shots 與統計估計機率的實作方式。
3. Preskill, J., *Lecture Notes for Physics 219: Quantum Computation*, Caltech。
