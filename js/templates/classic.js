/**
 * classic.js
 * 기존 정적 HTML(cover / toc / cards / columns)을 데이터 기반 렌더러로 이식.
 * 마크업/클래스명은 원본과 동일 — 디자인 변경 없이 구조만 컴포넌트화.
 */

export function renderCover(data) {
  const el = document.createElement('div');
  el.className = 'cover-content';
  el.innerHTML = `
    <span class="subtitle">${data.subtitle}</span>
    <h1>${data.title}</h1>
    <p class="tagline">${data.tagline}</p>
    <div class="core-values">
      ${data.values.map(v => `
        <div class="value-item">
          <div class="value-icon">${v.icon}</div>
          <strong>${v.label}</strong>
          <span>${v.desc}</span>
        </div>`).join('')}
    </div>
    <div class="cover-footer">
      <span class="presenter">PRESENTED BY <strong>${data.presenter}</strong></span>
      <div class="footer-badges">
        ${data.badges.map(b => `<span>${b}</span>`).join('')}
      </div>
    </div>
  `;
  return el;
}

export function renderToc(data) {
  const el = document.createElement('div');
  el.className = 'toc-container';
  const renderColumn = (sections) => sections.map(s => `
    <div class="toc-section">
      <h3>${s.title}</h3>
      <ul>
        ${s.items.map(i => `<li><span>${i.no}</span> ${i.label}</li>`).join('')}
      </ul>
    </div>
  `).join('');

  el.innerHTML = `
    <div class="toc-left">${renderColumn(data.left)}</div>
    <div class="toc-right">
      ${renderColumn(data.right)}
      <div class="toc-graphic">
        <svg viewBox="0 0 100 60" class="lighthouse-svg">
          <path d="M50,10 L45,45 L55,45 Z" fill="none" stroke="#2b4c7e" stroke-width="1"/>
          <circle cx="50" cy="10" r="3" fill="#e5a93b"/>
          <path d="M50,10 L20,30 M50,10 L80,30" stroke="#e5a93b" stroke-width="0.5" stroke-dasharray="2,2"/>
          <path d="M10,50 Q50,45 90,50" fill="none" stroke="#2b4c7e" stroke-width="1"/>
        </svg>
      </div>
    </div>
  `;
  return el;
}

export function renderCards(data) {
  const el = document.createElement('div');
  el.className = 'grid-4-cards';
  el.innerHTML = data.cards.map(c => `
    <div class="info-card">
      <div class="card-icon">${c.icon}</div>
      <h3>${c.title}</h3>
      <ul>${c.items.map(i => `<li>${i}</li>`).join('')}</ul>
    </div>
  `).join('');
  return el;
}

export function renderColumns(data) {
  const el = document.createElement('div');
  el.className = 'grid-4-columns';
  el.innerHTML = data.columns.map(c => `
    <div class="column-item">
      <div class="col-icon">${c.icon}</div>
      <h4>${c.title}</h4>
      <p>${c.desc}</p>
    </div>
  `).join('');
  return el;
}
