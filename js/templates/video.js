/**
 * video.js — Template: VIDEO (확장 스텁)
 * TODO: 재생/일시정지 커스텀 컨트롤, 자동재생 정책 대응, 자막 트랙 지원 추가 예정.
 * 현재는 최소 기능만 구현되어 있으며, content.js에서 template:'video'로 바로 사용 가능하다.
 */
export function renderVideo(data) {
  const el = document.createElement('div');
  el.className = 'tpl-video media-frame';
  el.innerHTML = `
    <video
      src="${data.src}"
      poster="${data.poster || ''}"
      ${data.autoplay ? 'autoplay muted loop playsinline' : 'controls'}
      preload="none"
      style="width:100%; height:100%; object-fit:cover;"
    ></video>
  `;
  return el;
}
