/**
 * SlideEngine
 * 슬라이드 내비게이션의 단일 소스. 입력 방식(휠/키보드/터치)이나 렌더링 방식과
 * 완전히 분리되어 있어, 어떤 입력이든 engine.next()/prev()/goTo()만 호출하면 된다.
 *
 * 이벤트:
 *   'beforechange' { from, to, direction }  — 전환 시작 직전
 *   'change'       { index, direction, slide } — 전환(activation) 반영 직후
 */
export class SlideEngine {
  constructor(stageEl) {
    this.stage = stageEl;
    this.slides = Array.from(stageEl.querySelectorAll(':scope > .slide'));
    this.total = this.slides.length;
    this.index = 0;
    this.locked = false;
    this._listeners = {};
  }

  on(event, handler) {
    (this._listeners[event] ||= []).push(handler);
    return this;
  }

  _emit(event, payload) {
    (this._listeners[event] || []).forEach((fn) => fn(payload));
  }

  init(startIndex = 0) {
    this.index = Math.min(Math.max(startIndex, 0), this.total - 1);
    this.slides.forEach((slide, i) => slide.classList.toggle('active', i === this.index));
    this._emit('change', { index: this.index, direction: 0, slide: this.slides[this.index] });
    return this;
  }

  goTo(nextIndex) {
    if (this.locked) return;
    if (nextIndex < 0 || nextIndex >= this.total) return;
    if (nextIndex === this.index) return;

    const direction = nextIndex > this.index ? 1 : -1;
    const prevSlide = this.slides[this.index];
    const nextSlide = this.slides[nextIndex];

    this.locked = true;
    this._emit('beforechange', { from: this.index, to: nextIndex, direction });

    prevSlide.classList.remove('active');
    prevSlide.classList.add(direction > 0 ? 'is-leaving-forward' : 'is-leaving-back');
    nextSlide.classList.add('active');

    const cleanup = () => {
      prevSlide.classList.remove('is-leaving-forward', 'is-leaving-back');
      this.locked = false;
      prevSlide.removeEventListener('transitionend', cleanup);
    };
    prevSlide.addEventListener('transitionend', cleanup);
    // transitionend가 못 잡히는 경우(모션 축소 설정 등)를 대비한 안전장치
    setTimeout(cleanup, 900);

    this.index = nextIndex;
    this._emit('change', { index: this.index, direction, slide: nextSlide });
  }

  next() { this.goTo(this.index + 1); }
  prev() { this.goTo(this.index - 1); }
  getIndex() { return this.index; }
  getTotal() { return this.total; }
}
