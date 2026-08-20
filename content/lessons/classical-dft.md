---
id: classical-dft
title: 經典離散傅立葉轉換 (DFT)
order: 9
track: basics
estMinutes: 14
---

## 動機

這一課是為 QFT 鋪路的「複習課」。在看懂量子傅立葉轉換之前，得先確定普通（離散）傅立葉轉換在做什麼——它們的公式長得幾乎一樣，差別在「作用的對象」。

## 先備知識回顧

第 1 課的 $e^{i\theta}$ 是旋轉；這一課會大量使用 $e^{2\pi i \cdot k/N}$ 這種形式，本質上是同一件事，只是角度用 $2\pi k/N$ 參數化。

## 核心概念與推導

### 1. DFT 在解決什麼問題

給一組長度 $N$ 的數列 $x_0, x_1, \dots, x_{N-1}$（可以想成訊號隨時間變化的數值），離散傅立葉轉換把它轉成另一組數列 $X_0,\dots,X_{N-1}$，代表這個訊號裡「每個頻率成分佔多少」：

$$
X_k = \sum_{n=0}^{N-1} x_n \, e^{-2\pi i kn/N}
$$

直覺理解：$e^{-2\pi i kn/N}$ 這一串隨 $n$ 轉動的複數，等於是在問「$x_n$ 這組數列裡，有多少成分跟頻率為 $k$ 的振盪對得上」。

### 2. DFT 是一個酉變換

把 DFT 寫成矩陣形式 $X = Fx$，這個矩陣（乘上正規化常數 $1/\sqrt N$ 之後）滿足 $F^\dagger F = I$——DFT 本質上就是一個**酉算子**（第 4 課）。這正是它能被搬到量子力學框架裡的關鍵原因：量子態的演化本來就要求是酉的。

### 3. 週期性與頻率

如果原始訊號 $x_n$ 帶有週期 $r$（每隔 $r$ 個點重複一次），轉換後的 $X_k$ 會在對應頻率的位置出現尖峰。這個「從訊號找出隱藏週期」的能力，正是 QFT 之後會被用在 Shor 演算法裡的原因——只是操作對象從「一串數字」換成「量子態的機率幅」。

## 應用例子

古典世界裡，DFT 的高效計算演算法——快速傅立葉轉換（FFT，由 Cooley 與 Tukey 於 1965 年提出）——是整個數位訊號處理、音訊壓縮、影像處理領域的基礎工具，把原本 $O(N^2)$ 的計算複雜度降到 $O(N\log N)$。這個「找到更有效率的電路/演算法來實現同一個變換」的思路，跟後面 QFT 電路只需要 $O(n^2)$ 個量子閘（$n=\log_2 N$）就能完成，是類似的工程精神，但量子版本的效率提升更加驚人。

## 小結

- DFT 把訊號從時域轉到頻域：$X_k = \sum_n x_n e^{-2\pi i kn/N}$
- DFT（正規化後）是一個酉變換，這是它能對應到量子版本的關鍵
- 訊號裡的週期性會反映成頻域裡的尖峰，這個性質是 QFT 應用於週期尋找問題的基礎

### 檢核題

如果 $N=4$，$k=1$，$n=2$，$e^{-2\pi i kn/N}$ 的值是多少？

<details>
<summary>看答案</summary>

$e^{-2\pi i \cdot 1 \cdot 2/4} = e^{-i\pi} = -1$。

</details>

## 來源

1. Cooley, J. W. & Tukey, J. W., *"An Algorithm for the Machine Calculation of Complex Fourier Series"*, Mathematics of Computation (1965) — FFT 演算法的奠基性論文。
2. Oppenheim, A. V. & Schafer, R. W., *Discrete-Time Signal Processing* — DFT 與其性質的標準教材介紹。
3. Nielsen, M. A. & Chuang, I. L., *Quantum Computation and Quantum Information* — 第 5 章在引入 QFT 前，同樣先回顧經典 DFT 的定義。
