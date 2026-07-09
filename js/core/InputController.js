/**
 * InputController
 * 휠 / 키보드 / 터치 스와이프 세 가지 입력을 SlideEngine 호출로 변환한다.
 * PresentationMode가 인쇄 모드 진입 시 setEnabled(false)로 비활성화할 수 있다.
 */
export class InputController {
  constructor(engine, { wheelThreshold = 40, wheelCooldown = 650, swipeThreshold = 50 } = {}) {
    this.engine = engine;
    this.wheelThreshold = wheelThreshold;
    this.wheelCooldown = wheelCooldown;
    this.swipeThreshold = swipeThreshold;
    this.enabled = true;

    this._wheelLock = false;
    this._touchStartX = null;
    this._touchStartY = null;

    this._onWheel = this._onWheel.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);
  }

  attach(target = window) {
    this.target = target;
    target.addEventListener('wheel', this._onWheel, { passive: true });
    target.addEventListener('keydown', this._onKeydown);
    target.addEventListener('touchstart', this._onTouchStart, { passive: true });
    target.addEventListener('touchend', this._onTouchEnd, { passive: true });
    return this;
  }

  detach() {
    this.target.removeEventListener('wheel', this._onWheel);
    this.target.removeEventListener('keydown', this._onKeydown);
    this.target.removeEventListener('touchstart', this._onTouchStart);
    this.target.removeEventListener('touchend', this._onTouchEnd);
  }

  setEnabled(value) {
    this.enabled = value;
  }

  _onWheel(e) {
    if (!this.enabled || this._wheelLock) return;
    // 슬라이드 내부 스크롤 영역([data-scroll-lock])에서는 휠을 페이지 전환에 쓰지 않음
    if (e.target.closest && e.target.closest('[data-scroll-lock]')) return;
    if (Math.abs(e.deltaY) < this.wheelThreshold) return;

    this._wheelLock = true;
    if (e.deltaY > 0) this.engine.next();
    else this.engine.prev();
    setTimeout(() => { this._wheelLock = false; }, this.wheelCooldown);
  }

  _onKeydown(e) {
    if (!this.enabled) return;
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      this.engine.next();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      this.engine.prev();
    } else if (e.key === 'Home') {
      e.preventDefault();
      this.engine.goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      this.engine.goTo(this.engine.getTotal() - 1);
    }
  }

  _onTouchStart(e) {
    if (!this.enabled) return;
    if (e.target.closest && e.target.closest('[data-touch-lock]')) { this._touchStartX = null; return; }
    const t = e.changedTouches[0];
    this._touchStartX = t.clientX;
    this._touchStartY = t.clientY;
  }

  _onTouchEnd(e) {
    if (!this.enabled || this._touchStartX === null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - this._touchStartX;
    const dy = t.clientY - this._touchStartY;

    if (Math.abs(dx) > this.swipeThreshold && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) this.engine.next();
      else this.engine.prev();
    }
    this._touchStartX = null;
  }
}
