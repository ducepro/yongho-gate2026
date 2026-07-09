import { SLIDES } from './data/content.js';
import { renderSlide } from './templates/index.js';
import { StageScaler } from './core/StageScaler.js';
import { SlideEngine } from './core/SlideEngine.js';
import { InputController } from './core/InputController.js';
import { LazyImageLoader } from './core/LazyImageLoader.js';
import { PresentationMode } from './core/PresentationMode.js';

document.addEventListener('DOMContentLoaded', () => {
  const viewport = document.getElementById('stage-viewport');
  const stage = document.getElementById('stage');

  // 1) 콘텐츠 데이터 → DOM 렌더링 (section.slide 구조는 그대로 유지됨)
  SLIDES.forEach((def, i) => stage.appendChild(renderSlide(def, i)));

  // 2) 코어 모듈 초기화
  const scaler = new StageScaler(stage, viewport).init();
  const engine = new SlideEngine(stage).init(0);
  const input = new InputController(engine).attach(window);
  const lazyLoader = new LazyImageLoader();
  lazyLoader.observe(stage);
  const presentation = new PresentationMode({ inputController: input, stageScaler: scaler });

  // 3) UI 컨트롤 (이전/다음, 인디케이터, 도트, 인쇄/전체화면)
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const pageIndicator = document.getElementById('page-indicator');
  const dotsWrap = document.getElementById('progress-dots');
  const printBtn = document.getElementById('print-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');

  SLIDES.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `${i + 1}번 슬라이드로 이동`);
    dot.addEventListener('click', () => engine.goTo(i));
    dotsWrap.appendChild(dot);
  });

  function syncUI({ index }) {
    pageIndicator.textContent = `${index + 1} / ${engine.getTotal()}`;
    Array.from(dotsWrap.children).forEach((dot, i) => dot.classList.toggle('is-current', i === index));
  }
  engine.on('change', syncUI);
  syncUI({ index: engine.getIndex() });

  prevBtn.addEventListener('click', () => engine.prev());
  nextBtn.addEventListener('click', () => engine.next());
  printBtn?.addEventListener('click', () => presentation.printToPDF());
  fullscreenBtn?.addEventListener('click', () => presentation.toggleFullscreen());

  // 4) 확장/디버그용 공개 API (콘솔에서 window.TJPE.engine.goTo(3) 등으로 조작 가능)
  window.TJPE = { engine, scaler, input, presentation, lazyLoader };
});
