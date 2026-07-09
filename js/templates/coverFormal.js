/**
 * coverFormal.js — Template: COVER-FORMAL
 * 제출일/제안업체명/관리코드처럼 자주 바뀌는 값이 있는 행정 공문형 표지.
 * 이미지가 아니라 HTML/CSS라서 content.js의 값만 바꾸면 바로 반영된다.
 * 값이 빈 문자열이면 참고 이미지처럼 밑줄 블랭크로 표시된다.
 *
 * data shape:
 * {
 *   projectTitle,           // 상단 소제목. 예: '용호골목시장 게이트 리뉴얼'
 *   docTitle,               // 중앙 큰 제목. 예: '제안서' (글자 사이 자동으로 벌어짐)
 *   year, month, day,       // 날짜. month/day를 ''로 두면 빈칸으로 표시
 *   companyLabel,           // 예: '제안업체'
 *   companyName,            // 빈 문자열이면 빈 입력칸으로 표시
 *   managementCode,         // 우측 하단 관리 코드. 빈 문자열이면 밑줄만 표시
 *   codeLabel,              // 관리 코드 라벨. 예: '관리번호'
 * }
 */
export function renderCoverFormal(data) {
  const el = document.createElement('div');
  el.className = 'tpl-cover-formal';

  const blank = (v) => v ? v : '<span class="blank">&nbsp;</span>';
  const docTitleSpaced = (data.docTitle || '제안서').split('').join(' ');

  el.innerHTML = `
    <div class="cover-formal__sheet">
      <div class="cover-formal__project-title">${data.projectTitle || ''}</div>
      <div class="cover-formal__doc-title">${docTitleSpaced}</div>
      <div class="cover-formal__date-box">
        ${data.year || '&nbsp;'}년&nbsp;&nbsp;${blank(data.month)}월&nbsp;&nbsp;${blank(data.day)}일
      </div>
      <div class="cover-formal__company-row">
        <div class="cover-formal__company-label">${data.companyLabel || '제안업체'}</div>
        <div class="cover-formal__company-dash">－</div>
        <div class="cover-formal__company-input">${data.companyName || '&nbsp;'}</div>
      </div>
      <div class="cover-formal__code">
        ${data.codeLabel || '관리번호'}<span class="value">${data.managementCode || '&nbsp;'}</span>
      </div>
    </div>
  `;
  return el;
}
