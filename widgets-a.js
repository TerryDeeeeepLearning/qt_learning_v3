/* ============================================================
   widgets-a.js — 第 1–6 課的互動元件
   ============================================================ */

import { C, M, GATES, State, gateP, gateRz, gateRy, gateRx,
         fromBlochAngles, blochVector, fmtC } from './qmath.js';
import { el, slider, segmented, button, makeCanvas, tex, renderMath,
         readout, bigStat, hint, barChart, draggable, CSSVAR,
         amplitudeTable } from './widget-kit.js';

const TAU = Math.PI * 2;

/* ------------------------------------------------------------
   1. 複數平面：拖曳看 e^{iθ}，觀察「乘 i = 轉 90 度」
   ------------------------------------------------------------ */
export function complexPlane(mount) {
  const wrap = el('div', 'w-body');
  const { canvas, ctx, w, h } = makeCanvas(340, 340);
  canvas.style.cursor = 'grab';
  canvas.style.touchAction = 'none';

  let theta = Math.PI / 6;
  let r = 1;
  let multiplyCount = 0;   // 連續乘 i 的次數

  const angleSlider = slider('角度 θ', {
    min: 0, max: 628, value: Math.round((theta * 100)), step: 1,
    format: (v) => `${(v / 100).toFixed(2)} rad`,
  });
  const radiusSlider = slider('長度 r', {
    min: 20, max: 140, value: 100, step: 1,
    format: (v) => (v / 100).toFixed(2),
  });

  const out = readout(String.raw`目前的複數 $z = re^{i\theta}$`);
  const outDeg = readout('換算成角度');
  const mulRow = el('div', 'w-btn-row');
  const mulBtn = button('× i （轉 90°）');
  const resetBtn = button('重設', 'w-btn ghost');
  mulRow.append(mulBtn, resetBtn);
  const mulNote = el('div', 'w-note', '每按一次「× i」就轉 90 度。按四次會轉回原點——這就是 i⁴ = 1。');

  function draw() {
    const cx = w / 2, cy = h / 2, R = 118;
    const line = CSSVAR('--border') || '#232b40';
    const dim = CSSVAR('--text-dim') || '#4b5670';
    const cyan = CSSVAR('--cyan') || '#4fd1e8';
    const amber = CSSVAR('--amber') || '#f2a65a';

    ctx.clearRect(0, 0, w, h);

    // 座標軸
    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, cy); ctx.lineTo(w - 20, cy);
    ctx.moveTo(cx, 20); ctx.lineTo(cx, h - 20);
    ctx.stroke();

    // 單位圓
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = line;
    ctx.stroke();
    ctx.setLineDash([]);

    // 軸標籤
    ctx.fillStyle = dim;
    ctx.font = '11px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('實部 Re', w - 62, cy - 8);
    ctx.textAlign = 'center';
    ctx.fillText('虛部 Im', cx + 34, 26);
    ctx.fillText('1', cx + R, cy + 16);
    ctx.fillText('i', cx - 10, cy - R + 4);
    ctx.fillText('−1', cx - R, cy + 16);
    ctx.fillText('−i', cx - 12, cy + R + 4);

    // 角度扇形
    const px = cx + Math.cos(theta) * R * r;
    const py = cy - Math.sin(theta) * R * r;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, 34, 0, -theta, true);
    ctx.closePath();
    ctx.fillStyle = amber;
    ctx.globalAlpha = 0.16;
    ctx.fill();
    ctx.globalAlpha = 1;

    // 投影虛線（實部、虛部）
    ctx.setLineDash([2, 3]);
    ctx.strokeStyle = dim;
    ctx.beginPath();
    ctx.moveTo(px, py); ctx.lineTo(px, cy);
    ctx.moveTo(px, py); ctx.lineTo(cx, py);
    ctx.stroke();
    ctx.setLineDash([]);

    // 向量本體
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = cyan;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(px, py, 6, 0, TAU);
    ctx.fillStyle = cyan;
    ctx.fill();

    // θ 標籤
    ctx.fillStyle = amber;
    ctx.font = '12px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('θ', cx + 40 * Math.cos(theta / 2), cy - 40 * Math.sin(theta / 2) + 4);
  }

  function update() {
    const z = C.polar(r, theta);
    const deg = ((theta * 180) / Math.PI) % 360;
    out.set(`<span class="mono hl">${fmtC(z)}</span>`);
    outDeg.set(`<span class="mono">θ = ${deg.toFixed(1)}°</span> ，
                <span class="mono dim">r = ${r.toFixed(2)}</span>`);
    draw();
  }

  angleSlider.input.addEventListener('input', () => {
    theta = angleSlider.get() / 100;
    update();
  });
  radiusSlider.input.addEventListener('input', () => {
    r = radiusSlider.get() / 100;
    update();
  });

  mulBtn.addEventListener('click', () => {
    theta = (theta + Math.PI / 2) % TAU;
    multiplyCount++;
    angleSlider.input.value = Math.round(theta * 100);
    angleSlider.sync();
    update();
    mulNote.innerHTML = multiplyCount % 4 === 0
      ? `已經按了 ${multiplyCount} 次 = 轉了 ${multiplyCount * 90}° <b>轉回原點了</b>，因為 i<sup>4</sup> = 1。`
      : `已經按了 ${multiplyCount} 次 = 總共轉了 ${multiplyCount * 90}°。`;
  });

  resetBtn.addEventListener('click', () => {
    theta = Math.PI / 6; r = 1; multiplyCount = 0;
    angleSlider.input.value = Math.round(theta * 100); angleSlider.sync();
    radiusSlider.input.value = 100; radiusSlider.sync();
    mulNote.innerHTML = '每按一次「× i」就轉 90 度。按四次會轉回原點——這就是 i⁴ = 1。';
    update();
  });

  // 直接在畫布上拖曳
  draggable(canvas, (nx, ny) => {
    const dx = nx * w - w / 2;
    const dy = -(ny * h - h / 2);
    theta = (Math.atan2(dy, dx) + TAU) % TAU;
    const dist = Math.hypot(dx, dy) / 118;
    r = Math.max(0.2, Math.min(1.4, dist));
    angleSlider.input.value = Math.round(theta * 100); angleSlider.sync();
    radiusSlider.input.value = Math.round(r * 100); radiusSlider.sync();
    update();
  });

  wrap.append(canvas, angleSlider.row, radiusSlider.row, out.box, outDeg.box, mulRow, mulNote,
    hint('直接用手指拖曳畫布上的點也可以。注意看：不管怎麼轉，長度 r 都不變——這就是後面「酉算子保持長度」的雛形。'));
  mount.appendChild(wrap);
  update();
}

/* ------------------------------------------------------------
   2. 內積探索器：兩個態向量，看內積與正交
   ------------------------------------------------------------ */
export function innerProduct(mount) {
  const wrap = el('div', 'w-body');
  const { canvas, ctx, w, h } = makeCanvas(340, 300);
  canvas.style.touchAction = 'none';

  // 用實數 2D 向量做視覺化（複數版本在讀數區呈現）
  let a = { x: 1, y: 0 };
  let b = { x: 0.6, y: 0.8 };
  let dragging = 'b';

  const target = segmented([
    { label: '拖曳 |ψ⟩', value: 'b' },
    { label: '拖曳 |φ⟩', value: 'a' },
  ], 0);
  target.onChange((v) => { dragging = v; });

  const innerOut = readout('內積 ⟨φ|ψ⟩');
  const normOut = readout('各自的長度');
  const orthoNote = el('div', 'w-note');

  function normalize(v) {
    const n = Math.hypot(v.x, v.y) || 1;
    return { x: v.x / n, y: v.y / n };
  }

  function draw() {
    const cx = w / 2, cy = h / 2, R = 110;
    const line = CSSVAR('--border') || '#232b40';
    const dim = CSSVAR('--text-dim') || '#4b5670';
    const cyan = CSSVAR('--cyan') || '#4fd1e8';
    const amber = CSSVAR('--amber') || '#f2a65a';

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = line;
    ctx.beginPath();
    ctx.moveTo(20, cy); ctx.lineTo(w - 20, cy);
    ctx.moveTo(cx, 16); ctx.lineTo(cx, h - 16);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.setLineDash([3, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = dim;
    ctx.font = '11px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('|0⟩', cx + R + 14, cy + 4);
    ctx.fillText('|1⟩', cx, cy - R - 8);

    const drawVec = (v, color, label) => {
      const px = cx + v.x * R, py = cy - v.y * R;
      ctx.beginPath();
      ctx.moveTo(cx, cy); ctx.lineTo(px, py);
      ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(px, py, 6, 0, TAU);
      ctx.fillStyle = color; ctx.fill();
      ctx.fillStyle = color;
      ctx.font = '12px ui-monospace, monospace';
      ctx.fillText(label, px + (v.x >= 0 ? 16 : -16), py - 8);
    };

    // 投影線（顯示內積的幾何意義）
    const dot = a.x * b.x + a.y * b.y;
    const projX = cx + a.x * dot * R, projY = cy - a.y * dot * R;
    ctx.setLineDash([2, 3]);
    ctx.strokeStyle = dim;
    ctx.beginPath();
    ctx.moveTo(cx + b.x * R, cy - b.y * R);
    ctx.lineTo(projX, projY);
    ctx.stroke();
    ctx.setLineDash([]);

    drawVec(a, amber, '|φ⟩');
    drawVec(b, cyan, '|ψ⟩');

    // 投影點
    ctx.beginPath();
    ctx.arc(projX, projY, 4, 0, TAU);
    ctx.fillStyle = dim; ctx.fill();
  }

  function update() {
    a = normalize(a); b = normalize(b);
    const dot = a.x * b.x + a.y * b.y;
    innerOut.set(`<span class="mono hl">${dot.toFixed(4)}</span>
      <span class="dim mono"> ｜ |⟨φ|ψ⟩|² = ${(dot * dot).toFixed(4)}</span>`);
    normOut.set(`<span class="mono">‖φ‖ = 1.000　‖ψ‖ = 1.000</span>
      <span class="dim"> （兩個都已歸一化）</span>`);

    if (Math.abs(dot) < 0.03) {
      orthoNote.innerHTML = '✓ <b>兩個態正交</b>（⟨φ|ψ⟩ ≈ 0）。這代表它們可以當作一組基底——測到其中一個時，另一個的機率是 0。';
      orthoNote.className = 'w-note good';
    } else if (Math.abs(dot) > 0.97) {
      orthoNote.innerHTML = '✓ <b>兩個態幾乎相同</b>（|⟨φ|ψ⟩| ≈ 1）。內積的絕對值越接近 1，代表兩個量子態越「重疊」。';
      orthoNote.className = 'w-note good';
    } else {
      orthoNote.innerHTML = `兩個態部分重疊。若系統在 |ψ⟩，用 |φ⟩ 這組基底測量，測到 φ 的機率就是 |⟨φ|ψ⟩|² = <b>${(dot * dot * 100).toFixed(1)}%</b>——這是下下課 Born 規則的預告。`;
      orthoNote.className = 'w-note';
    }
    draw();
  }

  draggable(canvas, (nx, ny) => {
    const dx = nx * w - w / 2;
    const dy = -(ny * h - h / 2);
    const v = { x: dx / 110, y: dy / 110 };
    if (dragging === 'a') a = v; else b = v;
    update();
  });

  wrap.append(target.row, canvas, innerOut.box, normOut.box, orthoNote,
    hint('拖曳畫布改變向量方向。試著把兩個向量拖成垂直——內積會變成 0，這就是「正交」的幾何意義。'));
  mount.appendChild(wrap);
  update();
}

/* ------------------------------------------------------------
   3. 矩陣檢查器：Hermitian？酉？特徵值是什麼？
   ------------------------------------------------------------ */
export function matrixInspector(mount) {
  const wrap = el('div', 'w-body');

  const presets = [
    { label: 'Z', m: GATES.Z },
    { label: 'X', m: GATES.X },
    { label: 'Y', m: GATES.Y },
    { label: 'H', m: GATES.H },
    { label: 'S（相位）', m: GATES.S },
  ];

  const seg = segmented(presets.map((p, i) => ({ label: p.label, value: i })), 0);

  const matBox = el('div', 'w-matrix-box');
  const checks = el('div', 'w-check-row');
  const eigenBox = el('div', 'w-eigen-box');

  function renderMatrix(m) {
    const f = (z) => {
      const re = +z.re.toFixed(3), im = +z.im.toFixed(3);
      if (Math.abs(im) < 1e-9) return `${re}`;
      if (Math.abs(re) < 1e-9) return im === 1 ? 'i' : im === -1 ? '−i' : `${im}i`;
      return `${re}${im >= 0 ? '+' : '−'}${Math.abs(im)}i`;
    };
    matBox.innerHTML = `
      <div class="w-matrix">
        <div class="mbracket">⎡</div>
        <div class="mcells">
          <span class="mono">${f(m[0][0])}</span><span class="mono">${f(m[0][1])}</span>
          <span class="mono">${f(m[1][0])}</span><span class="mono">${f(m[1][1])}</span>
        </div>
        <div class="mbracket">⎤</div>
      </div>`;
  }

  function update(idx) {
    const { m, label } = presets[idx];
    renderMatrix(m);

    const herm = M.isHermitian(m);
    const uni = M.isUnitary(m);
    checks.innerHTML = `
      <div class="w-check ${herm ? 'yes' : 'no'}">
        <span class="ck">${herm ? '✓' : '✗'}</span> Hermitian（A† = A）
      </div>
      <div class="w-check ${uni ? 'yes' : 'no'}">
        <span class="ck">${uni ? '✓' : '✗'}</span> 酉算子（U†U = I）
      </div>`;

    if (herm) {
      const eig = M.eigen2Hermitian(m);
      eigenBox.innerHTML = `
        <div class="w-eigen-title">特徵值與特徵向量</div>
        ${eig.map((e, i) => {
          const v = e.vector;
          const f = (z) => {
            const re = +z.re.toFixed(3), im = +z.im.toFixed(3);
            if (Math.abs(im) < 1e-9) return `${re}`;
            if (Math.abs(re) < 1e-9) return `${im}i`;
            return `${re}${im >= 0 ? '+' : '−'}${Math.abs(im)}i`;
          };
          return `<div class="w-eigen-row">
            <span class="eig-lam mono">λ${i + 1} = ${(+e.value.toFixed(4))}</span>
            <span class="eig-vec mono dim">|v⟩ = (${f(v[0])}, ${f(v[1])})</span>
          </div>`;
        }).join('')}
        <div class="w-note good">
          ✓ 特徵值都是<b>實數</b>——這正是 Hermitian 算子能代表「可觀測量」的原因：
          測量結果必須是我們讀得出來的實際數字。
        </div>`;
    } else {
      eigenBox.innerHTML = `
        <div class="w-note">
          這個矩陣不是 Hermitian，所以不保證特徵值是實數，也就不能直接當作「可觀測量」使用。
          但如果它是酉算子，它仍然可以當作<b>量子閘</b>——這兩個角色是不同的。
        </div>`;
    }
  }

  seg.onChange(update);
  wrap.append(seg.row, matBox, checks, eigenBox,
    hint('切換不同矩陣，注意 Pauli 矩陣（X、Y、Z）同時是 Hermitian 又是酉算子——這是它們的特殊性質，不是通例。S 閘就只是酉算子，不是 Hermitian。'));
  mount.appendChild(wrap);
  update(0);
}

/* ------------------------------------------------------------
   4. 酉算子驗證器：看它如何「保持長度」
   ------------------------------------------------------------ */
export function unitaryAction(mount) {
  const wrap = el('div', 'w-body');
  const { canvas, ctx, w, h } = makeCanvas(340, 260);

  let theta = Math.PI / 4;
  let gateKind = 'Rz';

  const seg = segmented([
    { label: 'Rz(θ)', value: 'Rz' },
    { label: 'Ry(θ)', value: 'Ry' },
    { label: 'Rx(θ)', value: 'Rx' },
  ], 0);

  const thetaSlider = slider('旋轉角 θ', {
    min: 0, max: 628, value: 157, step: 1,
    format: (v) => `${(v / 100).toFixed(2)} rad`,
  });

  const beforeOut = readout('作用前 |ψ⟩');
  const afterOut = readout('作用後 U|ψ⟩');
  const normOut = readout('長度檢查 ⟨ψ|ψ⟩');

  const initial = [C.make(Math.cos(Math.PI / 6), 0), C.make(Math.sin(Math.PI / 6), 0)];

  function currentGate() {
    if (gateKind === 'Rz') return gateRz(theta);
    if (gateKind === 'Ry') return gateRy(theta);
    return gateRx(theta);
  }

  function draw(after) {
    const line = CSSVAR('--border') || '#232b40';
    const cyan = CSSVAR('--cyan') || '#4fd1e8';
    const amber = CSSVAR('--amber') || '#f2a65a';
    const dim = CSSVAR('--text-dim') || '#4b5670';

    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, R = 95;

    ctx.strokeStyle = line;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.setLineDash([3, 4]); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(20, cy); ctx.lineTo(w - 20, cy);
    ctx.moveTo(cx, 14); ctx.lineTo(cx, h - 14);
    ctx.stroke();

    // 用 (Re α, Re β) 當作視覺化的二維投影
    const plot = (v, color, label, dash) => {
      const x = v[0].re, y = v[1].re;
      const px = cx + x * R, py = cy - y * R;
      ctx.beginPath();
      ctx.moveTo(cx, cy); ctx.lineTo(px, py);
      ctx.strokeStyle = color; ctx.lineWidth = 2.5;
      if (dash) ctx.setLineDash([4, 4]);
      ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(px, py, 5, 0, TAU);
      ctx.fillStyle = color; ctx.fill();
      ctx.font = '11px ui-monospace, monospace';
      ctx.fillStyle = color;
      ctx.fillText(label, px + 10, py - 6);
    };

    plot(initial, dim, '原態', true);
    plot(after, cyan, 'U|ψ⟩', false);

    ctx.fillStyle = amber;
    ctx.font = '11px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('半徑固定 = 長度不變', cx, h - 8);
    ctx.textAlign = 'left';
  }

  function update() {
    const U = currentGate();
    const after = M.apply(U, initial);
    const normBefore = initial.reduce((s, z) => s + C.abs2(z), 0);
    const normAfter = after.reduce((s, z) => s + C.abs2(z), 0);

    beforeOut.set(`<span class="mono">α = ${fmtC(initial[0])}，β = ${fmtC(initial[1])}</span>`);
    afterOut.set(`<span class="mono hl">α' = ${fmtC(after[0])}，β' = ${fmtC(after[1])}</span>`);
    normOut.set(`<span class="mono">作用前 = ${normBefore.toFixed(6)}　→　作用後 = ${normAfter.toFixed(6)}</span>
      <span class="good"> ✓ 完全沒變</span>`);
    draw(after);
  }

  seg.onChange((v) => { gateKind = v; update(); });
  thetaSlider.input.addEventListener('input', () => {
    theta = thetaSlider.get() / 100;
    update();
  });

  wrap.append(seg.row, thetaSlider.row, canvas, beforeOut.box, afterOut.box, normOut.box,
    hint('不管你怎麼轉、轉多少角度，⟨ψ|ψ⟩ 永遠是 1。這正是酉算子的定義 U†U = I 帶來的結果，也是量子力學要求機率總和守恆的數學保證。'));
  mount.appendChild(wrap);
  update();
}

/* ------------------------------------------------------------
   5. Bloch 球：拖曳 θ、φ，即時看態向量
   ------------------------------------------------------------ */
export function blochSphere(mount) {
  const wrap = el('div', 'w-body');
  const { canvas, ctx, w, h } = makeCanvas(340, 320);

  let theta = Math.PI / 2, phi = 0;

  const tSlider = slider('θ（緯度）', {
    min: 0, max: 314, value: 157, step: 1,
    format: (v) => `${(v / 100).toFixed(2)} rad`,
  });
  const pSlider = slider('φ（相位／經度）', {
    min: 0, max: 628, value: 0, step: 1,
    format: (v) => `${(v / 100).toFixed(2)} rad`,
  });

  const stateOut = readout('量子態');
  const probOut = readout('測量機率（Born 規則）');
  const specialNote = el('div', 'w-note');

  const presetRow = el('div', 'w-btn-row');
  [
    { label: '|0⟩', t: 0, p: 0 },
    { label: '|1⟩', t: Math.PI, p: 0 },
    { label: '|+⟩', t: Math.PI / 2, p: 0 },
    { label: '|−⟩', t: Math.PI / 2, p: Math.PI },
  ].forEach(({ label, t, p }) => {
    const b = button(label, 'w-btn ghost sm');
    b.addEventListener('click', () => {
      theta = t; phi = p;
      tSlider.input.value = Math.round(t * 100); tSlider.sync();
      pSlider.input.value = Math.round(p * 100); pSlider.sync();
      update();
    });
    presetRow.appendChild(b);
  });

  function draw() {
    const cx = w / 2, cy = h / 2 - 6, R = 105;
    const line = CSSVAR('--border') || '#232b40';
    const dim = CSSVAR('--text-dim') || '#4b5670';
    const cyan = CSSVAR('--cyan') || '#4fd1e8';
    const amber = CSSVAR('--amber') || '#f2a65a';

    ctx.clearRect(0, 0, w, h);

    // 球體外框
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU);
    ctx.strokeStyle = line; ctx.lineWidth = 1.5; ctx.stroke();

    // 赤道（橢圓）
    ctx.beginPath();
    ctx.ellipse(cx, cy, R, R * 0.32, 0, 0, TAU);
    ctx.setLineDash([3, 4]); ctx.strokeStyle = line; ctx.stroke(); ctx.setLineDash([]);

    // 縱向大圓
    ctx.beginPath();
    ctx.ellipse(cx, cy, R * 0.32, R, 0, 0, TAU);
    ctx.setLineDash([3, 4]); ctx.stroke(); ctx.setLineDash([]);

    // 軸標籤
    ctx.fillStyle = dim;
    ctx.font = '12px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('|0⟩', cx, cy - R - 10);
    ctx.fillText('|1⟩', cx, cy + R + 18);
    ctx.fillText('|+⟩', cx + R + 16, cy + 4);
    ctx.fillText('|−⟩', cx - R - 16, cy + 4);

    // 態向量（用等角投影把 3D 壓成 2D）
    const bx = Math.sin(theta) * Math.cos(phi);
    const by = Math.sin(theta) * Math.sin(phi);
    const bz = Math.cos(theta);
    // x 往右、z 往上、y 做斜向壓縮製造立體感
    const px = cx + (bx * R) + (by * R * 0.30);
    const py = cy - (bz * R) + (by * R * 0.16);

    // 投影到赤道的輔助線
    ctx.setLineDash([2, 3]);
    ctx.strokeStyle = dim;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(cx + bx * R + by * R * 0.30, cy + by * R * 0.16);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(cx, cy); ctx.lineTo(px, py);
    ctx.strokeStyle = cyan; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.arc(px, py, 7, 0, TAU);
    ctx.fillStyle = cyan; ctx.fill();
    ctx.beginPath(); ctx.arc(px, py, 11, 0, TAU);
    ctx.strokeStyle = cyan; ctx.globalAlpha = 0.3; ctx.lineWidth = 2; ctx.stroke();
    ctx.globalAlpha = 1;

    // 中心點
    ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, TAU);
    ctx.fillStyle = amber; ctx.fill();
    ctx.textAlign = 'left';
  }

  function update() {
    const [alpha, beta] = fromBlochAngles(theta, phi);
    const p0 = C.abs2(alpha), p1 = C.abs2(beta);

    stateOut.set(`<span class="mono hl">|ψ⟩ = ${(+alpha.re.toFixed(3))}|0⟩ + (${fmtC(beta)})|1⟩</span>`);
    probOut.set(`<span class="mono">P(0) = <b class="hl">${(p0 * 100).toFixed(1)}%</b>　
                  P(1) = <b class="hl">${(p1 * 100).toFixed(1)}%</b></span>`);

    if (Math.abs(p0 - 0.5) < 0.01) {
      specialNote.innerHTML = `目前在<b>赤道</b>上：測到 0 和 1 的機率各半。但注意——不同的 φ（經度）
        對應<b>不同的量子態</b>（例如 |+⟩ 和 |−⟩），機率卻完全一樣。
        這正是「相位在單獨測量時看不見」的直接體現，也是第 6 課的核心。`;
      specialNote.className = 'w-note focus';
    } else if (p0 > 0.99) {
      specialNote.innerHTML = '目前在<b>北極 |0⟩</b>。此時 φ 完全不影響狀態（極點上經度沒有意義），測量必定得到 0。';
      specialNote.className = 'w-note';
    } else if (p1 > 0.99) {
      specialNote.innerHTML = '目前在<b>南極 |1⟩</b>。測量必定得到 1。';
      specialNote.className = 'w-note';
    } else {
      specialNote.innerHTML = `θ 決定了「偏向 |0⟩ 還是 |1⟩」，φ 決定了相位。
        目前 P(0) : P(1) = ${(p0 * 100).toFixed(0)} : ${(p1 * 100).toFixed(0)}。`;
      specialNote.className = 'w-note';
    }
    draw();
  }

  tSlider.input.addEventListener('input', () => { theta = tSlider.get() / 100; update(); });
  pSlider.input.addEventListener('input', () => { phi = pSlider.get() / 100; update(); });

  wrap.append(presetRow, tSlider.row, pSlider.row, canvas, stateOut.box, probOut.box, specialNote,
    hint('關鍵實驗：把 θ 固定在 π/2（赤道），只拖動 φ。狀態一直在變，但 P(0) 和 P(1) 完全不動——相位藏在裡面，測量看不到。'));
  mount.appendChild(wrap);
  update();
}

/* ------------------------------------------------------------
   6. 測量模擬器：實際跑 shots，看統計如何逼近理論值
   ------------------------------------------------------------ */
export function measurementSim(mount) {
  const wrap = el('div', 'w-body');

  let theta = Math.PI / 3;
  let counts = [0, 0];
  let total = 0;

  const tSlider = slider('θ（決定機率）', {
    min: 0, max: 314, value: 105, step: 1,
    format: (v) => `${(v / 100).toFixed(2)} rad`,
  });

  const theoryOut = readout('理論機率（Born 規則）');
  const { canvas, ctx, w, h } = makeCanvas(340, 190);

  const statRow = el('div', 'w-stat-row');
  const s0 = bigStat('測到 0', '0', '0 次');
  const s1 = bigStat('測到 1', '0', '0 次');
  statRow.append(s0.box, s1.box);

  const btnRow = el('div', 'w-btn-row');
  const b1 = button('測 1 次');
  const b100 = button('測 100 次');
  const b1000 = button('測 1000 次');
  const bReset = button('重設', 'w-btn ghost');
  btnRow.append(b1, b100, b1000, bReset);

  const convNote = el('div', 'w-note');

  function state() {
    return fromBlochAngles(theta, 0);
  }

  function theoryProbs() {
    const [a, b] = state();
    return [C.abs2(a), C.abs2(b)];
  }

  function drawChart() {
    const [t0, t1] = theoryProbs();
    const empirical = total > 0 ? [counts[0] / total, counts[1] / total] : [0, 0];
    ctx.clearRect(0, 0, w, h);

    const cyan = CSSVAR('--cyan') || '#4fd1e8';
    const dim = CSSVAR('--text-dim') || '#4b5670';
    const amber = CSSVAR('--amber') || '#f2a65a';

    const padT = 16, padB = 30, padL = 20;
    const plotH = h - padT - padB;
    const groupW = (w - padL * 2) / 2;
    const barW = 44;

    [0, 1].forEach((i) => {
      const gx = padL + groupW * i + groupW / 2;
      // 理論值（空心框）
      const th = theoryProbs()[i] * plotH;
      ctx.strokeStyle = amber;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(gx - barW - 4, padT + plotH - th, barW, th);
      ctx.setLineDash([]);
      // 實測值（實心）
      const eh = empirical[i] * plotH;
      ctx.fillStyle = cyan;
      ctx.fillRect(gx + 4, padT + plotH - eh, barW, eh);

      ctx.fillStyle = dim;
      ctx.font = '11px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`|${i}⟩`, gx, h - 12);
    });

    // 基準線
    ctx.strokeStyle = CSSVAR('--border') || '#232b40';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT + plotH + 0.5);
    ctx.lineTo(w - padL, padT + plotH + 0.5);
    ctx.stroke();

    // 圖例
    ctx.font = '10px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = amber;
    ctx.fillText('▢ 理論', padL, 12);
    ctx.fillStyle = cyan;
    ctx.fillText('▉ 實測', padL + 52, 12);
  }

  function runShots(n) {
    const v = state();
    for (let i = 0; i < n; i++) {
      counts[State.sample(v)]++;
      total++;
    }
    update();
  }

  function update() {
    const [t0, t1] = theoryProbs();
    theoryOut.set(`<span class="mono">P(0) = |cos(θ/2)|² = <b class="hl">${(t0 * 100).toFixed(1)}%</b>　
      P(1) = |sin(θ/2)|² = <b class="hl">${(t1 * 100).toFixed(1)}%</b></span>`);

    const e0 = total ? counts[0] / total : 0;
    const e1 = total ? counts[1] / total : 0;
    s0.set(total ? `${(e0 * 100).toFixed(1)}%` : '—');
    s0.setSub(`${counts[0]} 次`);
    s1.set(total ? `${(e1 * 100).toFixed(1)}%` : '—');
    s1.setSub(`${counts[1]} 次`);

    if (total === 0) {
      convNote.innerHTML = '按上面的按鈕開始測量。單次測量只會得到 0 或 1——機率是要靠<b>大量重複</b>才看得出來的。';
      convNote.className = 'w-note';
    } else {
      const err = Math.abs(e0 - t0) * 100;
      convNote.innerHTML = `已測 <b>${total}</b> 次，實測與理論的誤差是 <b>${err.toFixed(2)} 個百分點</b>。
        ${total >= 1000
          ? '樣本數夠大時，誤差會縮到很小——這就是真實硬體上執行電路要跑上千個 shots 的原因。'
          : '試著增加測量次數，看誤差怎麼縮小。'}`;
      convNote.className = total >= 1000 ? 'w-note good' : 'w-note';
    }
    drawChart();
  }

  tSlider.input.addEventListener('input', () => {
    theta = tSlider.get() / 100;
    counts = [0, 0]; total = 0;
    update();
  });
  b1.addEventListener('click', () => runShots(1));
  b100.addEventListener('click', () => runShots(100));
  b1000.addEventListener('click', () => runShots(1000));
  bReset.addEventListener('click', () => { counts = [0, 0]; total = 0; update(); });

  wrap.append(tSlider.row, theoryOut.box, canvas, statRow, btnRow, convNote,
    hint('這個模擬器每次都是真的依 Born 規則抽樣，不是預先算好的動畫。少量測量時誤差很大，這正是真實實驗會遇到的統計雜訊。'));
  mount.appendChild(wrap);
  update();
}
