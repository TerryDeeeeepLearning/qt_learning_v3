/* ============================================================
   widgets-b.js — 第 7–13 課的互動元件
   ============================================================ */

import { C, M, GATES, State, gateP, dft, qftCircuitSteps, qftMatrix,
         modExp, findPeriod, gcd, fmtC } from './qmath.js';
import { el, slider, segmented, button, makeCanvas, readout, bigStat,
         hint, barChart, lineChart, CSSVAR, amplitudeTable } from './widget-kit.js';

const TAU = Math.PI * 2;

/* ------------------------------------------------------------
   7. 張量積：看維度指數成長 + 實際算出合併態
   ------------------------------------------------------------ */
export function tensorGrowth(mount) {
  const wrap = el('div', 'w-body');

  // --- 部分 A：維度成長 ---
  const nSlider = slider('量子位元數 n', {
    min: 1, max: 50, value: 3, step: 1, format: (v) => `${v}`,
  });
  const dimStat = bigStat('狀態空間維度 2ⁿ', '8', '需要 8 個複數才能描述');
  const cmpNote = el('div', 'w-note');
  const { canvas, ctx, w, h } = makeCanvas(340, 130);

  function humanize(n) {
    if (n < 1e4) return n.toLocaleString();
    if (n < 1e6) return `${(n / 1e3).toFixed(1)} 千`;
    if (n < 1e9) return `${(n / 1e6).toFixed(1)} 百萬`;
    if (n < 1e12) return `${(n / 1e9).toFixed(1)} 十億`;
    return n.toExponential(2);
  }

  function drawGrowth(n) {
    const series = [];
    for (let i = 1; i <= 50; i++) series.push(i);      // x
    ctx.clearRect(0, 0, w, h);
    const cyan = CSSVAR('--cyan') || '#4fd1e8';
    const amber = CSSVAR('--amber') || '#f2a65a';
    const dim = CSSVAR('--text-dim') || '#4b5670';
    const line = CSSVAR('--border') || '#232b40';

    const padL = 28, padR = 10, padT = 12, padB = 22;
    const plotW = w - padL - padR, plotH = h - padT - padB;

    // 用 log 尺度畫 2^n vs 2n
    const maxLog = 50 * Math.log2(2);   // = 50
    const X = (i) => padL + ((i - 1) / 49) * plotW;
    const Ylog = (val) => padT + plotH - (Math.log2(Math.max(1, val)) / maxLog) * plotH;

    ctx.strokeStyle = line; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT + plotH + .5); ctx.lineTo(w - padR, padT + plotH + .5);
    ctx.stroke();

    // 古典線性 2n
    ctx.beginPath();
    for (let i = 1; i <= 50; i++) {
      const y = Ylog(2 * i);
      i === 1 ? ctx.moveTo(X(i), y) : ctx.lineTo(X(i), y);
    }
    ctx.strokeStyle = dim; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.stroke();
    ctx.setLineDash([]);

    // 量子 2^n
    ctx.beginPath();
    for (let i = 1; i <= 50; i++) {
      const y = Ylog(Math.pow(2, i));
      i === 1 ? ctx.moveTo(X(i), y) : ctx.lineTo(X(i), y);
    }
    ctx.strokeStyle = cyan; ctx.lineWidth = 2.5; ctx.stroke();

    // 目前位置
    ctx.beginPath();
    ctx.arc(X(n), Ylog(Math.pow(2, n)), 5, 0, TAU);
    ctx.fillStyle = amber; ctx.fill();

    ctx.font = '10px ui-monospace, monospace';
    ctx.fillStyle = cyan; ctx.textAlign = 'left';
    ctx.fillText('2ⁿ（量子）', padL + 4, padT + 10);
    ctx.fillStyle = dim;
    ctx.fillText('2n（線性對照）', padL + 4, padT + 24);
    ctx.fillText('（縱軸為對數尺度）', padL + 4, h - 6);
  }

  function updateGrowth() {
    const n = nSlider.get();
    const dim = Math.pow(2, n);
    dimStat.set(humanize(dim));
    dimStat.setSub(`需要 ${humanize(dim)} 個複數才能完整描述`);

    let cmp;
    if (n <= 10) cmp = '一般筆電輕鬆處理。';
    else if (n <= 30) cmp = '古典電腦還模擬得動，但記憶體開始吃緊。';
    else if (n <= 45) cmp = '已經需要超級電腦等級的記憶體來儲存這個狀態向量。';
    else cmp = '超出目前任何古典超級電腦能完整儲存的範圍。';
    cmpNote.innerHTML = `<b>n = ${n}</b>：${cmp}
      注意對照線——如果維度只是線性成長（2n = ${2 * n}），古典模擬永遠不是問題。
      指數成長才是費曼 1982 年提出「用量子系統模擬量子系統」的原因。`;
    drawGrowth(n);
  }

  nSlider.input.addEventListener('input', updateGrowth);

  // --- 部分 B：實際算張量積 ---
  const divider = el('div', 'w-divider', '實際算一次張量積');
  const aSeg = segmented([
    { label: '|0⟩', value: 0 }, { label: '|1⟩', value: 1 },
    { label: '|+⟩', value: 2 }, { label: '|−⟩', value: 3 },
  ], 0);
  const bSeg = segmented([
    { label: '|0⟩', value: 0 }, { label: '|1⟩', value: 1 },
    { label: '|+⟩', value: 2 }, { label: '|−⟩', value: 3 },
  ], 2);

  const s2 = 1 / Math.SQRT2;
  const BASIS = [
    { name: '|0⟩', v: [C.make(1), C.make(0)] },
    { name: '|1⟩', v: [C.make(0), C.make(1)] },
    { name: '|+⟩', v: [C.make(s2), C.make(s2)] },
    { name: '|−⟩', v: [C.make(s2), C.make(-s2)] },
  ];

  const tprodOut = el('div', 'w-formula-live');
  const ampWrap = el('div');
  const ampTable = amplitudeTable([C.make(1), C.make(0), C.make(0), C.make(0)], 2, { showPhase: false });
  ampWrap.appendChild(ampTable.table);

  function updateTensor() {
    const A = BASIS[aSeg.get()], B = BASIS[bSeg.get()];
    // 手動張量積（2 維 ⊗ 2 維 = 4 維）
    const v = [
      C.mul(A.v[0], B.v[0]),
      C.mul(A.v[0], B.v[1]),
      C.mul(A.v[1], B.v[0]),
      C.mul(A.v[1], B.v[1]),
    ];
    const f = (z) => {
      const r = +z.re.toFixed(3);
      return Math.abs(r) < 1e-9 ? '0' : `${r}`;
    };
    tprodOut.innerHTML = `
      <div class="fl-line mono">${A.name} ⊗ ${B.name} =</div>
      <div class="fl-line mono hl">
        ${f(v[0])}|00⟩ + ${f(v[1])}|01⟩ + ${f(v[2])}|10⟩ + ${f(v[3])}|11⟩
      </div>`;
    ampTable.update(v);
  }

  aSeg.onChange(updateTensor);
  bSeg.onChange(updateTensor);

  const labelA = el('div', 'w-sublabel', '第一個量子位元');
  const labelB = el('div', 'w-sublabel', '第二個量子位元');

  wrap.append(nSlider.row, dimStat.box, canvas, cmpNote, divider,
    labelA, aSeg.row, labelB, bSeg.row, tprodOut, ampWrap,
    hint('這裡選出的組合全部都是「乘積態」——因為它們本來就是由兩個獨立的單量子位元態相乘而來。下一課會看到有些態根本拆不出來。'));
  mount.appendChild(wrap);
  updateGrowth();
  updateTensor();
}

/* ------------------------------------------------------------
   8. 糾纏檢測器：輸入態，判定可不可分離
   ------------------------------------------------------------ */
export function entanglementCheck(mount) {
  const wrap = el('div', 'w-body');

  const presets = [
    { label: '|00⟩', v: [1, 0, 0, 0], desc: '單純的乘積態' },
    { label: '|Φ⁺⟩ Bell', v: [1 / Math.SQRT2, 0, 0, 1 / Math.SQRT2], desc: '最經典的糾纏態' },
    { label: '|Ψ⁻⟩ Bell', v: [0, 1 / Math.SQRT2, -1 / Math.SQRT2, 0], desc: '反對稱 Bell 態' },
    { label: '|+⟩|0⟩', v: [1 / Math.SQRT2, 0, 1 / Math.SQRT2, 0], desc: '疊加但不糾纏' },
    { label: '|+⟩|+⟩', v: [0.5, 0.5, 0.5, 0.5], desc: '兩邊都疊加，仍不糾纏' },
  ];

  const seg = segmented(presets.map((p, i) => ({ label: p.label, value: i })), 0);

  const stateOut = el('div', 'w-formula-live');
  const verdict = el('div', 'w-verdict');
  const detBox = el('div', 'w-deriv-inline');

  // 測量關聯演示
  const corrDivider = el('div', 'w-divider', '測量關聯實驗');
  const corrBtnRow = el('div', 'w-btn-row');
  const runCorr = button('測量 200 次（兩個位元同時測）');
  const resetCorr = button('清空', 'w-btn ghost');
  corrBtnRow.append(runCorr, resetCorr);
  const { canvas, ctx, w, h } = makeCanvas(340, 160);
  const corrNote = el('div', 'w-note');
  let corrCounts = [0, 0, 0, 0];
  let corrTotal = 0;

  function currentVec() {
    return presets[seg.get()].v.map((x) => C.make(x, 0));
  }

  function drawCorr() {
    const probs = corrTotal
      ? corrCounts.map((c) => c / corrTotal)
      : [0, 0, 0, 0];
    barChart(ctx, w, h, probs, {
      labels: ['|00⟩', '|01⟩', '|10⟩', '|11⟩'],
      maxValue: 0.6,
    });
  }

  function update() {
    const p = presets[seg.get()];
    const v = currentVec();
    const f = (x) => {
      const r = +x.toFixed(3);
      return Math.abs(r) < 1e-9 ? '0' : `${r}`;
    };
    stateOut.innerHTML = `
      <div class="fl-line mono hl">
        |ψ⟩ = ${f(p.v[0])}|00⟩ + ${f(p.v[1])}|01⟩ + ${f(p.v[2])}|10⟩ + ${f(p.v[3])}|11⟩
      </div>
      <div class="fl-line dim">${p.desc}</div>`;

    // 可分離判定：ad − bc = 0
    const det = C.sub(C.mul(v[0], v[3]), C.mul(v[1], v[2]));
    const detVal = C.abs(det);
    const separable = detVal < 1e-8;

    verdict.className = `w-verdict ${separable ? 'sep' : 'ent'}`;
    verdict.innerHTML = separable
      ? '<span class="vmark">○</span> <b>可分離（乘積態）</b>　—　沒有糾纏'
      : '<span class="vmark">◆</span> <b>糾纏態</b>　—　無法拆成兩個獨立量子位元';

    detBox.innerHTML = `
      <div class="di-title">判定依據（可分離的充要條件）</div>
      <div class="di-step">
        若 |ψ⟩ = a|00⟩+b|01⟩+c|10⟩+d|11⟩ 能寫成
        (α₁|0⟩+β₁|1⟩) ⊗ (α₂|0⟩+β₂|1⟩)，
        則必然 a = α₁α₂、b = α₁β₂、c = β₁α₂、d = β₁β₂。
      </div>
      <div class="di-step">
        代入相乘：<span class="mono">ad = α₁α₂β₁β₂</span>，
        <span class="mono">bc = α₁β₂β₁α₂</span> —— 兩者<b>完全相同</b>。
        所以可分離 ⟺ <span class="mono hl">ad − bc = 0</span>。
      </div>
      <div class="di-step">
        目前這個態：<span class="mono">ad − bc = ${(+det.re.toFixed(4))}${Math.abs(det.im) > 1e-9 ? ` + ${(+det.im.toFixed(4))}i` : ''}</span>，
        絕對值 = <span class="mono hl">${detVal.toFixed(4)}</span>
        ${separable ? '→ 等於 0，可分離。' : '→ 不等於 0，<b>糾纏</b>。'}
      </div>`;

    corrCounts = [0, 0, 0, 0]; corrTotal = 0;
    drawCorr();
    corrNote.innerHTML = '按上面的按鈕，同時測量兩個量子位元 200 次，看結果的關聯模式。';
    corrNote.className = 'w-note';
  }

  runCorr.addEventListener('click', () => {
    const v = currentVec();
    for (let i = 0; i < 200; i++) {
      corrCounts[State.sample(v)]++;
      corrTotal++;
    }
    drawCorr();

    const p = presets[seg.get()];
    const det = C.abs(C.sub(C.mul(currentVec()[0], currentVec()[3]),
                            C.mul(currentVec()[1], currentVec()[2])));
    const sameCount = corrCounts[0] + corrCounts[3];
    const diffCount = corrCounts[1] + corrCounts[2];

    if (det > 1e-8) {
      corrNote.innerHTML = `結果只出現在特定組合上（相同：${sameCount} 次，相異：${diffCount} 次）。
        對 Bell 態來說，一旦測到第一個位元的值，<b>第二個位元的值就完全確定了</b>——
        這種關聯無法用「兩個各自獨立隨機的位元」來解釋，正是糾纏的實驗特徵。`;
      corrNote.className = 'w-note good';
    } else {
      corrNote.innerHTML = `四種組合都可能出現（相同：${sameCount} 次，相異：${diffCount} 次），
        兩個位元的結果<b>彼此獨立</b>——知道其中一個，對另一個沒有任何額外資訊。
        這就是乘積態的特徵。`;
      corrNote.className = 'w-note';
    }
  });
  resetCorr.addEventListener('click', () => {
    corrCounts = [0, 0, 0, 0]; corrTotal = 0; drawCorr();
  });

  seg.onChange(update);
  wrap.append(seg.row, stateOut, verdict, detBox, corrDivider, corrBtnRow, canvas, corrNote,
    hint('注意 |+⟩|+⟩：兩個位元都處在疊加態，看起來很「量子」，但它完全沒有糾纏——疊加和糾纏是兩件不同的事。'));
  mount.appendChild(wrap);
  update();
}

/* ------------------------------------------------------------
   9. DFT 頻譜探索器：畫訊號，即時看頻譜
   ------------------------------------------------------------ */
export function dftExplorer(mount) {
  const wrap = el('div', 'w-body');
  const N = 16;
  let signal = new Array(N).fill(0);

  const modeSeg = segmented([
    { label: '單一頻率', value: 'sine' },
    { label: '週期方波', value: 'square' },
    { label: '兩個頻率疊加', value: 'two' },
    { label: '自己畫', value: 'draw' },
  ], 0);

  const freqSlider = slider('頻率 k', {
    min: 1, max: 7, value: 2, step: 1, format: (v) => `${v}`,
  });
  const periodSlider = slider('週期 r', {
    min: 2, max: 8, value: 4, step: 1, format: (v) => `${v}`,
  });

  const sigCanvas = makeCanvas(340, 130);
  const specCanvas = makeCanvas(340, 150);
  const sigLabel = el('div', 'w-sublabel', '時域訊號 xₙ（點一下可以自己改）');
  const specLabel = el('div', 'w-sublabel', '頻域 |Xₖ|（DFT 之後）');
  const peakNote = el('div', 'w-note');

  function buildSignal() {
    const mode = modeSeg.get();
    const k = freqSlider.get();
    const r = periodSlider.get();
    if (mode === 'sine') {
      signal = Array.from({ length: N }, (_, n) => Math.cos((TAU * k * n) / N));
    } else if (mode === 'square') {
      signal = Array.from({ length: N }, (_, n) => (n % r < r / 2 ? 1 : -1));
    } else if (mode === 'two') {
      signal = Array.from({ length: N }, (_, n) =>
        Math.cos((TAU * k * n) / N) + 0.6 * Math.cos((TAU * (k + 3) * n) / N));
    }
    // draw 模式保留使用者畫的內容
  }

  function drawSignal() {
    const { ctx, w, h } = sigCanvas;
    ctx.clearRect(0, 0, w, h);
    const cyan = CSSVAR('--cyan') || '#4fd1e8';
    const line = CSSVAR('--border') || '#232b40';
    const dim = CSSVAR('--text-dim') || '#4b5670';

    const padL = 14, padR = 14, padT = 10, padB = 20;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const max = Math.max(1.8, ...signal.map(Math.abs));
    const X = (i) => padL + (i / (N - 1)) * plotW;
    const Y = (v) => padT + plotH / 2 - (v / max) * (plotH / 2);

    ctx.strokeStyle = line; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, Y(0)); ctx.lineTo(w - padR, Y(0));
    ctx.stroke();

    // 連線
    ctx.beginPath();
    signal.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
    ctx.strokeStyle = cyan; ctx.lineWidth = 2; ctx.stroke();

    // 點
    signal.forEach((v, i) => {
      ctx.beginPath(); ctx.arc(X(i), Y(v), 3.5, 0, TAU);
      ctx.fillStyle = cyan; ctx.fill();
    });

    ctx.fillStyle = dim; ctx.font = '10px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('n = 0', padL, h - 6);
    ctx.fillText(`n = ${N - 1}`, w - padR, h - 6);
  }

  function drawSpectrum() {
    const { ctx, w, h } = specCanvas;
    const spec = dft(signal.map((x) => C.make(x, 0)));
    const mags = spec.map((z) => C.abs(z) / N);
    const maxIdx = mags.indexOf(Math.max(...mags.slice(1, N / 2 + 1)));
    barChart(ctx, w, h, mags, {
      labels: mags.map((_, i) => `${i}`),
      highlight: maxIdx,
      maxValue: Math.max(...mags, 0.1),
      showValues: false,
    });

    // 提示
    const sorted = mags.map((m, i) => ({ m, i }))
      .slice(1, Math.floor(N / 2) + 1)
      .sort((a, b) => b.m - a.m);
    const top = sorted.slice(0, 2).filter((s) => s.m > 0.05);

    if (top.length === 0) {
      peakNote.innerHTML = '目前訊號沒有明顯的週期成分。';
      peakNote.className = 'w-note';
    } else if (top.length === 1 || top[1].m < top[0].m * 0.3) {
      const period = (N / top[0].i).toFixed(1);
      peakNote.innerHTML = `頻譜在 <b class="mono">k = ${top[0].i}</b> 出現單一尖峰，
        對應時域週期 <b>${period}</b> 個取樣點。
        <b>這就是 QFT 之所以能用來找週期的原理</b>——把「時域裡隱藏的週期」變成「頻域裡看得見的尖峰」。`;
      peakNote.className = 'w-note good';
    } else {
      peakNote.innerHTML = `頻譜出現兩個尖峰：<b class="mono">k = ${top[0].i}</b> 和
        <b class="mono">k = ${top[1].i}</b>，代表訊號裡混了兩個不同頻率的成分。
        DFT 把它們清楚地分離開來了。`;
      peakNote.className = 'w-note good';
    }
  }

  function update() {
    buildSignal();
    drawSignal();
    drawSpectrum();

    const mode = modeSeg.get();
    freqSlider.row.style.display = (mode === 'sine' || mode === 'two') ? '' : 'none';
    periodSlider.row.style.display = mode === 'square' ? '' : 'none';
    sigLabel.textContent = mode === 'draw'
      ? '時域訊號 xₙ（在圖上點擊或拖曳來改變數值）'
      : '時域訊號 xₙ';
  }

  // 自己畫模式
  let drawing = false;
  const handleDraw = (clientX, clientY) => {
    if (modeSeg.get() !== 'draw') return;
    const r = sigCanvas.canvas.getBoundingClientRect();
    const nx = (clientX - r.left) / r.width;
    const ny = (clientY - r.top) / r.height;
    const { w, h } = sigCanvas;
    const padL = 14, padR = 14, padT = 10, padB = 20;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const i = Math.round(((nx * w - padL) / plotW) * (N - 1));
    const val = -((ny * h - padT - plotH / 2) / (plotH / 2)) * 1.8;
    if (i >= 0 && i < N) {
      signal[i] = Math.max(-1.8, Math.min(1.8, val));
      drawSignal(); drawSpectrum();
    }
  };
  sigCanvas.canvas.style.touchAction = 'none';
  sigCanvas.canvas.addEventListener('mousedown', (e) => { drawing = true; handleDraw(e.clientX, e.clientY); });
  sigCanvas.canvas.addEventListener('mousemove', (e) => { if (drawing) handleDraw(e.clientX, e.clientY); });
  window.addEventListener('mouseup', () => { drawing = false; });
  sigCanvas.canvas.addEventListener('touchstart', (e) => {
    drawing = true; handleDraw(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault();
  }, { passive: false });
  sigCanvas.canvas.addEventListener('touchmove', (e) => {
    if (drawing) { handleDraw(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); }
  }, { passive: false });
  window.addEventListener('touchend', () => { drawing = false; });

  modeSeg.onChange(update);
  freqSlider.input.addEventListener('input', update);
  periodSlider.input.addEventListener('input', update);

  wrap.append(modeSeg.row, freqSlider.row, periodSlider.row,
    sigLabel, sigCanvas.canvas, specLabel, specCanvas.canvas, peakNote,
    hint('選「自己畫」模式，在上圖畫出任意波形，下面的頻譜會即時重算（真的在跑 DFT，不是預錄動畫）。試著畫一個有規律重複的圖形，看頻譜怎麼反應。'));
  mount.appendChild(wrap);
  update();
}

/* ------------------------------------------------------------
   10. 電路模擬器：拉閘門，即時看態演化
   ------------------------------------------------------------ */
export function circuitBuilder(mount) {
  const wrap = el('div', 'w-body');
  const n = 2;
  let ops = [];   // {type:'single'|'cnot', gate, target, control}

  const paletteLabel = el('div', 'w-sublabel', '點擊加入閘門（作用在 q0 / q1）');
  const palette = el('div', 'w-palette');

  const singleGates = [
    { name: 'H', g: GATES.H }, { name: 'X', g: GATES.X },
    { name: 'Z', g: GATES.Z }, { name: 'S', g: GATES.S },
  ];

  singleGates.forEach(({ name, g }) => {
    [0, 1].forEach((q) => {
      const b = button(`${name}<sub>q${q}</sub>`, 'w-gate-btn');
      b.addEventListener('click', () => {
        ops.push({ type: 'single', gate: g, name, target: q });
        update();
      });
      palette.appendChild(b);
    });
  });
  const cnotBtn = button('CNOT<sub>q0→q1</sub>', 'w-gate-btn cnot');
  cnotBtn.addEventListener('click', () => {
    ops.push({ type: 'cnot', name: 'CNOT', control: 0, target: 1 });
    update();
  });
  palette.appendChild(cnotBtn);

  const ctrlRow = el('div', 'w-btn-row');
  const undoBtn = button('← 移除最後一個', 'w-btn ghost sm');
  const clearBtn = button('清空', 'w-btn ghost sm');
  const bellBtn = button('★ 一鍵做出 Bell 態', 'w-btn sm');
  ctrlRow.append(bellBtn, undoBtn, clearBtn);

  const circuitView = el('div', 'w-circuit');
  const stateOut = el('div', 'w-formula-live');
  const { canvas, ctx, w, h } = makeCanvas(340, 150);
  const ampWrap = el('div');
  const ampTable = amplitudeTable(State.zeros(n), n);
  ampWrap.appendChild(ampTable.table);
  const analysisNote = el('div', 'w-note');

  function computeState() {
    let v = State.zeros(n);
    ops.forEach((op) => {
      if (op.type === 'single') {
        v = State.applySingle(v, op.gate, op.target, n);
      } else {
        v = State.applyControlled(v, GATES.X, op.control, op.target, n);
      }
    });
    return v;
  }

  function renderCircuit() {
    if (ops.length === 0) {
      circuitView.innerHTML = '<div class="w-circuit-empty">目前是空電路，狀態停在 |00⟩</div>';
      return;
    }
    const rows = [0, 1].map((q) => {
      const cells = ops.map((op) => {
        if (op.type === 'single') {
          return op.target === q
            ? `<span class="cg">${op.name}</span>`
            : '<span class="cw"></span>';
        }
        if (op.control === q) return '<span class="cc">●</span>';
        if (op.target === q) return '<span class="ct">⊕</span>';
        return '<span class="cw"></span>';
      }).join('');
      return `<div class="crow"><span class="clabel mono">q${q}</span>${cells}</div>`;
    }).join('');
    circuitView.innerHTML = rows;
  }

  function update() {
    renderCircuit();
    const v = computeState();
    const probs = State.probs(v);

    const terms = v.map((z, i) => ({ z, i, p: C.abs2(z) }))
      .filter((t) => t.p > 1e-9)
      .map((t) => {
        const re = +t.z.re.toFixed(3), im = +t.z.im.toFixed(3);
        let coef;
        if (Math.abs(im) < 1e-9) coef = `${re}`;
        else if (Math.abs(re) < 1e-9) coef = `${im}i`;
        else coef = `(${re}${im >= 0 ? '+' : '−'}${Math.abs(im)}i)`;
        return `${coef}|${State.label(t.i, n)}⟩`;
      });

    stateOut.innerHTML = `<div class="fl-line mono hl">|ψ⟩ = ${terms.join(' + ') || '0'}</div>`;
    barChart(ctx, w, h, probs, {
      labels: probs.map((_, i) => `|${State.label(i, n)}⟩`),
      maxValue: 1,
    });
    ampTable.update(v);

    // 分析：是不是糾纏？
    const det = C.abs(C.sub(C.mul(v[0], v[3]), C.mul(v[1], v[2])));
    if (ops.length === 0) {
      analysisNote.innerHTML = '加入閘門開始建構電路。試試看：先按 H(q0)，再按 CNOT。';
      analysisNote.className = 'w-note';
    } else if (det > 1e-8) {
      analysisNote.innerHTML = `✓ <b>目前是糾纏態</b>（ad − bc = ${det.toFixed(3)} ≠ 0）。
        兩個量子位元已經無法被獨立描述——你剛剛用電路<b>製造出了糾纏</b>。`;
      analysisNote.className = 'w-note good';
    } else {
      analysisNote.innerHTML = `目前是乘積態（ad − bc ≈ 0），兩個量子位元仍然彼此獨立。
        要製造糾纏，需要一個<b>雙量子位元閘</b>（例如 CNOT），而且控制位元必須先處於疊加態。`;
      analysisNote.className = 'w-note';
    }
  }

  undoBtn.addEventListener('click', () => { ops.pop(); update(); });
  clearBtn.addEventListener('click', () => { ops = []; update(); });
  bellBtn.addEventListener('click', () => {
    ops = [
      { type: 'single', gate: GATES.H, name: 'H', target: 0 },
      { type: 'cnot', name: 'CNOT', control: 0, target: 1 },
    ];
    update();
  });

  wrap.append(paletteLabel, palette, ctrlRow, circuitView, stateOut, canvas, ampWrap, analysisNote,
    hint('這個模擬器是真的在做矩陣運算，不是查表。任何你組出來的電路，機率分布都是實際算出來的。'));
  mount.appendChild(wrap);
  update();
}

/* ------------------------------------------------------------
   11. 相位閘與相位反衝
   ------------------------------------------------------------ */
export function phaseExplorer(mount) {
  const wrap = el('div', 'w-body');

  let theta = Math.PI / 2;
  let applyH = false;

  const tSlider = slider('相位角 θ', {
    min: 0, max: 628, value: 157, step: 1,
    format: (v) => `${(v / 100).toFixed(2)} rad`,
  });

  const hSeg = segmented([
    { label: '只加相位閘', value: false },
    { label: '相位閘後再做 H', value: true },
  ], 0);

  const stateOut = el('div', 'w-formula-live');
  const { canvas, ctx, w, h } = makeCanvas(340, 150);
  const keyNote = el('div', 'w-note');
  const specialNote = el('div', 'w-note');

  function compute() {
    // 從 |+> 出發
    let v = [C.make(1 / Math.SQRT2, 0), C.make(1 / Math.SQRT2, 0)];
    v = M.apply(gateP(theta), v);
    if (applyH) v = M.apply(GATES.H, v);
    return v;
  }

  function update() {
    const v = compute();
    const probs = [C.abs2(v[0]), C.abs2(v[1])];

    stateOut.innerHTML = `
      <div class="fl-line dim mono">起始態：|+⟩ = (|0⟩ + |1⟩)/√2</div>
      <div class="fl-line mono hl">
        結果：${fmtC(v[0])}|0⟩ + ${fmtC(v[1])}|1⟩
      </div>`;

    barChart(ctx, w, h, probs, {
      labels: ['|0⟩', '|1⟩'],
      maxValue: 1,
    });

    if (!applyH) {
      keyNote.innerHTML = `<b>不管 θ 怎麼變，P(0) 和 P(1) 永遠都是 50%。</b>
        相位確實被加進去了（看上面的機率幅，虛部有變化），
        但測量完全看不出來——這就是「相位在單獨測量時是隱形的」。`;
      keyNote.className = 'w-note focus';
    } else {
      keyNote.innerHTML = `加了 H 之後，<b>機率分布開始隨 θ 改變</b>了！
        P(0) = ${(probs[0] * 100).toFixed(1)}%，P(1) = ${(probs[1] * 100).toFixed(1)}%。
        H 閘讓 |0⟩ 和 |1⟩ 的分量互相干涉，把原本隱形的相位<b>轉換成了可測量的機率差異</b>。`;
      keyNote.className = 'w-note good';
    }

    // 特殊角度提示
    const deg = ((theta * 180) / Math.PI) % 360;
    if (Math.abs(theta - Math.PI) < 0.05) {
      specialNote.innerHTML = 'θ = π 時，相位閘 P(π) 就等於 <b>Pauli-Z</b> 閘。';
      specialNote.className = 'w-note';
      specialNote.style.display = '';
    } else if (Math.abs(theta - Math.PI / 2) < 0.05) {
      specialNote.innerHTML = 'θ = π/2 時，相位閘 P(π/2) 就是 <b>S 閘</b>。';
      specialNote.className = 'w-note';
      specialNote.style.display = '';
    } else if (Math.abs(theta - Math.PI / 4) < 0.05) {
      specialNote.innerHTML = 'θ = π/4 時，相位閘 P(π/4) 就是 <b>T 閘</b>——通用閘集 {H, T, CNOT} 裡的那個 T。';
      specialNote.className = 'w-note';
      specialNote.style.display = '';
    } else {
      specialNote.style.display = 'none';
    }
  }

  tSlider.input.addEventListener('input', () => { theta = tSlider.get() / 100; update(); });
  hSeg.onChange((v) => { applyH = v; update(); });

  wrap.append(hSeg.row, tSlider.row, stateOut, canvas, keyNote, specialNote,
    hint('這是整個量子演算法設計的核心機制：先用相位閘把資訊「寫進相位」，再用 H 之類的閘讓它干涉、轉換成測量得到的機率。QFT 做的正是這件事的大規模版本。'));
  mount.appendChild(wrap);
  update();
}

/* ------------------------------------------------------------
   12. QFT 逐步演示器：一步一步看電路怎麼把態轉過去
   ------------------------------------------------------------ */
export function qftStepper(mount) {
  const wrap = el('div', 'w-body');

  let n = 3;
  let inputIdx = 1;
  let stepIdx = 0;
  let steps = [];

  const nSeg = segmented([
    { label: '2 位元', value: 2 },
    { label: '3 位元', value: 3 },
  ], 1);

  const inSlider = slider('輸入基底態 |j⟩', {
    min: 0, max: 7, value: 1, step: 1,
    format: (v) => `|${v}⟩`,
  });

  const stepLabel = el('div', 'w-step-label');
  const stepBar = el('div', 'w-stepbar');
  const btnRow = el('div', 'w-btn-row');
  const prevBtn = button('← 上一步', 'w-btn ghost sm');
  const nextBtn = button('下一步 →', 'w-btn sm');
  const endBtn = button('跳到結果', 'w-btn ghost sm');
  btnRow.append(prevBtn, nextBtn, endBtn);

  const magCanvas = makeCanvas(340, 130);
  const phaseCanvas = makeCanvas(340, 130);
  const magLabel = el('div', 'w-sublabel', '機率幅大小 |amplitude|');
  const phaseLabel = el('div', 'w-sublabel', '相位（顏色環）');
  const verifyNote = el('div', 'w-note');

  function rebuild() {
    const dim = 1 << n;
    inSlider.input.max = dim - 1;
    if (inputIdx >= dim) inputIdx = dim - 1;
    inSlider.input.value = inputIdx;
    inSlider.sync();

    const init = Array.from({ length: dim }, (_, i) =>
      i === inputIdx ? C.make(1, 0) : C.make(0, 0));
    steps = qftCircuitSteps(init, n);
    stepIdx = 0;
    update();
  }

  function drawPhases(v) {
    const { ctx, w, h } = phaseCanvas;
    ctx.clearRect(0, 0, w, h);
    const dim = v.length;
    const dimC = CSSVAR('--text-dim') || '#4b5670';
    const cell = Math.min(38, (w - 20) / dim);
    const y = h / 2 - 6;

    v.forEach((z, i) => {
      const mag = C.abs(z);
      const phase = Math.atan2(z.im, z.re);
      const x = 10 + cell * i + cell / 2;
      // 用色相表示相位
      const hue = ((phase + Math.PI) / TAU) * 360;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(3, cell * 0.32), 0, TAU);
      ctx.fillStyle = mag < 1e-6 ? '#1a2236' : `hsl(${hue}, 70%, 58%)`;
      ctx.fill();
      // 相位指針
      if (mag > 1e-6) {
        const r = cell * 0.32;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(-phase) * r, y + Math.sin(-phase) * r);
        ctx.strokeStyle = '#0b0f19';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.fillStyle = dimC;
      ctx.font = '9px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`|${State.label(i, n)}⟩`, x, h - 8);
    });
  }

  function update() {
    const step = steps[stepIdx];
    if (!step) return;
    const v = step.state;

    stepLabel.innerHTML = `<span class="sl-idx mono">步驟 ${stepIdx} / ${steps.length - 1}</span>
      <span class="sl-text">${step.label}</span>`;

    // 進度條
    stepBar.innerHTML = steps.map((s, i) =>
      `<span class="sb-dot ${i === stepIdx ? 'on' : i < stepIdx ? 'done' : ''}"></span>`
    ).join('');

    const mags = v.map((z) => C.abs(z));
    barChart(magCanvas.ctx, magCanvas.w, magCanvas.h, mags, {
      labels: mags.map((_, i) => `|${State.label(i, n)}⟩`),
      maxValue: 1,
      showValues: false,
    });
    drawPhases(v);

    // 最後一步驗證
    if (stepIdx === steps.length - 1) {
      const expected = M.apply(qftMatrix(n), steps[0].state);
      let maxErr = 0;
      v.forEach((z, i) => {
        maxErr = Math.max(maxErr, C.abs(C.sub(z, expected[i])));
      });
      verifyNote.innerHTML = `✓ <b>電路輸出已與 QFT 定義式比對完畢</b>，
        最大誤差 = <span class="mono">${maxErr.toExponential(2)}</span>（浮點誤差等級）。
        也就是說：「H 閘 + 受控相位閘」這個電路，確實實現了
        <span class="mono">QFT|j⟩ = (1/√N)·Σₖ e^(2πijk/N)·|k⟩</span> 這個定義。
        <br><br>注意最終結果：所有基底態的<b>大小完全相同</b>（均勻分布），
        資訊全部編碼在<b>相位</b>裡——這正是為什麼 QFT 之後不能直接測量了事，
        必須設計後續步驟把相位資訊轉換出來。`;
      verifyNote.className = 'w-note good';
    } else {
      verifyNote.innerHTML = `目前套用的閘：<b class="mono">${step.gate || '（尚未開始）'}</b>。
        注意看下面的相位圖——每個受控相位閘都在把某一位元的資訊「寫入」相位角度。`;
      verifyNote.className = 'w-note';
    }

    prevBtn.disabled = stepIdx === 0;
    nextBtn.disabled = stepIdx === steps.length - 1;
  }

  nSeg.onChange((v) => { n = v; inputIdx = Math.min(inputIdx, (1 << v) - 1); rebuild(); });
  inSlider.input.addEventListener('input', () => { inputIdx = inSlider.get(); rebuild(); });
  prevBtn.addEventListener('click', () => { if (stepIdx > 0) { stepIdx--; update(); } });
  nextBtn.addEventListener('click', () => { if (stepIdx < steps.length - 1) { stepIdx++; update(); } });
  endBtn.addEventListener('click', () => { stepIdx = steps.length - 1; update(); });

  wrap.append(nSeg.row, inSlider.row, stepLabel, stepBar, btnRow,
    magLabel, magCanvas.canvas, phaseLabel, phaseCanvas.canvas, verifyNote,
    hint('相位圖的顏色代表相位角度、黑色指針指向相位方向。一步一步按「下一步」，看著資訊如何從「哪個基底態有振幅」轉移到「每個基底態的相位是多少」。'));
  mount.appendChild(wrap);
  rebuild();
}

/* ------------------------------------------------------------
   13. Shor 週期尋找演示
   ------------------------------------------------------------ */
export function shorDemo(mount) {
  const wrap = el('div', 'w-body');

  let N = 15, a = 7;

  const nSeg = segmented([
    { label: 'N = 15', value: 15 },
    { label: 'N = 21', value: 21 },
    { label: 'N = 33', value: 33 },
  ], 0);

  const aSlider = slider('底數 a', {
    min: 2, max: 14, value: 7, step: 1, format: (v) => `${v}`,
  });

  const gcdNote = el('div', 'w-note');
  const seqLabel = el('div', 'w-sublabel', 'f(x) = aˣ mod N 的數值序列');
  const seqCanvas = makeCanvas(340, 130);
  const periodStat = bigStat('找到的週期 r', '—', '');
  const specLabel = el('div', 'w-sublabel', 'QFT 之後的測量機率分布');
  const specCanvas = makeCanvas(340, 140);
  const factorBox = el('div', 'w-deriv-inline');

  function update() {
    N = nSeg.get();
    aSlider.input.max = N - 1;
    if (a >= N) { a = N - 1; aSlider.input.value = a; aSlider.sync(); }
    a = aSlider.get();

    const g = gcd(a, N);
    if (g > 1) {
      gcdNote.innerHTML = `⚠ gcd(${a}, ${N}) = <b>${g}</b> ≠ 1。
        運氣好，不用跑量子部分——直接用古典的歐幾里得演算法就找到因數 ${g} 了。
        請換一個 a，才能看到量子演算法真正派上用場的情況。`;
      gcdNote.className = 'w-note warn';
      periodStat.set('—'); periodStat.setSub('（此情況不需要量子步驟）');
      seqCanvas.ctx.clearRect(0, 0, seqCanvas.w, seqCanvas.h);
      specCanvas.ctx.clearRect(0, 0, specCanvas.w, specCanvas.h);
      factorBox.innerHTML = `<div class="di-title">古典捷徑</div>
        <div class="di-step">gcd(${a}, ${N}) = ${g}，所以 ${N} = ${g} × ${N / g}。分解完成，不需要量子電腦。</div>`;
      return;
    }

    gcdNote.innerHTML = `gcd(${a}, ${N}) = 1（互質）✓
      沒有古典捷徑，接下來要靠量子步驟找出 f(x) = ${a}ˣ mod ${N} 的<b>週期 r</b>。`;
    gcdNote.className = 'w-note';

    // 序列
    const L = 32;
    const seq = Array.from({ length: L }, (_, x) => modExp(a, x, N));
    const r = findPeriod(a, N);

    // 畫序列
    const { ctx, w, h } = seqCanvas;
    ctx.clearRect(0, 0, w, h);
    const cyan = CSSVAR('--cyan') || '#4fd1e8';
    const amber = CSSVAR('--amber') || '#f2a65a';
    const dimC = CSSVAR('--text-dim') || '#4b5670';
    const line = CSSVAR('--border') || '#232b40';

    const padL = 16, padR = 10, padT = 12, padB = 22;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const maxV = Math.max(...seq);
    const X = (i) => padL + (i / (L - 1)) * plotW;
    const Y = (v) => padT + plotH - (v / maxV) * plotH;

    ctx.strokeStyle = line; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, padT + plotH + .5);
    ctx.lineTo(w - padR, padT + plotH + .5); ctx.stroke();

    // 週期分隔線
    if (r) {
      for (let k = 0; k * r < L; k++) {
        ctx.beginPath();
        ctx.moveTo(X(k * r), padT); ctx.lineTo(X(k * r), padT + plotH);
        ctx.strokeStyle = amber; ctx.globalAlpha = 0.25;
        ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }
    }

    ctx.beginPath();
    seq.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
    ctx.strokeStyle = cyan; ctx.lineWidth = 1.8; ctx.stroke();
    seq.forEach((v, i) => {
      ctx.beginPath(); ctx.arc(X(i), Y(v), 2.6, 0, TAU);
      ctx.fillStyle = cyan; ctx.fill();
    });

    ctx.fillStyle = dimC; ctx.font = '10px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`x = 0 → ${L - 1}`, padL, h - 6);
    if (r) {
      ctx.fillStyle = amber;
      ctx.textAlign = 'right';
      ctx.fillText(`每 ${r} 個重複一次`, w - padR, h - 6);
    }

    periodStat.set(r ? `r = ${r}` : '—');
    periodStat.setSub(r ? `f(x) 每 ${r} 步重複一次` : '找不到週期');

    // QFT 之後的頻譜（模擬：在 k ≈ M·s/r 的位置出現尖峰）
    const M = 64;
    const spec = new Array(M).fill(0);
    if (r) {
      for (let k = 0; k < M; k++) {
        // 標準的週期性訊號經 QFT 後的振幅包絡
        let sum = C.make(0, 0);
        const reps = Math.floor(M / r);
        for (let t = 0; t < reps; t++) {
          sum = C.add(sum, C.expi((TAU * k * t * r) / M));
        }
        spec[k] = C.abs2(sum) / (reps * reps);
      }
    }
    const maxSpec = Math.max(...spec, 1e-9);
    const normSpec = spec.map((s) => s / maxSpec);
    barChart(specCanvas.ctx, specCanvas.w, specCanvas.h, normSpec, {
      labels: [],
      maxValue: 1,
      showValues: false,
    });

    // 後處理推導
    if (r) {
      const even = r % 2 === 0;
      const half = modExp(a, r / 2, N);
      const f1 = gcd(half - 1, N), f2 = gcd(half + 1, N);
      const success = even && half !== N - 1 && (f1 > 1 && f1 < N || f2 > 1 && f2 < N);

      factorBox.innerHTML = `
        <div class="di-title">古典後處理：從週期 r 推出質因數</div>
        <div class="di-step"><span class="di-tag">Step 1</span>
          量子部分（QFT + 測量）給出週期 <span class="mono hl">r = ${r}</span>。
          上面的頻譜圖顯示測量結果會集中在 k ≈ M·s/r 的位置，
          再用連分數演算法就能反推出 r。</div>
        <div class="di-step"><span class="di-tag">Step 2</span>
          檢查 r 是否為偶數：<b>${even ? `${r} 是偶數 ✓` : `${r} 是奇數 ✗ — 這次失敗，要換一個 a 重來`}</b>
          ${even ? '' : '（這正是為什麼 Shor 演算法是機率性的，可能需要重試）'}</div>
        ${even ? `
        <div class="di-step"><span class="di-tag">Step 3</span>
          計算 <span class="mono">a^(r/2) mod N = ${a}^${r / 2} mod ${N} = <b class="hl">${half}</b></span>
          ${half === N - 1 ? '<br>⚠ 等於 N−1，這次也失敗，要換 a 重來。' : ''}</div>` : ''}
        ${even && half !== N - 1 ? `
        <div class="di-step"><span class="di-tag">Step 4</span>
          計算最大公因數：<br>
          <span class="mono">gcd(${half} − 1, ${N}) = gcd(${half - 1}, ${N}) = <b class="hl">${f1}</b></span><br>
          <span class="mono">gcd(${half} + 1, ${N}) = gcd(${half + 1}, ${N}) = <b class="hl">${f2}</b></span></div>
        <div class="di-step ${success ? 'good' : ''}"><span class="di-tag">結果</span>
          ${success
            ? `✓ <b>分解成功：${N} = ${f1 > 1 && f1 < N ? f1 : f2} × ${N / (f1 > 1 && f1 < N ? f1 : f2)}</b>`
            : '這組 a 沒能得到非平凡因數，需要換 a 重試。'}</div>` : ''}`;
    }
  }

  nSeg.onChange(update);
  aSlider.input.addEventListener('input', update);

  wrap.append(nSeg.row, aSlider.row, gcdNote, seqLabel, seqCanvas.canvas, periodStat.box,
    specLabel, specCanvas.canvas, factorBox,
    hint('拖動 a 試不同的底數。你會發現有些 a 會失敗（週期是奇數，或 a^(r/2) ≡ −1）——Shor 演算法本來就是機率性的，實際執行時會多試幾個 a。'));
  mount.appendChild(wrap);
  update();
}
