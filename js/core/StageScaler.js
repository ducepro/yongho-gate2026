/**
 * StageScaler
 * 디자인은 항상 1920x1080 고정 캔버스 기준(PPT와 동일한 정밀도)으로 작업하고,
 * 실제 화면(노트북, 4K TV, 태블릿 등)에는 transform: scale()로 맞춰 보여준다.
 *
 * 4K(3840x2160) 화면에서는 scale이 2에 가까워지므로, 래스터 이미지가 흐려지지
 * 않으려면 2x/4K 원본 에셋이 함께 제공되어야 한다 (LazyImageLoader가 srcset으로 처리).
 */
export class StageScaler {
  constructor(stageEl, viewportEl, { width = 1920, height = 1080 } = {}) {
    this.stage = stageEl;
    this.viewport = viewportEl;
    this.width = width;
    this.height = height;
    this.scale = 1;
    this._onResize = this._onResize.bind(this);
  }

  init() {
    this._onResize();
    window.addEventListener('resize', this._onResize);
    return this;
  }

  destroy() {
    window.removeEventListener('resize', this._onResize);
  }

  _onResize() {
    const vw = this.viewport.clientWidth;
    const vh = this.viewport.clientHeight;
    const scale = Math.min(vw / this.width, vh / this.height);
    this.scale = scale;
    this.stage.style.transform = `scale(${scale})`;
    document.dispatchEvent(new CustomEvent('tjpe:stagescale', { detail: { scale } }));
  }

  getScale() {
    return this.scale;
  }

  /** 인쇄 모드 등에서 스케일을 강제로 재계산해야 할 때 사용 */
  refresh() {
    this._onResize();
  }
}
