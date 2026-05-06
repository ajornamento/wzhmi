import React from 'react';
import { useEditorStore } from '../../store/editorStore';

const PRESETS: Array<{ label: string; w: number; h: number }> = [
  { label: '16:9',  w: 1920, h: 1080 },
  { label: '4:3',   w: 1600, h: 1200 },
  { label: '21:9',  w: 2560, h: 1080 },
  { label: '3:2',   w: 1920, h: 1280 },
  { label: '1:1',   w: 1080, h: 1080 },
  { label: '9:16',  w: 1080, h: 1920 },
];

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#12121e', border: '1px solid #444',
  color: '#ccc', borderRadius: 3, padding: '3px 6px', fontSize: 12,
  boxSizing: 'border-box',
};

const sectionTitle: React.CSSProperties = {
  fontSize: 10, color: '#5577aa', fontWeight: 'bold',
  letterSpacing: 1, marginBottom: 8,
};

const presetBtn: React.CSSProperties = {
  background: '#1e1e2e', color: '#aab', border: '1px solid #334',
  borderRadius: 3, padding: '5px 0', cursor: 'pointer', fontSize: 11,
  textAlign: 'center',
};

const presetBtnActive: React.CSSProperties = {
  ...presetBtn,
  background: '#1e3050', color: '#7af', border: '1px solid #3a6aaa',
};

export const CanvasSettingsPanel: React.FC = () => {
  const { schema, setCanvas, canvasScale } = useEditorStore();
  const { canvas } = schema;

  const currentRatio = canvas.width / canvas.height;

  return (
    <div style={{ padding: 12 }}>
      {/* 설계 해상도 */}
      <div style={{ marginBottom: 14 }}>
        <div style={sectionTitle}>설계 해상도</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 16px 1fr', gap: 4, alignItems: 'center', marginBottom: 6 }}>
          <div>
            <label style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 2 }}>가로 (W)</label>
            <input
              type="number"
              min={100}
              max={7680}
              step={10}
              style={inputStyle}
              value={canvas.width}
              onChange={(e) => setCanvas({ width: Math.max(100, Number(e.target.value)) })}
            />
          </div>
          <span style={{ textAlign: 'center', color: '#555', fontSize: 12 }}>×</span>
          <div>
            <label style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 2 }}>세로 (H)</label>
            <input
              type="number"
              min={100}
              max={7680}
              step={10}
              style={inputStyle}
              value={canvas.height}
              onChange={(e) => setCanvas({ height: Math.max(100, Number(e.target.value)) })}
            />
          </div>
        </div>
        <div style={{ fontSize: 10, color: '#556', textAlign: 'right' }}>
          비율 {(currentRatio).toFixed(3)} · 표시 {Math.round(canvasScale * 100)}%
        </div>
      </div>

      {/* 비율 프리셋 */}
      <div style={{ marginBottom: 14 }}>
        <div style={sectionTitle}>비율 프리셋</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
          {PRESETS.map(({ label, w, h }) => {
            const isActive = canvas.width === w && canvas.height === h;
            return (
              <button
                key={label}
                type="button"
                style={isActive ? presetBtnActive : presetBtn}
                onClick={() => setCanvas({ width: w, height: h })}
                title={`${w} × ${h}`}
              >
                <div style={{ fontWeight: 'bold' }}>{label}</div>
                <div style={{ fontSize: 9, color: '#667', marginTop: 1 }}>{w}×{h}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 배경 */}
      <div style={{ marginBottom: 14 }}>
        <div style={sectionTitle}>배경</div>
        <label style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 2 }}>배경색</label>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="color"
            value={canvas.backgroundColor}
            onChange={(e) => setCanvas({ backgroundColor: e.target.value })}
            style={{ width: 36, height: 28, cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}
          />
          <input
            style={{ ...inputStyle, flex: 1 }}
            value={canvas.backgroundColor}
            onChange={(e) => setCanvas({ backgroundColor: e.target.value })}
          />
        </div>
      </div>

      {/* 안내 */}
      <div style={{
        background: '#0e1a2e', border: '1px solid #1a2a4a', borderRadius: 4,
        padding: '8px 10px', fontSize: 10, color: '#557', lineHeight: 1.6,
      }}>
        설계 해상도는 위젯 좌표 기준입니다.<br />
        캔버스는 브라우저 창 크기에 맞게 자동으로 축소·확대됩니다.
      </div>
    </div>
  );
};
