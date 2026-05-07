import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEditorStore } from '../../store/editorStore';
const PRESETS = [
    { label: '16:9', w: 1920, h: 1080 },
    { label: '4:3', w: 1600, h: 1200 },
    { label: '21:9', w: 2560, h: 1080 },
    { label: '3:2', w: 1920, h: 1280 },
    { label: '1:1', w: 1080, h: 1080 },
    { label: '9:16', w: 1080, h: 1920 },
];
const inputStyle = {
    width: '100%', background: '#12121e', border: '1px solid #444',
    color: '#ccc', borderRadius: 3, padding: '3px 6px', fontSize: 12,
    boxSizing: 'border-box',
};
const sectionTitle = {
    fontSize: 10, color: '#5577aa', fontWeight: 'bold',
    letterSpacing: 1, marginBottom: 8,
};
const presetBtn = {
    background: '#1e1e2e', color: '#aab', border: '1px solid #334',
    borderRadius: 3, padding: '5px 0', cursor: 'pointer', fontSize: 11,
    textAlign: 'center',
};
const presetBtnActive = {
    ...presetBtn,
    background: '#1e3050', color: '#7af', border: '1px solid #3a6aaa',
};
export const CanvasSettingsPanel = () => {
    const { schema, setCanvas, canvasScale } = useEditorStore();
    const { canvas } = schema;
    const currentRatio = canvas.width / canvas.height;
    return (_jsxs("div", { style: { padding: 12 }, children: [_jsxs("div", { style: { marginBottom: 14 }, children: [_jsx("div", { style: sectionTitle, children: "\uC124\uACC4 \uD574\uC0C1\uB3C4" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 16px 1fr', gap: 4, alignItems: 'center', marginBottom: 6 }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: 10, color: '#888', display: 'block', marginBottom: 2 }, children: "\uAC00\uB85C (W)" }), _jsx("input", { type: "number", min: 100, max: 7680, step: 10, style: inputStyle, value: canvas.width, onChange: (e) => setCanvas({ width: Math.max(100, Number(e.target.value)) }) })] }), _jsx("span", { style: { textAlign: 'center', color: '#555', fontSize: 12 }, children: "\u00D7" }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: 10, color: '#888', display: 'block', marginBottom: 2 }, children: "\uC138\uB85C (H)" }), _jsx("input", { type: "number", min: 100, max: 7680, step: 10, style: inputStyle, value: canvas.height, onChange: (e) => setCanvas({ height: Math.max(100, Number(e.target.value)) }) })] })] }), _jsxs("div", { style: { fontSize: 10, color: '#556', textAlign: 'right' }, children: ["\uBE44\uC728 ", (currentRatio).toFixed(3), " \u00B7 \uD45C\uC2DC ", Math.round(canvasScale * 100), "%"] })] }), _jsxs("div", { style: { marginBottom: 14 }, children: [_jsx("div", { style: sectionTitle, children: "\uBE44\uC728 \uD504\uB9AC\uC14B" }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }, children: PRESETS.map(({ label, w, h }) => {
                            const isActive = canvas.width === w && canvas.height === h;
                            return (_jsxs("button", { type: "button", style: isActive ? presetBtnActive : presetBtn, onClick: () => setCanvas({ width: w, height: h }), title: `${w} × ${h}`, children: [_jsx("div", { style: { fontWeight: 'bold' }, children: label }), _jsxs("div", { style: { fontSize: 9, color: '#667', marginTop: 1 }, children: [w, "\u00D7", h] })] }, label));
                        }) })] }), _jsxs("div", { style: { marginBottom: 14 }, children: [_jsx("div", { style: sectionTitle, children: "\uBC30\uACBD" }), _jsx("label", { style: { fontSize: 10, color: '#888', display: 'block', marginBottom: 2 }, children: "\uBC30\uACBD\uC0C9" }), _jsxs("div", { style: { display: 'flex', gap: 6 }, children: [_jsx("input", { type: "color", value: canvas.backgroundColor, onChange: (e) => setCanvas({ backgroundColor: e.target.value }), style: { width: 36, height: 28, cursor: 'pointer', border: 'none', background: 'none', padding: 0 } }), _jsx("input", { style: { ...inputStyle, flex: 1 }, value: canvas.backgroundColor, onChange: (e) => setCanvas({ backgroundColor: e.target.value }) })] })] }), _jsxs("div", { style: {
                    background: '#0e1a2e', border: '1px solid #1a2a4a', borderRadius: 4,
                    padding: '8px 10px', fontSize: 10, color: '#557', lineHeight: 1.6,
                }, children: ["\uC124\uACC4 \uD574\uC0C1\uB3C4\uB294 \uC704\uC82F \uC88C\uD45C \uAE30\uC900\uC785\uB2C8\uB2E4.", _jsx("br", {}), "\uCE94\uBC84\uC2A4\uB294 \uBE0C\uB77C\uC6B0\uC800 \uCC3D \uD06C\uAE30\uC5D0 \uB9DE\uAC8C \uC790\uB3D9\uC73C\uB85C \uCD95\uC18C\u00B7\uD655\uB300\uB429\uB2C8\uB2E4."] })] }));
};
