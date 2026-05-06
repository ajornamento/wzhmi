# widget sample
{
  "v": "1.0.0",               // 스키마 버전 (추후 호환성 관리용)
  "canvas": {                 // 도화지 설정
    "width": 1920,
    "height": 1080,
    "backgroundColor": "#1a1a1a",
    "backgroundImage": "base64_or_url"
  },
  "widgets": [
    {
      "id": "MTR-001",        // 고유 식별자
      "type": "MOTOR",        // 위젯 타입 (Web Component 태그명과 매핑)
      "name": "Line 1 메인 모터", // 관리용 이름
      
      // 1. 위치 및 크기 (Layout)
      "geometry": {
        "x": 450,
        "y": 200,
        "width": 120,
        "height": 120,
        "rotation": 0,
        "zIndex": 10
      },
      
      // 2. 데이터 바인딩 (OT/IT Connectivity)
      "binding": {
        "tagId": "PLC_01.MTR_STATUS", // 실시간 PLC 태그
        "dataType": "INT",            // 데이터 타입
        "refreshRate": 500,           // 업데이트 주기 (ms)
        "formatter": "motorStatus"    // 값 변환 함수명 (예: 0 -> 정지, 1 -> 가동)
      },
      
      // 3. 스타일 및 시각화 (Presentation)
      "styles": {
        "opacity": 1.0,
        "visible": true,
        "baseColor": "#808080",
        "animations": [               // 값에 따른 동적 스타일 정의
          { "condition": "== 1", "property": "fill", "value": "#00ff00", "effect": "blink" },
          { "condition": "== 2", "property": "fill", "value": "#ff0000", "effect": "static" }
        ]
      },
      
      // 4. 인터랙션 및 보안 (Interaction & Security)
      "actions": {
        "onClick": "toggleMotor",     // 클릭 시 실행할 스크립트/함수
        "confirmRequired": true,      // 조작 전 확인 창 표시 여부
        "role": "OPERATOR"            // 조작 가능 권한
      },
      
      // 5. 기타 확장 속성
      "properties": {
        "label": "Main Conveyor",
        "showTooltip": true
      }
    }
  ]
}