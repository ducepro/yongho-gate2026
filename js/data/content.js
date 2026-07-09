/**
 * content.js — 용호골목시장 게이트 리뉴얼 제안서
 *
 * 순서 기준: contents.png(실제 목차 이미지)에 박혀있는 원본 목차 순서를 그대로 따름
 * (I.제안개요 → II.현황및자산분석 → III.디자인개발 → 도면 → IV.실행계획 → V.기대효과/마무리).
 *
 * 확정 19장 PNG 중 도면 2장(gate1-blueprint, gate2-blueprint)만 Dimension 템플릿(규격표 포함)을
 * 쓰고, 나머지 17장은 이미 완성된 슬라이드 이미지이므로 텍스트 오버레이 없이
 * imageSlide(풀스크린, 16:9, object-fit:contain)로 표시한다.
 *
 * 이 파일은 순수 콘텐츠입니다. 다른 프로젝트(경찰청/장미정원/철마/공원/조형물 등)를
 * 새로 만들 때는 이 파일과 assets/ 폴더만 교체하면 됩니다 — 엔진/템플릿은 공용.
 */

// 17장 공통: 이미 완성된 슬라이드 이미지 → 텍스트 없이 풀스크린만 표시
const imageSlide = (id, theme, file, alt) => ({
  id,
  theme,
  transition: 'fade',
  template: 'imageSlide',
  data: { image: { src: `assets/images/1x/${file}.png`, alt } },
});

export const SLIDES = [

  // ===== I. 제안 개요 =====
  imageSlide('cover', 'dark-theme', 'cover', '용호골목시장 게이트 리뉴얼 제안서 표지'),
  imageSlide('contents', 'light-theme', 'contents', '목차'),
  imageSlide('project-overview', 'light-theme', 'project-overview', '프로젝트 개요'),
  imageSlide('project-background', 'light-theme', 'project-background', '사업 추진 배경'),

  // ===== II. 현황 및 자산 분석 =====
  imageSlide('current-analysis', 'light-theme', 'current-analysis', '현황 및 문제점 분석'),
  imageSlide('market-assets', 'light-theme', 'market-assets', '용호동 및 시장 자산 분석'),
  imageSlide('ci-analysis', 'light-theme', 'ci-analysis', '브랜드 스토리 및 CI 분석'),

  // ===== III. 디자인 개발 =====
  imageSlide('design-direction', 'light-theme', 'design-direction', '디자인 개발 방향'),
  imageSlide('design-concept', 'light-theme', 'design-concept', '디자인 컨셉'),

  // Gate 디자인 제안 (Gate1 Day/Night → 도면 → Gate2 Day/Night → 도면)
  imageSlide('gate1-day-design', 'light-theme', 'gate1-day-design', 'Gate 1 주간 디자인'),
  imageSlide('gate1-night-design', 'dark-theme', 'gate1-night-design', 'Gate 1 야간 디자인'),

  // 도면 2장 중 첫 번째 — 유일하게 Dimension 템플릿(규격표) 유지
  {
    id: 'gate1-dimension',
    theme: 'light-theme',
    transition: 'fade',
    template: 'dimension',
    header: { title: 'Gate 1 — Dimension' },
    data: {
      diagram: {
        src: 'assets/images/1x/gate1-blueprint.png',
        alt: 'Gate 1 구조 치수 도면',
      },
      callouts: [
        { x: 50, y: 8, label: '전체 높이 6,200mm' },
        { x: 15, y: 50, label: '기둥 폭 450mm' },
        { x: 85, y: 50, label: '기둥 폭 450mm' },
        { x: 50, y: 92, label: '전체 폭 8,400mm' },
      ],
      groups: [
        { title: '규격', rows: [
          { label: '전체 높이', value: '6,200 mm' },
          { label: '전체 폭', value: '8,400 mm' },
          { label: '기둥 폭', value: '450 mm × 2' },
        ]},
        { title: '재질', rows: [
          { label: '주 구조재', value: '알루미늄 압출' },
          { label: '패널', value: '강화유리 12T' },
          { label: '마감', value: '분체도장 (화이트/블루)' },
        ]},
        { title: '제작 방식', rows: [
          { label: '조립 방식', value: '모듈형 현장 조립' },
          { label: '공사 기간', value: '약 2주 (기초 제외)' },
        ]},
        { title: '구조', rows: [
          { label: '내풍 설계', value: '순간풍속 40 m/s' },
          { label: '기초', value: '독립기초 + 앵커볼트' },
        ]},
        { title: 'LED 사양', rows: [
          { label: '광원', value: 'LED 라인바 IP65' },
          { label: '색온도', value: '2700K–5000K 가변' },
          { label: '제어', value: 'DMX 시퀀스 제어' },
        ]},
      ],
    },
  },

  imageSlide('gate2-day-design', 'light-theme', 'gate2-day-design', 'Gate 2 주간 디자인'),
  imageSlide('gate2-night-design', 'dark-theme', 'gate2-night-design', 'Gate 2 야간 디자인'),

  // 도면 2장 중 두 번째
  {
    id: 'gate2-dimension',
    theme: 'light-theme',
    transition: 'fade',
    template: 'dimension',
    header: { title: 'Gate 2 — Dimension' },
    data: {
      diagram: {
        src: 'assets/images/1x/gate2-blueprint.png',
        alt: 'Gate 2 구조 치수 도면',
      },
      callouts: [
        { x: 50, y: 10, label: '전체 높이 4,800mm' },
        { x: 20, y: 50, label: '기둥 폭 300mm' },
        { x: 80, y: 50, label: '기둥 폭 300mm' },
        { x: 50, y: 90, label: '전체 폭 5,600mm' },
      ],
      groups: [
        { title: '규격', rows: [
          { label: '전체 높이', value: '4,800 mm' },
          { label: '전체 폭', value: '5,600 mm' },
          { label: '기둥 폭', value: '300 mm × 2' },
        ]},
        { title: '재질', rows: [
          { label: '주 구조재', value: '스틸 프레임' },
          { label: '패널', value: '목재 루버 (오일스테인 마감)' },
        ]},
        { title: '제작 방식', rows: [
          { label: '조립 방식', value: '현장 용접 + 루버 조립' },
          { label: '공사 기간', value: '약 10일 (기초 제외)' },
        ]},
        { title: '구조', rows: [
          { label: '내풍 설계', value: '순간풍속 35 m/s' },
          { label: '기초', value: '독립기초 + 앵커볼트' },
        ]},
        { title: 'LED 사양', rows: [
          { label: '광원', value: 'LED 간접조명 (전구색 2700K)' },
          { label: '설치 위치', value: '루버 배면 매입형' },
        ]},
      ],
    },
  },

  // ===== IV. 실행 계획 =====
  imageSlide('materials', 'light-theme', 'materials', '재질'),
  imageSlide('production-process', 'light-theme', 'production-process', '제작 및 설치 공정 계획'),
  imageSlide('schedule-maintenance', 'light-theme', 'schedule-maintenance', '추진 일정 및 유지관리 계획'),

  // ===== V. 기대효과 및 마무리 =====
  imageSlide('closing', 'dark-theme', 'closing', '용호골목시장의 새로운 얼굴'),
];
