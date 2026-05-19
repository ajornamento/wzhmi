# wzHmi — MES HMI Editor & Viewer

## 실행 방법

```bash
npm install

# 전부 동시 실행 (서버 + 에디터 + MES)
npm run dev

# 개별 실행
npm run dev:server   # Mock WebSocket 서버  → http://localhost:3001
npm run dev:editor   # HMI 에디터          → http://localhost:5173
npm run dev:mes      # MES 뷰어            → http://localhost:5174
```

## 구조

```
packages/
  core/       — 공통 타입, 포매터, 조건 평가기, 기본값
  widgets/    — Web Component 위젯 모음
  editor/     — React HMI 에디터
  viewer/     — React HMI 뷰어 라이브러리 (mes에서 사용)
  mes/        — MES 메뉴 기반 뷰어 앱

apps/
  dev-server/ — Express + WebSocket mock PLC 서버
  hmi-files/  — HMI JSON 파일 저장소
    sample.json
    production-line-1.json
    production-line-2.json
```

### packages/core

| 파일 | 역할 |
| ---- | ---- |
| `types.ts` | `HmiSchema`, `Widget`, `Geometry`, `Binding`, `Animation` 등 전체 타입 정의 |
| `formatters.ts` | 포매터 레지스트리 및 `format()`, `registerFormatter()` |
| `evaluator.ts` | 애니메이션 조건식(`== 1`, `> 80` 등) 평가기 |
| `defaults.ts` | `emptySchema()`, `defaultWidget()`, `LINE_PAD` 등 기본값 생성 함수 |

### packages/widgets

Web Component 기반 SVG 위젯. 각 위젯은 `<wz-*>` 커스텀 엘리먼트로 등록됨.

| 위젯 타입 | 태그 | 설명 |
| --------- | ---- | ---- |
| `MOTOR` | `<wz-motor>` | 모터 (회전 애니메이션) |
| `VALVE` | `<wz-valve>` | 밸브 (개폐 상태) |
| `GAUGE` | `<wz-gauge>` | 아날로그 게이지 |
| `TANK` | `<wz-tank>` | 탱크 (레벨 표시) |
| `CONVEYOR` | `<wz-conveyor>` | 컨베이어 벨트 |
| `ALARM` | `<wz-alarm>` | 알람 표시기 |
| `TEXT_LABEL` | `<wz-text-label>` | 텍스트 레이블 (shape 지원) |
| `LINE` | `<wz-line>` | 연결선 (직선/직각/곡선, 웨이포인트) |
| `PIPE` | `<wz-pipe>` | 파이프 |
| `WORKSTATION` | `<wz-workstation>` | 작업대 |
| `HOPPER` | `<wz-hopper>` | 호퍼 |
| `REACTOR` | `<wz-reactor>` | 반응기 |
| `WAREHOUSE` | `<wz-warehouse>` | 창고 |
| `OVEN` | `<wz-oven>` | 오븐/가열로 |
| `METAL_DETECTOR` | `<wz-metal-detector>` | 금속 탐지기 |
| `XRAY` | `<wz-xray>` | X-Ray 검사기 |
| `CUSTOM_*` | 사용자 정의 | 커스텀 위젯 레지스트리 등록 |

### packages/editor

React + Zustand 기반 HMI 에디터. 포트 5173.

```
src/
  App.tsx                        — 에디터 루트 컴포넌트
  main.tsx                       — 에디터 진입점
  viewer-main.tsx                — 뷰어 모드 진입점
  store/editorStore.ts           — 전역 상태 (스키마, 히스토리, 선택)
  components/
    Canvas/
      EditorCanvas.tsx           — 드래그·리사이즈·선택 캔버스
      LineHandles.tsx            — 연결선 엔드포인트·웨이포인트 핸들
      SelectionHandles.tsx       — 위젯 선택·리사이즈 핸들
    Toolbar/
      Toolbar.tsx                — 저장/불러오기, Undo/Redo, 스케일
    Palette/
      WidgetPalette.tsx          — 좌측 위젯 드래그 팔레트
    Properties/
      PropertyPanel.tsx          — 우측 속성 편집 패널
      CanvasSettingsPanel.tsx    — 캔버스 크기·배경 설정
    Layers/
      LayerPanel.tsx             — 레이어(위젯 목록) 패널
    WidgetRegistry/
      WidgetRegistryDialog.tsx   — 커스텀 위젯 등록 다이얼로그
      WidgetRegistryForm.tsx     — 등록 폼
      WidgetList.tsx             — 등록 위젯 목록
      WidgetPreview.tsx          — 위젯 미리보기
  hooks/
    useServerTags.ts             — dev-server에서 태그 목록 fetch
  services/
    customWidgetStorage.ts       — 커스텀 위젯 LocalStorage 저장소
```

에디터 주요 기능.

- 위젯 드래그&드롭 배치, 이동, 리사이즈, 회전
- 연결선(LINE) 웨이포인트 편집, 위젯 포트 연결
- 속성 패널에서 바인딩·애니메이션·스타일 편집
- 캔버스 배경 이미지 업로드
- Undo/Redo (히스토리 50단계)
- JSON 저장/불러오기
- 커스텀 위젯 등록 및 팔레트 표시

### packages/viewer

HMI 뷰어 라이브러리. `mes` 패키지에서 임포트하여 사용.

```
src/
  index.ts                    — 퍼블릭 API 내보내기
  App.tsx                     — 독립 실행 뷰어 앱 (dev용)
  store/viewerStore.ts        — 태그 값 상태 관리
  engine/DataBindingEngine.ts — WebSocket 구독, 태그→위젯 바인딩
  components/
    HmiCanvas.tsx             — 위젯 렌더링 캔버스
    ConfirmDialog.tsx         — onClick 확인 다이얼로그
```

### packages/mes

메뉴 기반 MES 뷰어 앱. 포트 5174.

```
src/
  main.tsx                         — 진입점
  App.tsx                          — 메뉴바 + HmiViewer 레이아웃
  components/
    MenuBar.tsx                    — 상단 메뉴바
    HmiViewer.tsx                  — 메뉴 ID에 따라 HMI 로드
  customizations/
    production-line-1.ts           — 생산 라인 1 커스텀 포매터/핸들러
    production-line-2.ts           — 생산 라인 2 커스텀 포매터/핸들러
config/
  menu-config.json                 — 메뉴 ID·이름 목록
```

### apps/dev-server

Express + `ws` 기반 mock PLC 서버. 포트 3001.

- `GET /tags` — 전체 태그 목록 반환
- `WS /` — 태그 값을 주기적으로 push (`tag_update` 이벤트)
- `src/mockData.ts` — 시뮬레이션 태그 데이터 정의

---

## 뷰어 태그 데이터 흐름

```text
[서버 WebSocket]
      │  { type: "tag_update", data: { tagId, value } }
      ▼
DataBindingEngine  →  구독 콜백 호출
      │
      ▼
BaseWidget.setValue()  →  updateVisuals() + updateValueDisplay()
      │
      ▼
각 위젯 렌더링 (GaugeWidget 등)
```

### 1. `main.tsx` — 진입점

앱 시작 시 `localStorage`에 `hmi_preview` 키가 있으면 즉시 `setSchema()`를 호출해 스키마를 스토어에 주입하고, `<App />`을 마운트합니다.

### 2. `store/viewerStore.ts` — 전역 상태

Zustand 스토어. `schema`, `serverUrl`, `scale`, `currentUser`를 보관합니다. `setSchema()`는 모든 위젯의 `animations` 필드를 정규화(`?? []`)해서 저장합니다. 이 스토어가 뷰어 전체의 단일 진실 원천입니다.

### 3. `App.tsx` — 스키마 로딩 담당

스키마를 스토어에 주입하는 세 가지 경로를 처리합니다.

| 경로 | 설명 |
| ---- | ---- |
| `postMessage` | 에디터 팝업에서 미리보기 전송 시 |
| 파일 열기 | 로컬 `.json` 파일 선택 시 |
| 서버 파일 | `/api/hmi/{filename}` REST API |

스키마가 로드되면 `<HmiCanvas />`에 자동으로 반영됩니다 (스토어 구독).

### 4. `components/HmiCanvas.tsx` — 핵심 조립 로직

두 가지 역할을 동시에 수행합니다.

위젯 DOM 생성 (`schema` 변경 시 재실행):

```ts
const el = document.createElement(tagName) as BaseWidget; // 예: "wz-gauge"
el.configure(widget);   // 위젯 설정 적용
container.appendChild(el);
```

태그 구독 등록 (같은 effect):

```ts
engine.subscribe(widget.binding.tagId, (value) => {
  el.setValue(value);   // 값 수신 시 위젯에 직접 전달
});
```

`extraBindings`(다중 태그 바인딩)도 동일한 방식으로 `el.setExtraValue(key, value)`를 호출합니다.

### 5. `engine/DataBindingEngine.ts` — WebSocket 통신

```text
connect()            →  WebSocket 열기
subscribe(tagId, cb) →  구독자 맵에 콜백 등록
                        + 서버에 { type: "subscribe", tagId } 전송
handleMessage()      →  { type: "tag_update" } 수신 시 dispatch()
dispatch()           →  해당 tagId 구독자 전체에 value 전달
```

연결 끊김 시 3초 후 자동 재연결합니다.

### 6. `widgets/src/base/BaseWidget.ts` — 위젯 베이스

`setValue(value)`가 호출되면:

1. `_value` 업데이트
2. `updateVisuals()` — 각 서브클래스가 구현 (게이지 바늘 회전, 밸브 색상 변경 등)
3. `updateValueDisplay()` — `showValue: true`이면 중앙에 포맷된 값 텍스트 렌더링

`getDisplayValue()`는 `@wzhmi/core`의 `format(formatter, value)`를 통해 단위/소수점 포맷을 적용합니다. 애니메이션(`findMatchingAnimation`)은 값 범위에 따라 블링크/펄스 효과를 트리거합니다.

> 요약: 서버 WebSocket → `DataBindingEngine.dispatch()` → `BaseWidget.setValue()` → `updateVisuals()` 순서로 데이터가 흐르며, 스키마 로딩과 위젯 구독 등록은 `HmiCanvas`의 `useEffect`에서 한 번에 처리됩니다.

## HMI JSON 스키마

```jsonc
{
  "v": "1.0",
  "canvas": {
    "width": 1280,
    "height": 720,
    "backgroundColor": "#1a1a2e",
    "backgroundImage": "...",        // 선택
    "backgroundImageFit": "cover"    // cover | contain | fill
  },
  "widgets": [
    {
      "id": "W001",
      "type": "MOTOR",               // WidgetType
      "name": "피더 모터",
      "geometry": { "x": 100, "y": 200, "width": 80, "height": 80, "rotation": 0, "zIndex": 1 },
      "binding": {
        "tagId": "motor_01",
        "dataType": "INT",           // INT | FLOAT | BOOL | STRING
        "refreshRate": 1000,
        "formatter": "motorStatus"   // 선택
      },
      "extraBindings": {},           // 추가 태그 바인딩 (선택)
      "styles": {
        "opacity": 1,
        "visible": true,
        "baseColor": "#4fc3f7",
        "animations": [
          { "condition": "== 1", "property": "color", "value": "#00ff00", "effect": "static" }
        ]
      },
      "actions": {
        "onClick": "toggle",
        "confirmRequired": true,
        "role": "operator"
      },
      "properties": {
        "label": "피더",
        "labelSide": "bottom",       // top | right | bottom | left
        "showTooltip": true,
        "showValue": true,
        "strokeWidth": 2,
        "unit": "RPM",
        "min": 0,
        "max": 100
      }
    }
  ]
}
```

LINE 위젯 전용 properties.

```jsonc
{
  "x1": 100, "y1": 200, "x2": 400, "y2": 200,
  "lineWidth": 2,
  "lineStyle": "solid",           // solid | dashed | dotted
  "lineType": "orthogonal",       // straight | orthogonal | curved
  "arrowStart": false,
  "arrowEnd": true,
  "flowSpeed": 1,
  "waypoints": [{ "x": 250, "y": 200 }],
  "startConnection": { "widgetId": "W001", "point": "right" },
  "endConnection":   { "widgetId": "W002", "point": "left" }
}
```

---

## 지원 포매터

| 이름 | 입력 | 출력 예 |
| ---- | ---- | ------- |
| `motorStatus` | INT (0/1/2) | 정지 / 가동 / 오류 |
| `valveState` | INT (0/1/n) | 닫힘 / 열림 / n% |
| `onOff` | BOOL | ON / OFF |
| `yesNo` | BOOL | Yes / No |
| `percent` | FLOAT | 82.3% |
| `temperature` | FLOAT | 23.5°C |
| `pressure` | FLOAT | 1.23 bar |
| `rpm` | INT | 1500 RPM |

커스텀 포매터는 JS 템플릿 리터럴 문자열로 인라인 지정 가능.

```json
"formatter": "${value} kPa"
```

또는 `registerFormatter(name, fn)`으로 런타임 등록.
