# 量子軌跡 Quantum Trace

互動式量子計算學習 PWA。部署在 GitHub Pages，可加到 iPhone 主畫面、**完全離線可用**。

**基礎到 QFT 主線，13 課全部完成**，每一課都有互動實驗、逐步公式推導、手算範例、檢核題與來源標註。

---

## 這次改版做了什麼

原本每課是一篇 markdown 長文。量子這種抽象主題純文字讀不動，所以**底層架構整個換掉**：

| | 改版前 | 改版後 |
|---|---|---|
| 課程格式 | Markdown | HTML + 可掛載互動元件 |
| 互動性 | 無 | **13 個互動元件**，每課一個 |
| 公式 | 靜態顯示 | 靜態 + **即時計算回饋** |
| 推導 | 條列結論 | **逐步展開推導**（可摺疊） |
| 檢核 | 折疊答案 | **可作答的選擇題 + 解釋** |
| KaTeX | CDN 載入 | **本地打包**（離線可用） |

### 核心原則：所有計算都是真的

互動元件不是預錄動畫。電路模擬器真的在做矩陣乘法、測量模擬器真的依 Born 規則抽樣、
DFT 探索器真的在跑 16 點 DFT、QFT 演示器真的在執行 H + 受控相位閘電路。

---

## 檔案結構

```
quantum-app/
├── index.html            進入點
├── style.css             視覺系統
├── main.js               載入、路由、進度、測驗
├── qmath.js              ★ 量子數學引擎（複數/矩陣/態向量/量子閘/DFT/QFT/Shor）
├── widget-kit.js         ★ 互動元件共用零件（滑桿/canvas/圖表/拖曳）
├── widgets-a.js          ★ 第 1–6 課的互動元件
├── widgets-b.js          ★ 第 7–13 課的互動元件
├── widgets.js            元件註冊表
├── vendor/katex/         本地 KaTeX（離線公式渲染，604KB）
├── sw.js                 Service Worker（離線快取）
├── manifest.json         PWA 設定
├── .nojekyll             避免 GitHub Pages 用 Jekyll 處理檔案
├── .github/workflows/    GitHub Actions 自動部署
├── icons/                App 圖示
└── content/
    ├── index.json        課程清單 + 前置關係（知識樹資料來源）
    └── lessons-html/     13 課的內容
```

## 13 個互動元件

| 課 | 元件 | 你可以做什麼 |
|---|---|---|
| 1 | 複數平面 | 拖曳箭頭、按「× i」看它轉 90 度 |
| 2 | 內積探索器 | 拖兩個態向量，看內積與正交 |
| 3 | 矩陣檢查器 | 驗證 Hermitian / 酉，解出特徵值 |
| 4 | 酉算子驗證 | 轉任意角度，確認長度永遠不變 |
| 5 | Bloch 球 | 拖 θ、φ，看相位如何「隱形」 |
| 6 | 測量模擬器 | 實跑 1000 次測量，看統計收斂 |
| 7 | 張量積 | 把 n 拉到 50，看維度指數爆炸 |
| 8 | 糾纏判定器 | 即時算 ad−bc，跑測量關聯實驗 |
| 9 | DFT 頻譜 | **自己畫訊號**，即時看頻譜變化 |
| 10 | 電路模擬器 | 自己搭電路，親手做出 Bell 態 |
| 11 | 相位干涉 | 看 H 閘如何把相位逼成可測量的機率 |
| 12 | QFT 逐步演示 | 一步步執行電路，與定義式比對驗證 |
| 13 | Shor 流程 | 跑完整流程，含會失敗的情況 |

## 知識樹

兩條分支平行進行，在第 12 課匯流：

- **分支 A（獨立線）**：虛數 i → 經典 DFT
- **分支 B（主線）**：虛數 i → 向量空間/內積 → Hermitian → 酉算子 → 量子位元 →
  測量公設 → 張量積 → 糾纏 → 量子閘電路 → 相位閘
- **匯流**：分支 A + 分支 B → **QFT 推導** → Shor 演算法應用

`classical-dft` 只依賴第 1 課，可與量子主線平行學習。

---

## 驗證紀錄

### 數學正確性（52 項測試全數通過）

課程裡**每一個數值斷言**都寫成自動化測試驗證過：

- **QFT 電路 vs 定義式**：n=1,2,3 全部比對，最大誤差 **1.4e-15**
- 第 9 課「N=2 的 DFT 就是 Hadamard 閘」→ 成立
- 第 10 課「H+CNOT 產生糾纏、單獨 CNOT 不會」→ 兩者皆成立
- 第 11 課「P(θ) 後接 H 得 P(0)=cos²(θ/2)」→ 五個角度全對
- 第 12 課「H 閘數 = n，受控相位閘數 = n(n−1)/2」→ n=2,3,4 全對
- 第 13 課「有些 a 會失敗」→ a=14 確實失敗（a^(r/2)≡−1），與課程說法一致
- Pauli X/Y/Z 特徵值皆為 ±1、糾纏判定式對四種態皆正確

### 瀏覽器實測（390×844 手機視窗）

- 13 課全部載入成功，**464 個公式全部渲染，零殘留原始碼**
- 13 個互動元件全部掛載成功，零 console 錯誤、零資源 404
- 互動實測：點「× i」→ `0.866+0.5i` 變成 `-0.5+0.866i`（正好轉 90 度 ✓）
- 測驗可作答並顯示解釋、完成後 streak 與解鎖狀態正確更新

---

## 部署

1. 把 `quantum-app/` 底下所有檔案 push 到 repo 根目錄
2. Settings → Pages → Source 選 **GitHub Actions**
3. Actions 分頁看部署狀態，跑完會給網址
4. iPhone Safari 開啟 → 分享 → **加入主畫面**

> **注意**：`.nojekyll` 和 `.github/workflows/deploy.yml` 是隱藏檔，
> 用檔案總管拖曳上傳容易漏掉。若漏了，直接在 GitHub 網頁用
> `Add file → Create new file` 補建。

### 本機預覽

```bash
cd quantum-app
python3 -m http.server 8000
```

必須用伺服器開啟，不能直接雙擊 `index.html`——ES module 在 `file://` 下會被瀏覽器擋掉。

---

## 新增課程

1. 在 `content/lessons-html/` 新增 `<id>.html`
2. 在 `content/index.json` 加一筆（`id`、`order`、`prereqs`、`hook`）
3. 若需要新的互動元件：寫在 `widgets-a.js` 或 `widgets-b.js`，
   到 `widgets.js` 註冊，課程裡用 `<div class="widget" data-widget="名稱"></div>` 掛載

不需要任何建置流程，push 上去就生效。

### 課程 HTML 可用的區塊

| class | 用途 |
|---|---|
| `.lsec` + `.sec-label` | 章節與標籤 |
| `.formula-box` | 公式盒（金色左邊框） |
| `details.deriv` | 可摺疊推導（`.step` + `.tag` 分步） |
| `.example-box` | 手算範例（綠色） |
| `.key-insight` | 關鍵洞察（紫色） |
| `.caveat-box` | 但書／限制說明（橘色） |
| `.widget[data-widget]` | 互動元件掛載點 |
| `.quiz[data-quiz]` | 選擇題（JSON 格式） |

寫互動元件時若標籤含 LaTeX，記得用 `String.raw` 包住，
否則 `\theta` 的反斜線會被 JavaScript 當成跳脫字元吃掉（`\t` 是 TAB）。

---

## 已知限制（刻意的取捨）

- **無跨裝置同步**：進度存在 `localStorage`，換裝置或清瀏覽器資料會重置。這是先前確認過的決定。
- **知識樹是線性呈現**：`qft-derivation` 實際有兩個前置條件，但畫面上仍是直線排列，
  不是視覺化的分支圖。要做真正的分支圖需改用 SVG 繪製，屬於 V2 項目。
- **內容範圍**：目前只有「基礎到 QFT」這一條主線。
  下一條建議做量子機器學習（VQE、QAOA）。
- **網頁字型為選配**：Space Grotesk / IBM Plex Mono 從 Google Fonts 載入，
  離線時會退回系統字型（iOS 上是 PingFang TC），不影響閱讀。
  **公式渲染不受影響**，因為 KaTeX 是本地打包的。
