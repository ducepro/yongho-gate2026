/**
 * dimension.js — Template: DIMENSION (v2)
 * 좌측: 도면 + 좌표 기반 콜아웃 / 우측: 카테고리별 규격 그룹
 *
 * data shape:
 * {
 *   diagram: { src, srcset, alt },
 *   callouts: [{ x, y, label }],   // x/y는 0~100(%)
 *   groups: [
 *     { title: '규격', rows: [{ label, value }] },
 *     { title: '재질', rows: [...] },
 *     { title: '제작 방식', rows: [...] },
 *     { title: '구조', rows: [...] },
 *     { title: 'LED 사양', rows: [...] },
 *   ]
 * }
 */
export function renderDimension(data) {
  const el = document.createElement('div');
  el.className = 'tpl-dimension';
  el.innerHTML = `
    <div class="tpl-dimension__diagram-slot">
<div class="tpl-dimension__diagram">
        <img
          data-src="${data.diagram.src}"
          ${data.diagram.srcset ? `data-srcset="${data.diagram.srcset}"` : ''}
          alt="${data.diagram.alt || '치수도'}"
          loading="lazy"
        />
        ${(data.callouts || []).map(c => `
          <span class="tpl-dimension__callout" style="left:${c.x}%; top:${c.y}%;">${c.label}</span>
        `).join('')}
      </div>
    </div>
    <div class="tpl-dimension__specs" data-scroll-lock>
      ${(data.groups || []).map(g => `
        <div class="spec-group">
          <div class="spec-group__title">${g.title}</div>
          ${g.rows.map(r => `
            <div class="spec-row">
              <span class="spec-label">${r.label}</span>
              <span class="spec-value">${r.value}</span>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  `;
  return el;
}
