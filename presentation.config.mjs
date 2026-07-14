/**
 * presentation.config.mjs — 용호골목시장 게이트 리뉴얼 프로젝트 설정
 *
 * teamj-presentation-engine-v2 (지금은 export/engine/export-ppt.mjs)가
 * `--project <이 파일이 있는 폴더>` 인자로 이 파일을 동적 import한다.
 * 엔진은 이 파일 안의 값 외에는 이 프로젝트에 대해 아무것도 모른다.
 *
 * 아래 경로 값(contentPath / assetsBase / outputDir)은 전부
 * "이 config 파일이 위치한 폴더(프로젝트 루트)" 기준 상대경로다.
 * 실행 위치(process.cwd())나 엔진 파일 위치와는 무관하다.
 */
export default {
  projectName: 'yongho-gate2026',

  contentPath: './js/data/content.js',
  assetsBase: '.',

  outputDir: './export/ppt',
  outputFileName: 'Yongho_Market_Presentation_V2.pptx',

  theme: {
    accent: '2B4C7E',
    ink: '1A1A1A',
    inkMuted: '666666',
    fontFace: 'Malgun Gothic',
    monoFontFace: 'Consolas',
  },

  layout: {
    dimensionLeftFr: 2.4,
    dimensionRightFr: 1,
  },
};
