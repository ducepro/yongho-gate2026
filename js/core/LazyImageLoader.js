/**
 * LazyImageLoader
 * <img data-src="..." data-srcset="img-1x.jpg 1x, img-2x.jpg 2x, img-4k.jpg 4x"> 형태를
 * 뷰포트(스테이지) 진입 시점에 실제로 로드한다.
 *
 * srcset의 밀도 서술자(1x/2x/4x)는 브라우저가 devicePixelRatio 기준으로 스스로 고른다.
 * 참고: 이 프로젝트는 CSS transform:scale로 캔버스를 확대하는 구조라(StageScaler),
 * 4K TV처럼 스케일이 커지는 환경에서 더 세밀한 제어가 필요하면 밀도 서술자 대신
 * width 서술자(w)+sizes를 쓰는 방식으로 교체할 수 있다 (v2 확장 지점).
 */
export class LazyImageLoader {
  constructor({ root = null, rootMargin = '200px' } = {}) {
    this.supportsIO = 'IntersectionObserver' in window;
    this.observer = this.supportsIO
      ? new IntersectionObserver(this._onIntersect.bind(this), { root, rootMargin })
      : null;
  }

  observe(container = document) {
    const targets = container.querySelectorAll('img[data-src], img[data-srcset]');
    targets.forEach((img) => {
      if (this.observer) this.observer.observe(img);
      else this._load(img); // IntersectionObserver 미지원 환경 폴백: 즉시 로드
    });
  }

  _onIntersect(entries, obs) {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      this._load(entry.target);
      obs.unobserve(entry.target);
    });
  }

  _load(img) {
    const { src, srcset } = img.dataset;
    if (srcset) img.srcset = srcset;
    if (src) img.src = src;
    img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
  }
}
