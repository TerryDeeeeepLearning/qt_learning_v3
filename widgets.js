/* ============================================================
   widgets.js — 元件註冊表
   課程 HTML 用 <div class="widget" data-widget="名稱"></div> 掛載
   ============================================================ */

import { complexPlane, innerProduct, matrixInspector, unitaryAction,
         blochSphere, measurementSim } from './widgets-a.js';
import { tensorGrowth, entanglementCheck, dftExplorer, circuitBuilder,
         phaseExplorer, qftStepper, shorDemo } from './widgets-b.js';
import { renderMath } from './widget-kit.js';

export const WIDGETS = {
  'complex-plane': complexPlane,
  'inner-product': innerProduct,
  'matrix-inspector': matrixInspector,
  'unitary-action': unitaryAction,
  'bloch-sphere': blochSphere,
  'measurement-sim': measurementSim,
  'tensor-growth': tensorGrowth,
  'entanglement-check': entanglementCheck,
  'dft-explorer': dftExplorer,
  'circuit-builder': circuitBuilder,
  'phase-explorer': phaseExplorer,
  'qft-stepper': qftStepper,
  'shor-demo': shorDemo,
};

/** 掃描容器內所有 .widget 元素並掛載對應元件 */
export function mountWidgets(container) {
  container.querySelectorAll('[data-widget]').forEach((node) => {
    if (node.dataset.mounted === '1') return;
    const name = node.dataset.widget;
    const fn = WIDGETS[name];
    const host = document.createElement('div');
    host.className = 'w-host';

    const title = node.dataset.title;
    if (title) {
      const head = document.createElement('div');
      head.className = 'w-head';
      head.innerHTML = `<span class="w-badge">互動</span><span class="w-title">${title}</span>`;
      host.appendChild(head);
      renderMath(head);   // 標題在 renderMath 之後才注入，這裡要補渲染
    }

    if (!fn) {
      host.innerHTML += `<div class="w-note warn">找不到互動元件「${name}」。</div>`;
    } else {
      try {
        fn(host);
      } catch (err) {
        const e = document.createElement('div');
        e.className = 'w-note warn';
        e.textContent = `互動元件「${name}」載入失敗：${err.message}`;
        host.appendChild(e);
        console.error(`widget ${name} failed:`, err);
      }
    }

    node.appendChild(host);
    node.dataset.mounted = '1';
  });
}
