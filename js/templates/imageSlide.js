/**
 * imageSlide.js — Template: IMAGE SLIDE
 * 이미 완성된 슬라이드 이미지(제목/텍스트/배너가 이미지 안에 다 포함된 경우)를
 * 별도 HTML 텍스트 없이 그대로 풀스크린(16:9, object-fit:contain)으로 보여준다.
 * 우리 엔진(네비게이션/전환/인쇄모드/4K 스케일링)은 그대로 적용되면서,
 * 콘텐츠 중복(이미지 안 텍스트 + HTML 텍스트) 문제를 원천적으로 없앤다.
 *
 * data shape: { image: { src, srcset, alt } }
 */
export function renderImageSlide(data) {
  const el = document.createElement('div');
  el.className = 'tpl-image-slide';
  el.innerHTML = `
    <div class="media-frame is-16x9">
      <img
        data-src="${data.image.src}"
        ${data.image.srcset ? `data-srcset="${data.image.srcset}"` : ''}
        alt="${data.image.alt || ''}"
        loading="lazy"
      />
    </div>
  `;
  return el;
}
