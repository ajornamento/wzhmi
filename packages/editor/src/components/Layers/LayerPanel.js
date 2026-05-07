import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
const TYPE_ICON = {
    MOTOR: '⚙️', VALVE: '🔧', GAUGE: '📊', TANK: '🛢️',
    CONVEYOR: '➡️', ALARM: '🔴', TEXT_LABEL: '📝', LINE: '↗',
};
export const LayerPanel = () => {
    const { schema, selectedId, selectWidget, bringForward, sendBackward, removeWidget, duplicateWidget } = useEditorStore();
    const [hoverId, setHoverId] = useState(null);
    const sorted = [...schema.widgets].sort((a, b) => b.geometry.zIndex - a.geometry.zIndex);
    return (_jsxs("div", { style: {
            width: 210, background: '#1a1a2a', borderLeft: '1px solid #333',
            display: 'flex', flexDirection: 'column', flexShrink: 0,
        }, children: [_jsxs("div", { style: {
                    padding: '8px 10px', borderBottom: '1px solid #333',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }, children: [_jsx("span", { style: { fontSize: 11, color: '#888', fontWeight: 'bold', letterSpacing: 1 }, children: "\uB808\uC774\uC5B4" }), _jsx("span", { style: { fontSize: 10, color: '#446' }, title: "Tab \uD0A4\uB85C \uC704\uC82F\uC744 \uC21C\uC11C\uB300\uB85C \uC120\uD0DD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4", children: "Tab = \uC21C\uD658\uC120\uD0DD" })] }), selectedId && (_jsxs("div", { style: {
                    padding: '4px 10px', background: '#1e2a1e', borderBottom: '1px solid #2a3a2a',
                    fontSize: 10, color: '#6a8', display: 'flex', alignItems: 'center', gap: 4,
                }, children: [_jsx("span", { children: "\u2714" }), _jsx("span", { children: "1\uAC1C \uC120\uD0DD\uB428 \u2014 \uD074\uB9AD\uC73C\uB85C \uC774\uB3D9 \uAC00\uB2A5" })] })), _jsxs("div", { style: { flex: 1, overflowY: 'auto' }, children: [sorted.map((w) => {
                        const isSelected = w.id === selectedId;
                        const isHovered = w.id === hoverId;
                        return (_jsxs("div", { onClick: () => selectWidget(w.id), onMouseEnter: () => setHoverId(w.id), onMouseLeave: () => setHoverId(null), title: `클릭하여 선택: ${w.name}`, style: {
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '6px 8px',
                                background: isSelected ? '#1e3358' : isHovered ? '#22223a' : 'transparent',
                                borderLeft: isSelected ? '3px solid #5599ff' : '3px solid transparent',
                                cursor: 'pointer',
                                borderBottom: '1px solid #1a1a2a',
                                transition: 'background 0.1s',
                                userSelect: 'none',
                            }, children: [_jsx("span", { style: { fontSize: 13, minWidth: 18, textAlign: 'center' }, children: TYPE_ICON[w.type] ?? '□' }), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { style: {
                                                fontSize: 12,
                                                color: isSelected ? '#aaccff' : '#ccc',
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                fontWeight: isSelected ? 'bold' : 'normal',
                                            }, children: w.name }), _jsxs("div", { style: { fontSize: 10, color: '#556', marginTop: 1 }, children: ["z=", w.geometry.zIndex, " \u00B7 ", w.type] })] }), isSelected && (_jsx("span", { style: { fontSize: 10, color: '#5599ff' }, children: "\u2714" }))] }, w.id));
                    }), sorted.length === 0 && (_jsxs("div", { style: { padding: 20, color: '#444', fontSize: 12, textAlign: 'center', lineHeight: 1.6 }, children: ["\uC704\uC82F \uC5C6\uC74C", _jsx("br", {}), _jsx("span", { style: { fontSize: 10 }, children: "\uD314\uB808\uD2B8\uC5D0\uC11C \uCD94\uAC00\uD558\uC138\uC694" })] }))] }), selectedId && (_jsxs("div", { style: { borderTop: '1px solid #2a2a3a', padding: 8 }, children: [_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 4 }, children: [_jsx("button", { type: "button", onClick: () => bringForward(selectedId), style: smallBtn, title: "z-index +1", children: "\u25B2 \uC55E\uC73C\uB85C" }), _jsx("button", { type: "button", onClick: () => sendBackward(selectedId), style: smallBtn, title: "z-index -1", children: "\u25BC \uB4A4\uB85C" })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }, children: [_jsx("button", { type: "button", onClick: () => duplicateWidget(selectedId), style: smallBtn, children: "\u29C9 \uBCF5\uC81C" }), _jsx("button", { type: "button", onClick: () => removeWidget(selectedId), style: { ...smallBtn, color: '#f88', borderColor: '#622' }, children: "\uD83D\uDDD1 \uC0AD\uC81C" })] })] })), _jsx("div", { style: { padding: '5px 10px', borderTop: '1px solid #222', fontSize: 10, color: '#334', textAlign: 'center' }, children: "\uB808\uC774\uC5B4 \uD074\uB9AD \u2192 \uC704\uC82F \uC120\uD0DD" })] }));
};
const smallBtn = {
    background: '#2a2a3a', color: '#ccc', border: '1px solid #444',
    borderRadius: 3, padding: '4px 0', cursor: 'pointer', fontSize: 11,
    textAlign: 'center', width: '100%',
};
