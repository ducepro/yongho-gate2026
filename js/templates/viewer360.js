/**
 * viewer360.js — Template: VIEWER360 (확장 스텁)
 * TODO: 실제 360 뷰어 라이브러리(예: photo-sphere-viewer) 연동 필요.
 * 지금은 드래그로 좌우 회전하는 간이 프레임 시퀀스 방식의 자리표시자만 제공.
 * content.js에서 template:'viewer360'으로 등록하고, data.frames(이미지 배열)를 넘기면 된다.
 */
export function renderViewer360(data) {
  const el = document.createElement('div');
  el.className = 'tpl-viewer360 media-frame';
  el.innerHTML = `
    <img data-src="${data.frames?.[0] || ''}" alt="${data.alt || '360 뷰'}" loading="lazy" />
    <p style="position:absolute;bottom:12px;left:12px;font-size:12px;color:#fff;background:rgba(0,0,0,.5);padding:4px 10px;border-radius:12px;">
      360˚ VIEWER — Coming soon
    </p>
  `;
  el.style.position = 'relative';
  return el;
}
