/* ============================================================
   widget-kit.js — 互動元件的共用零件
   ============================================================ */

export const CSSVAR = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

/** 標準滑桿列：回傳 { row, input, chip, get() } */
export function slider(labelText, { min, max, value, step = 1, format }) {
  const row = el('div', 'w-ctrl');
  const label = el('label', null, labelText);
  const input = el('input');
  input.type = 'range';
  input.min = min; input.max = max; input.value = value; input.step = step;
  const chip = el('span', 'w-chip');

  const fmt = format || ((v) => v.toFixed(2));
  const sync = () => { chip.textContent = fmt(parseFloat(input.value)); };
  input.addEventListener('input', sync);
  sync();

  row.append(label, input, chip);
  return { row, input, chip, get: () => parseFloat(input.value), sync };
}

/** 分段按鈕組：回傳 { row, get(), onChange(fn) } */
export function segmented(options, initial = 0) {
  const row = el('div', 'w-seg');
  let current = options[initial].value;
  const handlers = [];
  options.forEach((opt, i) => {
    const b = el('button', i === initial ? 'on' : '', opt.label);
    b.addEventListener('click', () => {
      current = opt.value;
      [...row.children].forEach((c) => c.classList.remove('on'));
      b.classList.add('on');
      handlers.forEach((h) => h(current));
    });
    row.appendChild(b);
  });
  return { row, get: () => current, onChange: (fn) => handlers.push(fn) };
}

export function button(text, cls = 'w-btn') {
  return el('button', cls, text);
}

/** 高解析度 canvas（處理 devicePixelRatio，避免手機上糊掉） */
export function makeCanvas(w, h) {
  const canvas = el('canvas');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = '100%';
  canvas.style.maxWidth = w + 'px';
  canvas.style.height = 'auto';
  canvas.style.aspectRatio = `${w} / ${h}`;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { canvas, ctx, w, h };
}

/** 在元素內渲染 KaTeX 公式（行內） */
export function tex(latex, displayMode = false) {
  const span = el('span');
  try {
    katex.render(latex, span, { displayMode, throwOnError: false });
  } catch {
    span.textContent = latex;
  }
  return span;
}

/** 渲染整塊含 $...$ 的內容 */
export function renderMath(container) {
  if (window.renderMathInElement) {
    renderMathInElement(container, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
      ],
      throwOnError: false,
    });
  }
}

/** 數值讀數區塊 */
export function readout(labelText, initial = '—') {
  const box = el('div', 'w-readout');
  const lab = el('div', 'w-readout-label', labelText);
  const val = el('div', 'w-readout-value', initial);
  box.append(lab, val);
  if (labelText.includes('$')) renderMath(lab);   // 標籤裡的 $...$ 也要渲染成公式
  return { box, set: (v) => { val.innerHTML = v; }, el: val };
}

/** 大數字讀數 */
export function bigStat(labelText, initial = '—', sub = '') {
  const box = el('div', 'w-stat');
  const lab = el('div', 'w-stat-label', labelText);
  if (labelText.includes('$')) renderMath(lab);
  const val = el('div', 'w-stat-big', initial);
  const s = el('div', 'w-stat-sub', sub);
  box.append(lab, val, s);
  return { box, set: (v) => { val.innerHTML = v; }, setSub: (v) => { s.innerHTML = v; } };
}

/** 提示列 */
export function hint(text) {
  return el('div', 'w-hint', text);
}

/** 條形圖（機率分布用），純 canvas 手繪，不依賴圖表函式庫 */
export function barChart(ctx, w, h, data, opts = {}) {
  const {
    labels = [],
    color = CSSVAR('--cyan') || '#4fd1e8',
    highlight = -1,
    highlightColor = CSSVAR('--amber') || '#f2a65a',
    maxValue = null,
    showValues = true,
  } = opts;

  ctx.clearRect(0, 0, w, h);
  const n = data.length;
  if (!n) return;

  const padL = 8, padR = 8, padT = 18, padB = 26;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const max = maxValue !== null ? maxValue : Math.max(...data, 1e-9);
  const slot = plotW / n;
  const barW = Math.max(2, Math.min(slot * 0.68, 46));

  const textDim = CSSVAR('--text-dim') || '#8b96b3';
  const line = CSSVAR('--border') || '#232b40';

  // 基準線
  ctx.strokeStyle = line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padL, padT + plotH + 0.5);
  ctx.lineTo(padL + plotW, padT + plotH + 0.5);
  ctx.stroke();

  data.forEach((v, i) => {
    const bh = Math.max(0, (v / max) * plotH);
    const x = padL + slot * i + (slot - barW) / 2;
    const y = padT + plotH - bh;
    ctx.fillStyle = i === highlight ? highlightColor : color;
    ctx.globalAlpha = v < 1e-9 ? 0.18 : 1;
    ctx.fillRect(x, y, barW, bh);
    ctx.globalAlpha = 1;

    // 標籤
    if (labels[i] !== undefined && n <= 16) {
      ctx.fillStyle = textDim;
      ctx.font = '10px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], x + barW / 2, h - 10);
    }
    // 數值
    if (showValues && n <= 8 && v > 1e-9) {
      ctx.fillStyle = i === highlight ? highlightColor : textDim;
      ctx.font = '10px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(v.toFixed(2), x + barW / 2, y - 5);
    }
  });
}

/** 折線圖 */
export function lineChart(ctx, w, h, series, opts = {}) {
  const {
    color = CSSVAR('--cyan') || '#4fd1e8',
    fill = false,
    yMin = null,
    yMax = null,
    markers = [],
  } = opts;

  ctx.clearRect(0, 0, w, h);
  if (!series.length) return;

  const padL = 10, padR = 10, padT = 12, padB = 20;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const lo = yMin !== null ? yMin : Math.min(...series);
  const hi = yMax !== null ? yMax : Math.max(...series);
  const range = hi - lo || 1;

  const X = (i) => padL + (i / (series.length - 1 || 1)) * plotW;
  const Y = (v) => padT + plotH - ((v - lo) / range) * plotH;

  const line = CSSVAR('--border') || '#232b40';
  ctx.strokeStyle = line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padL, padT + plotH + 0.5);
  ctx.lineTo(padL + plotW, padT + plotH + 0.5);
  ctx.stroke();

  if (fill) {
    ctx.beginPath();
    ctx.moveTo(X(0), padT + plotH);
    series.forEach((v, i) => ctx.lineTo(X(i), Y(v)));
    ctx.lineTo(X(series.length - 1), padT + plotH);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.12;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.beginPath();
  series.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  markers.forEach((m) => {
    ctx.beginPath();
    ctx.arc(X(m.i), Y(m.v), 4, 0, Math.PI * 2);
    ctx.fillStyle = m.color || CSSVAR('--amber') || '#f2a65a';
    ctx.fill();
  });
}

/** 讓元素可拖曳（回傳正規化座標） */
export function draggable(target, onDrag) {
  const handler = (clientX, clientY) => {
    const r = target.getBoundingClientRect();
    onDrag((clientX - r.left) / r.width, (clientY - r.top) / r.height);
  };
  let active = false;
  const down = (e) => {
    active = true;
    const t = e.touches ? e.touches[0] : e;
    handler(t.clientX, t.clientY);
    e.preventDefault();
  };
  const move = (e) => {
    if (!active) return;
    const t = e.touches ? e.touches[0] : e;
    handler(t.clientX, t.clientY);
    e.preventDefault();
  };
  const up = () => { active = false; };

  target.addEventListener('mousedown', down);
  target.addEventListener('touchstart', down, { passive: false });
  window.addEventListener('mousemove', move);
  window.addEventListener('touchmove', move, { passive: false });
  window.addEventListener('mouseup', up);
  window.addEventListener('touchend', up);
}

/** 態向量表格（顯示每個基底態的機率幅與機率） */
export function amplitudeTable(states, n, opts = {}) {
  const { maxRows = 8, showPhase = true } = opts;
  const table = el('table', 'w-amp-table');
  const thead = el('thead');
  thead.innerHTML = `<tr><th>基底態</th><th>機率幅</th>${showPhase ? '<th>相位</th>' : ''}<th>機率</th></tr>`;
  table.appendChild(thead);
  const tbody = el('tbody');
  table.appendChild(tbody);

  const update = (v) => {
    tbody.innerHTML = '';
    const rows = v.map((z, i) => ({ z, i, p: z.re * z.re + z.im * z.im }));
    const shown = rows.length > maxRows
      ? rows.filter((r) => r.p > 1e-6).slice(0, maxRows)
      : rows;
    shown.forEach(({ z, i, p }) => {
      const tr = el('tr');
      const phase = Math.atan2(z.im, z.re);
      const phaseStr = p < 1e-9 ? '—' : `${(phase / Math.PI).toFixed(2)}π`;
      const reStr = (+z.re.toFixed(3)).toString();
      const imStr = (+z.im.toFixed(3)).toString();
      const ampStr = Math.abs(z.im) < 1e-9
        ? reStr
        : Math.abs(z.re) < 1e-9 ? `${imStr}i`
        : `${reStr}${z.im >= 0 ? '+' : '−'}${Math.abs(+z.im.toFixed(3))}i`;
      tr.innerHTML = `
        <td class="mono">|${i.toString(2).padStart(n, '0')}⟩</td>
        <td class="mono">${ampStr}</td>
        ${showPhase ? `<td class="mono dim">${phaseStr}</td>` : ''}
        <td class="mono hl">${(p * 100).toFixed(1)}%</td>`;
      if (p < 1e-9) tr.classList.add('faded');
      tbody.appendChild(tr);
    });
  };

  update(states);
  return { table, update };
}
