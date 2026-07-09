# TJPE — TeamJ Presentation Engine

이번 프로젝트 하나만을 위한 웹이 아니라, **TeamJ의 모든 제안서(용호골목시장 / 경찰청 /
장미정원 / 철마 / 공원 / 조형물 등)가 공통으로 사용하는 프레젠테이션 엔진**입니다.
PPT를 웹으로 "옮기는" 게 아니라, 웹에서 바로 "제작"하고 PPT는 출력(PDF) 용도로만 씁니다.

프로젝트마다 바뀌는 건 원칙적으로 `js/data/content.js`, `css/variables.css`, `assets/` 세 가지뿐이고,
엔진(`js/core/`)과 템플릿(`js/templates/`, `css/templates/`)은 그대로 재사용합니다.

## Story Flow (이 프로젝트 기준 예시)

```
01 Cover
02 Contents
03 Gate 1 - Day Design         ─┐
04 Gate 1 - Day Simulation      │
05 Gate 1 - Night Design        ├─ Gate 1
06 Gate 1 - Night Simulation    │
07 Gate 1 - Dimension          ─┘
08 Gate 2 - Day Design         ─┐
09 Gate 2 - Day Simulation      │
10 Gate 2 - Night Design        ├─ Gate 2 (동일 구조 반복)
11 Gate 2 - Night Simulation    │
12 Gate 2 - Dimension          ─┘
13 Expected Effects
14 Closing
```

다른 프로젝트(경찰청, 장미정원 등)는 대상이 "Gate"가 아니라 "조형물", "정원", "구조물" 등으로
바뀔 뿐, `content.js`에서 동일한 5종 슬라이드 묶음(Day Design → Day Simulation → Night Design →
Night Simulation → Dimension)을 대상 개수만큼 반복하면 됩니다.

## 폴더 구조

```
tjpe/
├── index.html
├── css/
│   ├── variables.css          # 디자인 토큰 — 프로젝트 교체 시 1순위로 건드릴 파일
│   ├── reset.css / layout.css / animations.css
│   ├── components.css         # 재사용 컴포넌트 (cover/toc/cards/columns/feature-card/media-frame)
│   ├── templates/
│   │   ├── template-design.css      # 좌 70~75% 비주얼 + 우 설명 패널
│   │   ├── template-simulation.css  # 상단 Before/After + 하단 설명 카드
│   │   ├── template-dimension.css   # 좌 도면 + 우 카테고리별 규격
│   │   └── template-closing.css
│   └── print.css               # A3 PDF 인쇄 모드
├── js/
│   ├── core/                   # 엔진 (콘텐츠 무관, 프로젝트 간 100% 재사용)
│   │   ├── StageScaler.js          # 1920x1080 캔버스 → 화면 크기(4K 포함) 스케일링
│   │   ├── SlideEngine.js          # 슬라이드 상태 관리 단일 소스
│   │   ├── InputController.js      # 휠 / 키보드 / 터치 스와이프 통합
│   │   ├── LazyImageLoader.js      # 이미지 지연 로딩 (1x/2x/4K)
│   │   └── PresentationMode.js     # 발표모드 ↔ 인쇄(A3 PDF)모드
│   ├── templates/               # 템플릿별 렌더 함수 + 레지스트리
│   │   ├── classic.js              # cover / toc / cards / columns
│   │   ├── design.js / simulation.js / dimension.js / closing.js
│   │   ├── video.js / viewer360.js   # [확장 스텁]
│   │   └── index.js                 # REGISTRY
│   ├── data/content.js          # ★ 이 프로젝트의 모든 콘텐츠 — 새 프로젝트는 이 파일만 교체
│   └── main.js
└── assets/images/{1x,2x,4k}/, video/, 360/
```

## Slide Layout Rules

### ■ Design 템플릿
좌측 70~75% 디자인 시안 + 우측 25~30% 설명 패널. 우측 패널은 4개 섹션 고정 구성:
`DESIGN CONCEPT` → `MATERIAL` → `KEY FEATURES`(4~6개, feature-card 그리드) → `DESIGN SUMMARY`.
**기존 PPT식 아이콘 나열 방식은 폐지**했고, 아이콘 없는 `feature-card` 공통 컴포넌트로 대체했습니다
(제목+설명 텍스트만 있어 프로젝트마다 내용만 바꿔도 레이아웃이 깨지지 않음).

```js
template: 'design',
data: {
  eyebrow, title, image: { src, srcset, alt },
  concept, material,
  features: [{ title, desc }, ...], // 4~6개
  summary,
}
```

### ■ Simulation 템플릿
상단(약 62%) Before/After 드래그 비교 슬라이더 — 단일 시뮬레이션 이미지만 쓰려면
`mode: 'single'`. 하단은 3~4개 핵심 설명 카드(재질/경관효과/상징성/제작성 등), Design과
동일한 `feature-card` 컴포넌트를 공유합니다.

```js
template: 'simulation',
data: {
  mode: 'compare', // or 'single'
  before, after,   // mode:'compare'
  image,           // mode:'single'
  beforeLabel, afterLabel,
  cards: [{ title, desc }, ...], // 3~4개
}
```

### ■ Dimension 템플릿
좌측에 도면을 크게 표시하고, 우측은 카테고리별로 그룹화한 규격표입니다.
그룹 구성은 프로젝트마다 자유롭게 (예: 규격/재질/제작 방식/구조/LED 사양).

```js
template: 'dimension',
data: {
  diagram: { src, alt },
  callouts: [{ x, y, label }],
  groups: [
    { title: '규격', rows: [{ label, value }] },
    { title: '재질', rows: [...] },
    { title: '제작 방식', rows: [...] },
    { title: '구조', rows: [...] },
    { title: 'LED 사양', rows: [...] },
  ],
}
```

## Engine Rules (변하지 않는 원칙)

- **콘텐츠와 레이아웃은 완전히 분리**한다. 템플릿(`js/templates/*.js`, `css/templates/*.css`)은
  어떤 프로젝트에서도 그대로 재사용하고, 프로젝트 고유 정보는 전부 `content.js`에만 존재한다.
- 새 슬라이드 묶음이 필요하면(예: Gate 3 추가, 대상이 "조형물 A/B/C"로 여러 개) `content.js`에
  같은 5종 템플릿(design/simulation×2/dimension)을 이어붙이면 된다 — 템플릿 코드는 건드리지 않는다.
- 새로운 종류의 슬라이드가 필요하면 템플릿을 새로 만들고 `js/templates/index.js`의
  `REGISTRY`에 등록한다 (아래 "새 템플릿 추가하기" 참고).

## 새 프로젝트 시작하기 (예: 경찰청 제안서)

1. 이 폴더 전체를 복사 (`tjpe/` → `police-station-proposal/`)
2. `js/data/content.js`를 새 프로젝트 내용으로 교체 (Design/Simulation/Dimension 데이터 구조는
   위 규칙을 그대로 따르면 됨 — 대상만 "Gate"에서 "조형물"/"정원"/"구조물" 등으로 바뀜)
3. `assets/images/`에 새 프로젝트 이미지(1x/2x/4k) 교체
4. `css/variables.css`의 색상 팔레트를 새 프로젝트 톤으로 조정 (선택)
5. `index.html`의 `<title>`만 변경
6. 엔진(`js/core/`), 템플릿 렌더러(`js/templates/`), 템플릿 CSS는 그대로 둔다

## 새 슬라이드 추가하기

`js/data/content.js` 배열에 항목을 하나 추가:

```js
{
  id: 'my-new-slide',
  theme: 'light-theme',      // 'dark-theme' | 'light-theme'
  transition: 'zoom',        // 'fade' | 'zoom'
  template: 'design',        // templates/index.js REGISTRY의 키
  header: { title: '슬라이드 제목', subtitle: '부제 (선택)' },
  data: { /* 템플릿별 데이터. 각 templates/*.js 상단 주석 참고 */ },
}
```

## 새 템플릿 타입 추가하기

1. `js/templates/my-template.js`에 `export function renderMyTemplate(data) { ... }` 작성
2. `css/templates/template-my-template.css` 작성 후 `index.html`에 `<link>` 추가
3. `js/templates/index.js`의 `REGISTRY`에 등록
4. `content.js`에서 `template: 'my-template'`로 사용

## 핵심 아키텍처 (변경 없음)

- **고정 캔버스 + 스케일링**: 디자인은 항상 1920×1080 기준으로 작업하고, `StageScaler`가
  화면 크기(4K TV 포함)에 맞춰 `transform: scale()`로 확대/축소한다. 4K 환경에서는 scale이
  2에 가까워지므로 `assets/images/2x`, `4k`에 고해상도 원본을 함께 준비해야 한다.
- **입력 3종 통합**: `InputController` 하나가 휠 / 키보드(←→, Space, Home/End) / 터치 스와이프를
  전부 `SlideEngine.next()/prev()/goTo()` 호출로 변환한다. 슬라이드 내부에 스크롤 영역이나
  드래그 컴포넌트가 있으면 `[data-scroll-lock]`(휠 제외), `[data-touch-lock]`(터치 제외)
  속성으로 충돌을 막는다 (Design 패널의 스크롤, Simulation 슬라이더가 이미 이 방식을 사용 중).
- **발표 모드 ↔ 인쇄(A3 PDF) 모드**: `PresentationMode.printToPDF()` → `body.mode-print` 클래스 부여
  → `print.css`가 전체 슬라이드를 A3 가로 페이지로 세로 스택 → `window.print()`로 PDF 저장 →
  인쇄 다이얼로그가 닫히면 자동으로 발표 모드 복귀.

## 로컬에서 확인하기

ES 모듈(`<script type="module">`)을 쓰기 때문에 `file://`로 직접 열면 CORS로 막힙니다.

```bash
cd tjpe
python3 -m http.server 8080
# http://localhost:8080
```

## 알려진 제약 / TODO

- `assets/images/`에 실제 이미지가 아직 없습니다 (경로만 존재). 이미지가 없으면
  `.media-frame`의 스켈레톤 애니메이션이 계속 보이는데, 이는 로딩 실패 상태를 시각적으로
  구분해주는 의도된 폴백입니다.
- `srcset`의 밀도 서술자(1x/2x/4x)는 브라우저가 `devicePixelRatio` 기준으로 고르며,
  `StageScaler`의 CSS scale 값까지 반영하진 않습니다. 4K 환경에서 더 정교한 제어가
  필요해지면 `width` 서술자(`w`) + `sizes`로 `LazyImageLoader`를 확장하는 것을 권장합니다.
- `video.js`, `viewer360.js`는 스캐폴드 단계입니다 (기능 명세는 파일 상단 TODO 참고).
- Gate 1/2의 Design/Simulation/Dimension 슬라이드는 **예시 콘텐츠**입니다. 실제 렌더링본/사진/
  도면이 준비되면 `content.js`의 해당 항목만 교체하세요.
