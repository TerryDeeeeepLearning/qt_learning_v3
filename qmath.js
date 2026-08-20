/* ============================================================
   qmath.js — 量子計算數學引擎
   所有互動元件的計算都走這裡，不做假動畫。
   ============================================================ */

// ---------- 複數 ----------

export const C = {
  make: (re = 0, im = 0) => ({ re, im }),
  add: (a, b) => ({ re: a.re + b.re, im: a.im + b.im }),
  sub: (a, b) => ({ re: a.re - b.re, im: a.im - b.im }),
  mul: (a, b) => ({
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  }),
  scale: (a, s) => ({ re: a.re * s, im: a.im * s }),
  conj: (a) => ({ re: a.re, im: -a.im }),
  abs: (a) => Math.hypot(a.re, a.im),
  abs2: (a) => a.re * a.re + a.im * a.im,
  arg: (a) => Math.atan2(a.im, a.re),
  // e^{iθ}
  expi: (theta) => ({ re: Math.cos(theta), im: Math.sin(theta) }),
  // r·e^{iθ}
  polar: (r, theta) => ({ re: r * Math.cos(theta), im: r * Math.sin(theta) }),
  isZero: (a, eps = 1e-10) => Math.abs(a.re) < eps && Math.abs(a.im) < eps,
};

// 複數格式化成好讀的字串
export function fmtC(z, digits = 3) {
  const r = +z.re.toFixed(digits);
  const i = +z.im.toFixed(digits);
  if (Math.abs(i) < 1e-9) return `${r}`;
  if (Math.abs(r) < 1e-9) return `${i}i`;
  return `${r} ${i >= 0 ? '+' : '−'} ${Math.abs(i)}i`;
}

export function fmtNum(x, digits = 3) {
  const v = +x.toFixed(digits);
  return `${v}`;
}

// ---------- 矩陣（複數，以 row-major 巢狀陣列表示） ----------

export const M = {
  // 產生 n×n 單位矩陣
  identity(n) {
    return Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => C.make(i === j ? 1 : 0, 0))
    );
  },

  mul(A, B) {
    const n = A.length, m = B[0].length, k = B.length;
    const out = Array.from({ length: n }, () =>
      Array.from({ length: m }, () => C.make(0, 0))
    );
    for (let i = 0; i < n; i++)
      for (let j = 0; j < m; j++) {
        let s = C.make(0, 0);
        for (let t = 0; t < k; t++) s = C.add(s, C.mul(A[i][t], B[t][j]));
        out[i][j] = s;
      }
    return out;
  },

  // 共軛轉置
  dagger(A) {
    const n = A.length, m = A[0].length;
    return Array.from({ length: m }, (_, i) =>
      Array.from({ length: n }, (_, j) => C.conj(A[j][i]))
    );
  },

  // 作用在態向量上
  apply(A, v) {
    return A.map((row) =>
      row.reduce((acc, a, j) => C.add(acc, C.mul(a, v[j])), C.make(0, 0))
    );
  },

  // 張量積
  tensor(A, B) {
    const n1 = A.length, m1 = A[0].length;
    const n2 = B.length, m2 = B[0].length;
    const out = Array.from({ length: n1 * n2 }, () =>
      Array.from({ length: m1 * m2 }, () => C.make(0, 0))
    );
    for (let i1 = 0; i1 < n1; i1++)
      for (let j1 = 0; j1 < m1; j1++)
        for (let i2 = 0; i2 < n2; i2++)
          for (let j2 = 0; j2 < m2; j2++)
            out[i1 * n2 + i2][j1 * m2 + j2] = C.mul(A[i1][j1], B[i2][j2]);
    return out;
  },

  // 檢查是否為酉矩陣：U†U = I
  isUnitary(A, eps = 1e-9) {
    const P = M.mul(M.dagger(A), A);
    const n = A.length;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const target = i === j ? 1 : 0;
        if (Math.abs(P[i][j].re - target) > eps || Math.abs(P[i][j].im) > eps)
          return false;
      }
    return true;
  },

  // 檢查是否為 Hermitian：A† = A
  isHermitian(A, eps = 1e-9) {
    const D = M.dagger(A);
    const n = A.length;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (Math.abs(D[i][j].re - A[i][j].re) > eps ||
            Math.abs(D[i][j].im - A[i][j].im) > eps) return false;
    return true;
  },

  // 2×2 Hermitian 矩陣的特徵值（解析解，保證實數）
  eigen2Hermitian(A) {
    const a = A[0][0].re;          // 實數（Hermitian 對角必為實）
    const d = A[1][1].re;
    const b = A[0][1];             // 複數
    const tr = a + d;
    const det = a * d - C.abs2(b);
    const disc = Math.sqrt(Math.max(0, tr * tr / 4 - det));
    const l1 = tr / 2 + disc;
    const l2 = tr / 2 - disc;

    const vecFor = (lam) => {
      // (A - λI)v = 0  →  v = [b, λ-a] 或 [λ-d, conj(b)]
      let v;
      if (C.abs(b) > 1e-12) {
        v = [b, C.make(lam - a, 0)];
      } else {
        v = Math.abs(lam - a) < 1e-12 ? [C.make(1, 0), C.make(0, 0)]
                                      : [C.make(0, 0), C.make(1, 0)];
      }
      const norm = Math.sqrt(C.abs2(v[0]) + C.abs2(v[1]));
      return v.map((z) => C.scale(z, 1 / norm));
    };

    return [
      { value: l1, vector: vecFor(l1) },
      { value: l2, vector: vecFor(l2) },
    ];
  },
};

// ---------- 量子閘 ----------

const s2 = 1 / Math.SQRT2;

export const GATES = {
  I: [[C.make(1), C.make(0)], [C.make(0), C.make(1)]],
  X: [[C.make(0), C.make(1)], [C.make(1), C.make(0)]],
  Y: [[C.make(0), C.make(0, -1)], [C.make(0, 1), C.make(0)]],
  Z: [[C.make(1), C.make(0)], [C.make(0), C.make(-1)]],
  H: [[C.make(s2), C.make(s2)], [C.make(s2), C.make(-s2)]],
  S: [[C.make(1), C.make(0)], [C.make(0), C.make(0, 1)]],
  T: [[C.make(1), C.make(0)], [C.make(0), C.polar(1, Math.PI / 4)]],
};

// 相位閘 P(θ)
export function gateP(theta) {
  return [[C.make(1), C.make(0)], [C.make(0), C.expi(theta)]];
}

// 繞 z 軸旋轉 Rz(θ)
export function gateRz(theta) {
  return [
    [C.expi(-theta / 2), C.make(0)],
    [C.make(0), C.expi(theta / 2)],
  ];
}

// 繞 y 軸旋轉 Ry(θ)
export function gateRy(theta) {
  const c = Math.cos(theta / 2), s = Math.sin(theta / 2);
  return [[C.make(c), C.make(-s)], [C.make(s), C.make(c)]];
}

// 繞 x 軸旋轉 Rx(θ)
export function gateRx(theta) {
  const c = Math.cos(theta / 2), s = Math.sin(theta / 2);
  return [[C.make(c), C.make(0, -s)], [C.make(0, -s), C.make(c)]];
}

// ---------- 態向量 ----------

export const State = {
  // n 個量子位元的 |00...0>
  zeros(n) {
    const dim = 1 << n;
    const v = Array.from({ length: dim }, () => C.make(0, 0));
    v[0] = C.make(1, 0);
    return v;
  },

  // 從機率幅陣列建立並歸一化
  normalize(v) {
    const norm = Math.sqrt(v.reduce((s, z) => s + C.abs2(z), 0));
    if (norm < 1e-15) return v;
    return v.map((z) => C.scale(z, 1 / norm));
  },

  // 測量機率分布（Born 規則）
  probs(v) {
    return v.map((z) => C.abs2(z));
  },

  // 內積 <a|b>
  inner(a, b) {
    return a.reduce((s, z, i) => C.add(s, C.mul(C.conj(z), b[i])), C.make(0, 0));
  },

  // 對 n 量子位元系統的第 target 位元施加單量子位元閘
  applySingle(v, gate, target, n) {
    const dim = 1 << n;
    const out = Array.from({ length: dim }, () => C.make(0, 0));
    const bit = 1 << (n - 1 - target);   // target 0 = 最高位（跟電路圖上排一致）
    for (let i = 0; i < dim; i++) {
      const isOne = (i & bit) !== 0;
      const partner = i ^ bit;
      const i0 = isOne ? partner : i;
      const i1 = isOne ? i : partner;
      // out[i] = gate[isOne][0]*v[i0] + gate[isOne][1]*v[i1]
      const r = isOne ? 1 : 0;
      out[i] = C.add(C.mul(gate[r][0], v[i0]), C.mul(gate[r][1], v[i1]));
    }
    return out;
  },

  // 受控閘：control 為 1 時對 target 施加 gate
  applyControlled(v, gate, control, target, n) {
    const dim = 1 << n;
    const out = v.slice();
    const cbit = 1 << (n - 1 - control);
    const tbit = 1 << (n - 1 - target);
    for (let i = 0; i < dim; i++) {
      if ((i & cbit) === 0) continue;      // 控制位元是 0，不動
      if ((i & tbit) !== 0) continue;      // 只處理 target=0 的那一半，配對處理
      const j = i | tbit;                  // target=1 的夥伴
      const a0 = v[i], a1 = v[j];
      out[i] = C.add(C.mul(gate[0][0], a0), C.mul(gate[0][1], a1));
      out[j] = C.add(C.mul(gate[1][0], a0), C.mul(gate[1][1], a1));
    }
    return out;
  },

  // 二進位標籤，例如 n=3, i=5 → "101"
  label(i, n) {
    return i.toString(2).padStart(n, '0');
  },

  // 檢查雙量子位元態是否可分離（乘積態）
  // |ψ> = a|00>+b|01>+c|10>+d|11> 可分離 ⟺ ad - bc = 0
  isSeparable2(v, eps = 1e-8) {
    const det = C.sub(C.mul(v[0], v[3]), C.mul(v[1], v[2]));
    return C.abs(det) < eps;
  },

  // 依 Born 規則抽樣一次測量結果
  sample(v) {
    const p = State.probs(v);
    let r = Math.random(), acc = 0;
    for (let i = 0; i < p.length; i++) {
      acc += p[i];
      if (r <= acc) return i;
    }
    return p.length - 1;
  },
};

// ---------- 離散傅立葉轉換（古典，供對照用） ----------

export function dft(signal) {
  const N = signal.length;
  const out = [];
  for (let k = 0; k < N; k++) {
    let s = C.make(0, 0);
    for (let n = 0; n < N; n++) {
      const ang = (-2 * Math.PI * k * n) / N;
      s = C.add(s, C.mul(signal[n], C.expi(ang)));
    }
    out.push(s);
  }
  return out;
}

// ---------- 量子傅立葉轉換（直接依定義，供驗證電路用） ----------

export function qftMatrix(n) {
  const N = 1 << n;
  const f = 1 / Math.sqrt(N);
  return Array.from({ length: N }, (_, k) =>
    Array.from({ length: N }, (_, j) =>
      C.scale(C.expi((2 * Math.PI * j * k) / N), f)
    )
  );
}

// 用 H + 受控相位閘 實際搭出 QFT 電路，回傳每一步的態（供逐步演示）
export function qftCircuitSteps(initial, n) {
  let v = initial.slice();
  const steps = [{ label: '初始態', state: v.slice(), gate: null }];

  for (let j = 0; j < n; j++) {
    v = State.applySingle(v, GATES.H, j, n);
    steps.push({ label: `H 作用在 q${j}`, state: v.slice(), gate: `H(q${j})` });
    for (let k = j + 1; k < n; k++) {
      const theta = Math.PI / (1 << (k - j));
      v = State.applyControlled(v, gateP(theta), k, j, n);
      steps.push({
        label: `受控相位 CP(π/${1 << (k - j)})，控制 q${k} → 目標 q${j}`,
        state: v.slice(),
        gate: `CP(π/${1 << (k - j)})`,
      });
    }
  }
  // 反轉量子位元順序
  for (let j = 0; j < Math.floor(n / 2); j++) {
    v = swapQubits(v, j, n - 1 - j, n);
  }
  steps.push({ label: '反轉量子位元順序（SWAP）', state: v.slice(), gate: 'SWAP' });
  return steps;
}

export function swapQubits(v, a, b, n) {
  if (a === b) return v.slice();
  const dim = 1 << n;
  const out = Array.from({ length: dim }, () => C.make(0, 0));
  const abit = 1 << (n - 1 - a);
  const bbit = 1 << (n - 1 - b);
  for (let i = 0; i < dim; i++) {
    const ai = (i & abit) !== 0 ? 1 : 0;
    const bi = (i & bbit) !== 0 ? 1 : 0;
    let j = i;
    if (ai !== bi) j = i ^ abit ^ bbit;
    out[j] = v[i];
  }
  return out;
}

// ---------- Bloch 球座標 ----------

// |ψ> = cos(θ/2)|0> + e^{iφ}sin(θ/2)|1>  →  (x,y,z)
export function blochVector(alpha, beta) {
  const x = 2 * (alpha.re * beta.re + alpha.im * beta.im);
  const y = 2 * (alpha.re * beta.im - alpha.im * beta.re);
  const z = C.abs2(alpha) - C.abs2(beta);
  return { x, y, z };
}

export function fromBlochAngles(theta, phi) {
  return [
    C.make(Math.cos(theta / 2), 0),
    C.polar(Math.sin(theta / 2), phi),
  ];
}

// ---------- 週期尋找（Shor 用，古典部分） ----------

export function modExp(base, exp, mod) {
  let result = 1, b = base % mod, e = exp;
  while (e > 0) {
    if (e & 1) result = (result * b) % mod;
    b = (b * b) % mod;
    e >>= 1;
  }
  return result;
}

export function findPeriod(a, N) {
  let x = a % N;
  for (let r = 1; r <= N; r++) {
    if (x === 1) return r;
    x = (x * a) % N;
  }
  return null;
}

export function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}
