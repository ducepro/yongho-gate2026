/**
 * export-ppt.mjs — TeamJ Presentation Engine V2 / PPT Export MVP
 *
 * 이 엔진은 특정 프로젝트(용호골목시장 등)를 직접 알지 않는다.
 * `--project <프로젝트 루트 경로>` 인자로 전달받은 폴더에서
 * presentation.config.mjs를 동적으로 읽어, 그 안의 값만으로 동작한다.
 *
 * 설계 원칙:
 * - content.js는 "읽기만" 한다. 절대 수정하지 않는다.
 * - PROJECT_ROOT / ASSETS_ROOT / CONTENT_PATH / OUTPUT_DIR은 전부
 *   --project 인자 + config 값으로만 계산한다.
 *   (터미널 실행 위치나 이 파일의 위치를 기준으로 추측하지 않는다)
 * - 이미지 배치는 pptxgenjs의 sizing:{type:'contain'/'cover'} 옵션을 사용하지 않는다.
 *   (실측 결과, pptxgenjs 4.0.1은 로컬 파일 경로의 실제 원본 크기를 읽지 않고
 *   전달한 목표 박스 크기를 "이미지 크기"로 그대로 재사용해, contain/cover 계산이
 *   무의미해지고 이미지가 박스에 늘어나며 원본 비율이 왜곡되는 문제가 있었다.)
 *   대신 이미지 원본 픽셀 크기는 외부 패키지 없이 PNG IHDR 청크를 직접 읽고,
 *   containFit()/coverFit()으로 x/y/w/h를 직접 계산해 addImage에 그대로 넘긴다.
 *   dimension 슬라이드의 콜아웃(%) 좌표도 이렇게 실제 계산된 "표시되는 도면 박스"
 *   기준으로 환산한다 — 이미지 배치 계산과 콜아웃 좌표 계산이 반드시 같은 값을 써야
 *   정렬이 어긋나지 않는다.
 */

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import pptxgen from 'pptxgenjs';

// ────────────────────────────────────────────────────────────
// --project 인자 파싱
// ────────────────────────────────────────────────────────────
function parseProjectArg(argv) {
  const idx = argv.indexOf('--project');
  if (idx === -1 || !argv[idx + 1]) {
    console.error(
      '오류: --project <프로젝트 루트 경로> 인자가 필요합니다.\n' +
        '예: node export/engine/export-ppt.mjs --project .'
    );
    process.exit(1);
  }
  return argv[idx + 1];
}

const projectArg = parseProjectArg(process.argv.slice(2));
const PROJECT_ROOT = path.resolve(process.cwd(), projectArg);

if (!fs.existsSync(PROJECT_ROOT)) {
  console.error(`오류: 프로젝트 루트 경로가 존재하지 않습니다 -> ${PROJECT_ROOT}`);
  process.exit(1);
}

// ────────────────────────────────────────────────────────────
// presentation.config.mjs 로드 및 검증
// ────────────────────────────────────────────────────────────
const CONFIG_PATH = path.join(PROJECT_ROOT, 'presentation.config.mjs');

if (!fs.existsSync(CONFIG_PATH)) {
  console.error(`오류: presentation.config.mjs를 찾을 수 없습니다 -> ${CONFIG_PATH}`);
  process.exit(1);
}

const configModule = await import(pathToFileURL(CONFIG_PATH).href);
const config = configModule.default;

function validateConfig(cfg) {
  const requiredKeys = ['contentPath', 'assetsBase', 'outputDir', 'outputFileName', 'theme', 'layout'];
  const missing = requiredKeys.filter((key) => cfg?.[key] === undefined || cfg?.[key] === null);
  if (missing.length) {
    console.error(
      `오류: presentation.config.mjs에 다음 필수 항목이 없습니다: ${missing.join(', ')}`
    );
    process.exit(1);
  }

  const requiredThemeKeys = ['accent', 'ink', 'inkMuted', 'fontFace', 'monoFontFace'];
  const missingTheme = requiredThemeKeys.filter((key) => cfg.theme[key] === undefined);
  if (missingTheme.length) {
    console.error(`오류: config.theme에 다음 항목이 없습니다: ${missingTheme.join(', ')}`);
    process.exit(1);
  }

  // layout 세부 키는 템플릿마다 다르므로(예: dimension은 dimensionLeftFr/RightFr,
  // overview는 overviewLeftFr/RightFr) 여기서는 layout이 객체인지만 확인하고,
  // 세부 키는 각 렌더러가 실제로 그 템플릿을 그릴 때 확인한다.
  if (typeof cfg.layout !== 'object' || cfg.layout === null) {
    console.error('오류: config.layout은 객체여야 합니다.');
    process.exit(1);
  }
}

validateConfig(config);

// ────────────────────────────────────────────────────────────
// 경로 계산 (전부 PROJECT_ROOT + config 값 기준. 추측 없음)
// ────────────────────────────────────────────────────────────
const ASSETS_ROOT = path.resolve(PROJECT_ROOT, config.assetsBase);
const CONTENT_PATH = path.resolve(PROJECT_ROOT, config.contentPath);
const OUTPUT_DIR = path.resolve(PROJECT_ROOT, config.outputDir);

if (!fs.existsSync(CONTENT_PATH)) {
  console.error(`오류: content.js를 찾을 수 없습니다 -> ${CONTENT_PATH}`);
  process.exit(1);
}

const contentModule = await import(pathToFileURL(CONTENT_PATH).href);
const SLIDES = contentModule.SLIDES;

if (!Array.isArray(SLIDES)) {
  console.error(`오류: ${CONTENT_PATH}에서 SLIDES 배열을 찾을 수 없습니다 (export const SLIDES 확인 필요).`);
  process.exit(1);
}

/**
 * content.js 안의 웹 기준 상대경로(예: 'assets/images/1x/cover.png')를
 * ASSETS_ROOT 기준 절대경로로 변환한다. (PROJECT_ROOT가 아니라 ASSETS_ROOT 기준)
 * 슬래시/백슬래시 혼용을 방어적으로 처리해 Windows에서도 동일하게 동작한다.
 */
function resolveAssetPath(relativePath) {
  const normalized = String(relativePath).replace(/\\/g, '/').replace(/^\.?\//, '');
  const segments = normalized.split('/').filter(Boolean);
  return path.join(ASSETS_ROOT, ...segments);
}

// ────────────────────────────────────────────────────────────
// PNG 원본 크기 읽기 (외부 패키지 없이 IHDR 청크 직접 파싱)
// ────────────────────────────────────────────────────────────
function getPngSize(absPath) {
  const buf = Buffer.alloc(24);
  const fd = fs.openSync(absPath, 'r');
  try {
    fs.readSync(fd, buf, 0, 24, 0);
  } finally {
    fs.closeSync(fd);
  }
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}

/** box(boxW×boxH) 안에 img(imgW×imgH)를 잘림 없이 최대로 맞췄을 때의 크기 */
function containFit(boxW, boxH, imgW, imgH) {
  const boxRatio = boxW / boxH;
  const imgRatio = imgW / imgH;
  if (imgRatio > boxRatio) {
    return { w: boxW, h: boxW / imgRatio };
  }
  return { w: boxH * imgRatio, h: boxH };
}

/**
 * box(boxW×boxH)를 img(imgW×imgH)로 원본 비율을 유지한 채 완전히 채웠을 때의 크기.
 * (CSS background-size:cover와 동일한 계산 — stretch 없이, 필요한 축만 넘치게 계산)
 * 반환된 w/h는 boxW/boxH보다 클 수 있으며, 호출부에서 중앙 정렬로 넘치는 부분을
 * 캔버스(슬라이드) 경계 밖에 두어 자연스럽게 잘리도록 한다 (실제 크롭 메타데이터 없이도
 * 슬라이드 경계가 시각적 크롭 역할을 한다).
 */
function coverFit(boxW, boxH, imgW, imgH) {
  const boxRatio = boxW / boxH;
  const imgRatio = imgW / imgH;
  if (imgRatio > boxRatio) {
    // 이미지가 박스보다 상대적으로 넓음 → 높이를 맞추고 폭은 넘치게(좌우 크롭)
    return { w: boxH * imgRatio, h: boxH };
  }
  // 이미지가 박스보다 상대적으로 좁음 → 폭을 맞추고 높이는 넘치게(상하 크롭)
  return { w: boxW, h: boxW / imgRatio };
}

// ────────────────────────────────────────────────────────────
// 레이아웃 상수 (16:9 캔버스 자체는 엔진 고정값 — 슬라이드 규격이므로 프로젝트 종속 아님)
// ────────────────────────────────────────────────────────────
const SLIDE_W = 10;
const SLIDE_H = 5.625;

const MARGIN = 0.4;
const HEADER_H = 0.55;
const COL_GAP = 0.25;

// config에서 주입되는 프로젝트 종속 값 (dimension 템플릿 전용)
const LEFT_FR = config.layout.dimensionLeftFr;
const RIGHT_FR = config.layout.dimensionRightFr;

// overview 템플릿 전용 좌우 비율
const OVERVIEW_LEFT_FR = config.layout.overviewLeftFr;
const OVERVIEW_RIGHT_FR = config.layout.overviewRightFr;

const COLOR_ACCENT = config.theme.accent;
const COLOR_INK = config.theme.ink;
const COLOR_INK_MUTED = config.theme.inkMuted;
const FONT_FACE = config.theme.fontFace;
const MONO_FONT_FACE = config.theme.monoFontFace;

// ────────────────────────────────────────────────────────────
// 실행
// ────────────────────────────────────────────────────────────
const missingImages = [];
let generatedCount = 0;

const pptx = new pptxgen();
pptx.defineLayout({ name: 'TEAMJ_16x9', width: SLIDE_W, height: SLIDE_H });
pptx.layout = 'TEAMJ_16x9';

console.log(`프로젝트: ${config.projectName}`);
console.log(`읽은 슬라이드 수: ${SLIDES.length}`);

function checkImage(relPath, slideId) {
  const abs = resolveAssetPath(relPath);
  if (!fs.existsSync(abs)) {
    missingImages.push(`[${slideId}] ${relPath} -> ${abs}`);
    return null;
  }
  return abs;
}

function buildImageSlide(slideData) {
  const s = pptx.addSlide();
  const abs = checkImage(slideData.data.image.src, slideData.id);
  if (abs) {
    const { width: imgW, height: imgH } = getPngSize(abs);
    const fitted = containFit(SLIDE_W, SLIDE_H, imgW, imgH);
    s.addImage({
      path: abs,
      x: (SLIDE_W - fitted.w) / 2,
      y: (SLIDE_H - fitted.h) / 2,
      w: fitted.w,
      h: fitted.h,
    });
  }
  generatedCount += 1;
}

function buildDimensionSlide(slideData, index) {
  const s = pptx.addSlide();
  const { header, data } = slideData;

  s.addText(header?.title || '', {
    x: MARGIN,
    y: MARGIN * 0.4,
    w: SLIDE_W - MARGIN * 2 - 0.6,
    h: HEADER_H,
    fontSize: 22,
    bold: true,
    color: COLOR_INK,
    fontFace: FONT_FACE,
    align: 'left',
    valign: 'middle',
  });
  s.addText(String(index + 1).padStart(2, '0'), {
    x: SLIDE_W - MARGIN - 0.6,
    y: MARGIN * 0.4,
    w: 0.6,
    h: HEADER_H,
    fontSize: 16,
    bold: true,
    color: COLOR_ACCENT,
    align: 'right',
    valign: 'middle',
  });

  const contentTop = MARGIN + HEADER_H;
  const contentHeight = SLIDE_H - contentTop - MARGIN;
  const contentWidth = SLIDE_W - MARGIN * 2;

  const totalFr = LEFT_FR + RIGHT_FR;
  const leftW = (contentWidth - COL_GAP) * (LEFT_FR / totalFr);
  const rightW = (contentWidth - COL_GAP) * (RIGHT_FR / totalFr);
  const leftX = MARGIN;
  const rightX = MARGIN + leftW + COL_GAP;

  const abs = checkImage(data.diagram.src, slideData.id);
  let diagramBox = { x: leftX, y: contentTop, w: leftW, h: contentHeight };

  if (abs) {
    const { width: imgW, height: imgH } = getPngSize(abs);
    const fitted = containFit(leftW, contentHeight, imgW, imgH);
    diagramBox = {
      x: leftX + (leftW - fitted.w) / 2,
      y: contentTop + (contentHeight - fitted.h) / 2,
      w: fitted.w,
      h: fitted.h,
    };

    // addImage에는 실제로 계산된 diagramBox를 그대로 사용한다.
    // (박스 전체(leftW×contentHeight)를 넘기면 이전처럼 비율이 왜곡되므로 금지)
    s.addImage({
      path: abs,
      x: diagramBox.x,
      y: diagramBox.y,
      w: diagramBox.w,
      h: diagramBox.h,
    });
  }

  const calloutW = 0.85;
  const calloutH = 0.24;
  (data.callouts || []).forEach((c) => {
    const cx = diagramBox.x + (c.x / 100) * diagramBox.w;
    const cy = diagramBox.y + (c.y / 100) * diagramBox.h;
    s.addText(c.label, {
      x: cx - calloutW / 2,
      y: cy - calloutH / 2,
      w: calloutW,
      h: calloutH,
      fontSize: 9,
      bold: true,
      color: COLOR_ACCENT,
      fill: { color: 'FFFFFF' },
      line: { color: COLOR_ACCENT, width: 1.25 },
      align: 'center',
      valign: 'middle',
      fontFace: MONO_FONT_FACE,
    });
  });

  const groups = data.groups || [];
  const titleH = 0.22;
  const rowH = 0.19;
  const groupGap = 0.1;

  const totalRows = groups.reduce((sum, g) => sum + g.rows.length, 0);
  const naturalHeight = groups.length * (titleH + groupGap) + totalRows * rowH;
  const scale = naturalHeight > contentHeight ? contentHeight / naturalHeight : 1;

  let cursorY = contentTop;
  groups.forEach((g) => {
    s.addText(g.title, {
      x: rightX,
      y: cursorY,
      w: rightW,
      h: titleH * scale,
      fontSize: 10 * scale,
      bold: true,
      color: COLOR_ACCENT,
      fontFace: FONT_FACE,
      align: 'left',
      valign: 'bottom',
    });
    cursorY += titleH * scale;

    g.rows.forEach((r) => {
      s.addText(r.label, {
        x: rightX,
        y: cursorY,
        w: rightW * 0.52,
        h: rowH * scale,
        fontSize: 9 * scale,
        color: COLOR_INK_MUTED,
        fontFace: FONT_FACE,
        align: 'left',
        valign: 'middle',
      });
      s.addText(r.value, {
        x: rightX + rightW * 0.48,
        y: cursorY,
        w: rightW * 0.52,
        h: rowH * scale,
        fontSize: 9 * scale,
        bold: true,
        color: COLOR_INK,
        fontFace: MONO_FONT_FACE,
        align: 'right',
        valign: 'middle',
      });
      cursorY += rowH * scale;
    });

    cursorY += groupGap * scale;
  });

  generatedCount += 1;
}

/**
 * heroOverlay — Photozone Family 전용
 * 16:9 배경 이미지 + 어두운 오버레이 + kicker/title/titleAccent/subtitle 텍스트.
 * CTA는 PPT에서 표시하지 않는다 (Web 전용 인터랙션이므로 제외).
 */
function buildHeroSlide(slideData) {
  const s = pptx.addSlide();
  const { data } = slideData;

  const abs = checkImage(data.bgImage, slideData.id);
  if (abs) {
    const { width: imgW, height: imgH } = getPngSize(abs);
    const fitted = coverFit(SLIDE_W, SLIDE_H, imgW, imgH);
    // 중앙 정렬 — 슬라이드보다 넘치는 부분은 슬라이드 경계 밖으로 배치되어
    // 실제 프레젠테이션에서는 자연스럽게 잘려 보인다 (실제 크롭 없이 비율은 그대로 유지).
    s.addImage({
      path: abs,
      x: (SLIDE_W - fitted.w) / 2,
      y: (SLIDE_H - fitted.h) / 2,
      w: fitted.w,
      h: fitted.h,
    });
  }

  // 어두운 오버레이 (Web의 어두운 배경 톤 재현, 텍스트 가독성 확보)
  s.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: SLIDE_W,
    h: SLIDE_H,
    fill: { color: '000000', transparency: 55 },
    line: { type: 'none' },
  });

  // 텍스트 블록: Web의 .hero-body{width:40%; 우측 정렬} 구조 반영
  const textX = 6.1;
  const textW = 3.4;

  s.addText(data.kicker || '', {
    x: textX,
    y: 1.65,
    w: textW,
    h: 0.35,
    fontSize: 10,
    bold: true,
    color: COLOR_ACCENT,
    fontFace: FONT_FACE,
    align: 'left',
  });

  s.addText(
    [
      { text: data.title || '', options: { color: 'FFFFFF', breakLine: true } },
      { text: data.titleAccent || '', options: { color: COLOR_ACCENT } },
    ],
    {
      x: textX,
      y: 2.05,
      w: textW,
      h: 1.35,
      fontSize: 28,
      bold: true,
      fontFace: FONT_FACE,
      align: 'left',
      valign: 'top',
    }
  );

  const subtitleLines = Array.isArray(data.subtitle) ? data.subtitle : [data.subtitle];
  s.addText(
    subtitleLines.map((line, i) => ({
      text: line || '',
      options: i < subtitleLines.length - 1 ? { breakLine: true } : {},
    })),
    {
      x: textX,
      y: 3.55,
      w: textW,
      h: 0.7,
      fontSize: 12,
      color: 'FFFFFF',
      fontFace: FONT_FACE,
      align: 'left',
      valign: 'top',
    }
  );

  // CTA는 지시대로 PPT에서 제외

  generatedCount += 1;
}

/**
 * overview — Photozone Family 전용
 * 좌측: kicker/title/description/specs, 우측: mainImage.
 * config.layout.overviewLeftFr/overviewRightFr 비율 사용 (Cheolma는 1:1).
 */
function buildOverviewSlide(slideData) {
  const s = pptx.addSlide();
  const { data } = slideData;

  if (OVERVIEW_LEFT_FR === undefined || OVERVIEW_RIGHT_FR === undefined) {
    console.error(
      `오류: '${slideData.id}' 슬라이드(overview)를 그리려면 config.layout.overviewLeftFr / overviewRightFr가 필요합니다.`
    );
    process.exit(1);
  }

  const contentTop = MARGIN;
  const contentHeight = SLIDE_H - MARGIN * 2;
  const contentWidth = SLIDE_W - MARGIN * 2;
  const gap = 0.4;

  const totalFr = OVERVIEW_LEFT_FR + OVERVIEW_RIGHT_FR;
  const leftW = (contentWidth - gap) * (OVERVIEW_LEFT_FR / totalFr);
  const rightW = (contentWidth - gap) * (OVERVIEW_RIGHT_FR / totalFr);
  const leftX = MARGIN;
  const rightX = MARGIN + leftW + gap;

  let cursorY = contentTop;

  s.addText(data.kicker || '', {
    x: leftX,
    y: cursorY,
    w: leftW,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: COLOR_ACCENT,
    fontFace: FONT_FACE,
    align: 'left',
  });
  cursorY += 0.35;

  s.addText(data.title || '', {
    x: leftX,
    y: cursorY,
    w: leftW,
    h: 0.6,
    fontSize: 20,
    bold: true,
    color: COLOR_INK,
    fontFace: FONT_FACE,
    align: 'left',
    valign: 'top',
  });
  cursorY += 0.65;

  const descriptionLines = Array.isArray(data.description) ? data.description : [data.description];
  s.addText(descriptionLines.join('\n\n'), {
    x: leftX,
    y: cursorY,
    w: leftW,
    h: 1.0,
    fontSize: 11,
    color: COLOR_INK,
    fontFace: FONT_FACE,
    align: 'left',
    valign: 'top',
  });
  cursorY += 1.05;

  // 구분선 (Web의 spec-list 상단 테두리 재현)
  s.addShape(pptx.ShapeType.line, {
    x: leftX,
    y: cursorY,
    w: leftW,
    h: 0,
    line: { color: COLOR_ACCENT, width: 1.5 },
  });
  cursorY += 0.1;

  // specs: label/value 쌍을 각각 박스로 쪼개던 방식 대신, 하나의 텍스트박스에
  // 줄바꿈으로 모아 편집하기 쉽게 구성한다 (label은 bold, value는 일반체, 한 줄에 함께).
  const specs = data.specs || [];
  const specRuns = [];
  specs.forEach((spec, i) => {
    specRuns.push({ text: `${spec.label}: `, options: { bold: true, color: COLOR_INK } });
    specRuns.push({
      text: spec.value,
      options: {
        color: COLOR_INK_MUTED,
        breakLine: i < specs.length - 1,
      },
    });
  });
  const specsBoxH = specs.length * 0.32 + 0.1;
  s.addText(specRuns, {
    x: leftX,
    y: cursorY,
    w: leftW,
    h: specsBoxH,
    fontSize: 10.5,
    fontFace: FONT_FACE,
    align: 'left',
    valign: 'top',
    lineSpacingMultiple: 1.3,
  });

  // 우측: mainImage (원본 비율 유지, 잘림 없음, 우측 박스 안에서 중앙 정렬)
  const abs = checkImage(data.mainImage, slideData.id);
  if (abs) {
    const { width: imgW, height: imgH } = getPngSize(abs);
    const fitted = containFit(rightW, contentHeight, imgW, imgH);
    s.addImage({
      path: abs,
      x: rightX + (rightW - fitted.w) / 2,
      y: contentTop + (contentHeight - fitted.h) / 2,
      w: fitted.w,
      h: fitted.h,
    });
  }

  generatedCount += 1;
}

/**
 * comparison — Photozone Family 전용
 * kicker/title/description은 중앙 정렬 상단 헤더.
 * cards.length에 따라 열 개수를 자동 계산한다 (하드코딩 금지).
 * 각 카드는 "이미지 영역이 먼저, 텍스트는 나머지 공간만" 원칙(Visual Priority)을 따른다.
 */
function buildComparisonSlide(slideData) {
  const s = pptx.addSlide();
  const { data } = slideData;
  const cards = data.cards || [];

  // ── 헤더 (중앙 정렬) ──
  const headerW = SLIDE_W - MARGIN * 2;
  s.addText(data.kicker || '', {
    x: MARGIN,
    y: 0.4,
    w: headerW,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: COLOR_ACCENT,
    fontFace: FONT_FACE,
    align: 'center',
  });
  s.addText(data.title || '', {
    x: MARGIN,
    y: 0.7,
    w: headerW,
    h: 0.5,
    fontSize: 18,
    bold: true,
    color: COLOR_INK,
    fontFace: FONT_FACE,
    align: 'center',
    valign: 'middle',
  });
  // description(Web 전용 안내 문구 "카드를 클릭하면...")은 PPT에서 표시하지 않는다.
  // content.js에는 원문 그대로 유지하고, 여기서 렌더링만 생략한다.

  // ── 카드 영역: cards.length 기반 자동 계산 (하드코딩 금지) ──
  // "PPT Draft" 목표로 전환: 정밀 자동 계산보다 이미지 최대화 + 편집하기 쉬운
  // 텍스트박스 구조를 우선한다.
  const cardsTop = 1.3; // 제목 바로 아래
  const cardsBottomMargin = 0.3;
  const cardsHeight = SLIDE_H - cardsTop - cardsBottomMargin;
  const gap = 0.3;
  const n = cards.length;
  const cardW = (SLIDE_W - MARGIN * 2 - gap * (n - 1)) / n;

  cards.forEach((card, i) => {
    const cardX = MARGIN + i * (cardW + gap);
    const cardY = cardsTop;

    // Visual Priority: 이미지를 카드 높이의 74%까지 최대한 크게 배치.
    // containFit()이 원본 비율을 그대로 지키므로 실제로는 이보다 letterbox될 수 있으나,
    // 임의 크롭이나 왜곡은 없다.
    const imageBoxH = cardsHeight * 0.74;
    const imageBoxW = cardW;
    const imageBoxX = cardX;
    const imageBoxY = cardY;

    let imageActual = { x: imageBoxX, y: imageBoxY, w: imageBoxW, h: imageBoxH };
    const abs = checkImage(card.image, `${slideData.id}[${i}]`);
    if (abs) {
      const { width: imgW, height: imgH } = getPngSize(abs);
      const fitted = containFit(imageBoxW, imageBoxH, imgW, imgH);
      imageActual = {
        x: imageBoxX + (imageBoxW - fitted.w) / 2,
        y: imageBoxY + (imageBoxH - fitted.h) / 2,
        w: fitted.w,
        h: fitted.h,
      };
      s.addImage({
        path: abs,
        x: imageActual.x,
        y: imageActual.y,
        w: imageActual.w,
        h: imageActual.h,
      });
    }

    // badge: 실제 표시되는 이미지 박스(imageActual) 기준 좌측 상단
    if (card.badge) {
      const badgeW = Math.min(cardW * 0.3, 1.1);
      const badgeH = 0.24;
      s.addText(card.badge, {
        x: imageActual.x + 0.08,
        y: imageActual.y + 0.08,
        w: badgeW,
        h: badgeH,
        fontSize: 9,
        bold: true,
        color: 'FFFFFF',
        fill: { color: COLOR_ACCENT },
        fontFace: FONT_FACE,
        align: 'center',
        valign: 'middle',
      });
    }

    // ── 텍스트 영역: tag/제목/부제/summary를 카드당 "텍스트박스 1개"로 통합.
    // PowerPoint에서 한 번의 클릭으로 전체 문구를 자유롭게 고쳐 쓸 수 있도록
    // 여러 개의 정밀 계산된 박스 대신 하나의 편집 친화적 박스로 구성한다.
    const textPad = 0.15;
    const textX = cardX + textPad;
    const textW = cardW - textPad * 2;
    const textTop = imageBoxY + imageBoxH + 0.12;
    const textH = cardY + cardsHeight - textTop;

    const nameLines = Array.isArray(card.name) ? card.name : [card.name];
    const summaryLines = Array.isArray(card.summary) ? card.summary : [card.summary];

    const runs = [];
    if (card.tag) {
      runs.push({ text: `${card.tag}  `, options: { fontSize: 11, bold: true, color: COLOR_ACCENT } });
    }
    runs.push({ text: nameLines[0] || '', options: { fontSize: 13, bold: true, color: COLOR_INK, breakLine: true } });
    if (nameLines[1]) {
      runs.push({ text: nameLines[1], options: { fontSize: 10, color: COLOR_INK_MUTED, breakLine: true } });
    }
    summaryLines.forEach((line, li) => {
      runs.push({
        text: line || '',
        options: { fontSize: 10, color: COLOR_INK_MUTED, breakLine: li < summaryLines.length - 1 },
      });
    });

    s.addText(runs, {
      x: textX,
      y: textTop,
      w: textW,
      h: textH,
      fontFace: FONT_FACE,
      align: 'left',
      valign: 'top',
      lineSpacingMultiple: 1.2,
    });

    // card.targetId는 Web 이동용 데이터이므로 PPT renderer에서는 사용하지 않는다.
  });

  generatedCount += 1;
}

SLIDES.forEach((slideData, index) => {
  if (slideData.template === 'imageSlide') {
    buildImageSlide(slideData);
  } else if (slideData.template === 'dimension') {
    buildDimensionSlide(slideData, index);
  } else if (slideData.template === 'heroOverlay') {
    buildHeroSlide(slideData);
  } else if (slideData.template === 'overview') {
    buildOverviewSlide(slideData);
  } else if (slideData.template === 'comparison') {
    buildComparisonSlide(slideData);
  } else {
    console.warn(
      `알 수 없는 template: '${slideData.template}' (id: ${slideData.id}) — 이 슬라이드는 건너뜁니다.`
    );
  }
});

// ────────────────────────────────────────────────────────────
// 저장 + 검증 로그
// ────────────────────────────────────────────────────────────
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
const outPath = path.join(OUTPUT_DIR, config.outputFileName);

pptx.writeFile({ fileName: outPath }).then(() => {
  console.log('──────────────────────────────');
  console.log('PPT Export 완료');
  console.log(`읽은 슬라이드 수: ${SLIDES.length}`);
  console.log(`생성한 슬라이드 수: ${generatedCount}`);
  console.log(
    `누락된 이미지 경로: ${
      missingImages.length ? '\n  - ' + missingImages.join('\n  - ') : '없음'
    }`
  );
  console.log(`최종 저장 경로: ${outPath}`);
  console.log('──────────────────────────────');
});
