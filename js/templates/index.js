import { renderCover, renderToc, renderCards, renderColumns } from './classic.js';
import { renderDesign } from './design.js';
import { renderSimulation } from './simulation.js';
import { renderDimension } from './dimension.js';
import { renderClosing } from './closing.js';
import { renderImageSlide } from './imageSlide.js';
import { renderCoverFormal } from './coverFormal.js';
import { renderVideo } from './video.js';
import { renderViewer360 } from './viewer360.js';

/**
 * 템플릿 레지스트리.
 * 새 템플릿을 추가하려면: 1) js/templates/*.js 에 렌더 함수 작성
 *                      2) 아래 REGISTRY에 등록
 *                      3) content.js에서 template: '키' 로 사용
 * 이게 "내용만 교체하면 새 제안서" 구조의 핵심 확장 지점이다.
 */
const REGISTRY = {
  cover: renderCover,
  toc: renderToc,
  cards: renderCards,
  columns: renderColumns,
  design: renderDesign,
  simulation: renderSimulation,
  dimension: renderDimension,
  closing: renderClosing,
  imageSlide: renderImageSlide,
  coverFormal: renderCoverFormal,
  video: renderVideo,
  viewer360: renderViewer360,
};

/**
 * 슬라이드 정의(content.js의 한 항목)를 실제 <section class="slide"> DOM으로 변환.
 * 기존 마크업 계약(section.slide + slide-header 구조)을 그대로 유지한다.
 */
export function renderSlide(def, index) {
  const section = document.createElement('section');
  section.className = `slide ${def.theme || 'light-theme'}`;
  section.id = def.id || `slide-${index + 1}`;
  section.dataset.transition = def.transition || 'fade';

  // 완성된 슬라이드 이미지 / 공문형 표지처럼 자체 여백을 갖는 템플릿은 풀블리드로 표시
  if (def.template === 'imageSlide' || def.template === 'coverFormal') {
    section.classList.add('slide--fullbleed');
  }

  if (def.header) {
    const header = document.createElement('div');
    header.className = 'slide-header';
    header.innerHTML = `
      <span class="slide-number">${String(index + 1).padStart(2, '0')}</span>
      <h2>${def.header.title}</h2>
      ${def.header.subtitle ? `<p class="slide-subtitle">${def.header.subtitle}</p>` : ''}
    `;
    section.appendChild(header);
  }

  const renderFn = REGISTRY[def.template];
  if (!renderFn) {
    console.warn(`[TJPE] 알 수 없는 템플릿 "${def.template}" (slide: ${def.id})`);
  } else {
    section.appendChild(renderFn(def.data));
  }

  if (def.bgImage) {
    const bg = document.createElement('div');
    bg.className = 'slide-bg-image';
    bg.style.backgroundImage = `url('${def.bgImage}')`;
    section.appendChild(bg);
  }

  return section;
}

export { REGISTRY };
