import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';

const TYPE_ICON: Record<string, string> = {
  MOTOR: '⚙️', VALVE: '🔧', GAUGE: '📊', TANK: '🛢️',
  CONVEYOR: '➡️', ALARM: '🔴', TEXT_LABEL: '📝', LINE: '↗',
};

export const LayerPanel: React.FC = () => {
  const { schema, selectedId, selectWidget, bringForward, sendBackward, removeWidget, duplicateWidget } = useEditorStore();
  const [hoverId, setHoverId] = useState<string | null>(null);
  const sorted = [...schema.widgets].sort((a, b) => b.geometry.zIndex - a.geometry.zIndex);

  return (
    <div style={{
      width: 210, background: '#1a1a2a', borderLeft: '1px solid #333',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>
      <div style={{
        padding: '8px 10px', borderBottom: '1px solid #333',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 11, color: '#888', fontWeight: 'bold', letterSpacing: 1 }}>
          레이어
        </span>
        <span style={{ fontSize: 10, color: '#446' }} title="Tab 키로 위젯을 순서대로 선택할 수 있습니다">Tab = 순환선택</span>
      </div>
      {selectedId && (
        <div style={{
          padding: '4px 10px', background: '#1e2a1e', borderBottom: '1px solid #2a3a2a',
          fontSize: 10, color: '#6a8', display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span>✔</span>
          <span>1개 선택됨 — 클릭으로 이동 가능</span>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {sorted.map((w) => {
          const isSelected = w.id === selectedId;
          const isHovered = w.id === hoverId;
          return (
            <div
              key={w.id}
              onClick={() => selectWidget(w.id)}
              onMouseEnter={() => setHoverId(w.id)}
              onMouseLeave={() => setHoverId(null)}
              title={`클릭하여 선택: ${w.name}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 8px',
                background: isSelected ? '#1e3358' : isHovered ? '#22223a' : 'transparent',
                borderLeft: isSelected ? '3px solid #5599ff' : '3px solid transparent',
                cursor: 'pointer',
                borderBottom: '1px solid #1a1a2a',
                transition: 'background 0.1s',
                userSelect: 'none',
              }}
            >
              <span style={{ fontSize: 13, minWidth: 18, textAlign: 'center' }}>
                {TYPE_ICON[w.type] ?? '□'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12,
                  color: isSelected ? '#aaccff' : '#ccc',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  fontWeight: isSelected ? 'bold' : 'normal',
                }}>
                  {w.name}
                </div>
                <div style={{ fontSize: 10, color: '#556', marginTop: 1 }}>
                  z={w.geometry.zIndex} · {w.type}
                </div>
              </div>
              {isSelected && (
                <span style={{ fontSize: 10, color: '#5599ff' }}>✔</span>
              )}
            </div>
          );
        })}
        {sorted.length === 0 && (
          <div style={{ padding: 20, color: '#444', fontSize: 12, textAlign: 'center', lineHeight: 1.6 }}>
            위젯 없음<br />
            <span style={{ fontSize: 10 }}>팔레트에서 추가하세요</span>
          </div>
        )}
      </div>

      {/* 선택된 위젯 조작 버튼 */}
      {selectedId && (
        <div style={{ borderTop: '1px solid #2a2a3a', padding: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 4 }}>
            <button type="button" onClick={() => bringForward(selectedId)} style={smallBtn} title="z-index +1">▲ 앞으로</button>
            <button type="button" onClick={() => sendBackward(selectedId)} style={smallBtn} title="z-index -1">▼ 뒤로</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            <button type="button" onClick={() => duplicateWidget(selectedId)} style={smallBtn}>⧉ 복제</button>
            <button type="button" onClick={() => removeWidget(selectedId)} style={{ ...smallBtn, color: '#f88', borderColor: '#622' }}>🗑 삭제</button>
          </div>
        </div>
      )}

      <div style={{ padding: '5px 10px', borderTop: '1px solid #222', fontSize: 10, color: '#334', textAlign: 'center' }}>
        레이어 클릭 → 위젯 선택
      </div>
    </div>
  );
};

const smallBtn: React.CSSProperties = {
  background: '#2a2a3a', color: '#ccc', border: '1px solid #444',
  borderRadius: 3, padding: '4px 0', cursor: 'pointer', fontSize: 11,
  textAlign: 'center', width: '100%',
};
