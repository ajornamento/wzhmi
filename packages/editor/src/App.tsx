// 위젯 편집기 메인 앱 컴포넌트
import React from 'react';
import { Toolbar } from './components/Toolbar/Toolbar';
import { WidgetPalette } from './components/Palette/WidgetPalette';
import { EditorCanvas } from './components/Canvas/EditorCanvas';
import { LayerPanel } from './components/Layers/LayerPanel';
import { PropertyPanel } from './components/Properties/PropertyPanel';
import { CanvasSettingsPanel } from './components/Properties/CanvasSettingsPanel';
import { useEditorStore } from './store/editorStore';

export const App: React.FC = () => {
  const { schema, selectedId } = useEditorStore();
  const selectedWidget = schema.widgets.find((w) => w.id === selectedId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Toolbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <WidgetPalette />
        <EditorCanvas />
        <LayerPanel />
        <div style={{
          width: 260, background: '#1a1a2a', borderLeft: '1px solid #333',
          display: 'flex', flexDirection: 'column', flexShrink: 0,
        }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #333', fontSize: 11, color: '#888', fontWeight: 'bold', letterSpacing: 1 }}>
            {selectedWidget ? '속성' : '캔버스 설정'}
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {selectedWidget ? (
              <PropertyPanel widget={selectedWidget} />
            ) : (
              <CanvasSettingsPanel />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
