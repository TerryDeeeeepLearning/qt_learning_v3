---
id: entanglement-bell-states
title: 量子糾纏與 Bell 態
order: 8
track: basics
estMinutes: 12
---

## 動機

「糾纏」大概是量子計算裡被誤解最多的詞。這一課用上一課的張量積工具，把糾纏講成一個精確的數學陳述，而不是「兩個粒子神秘連動」這種模糊說法。

## 先備知識回顧

多量子位元的乘積態 $|\psi_1\rangle\otimes|\psi_2\rangle$（第 7 課）——這一課要講的正是「寫不成這種形式」的狀態。

## 核心概念與推導

### 1. 糾纏態的定義

一個雙量子位元態 $|\psi\rangle$ 若**無法**寫成 $|\psi_1\rangle\otimes|\psi_2\rangle$ 的形式（任何單量子位元態的組合都不行），就稱為糾纏態。最經典的例子是 **Bell 態**：

$$
|\Phi^+\rangle = \frac{1}{\sqrt2}(|00\rangle + |11\rangle)
$$

可以證明：不存在任何 $\alpha_1,\beta_1,\alpha_2,\beta_2$ 使得 $|\Phi^+\rangle = (\alpha_1|0\rangle+\beta_1|1\rangle)\otimes(\alpha_2|0\rangle+\beta_2|1\rangle)$——因為展開後一定會有 $|01\rangle,|10\rangle$ 的分量，跟 $|\Phi^+\rangle$ 對不上。

四個 Bell 態構成一組正交基底：

$$
|\Phi^\pm\rangle = \tfrac{1}{\sqrt2}(|00\rangle\pm|11\rangle),\qquad
|\Psi^\pm\rangle = \tfrac{1}{\sqrt2}(|01\rangle\pm|10\rangle)
$$

### 2. 糾纏態的關聯性

對 $|\Phi^+\rangle$ 測量第一個量子位元，不管結果是 0 還是 1，第二個量子位元會立刻「確定」是同一個值——但這不是超光速傳訊息（沒有辦法用這個機制單方面傳遞可控制的資訊），而是兩邊的測量結果存在古典機率論無法完全解釋的統計關聯。這個關聯性可以用 Bell 不等式量化檢驗，實驗上也確實觀測到違反 Bell 不等式的結果，證實這種關聯是量子力學特有、無法用「隱變數」理論解釋的。

### 3. 糾纏跟疊加不是同一件事

單一量子位元的疊加態（第 5 課）跟糾纏是兩個不同概念：疊加是單一系統的性質，糾纏是**多個系統之間**沒辦法被拆開描述的性質。一個系統可以疊加但不糾纏（乘積態裡每個分量各自疊加），也可以糾纏。

## 應用例子

Bell 態是量子隱形傳態（quantum teleportation）與超密編碼（superdense coding）等經典協議的核心資源，也是後續變分量子演算法（如 VQE、QAOA）裡「線路表達能力（expressivity）」討論中，糾纏層（entangling layer）要達成的效果——這條主線後面會直接碰到。

## 小結

- 糾纏態無法寫成單一量子位元態的張量積乘積
- Bell 態是最基本的雙量子位元糾纏態範例，四個構成一組正交基底
- 糾纏對應的統計關聯已被實驗證實無法用古典隱變數理論解釋
- 疊加是單一系統的性質，糾纏是系統之間的性質，兩者不同

### 檢核題

$|01\rangle$ 是糾纏態嗎？

<details>
<summary>看答案</summary>

不是。$|01\rangle = |0\rangle \otimes |1\rangle$，本身就是一個乘積態，兩個量子位元完全獨立，沒有糾纏。

</details>

## 來源

1. Nielsen, M. A. & Chuang, I. L., *Quantum Computation and Quantum Information* — 第 2 章對糾纏態與 Bell 態的標準定義。
2. Bell, J. S., *"On the Einstein Podolsky Rosen Paradox"*, Physics Physique Физика (1964) — 提出 Bell 不等式的奠基性論文。
3. Aspect, A., Grangier, P. & Roger, G., *"Experimental Realization of Einstein-Podolsky-Rosen-Bohm Gedankenexperiment"*, Physical Review Letters (1982) — 早期驗證違反 Bell 不等式的重要實驗之一。
