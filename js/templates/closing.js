/**
 * closing.js — Template: CLOSING
 * 발표 마지막 슬라이드. Cover와 톤은 맞추되 역할이 다르므로 별도 클래스로 분리.
 *
 * data shape:
 * {
 *   eyebrow, title, message,
 *   contact: { company, email, phone },
 *   bgImage: { src, alt }   // 선택. 시장/게이트 사진을 10~15% 투명도로 희미하게 배경에 깐다
 * }
 */
export function renderClosing(data) {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  wrapper.style.height = '100%';

  if (data.bgImage) {
    const bg = document.createElement('div');
    bg.className = 'closing-bg-image';
    bg.style.backgroundImage = `url('${data.bgImage.src}')`;
    bg.setAttribute('role', 'img');
    bg.setAttribute('aria-label', data.bgImage.alt || '');
    wrapper.appendChild(bg);
  }

  const content = document.createElement('div');
  content.className = 'closing-content';
  content.innerHTML = `
    <span class="subtitle">${data.eyebrow || ''}</span>
    <h1>${data.title}</h1>
    <p class="closing-message">${data.message}</p>
    ${data.contact ? `
      <div class="closing-contact">
        <strong>${data.contact.company || ''}</strong>
        <span>${data.contact.email || ''}</span>
        <span>${data.contact.phone || ''}</span>
      </div>
    ` : ''}
  `;
  wrapper.appendChild(content);
  return wrapper;
}
