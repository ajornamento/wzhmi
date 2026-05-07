import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Toolbar } from './components/Toolbar/Toolbar';
import { WidgetPalette } from './components/Palette/WidgetPalette';
import { EditorCanvas } from './components/Canvas/EditorCanvas';
import { LayerPanel } from './components/Layers/LayerPanel';
import { PropertyPanel } from './components/Properties/PropertyPanel';
import { CanvasSettingsPanel } from './components/Properties/CanvasSettingsPanel';
import { useEditorStore } from './store/editorStore';
export const App = () => {
    const { schema, selectedId } = useEditorStore();
    const selectedWidget = schema.widgets.find((w) => w.id === selectedId);
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }, children: [_jsx(Toolbar, {}), _jsxs("div", { style: { display: 'flex', flex: 1, overflow: 'hidden' }, children: [_jsx(WidgetPalette, {}), _jsx(EditorCanvas, {}), _jsx(LayerPanel, {}), _jsxs("div", { style: {
                            width: 260, background: '#1a1a2a', borderLeft: '1px solid #333',
                            display: 'flex', flexDirection: 'column', flexShrink: 0,
                        }, children: [_jsx("div", { style: { padding: '8px 10px', borderBottom: '1px solid #333', fontSize: 11, color: '#888', fontWeight: 'bold', letterSpacing: 1 }, children: selectedWidget ? '속성' : '캔버스 설정' }), _jsx("div", { style: { flex: 1, overflowY: 'auto' }, children: selectedWidget ? (_jsx(PropertyPanel, { widget: selectedWidget })) : (_jsx(CanvasSettingsPanel, {})) })] })] })] }));
};
