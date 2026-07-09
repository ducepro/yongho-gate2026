/**
 * simulation.js — Template: SIMULATION (v2)
 * 상단: Before/After 드래그 비교 (single 모드면 이미지 1장만)
 * 하단: 3~4개 핵심 설명 카드 (재질/경관효과/상징성/제작성 등) — feature-card 공통 컴포넌트 사용
 *
 * data shape:
 * {
 *   mode: 'compare' | 'single'   // 기본 'compare'
 *   before: { src, srcset, alt }, after: { src, srcset, alt }  // mode:'compare'일 때
 *   image: { src, srcset, alt }                                 // mode:'single'일 때
 *   beforeLabel, afterLabel,
 *   cards: [{ title, desc }, ...]  // 3~4개 권장
 * }
 */
/**
 * simulation.js — Template: SIMULATION (v2.1 — 16:9 프레임 대응)
 * mode:'compare' → 기존 Before/After 드래그 슬라이더 (풀블리드 cover, 변경 없음)
 * mode:'single'  → 16:9 프레임 안에 원본 이미지 전체를 object-fit:contain으로 표시
 * 하단: 3~4개 핵심 설명 카드 — feature-card 공통 컴포넌트 사용
 *
 * data shape:
 * {
 *   mode: 'compare' | 'single'   // 기본 'compare'
 *   before: { src, srcset, alt }, after: { src, srcset, alt }  // mode:'compare'일 때
 *   image: { src, srcset, alt }                                 // mode:'single'일 때
 *   beforeLabel, afterLabel,
 *   cards: [{ title, desc }, ...]  // 3~4개 권장
 * }
 */
export function renderSimulation(data) {
  const isSingle = data.mode === 'single';
  const el = document.createElement('div');
  el.className = 'tpl-simulation';

  const cardsHtml = `
    <div class="tpl-simulation__cards">
      <div class="feature-grid ${(data.cards || []).length >= 4 ? 'cols-4' : 'cols-3'}">
        ${(data.cards || []).map(c => `
          <div class="feature-card">
            <div class="feature-card__title">${c.title}</div>
            <div class="feature-card__desc">${c.desc}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  if (isSingle) {
    el.innerHTML = `
      <div class="tpl-simulation__single-slot">
        <div class="media-frame is-16x9">
          <img data-src="${data.image.src}" ${data.image.srcset ? `data-srcset="${data.image.srcset}"` : ''} alt="${data.image.alt || ''}" loading="lazy" />
        </div>
      </div>
      ${cardsHtml}
    `;
    return el;
  }

  el.innerHTML = `
    <div class="tpl-simulation__compare" data-touch-lock style="--reveal: 50">
      <div class="tpl-simulation__media is-before media-frame">
        <img data-src="${data.before.src}" ${data.before.srcset ? `data-srcset="${data.before.srcset}"` : ''} alt="${data.before.alt || 'Before'}" loading="lazy" />
      </div>
      <div class="tpl-simulation__media is-after media-frame">
        <img data-src="${data.after.src}" ${data.after.srcset ? `data-srcset="${data.after.srcset}"` : ''} alt="${data.after.alt || 'After'}" loading="lazy" />
      </div>
      <div class="tpl-simulation__labels">
        <span class="label-before">${data.beforeLabel || 'BEFORE'}</span>
        <span class="label-after">${data.afterLabel || 'AFTER'}</span>
      </div>
      <div class="tpl-simulation__handle"></div>
    </div>
    ${cardsHtml}
  `;

  const compare = el.querySelector('.tpl-simulation__compare');
  _bindDrag(compare);
  return el;
}

function _bindDrag(compareEl) {
  let dragging = false;

  const setReveal = (clientX) => {
    const rect = compareEl.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    compareEl.style.setProperty('--reveal', (ratio * 100).toFixed(2));
  };

  compareEl.addEventListener('pointerdown', (e) => {
    dragging = true;
    compareEl.setPointerCapture(e.pointerId);
    setReveal(e.clientX);
    e.stopPropagation(); // 슬라이드 전환용 스와이프와 충돌 방지
  });

  compareEl.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    setReveal(e.clientX);
    e.stopPropagation();
  });

  const end = (e) => { dragging = false; e.stopPropagation(); };
  compareEl.addEventListener('pointerup', end);
  compareEl.addEventListener('pointercancel', end);
}
