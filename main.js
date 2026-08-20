/* ============================================================
   main.js — App 主控：載入、路由、進度、課程渲染
   ============================================================ */

import { mountWidgets } from './widgets.js';
import { renderMath } from './widget-kit.js';

const CONTENT_BASE = 'content/';
const PROGRESS_KEY = 'qtrace_progress_v2';
const TRACK_LABEL = { basics: '基礎', core: '核心' };

let LESSONS = [];

/* ---------- 進度（localStorage，單機） ---------- */

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) throw new Error('empty');
    const p = JSON.parse(raw);
    return {
      completed: p.completed || [],
      lastCompletedDate: p.lastCompletedDate || null,
      streak: p.streak || 0,
      quizzes: p.quizzes || {},
    };
  } catch {
    return { completed: [], lastCompletedDate: null, streak: 0, quizzes: {} };
  }
}

function saveProgress(p) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch {}
}

const dayStr = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayStr(d);
}

function markCompleted(lessonId) {
  const p = loadProgress();
  if (!p.completed.includes(lessonId)) {
    p.completed.push(lessonId);
    const today = dayStr();
    if (p.lastCompletedDate !== today) {
      p.streak = (p.lastCompletedDate === yesterdayStr()) ? p.streak + 1 : 1;
      p.lastCompletedDate = today;
    }
    saveProgress(p);
  }
  return p;
}

/* ---------- 資料 ---------- */

async function loadIndex() {
  const res = await fetch(CONTENT_BASE + 'index.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error(`索引載入失敗 HTTP ${res.status}`);
  const data = await res.json();
  LESSONS = data.lessons.sort((a, b) => a.order - b.order);
}

const isUnlocked = (l, done) => l.prereqs.every((id) => done.has(id));
const nextLesson = (done) =>
  LESSONS.find((l) => !done.has(l.id) && isUnlocked(l, done));

/* ---------- 首頁 ---------- */

function renderHome() {
  const p = loadProgress();
  const done = new Set(p.completed);

  document.getElementById('streak-count').textContent = p.streak;
  document.getElementById('progress-fraction').textContent =
    `${done.size}/${LESSONS.length}`;

  const pct = LESSONS.length ? (done.size / LESSONS.length) * 100 : 0;
  document.getElementById('progress-fill').style.width = `${pct}%`;

  const next = nextLesson(done);
  const titleEl = document.getElementById('today-title');
  const hookEl = document.getElementById('today-hook');
  const metaEl = document.getElementById('today-meta');
  const btn = document.getElementById('today-start-btn');

  if (next) {
    titleEl.textContent = next.title;
    hookEl.textContent = next.hook || '';
    metaEl.innerHTML =
      `<span class="tm-pill">${TRACK_LABEL[next.track]}篇</span>` +
      `<span class="tm-item">約 ${next.estMinutes} 分鐘</span>` +
      `<span class="tm-item">${next.labs || 1} 個互動實驗</span>`;
    btn.disabled = false;
    btn.textContent = done.size === 0 ? '開始第一課' : '開始今天的課';
    btn.onclick = () => openLesson(next.id);
  } else if (done.size === LESSONS.length) {
    titleEl.textContent = '這條主線已全部完成';
    hookEl.textContent = '下一條主線：量子機器學習（VQE、QAOA）';
    metaEl.innerHTML = '<span class="tm-pill done">完成</span>';
    btn.disabled = true;
    btn.textContent = '全部完成';
  } else {
    titleEl.textContent = '沒有可解鎖的課程';
    hookEl.textContent = '請檢查知識電路中卡住的節點';
    metaEl.innerHTML = '';
    btn.disabled = true;
  }

  renderRail(done, next ? next.id : null);
}

function renderRail(done, activeId) {
  const rail = document.getElementById('rail');
  rail.innerHTML = '';

  LESSONS.forEach((lesson) => {
    const unlocked = isUnlocked(lesson, done);
    const isDone = done.has(lesson.id);
    const state = isDone ? 'done'
      : lesson.id === activeId ? 'active'
      : unlocked ? 'unlocked' : 'locked';

    const btn = document.createElement('button');
    btn.className = 'rail-node';
    btn.dataset.state = state;
    btn.disabled = state === 'locked';

    const meta = isDone ? '已完成'
      : state === 'locked' ? `需先完成：${lesson.prereqs.map(prereqTitle).join('、')}`
      : `約 ${lesson.estMinutes} 分鐘 · ${lesson.labs || 1} 個實驗`;

    btn.innerHTML = `
      <span class="rail-dot"></span>
      <div class="rail-label-row">
        <span class="rail-title">${lesson.title}</span>
        <span class="rail-tag">${TRACK_LABEL[lesson.track]}</span>
      </div>
      <div class="rail-meta">${meta}</div>`;

    if (state !== 'locked') btn.onclick = () => openLesson(lesson.id);
    rail.appendChild(btn);
  });
}

const prereqTitle = (id) => {
  const l = LESSONS.find((x) => x.id === id);
  return l ? l.title : id;
};

/* ---------- 小測驗 ---------- */

function mountQuizzes(container, lessonId) {
  container.querySelectorAll('[data-quiz]').forEach((node) => {
    if (node.dataset.mounted === '1') return;
    let cfg;
    try {
      cfg = JSON.parse(node.dataset.quiz);
    } catch (e) {
      node.innerHTML = `<div class="w-note warn">測驗資料格式錯誤：${e.message}</div>`;
      node.dataset.mounted = '1';
      return;
    }

    const box = document.createElement('div');
    box.className = 'quiz-box';
    box.innerHTML = `
      <div class="quiz-head"><span class="quiz-badge">檢核</span>${cfg.q}</div>
      <div class="quiz-options"></div>
      <div class="quiz-explain"></div>`;

    const optWrap = box.querySelector('.quiz-options');
    const explain = box.querySelector('.quiz-explain');
    let answered = false;

    cfg.options.forEach((text, i) => {
      const b = document.createElement('button');
      b.className = 'quiz-opt';
      b.innerHTML = `<span class="qo-idx">${'ABCD'[i]}</span><span class="qo-text">${text}</span>`;
      b.onclick = () => {
        if (answered) return;
        answered = true;
        const correct = i === cfg.answer;
        b.classList.add(correct ? 'correct' : 'wrong');
        if (!correct) {
          optWrap.children[cfg.answer].classList.add('correct');
        }
        [...optWrap.children].forEach((c) => c.classList.add('locked'));
        explain.innerHTML =
          `<div class="qe-verdict ${correct ? 'ok' : 'no'}">${correct ? '答對了' : '再想一次'}</div>` +
          `<div class="qe-body">${cfg.explain}</div>`;
        explain.classList.add('show');
        renderMath(explain);

        const p = loadProgress();
        p.quizzes[lessonId] = correct;
        saveProgress(p);
      };
      optWrap.appendChild(b);
    });

    node.appendChild(box);
    node.dataset.mounted = '1';
    renderMath(box);
  });
}

/* ---------- 課程頁 ---------- */

async function openLesson(lessonId) {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  if (!lesson) return;

  const body = document.getElementById('lesson-body');
  document.getElementById('lesson-track-label').textContent =
    `${TRACK_LABEL[lesson.track]}篇 · 第 ${lesson.order} 課`;
  document.getElementById('lesson-title').textContent = lesson.title;
  body.innerHTML = '<div class="loading">載入中…</div>';

  document.getElementById('view-home').classList.add('hidden');
  document.getElementById('view-lesson').classList.remove('hidden');
  window.scrollTo(0, 0);

  const completeBtn = document.getElementById('complete-btn');
  completeBtn.onclick = null;
  completeBtn.disabled = true;

  try {
    const res = await fetch(CONTENT_BASE + lesson.file, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    if (!html.trim()) throw new Error('內容是空的');

    body.innerHTML = html;
    renderMath(body);          // 先渲染公式
    mountWidgets(body);         // 再掛載互動元件
    mountQuizzes(body, lesson.id);

    const p = loadProgress();
    const already = p.completed.includes(lesson.id);
    completeBtn.textContent = already ? '已完成 ✓' : '標記完成 ✓';
    completeBtn.disabled = already;
    completeBtn.onclick = () => {
      markCompleted(lesson.id);
      completeBtn.textContent = '已完成 ✓';
      completeBtn.disabled = true;
      const nx = document.getElementById('next-hint');
      const done = new Set(loadProgress().completed);
      const nl = nextLesson(done);
      nx.innerHTML = nl
        ? `下一課已解鎖：<b>${nl.title}</b>`
        : '這條主線已全部完成。';
      nx.classList.add('show');
    };
    document.getElementById('next-hint').classList.remove('show');
  } catch (err) {
    body.innerHTML = `
      <div class="w-note warn">
        這一課載入失敗（${err.message}）。<br>
        嘗試的路徑：<code>${CONTENT_BASE}${lesson.file}</code><br><br>
        若是在本機用 file:// 直接開啟，瀏覽器會擋住模組與 fetch，
        請用本機伺服器（例如 <code>python3 -m http.server</code>）或部署到 GitHub Pages 後再開。
      </div>`;
  }
}

function closeLesson() {
  document.getElementById('view-lesson').classList.add('hidden');
  document.getElementById('view-home').classList.remove('hidden');
  renderHome();
}

/* ---------- 啟動 ---------- */

document.getElementById('back-btn').addEventListener('click', closeLesson);

(async function init() {
  try {
    await loadIndex();
    renderHome();
  } catch (err) {
    document.getElementById('rail').innerHTML =
      `<div class="w-note warn">課程索引載入失敗：${err.message}</div>`;
  }
})();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
