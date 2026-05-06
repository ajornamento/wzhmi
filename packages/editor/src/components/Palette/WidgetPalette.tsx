import React from 'react';
import type { WidgetType } from '@wzhmi/core';
import { useEditorStore } from '../../store/editorStore';

const WIDGET_DEFS: Array<{ type: WidgetType; label: string; icon: string; desc: string }> = [
  { type: 'MOTOR', label: '모터', icon: '⚙️', desc: '회전 모터 상태 표시' },
  { type: 'VALVE', label: '밸브', icon: '🔧', desc: '밸브 개/폐 상태' },
  { type: 'GAUGE', label: '계기판', icon: '📊', desc: '수치 게이지 표시' },
  { type: 'TANK', label: '탱크', icon: '🛢️', desc: '레벨 탱크 표시' },
  { type: 'CONVEYOR', label: '컨베이어', icon: '➡️', desc: '컨베이어 벨트' },
  { type: 'ALARM', label: '알람등', icon: '🔴', desc: '알람 표시등' },
  { type: 'TEXT_LABEL', label: '텍스트', icon: '📝', desc: '동적 텍스트 표시' },
  { type: 'LINE', label: '라인', icon: '↗', desc: '위젯 연결 라인/파이프' },
];

export const WidgetPalette: React.FC = () => {
  const { addWidget } = useEditorStore();

  const handleDragStart = (e: React.DragEvent, type: WidgetType) => {
    e.dataTransfer.setData('widget-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div style={{
      width: 160, background: '#1a1a2a', borderRight: '1px solid #333',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>
      <div style={{ padding: '8px 10px', borderBottom: '1px solid #333', fontSize: 11, color: '#888', fontWeight: 'bold', letterSpacing: 1 }}>
        위젯 팔레트
      </div>
      <div style={{ overflowY: 'auto', flex: 1, padding: 6 }}>
        {WIDGET_DEFS.map(({ type, label, icon, desc }) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => handleDragStart(e, type)}
            onClick={() => addWidget(type)}
            title={desc}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 8px', marginBottom: 4,
              background: '#242436', border: '1px solid #333',
              borderRadius: 4, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = '#2e2e50';
              (e.currentTarget as HTMLDivElement).style.borderColor = '#5566aa';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = '#242436';
              (e.currentTarget as HTMLDivElement).style.borderColor = '#333';
            }}
          >
            <span style={{ fontSize: 18 }}>{icon}</span>
            <div>
              <div style={{ fontSize: 12, color: '#ddd' }}>{label}</div>
              <div style={{ fontSize: 10, color: '#666' }}>{type}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '6px 10px', borderTop: '1px solid #333', fontSize: 10, color: '#555' }}>
        클릭 또는 드래그로 추가
      </div>
    </div>
  );
};
