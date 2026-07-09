/**
 * design.js — Template: DESIGN (v2)
 * 좌측 70~75% 디자인 시안 + 우측 설명 패널(Concept / Material / Key Features / Summary).
 * Key Features는 아이콘 나열이 아닌 공통 feature-card 컴포넌트로 렌더링한다.
 *
 * data shape:
 * {
 *   eyebrow, title,
 *   image: { src, srcset, alt },
 *   concept: '컨셉 설명 문단',
 *   material: '재질 설명 (짧은 문장)',
 *   features: [{ title, desc }, ...]   // 4~6개 권장
 *   summary: '디자인 종합 요약 문단'
 * }
 */
export function renderDesign(data) {
  const el = document.createElement('div');
  el.className = 'tpl-design';
  el.innerHTML = `
    <div class="tpl-design__visual">
      <div class="media-frame is-16x9">
        <img
          data-src="${data.image.src}"
          ${data.image.srcset ? `data-srcset="${data.image.srcset}"` : ''}
          alt="${data.image.alt || ''}"
          loading="lazy"
        />
      </div>
    </div>
    <div class="tpl-design__panel" data-scroll-lock>
      <span class="tpl-design__eyebrow">${data.eyebrow || ''}</span>
      <h3 class="tpl-design__title">${data.title}</h3>

      <div class="section-block">
        <span class="section-block__label">DESIGN CONCEPT</span>
        <p class="section-block__body">${data.concept}</p>
      </div>

      <div class="section-block">
        <span class="section-block__label">MATERIAL</span>
        <p class="section-block__body">${data.material}</p>
      </div>

      <div class="section-block">
        <span class="section-block__label">KEY FEATURES</span>
        <div class="feature-grid">
          ${(data.features || []).map(f => `
            <div class="feature-card">
              <div class="feature-card__title">${f.title}</div>
              <div class="feature-card__desc">${f.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="section-block">
        <span class="section-block__label">DESIGN SUMMARY</span>
        <p class="section-block__body is-emphasis">${data.summary}</p>
      </div>
    </div>
  `;
  return el;
}
