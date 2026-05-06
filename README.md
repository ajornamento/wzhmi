# wzHmi — MES HMI Editor & Viewer

## 실행 방법

```bash
npm install

# 전부 동시 실행 (서버 + 에디터 + 뷰어)
npm run dev

# 개별 실행
npm run dev:server   # Mock WebSocket 서버  → http://localhost:3001
npm run dev:editor   # HMI 에디터          → http://localhost:5173
npm run dev:viewer   # HMI 뷰어            → http://localhost:5174
```

## 구조

```
packages/
  core/     — TypeScript 공통 타입, 포매터, 조건 평가기
  widgets/  — Web Component 위젯 (MOTOR, VALVE, GAUGE, TANK, CONVEYOR, ALARM, TEXT_LABEL)
  editor/   — React HMI 에디터 (드래그&드롭, 속성 편집, 저장/불러오기)
  viewer/   — React HMI 뷰어 (실시간 WebSocket 데이터 바인딩)
apps/
  dev-server/ — Express + WebSocket mock PLC 서버
  hmi-files/  — HMI JSON 파일 저장소 (sample.json 포함)
```

## HMI JSON 스키마

`widget_sample.md` 참조. 주요 필드:
- `canvas` — 도화지 크기/배경
- `widgets[].geometry` — 위치·크기·회전·z-index
- `widgets[].binding` — PLC 태그ID, 갱신주기, 포매터
- `widgets[].styles.animations` — 조건(예: `== 1`, `> 80`)에 따른 색상·효과
- `widgets[].actions` — onClick, 권한(role), 확인 창

## 지원 포매터

`motorStatus` `valveState` `onOff` `percent` `temperature` `pressure` `rpm`
