import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { customWidgetStorage } from '../../services/customWidgetStorage';
import { WidgetRegistryDialog } from '../WidgetRegistry';
const BUILTIN_WIDGETS = [
    { type: 'MOTOR', label: '모터', icon: '⚙️', desc: '회전 모터 상태 표시' },
    { type: 'VALVE', label: '밸브', icon: '🔧', desc: '밸브 개/폐 상태' },
    { type: 'GAUGE', label: '계기판', icon: '📊', desc: '수치 게이지 표시' },
    { type: 'TANK', label: '탱크', icon: '🛢️', desc: '레벨 탱크 표시' },
    { type: 'CONVEYOR', label: '컨베이어', icon: '➡️', desc: '컨베이어 벨트' },
    { type: 'ALARM', label: '알람등', icon: '🔴', desc: '알람 표시등' },
    { type: 'TEXT_LABEL', label: '텍스트', icon: '📝', desc: '동적 텍스트 표시' },
    { type: 'LINE', label: '라인', icon: '↗', desc: '위젯 연결 라인/파이프' },
    { type: 'PIPE', label: '파이프', icon: '▬', desc: '3D 파이프 (수평/수직, 흐름 애니메이션)' },
    { type: 'WORKSTATION', label: '작업장', icon: '🖥', desc: '작업장 (가동/대기 상태 표시)' },
    { type: 'HOPPER', label: '호퍼', icon: '▽', desc: '호퍼 (충전 레벨 표시)' },
    { type: 'REACTOR', label: '반응기', icon: '⚗', desc: '반응기 (교반기 회전 애니메이션)' },
    { type: 'WAREHOUSE', label: '창고', icon: '🏭', desc: '창고 (재고 레벨 표시)' },
    { type: 'OVEN', label: '오븐', icon: '🔥', desc: 'HACCP 오븐 (온도 모니터링)' },
    { type: 'METAL_DETECTOR', label: '금속검출기', icon: '🔍', desc: '금속 이물질 검출 알람 표시' },
    { type: 'XRAY', label: '엑스레이', icon: '☢', desc: 'X-ray 검사 가동 상태 표시' },
];
export const WidgetPalette = () => {
    const { addWidget } = useEditorStore();
    const [customWidgets, setCustomWidgets] = useState([]);
    const [showRegistry, setShowRegistry] = useState(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        loadCustomWidgets();
    }, []);
    const loadCustomWidgets = async () => {
        setLoading(true);
        try {
            const widgets = await customWidgetStorage.loadAllCustomWidgets();
            setCustomWidgets(widgets);
        }
        catch (error) {
            console.error('Failed to load custom widgets:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleDragStart = (e, type, metadata) => {
        e.dataTransfer.setData('widget-type', type);
        if (metadata) {
            e.dataTransfer.setData('widget-metadata', JSON.stringify({
                imageData: metadata.imageData,
                imageUrl: metadata.imageUrl,
                customWidgetId: metadata.id,
                label: metadata.label,
            }));
        }
        e.dataTransfer.effectAllowed = 'copy';
    };
    const handleCustomWidgetSave = (metadata) => {
        setCustomWidgets(prev => {
            const existing = prev.find(w => w.id === metadata.id);
            if (existing) {
                return prev.map(w => w.id === metadata.id ? metadata : w);
            }
            else {
                return [...prev, metadata];
            }
        });
    };
    return (_jsxs("div", { style: {
            width: 160, background: '#1a1a2a', borderRight: '1px solid #333',
            display: 'flex', flexDirection: 'column', flexShrink: 0,
        }, children: [_jsx("div", { style: { padding: '8px 10px', borderBottom: '1px solid #333', fontSize: 11, color: '#888', fontWeight: 'bold', letterSpacing: 1 }, children: "\uC704\uC82F \uD314\uB808\uD2B8" }), _jsxs("div", { style: { overflowY: 'auto', flex: 1, padding: 6 }, children: [_jsxs("div", { style: { marginBottom: 12 }, children: [_jsx("div", { style: { fontSize: 10, color: '#666', marginBottom: 6, fontWeight: 'bold' }, children: "\uAE30\uBCF8 \uC704\uC82F" }), BUILTIN_WIDGETS.map(({ type, label, icon, desc }) => (_jsxs("div", { draggable: true, onDragStart: (e) => handleDragStart(e, type), onClick: () => addWidget(type), title: desc, style: {
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '7px 8px', marginBottom: 4,
                                    background: '#242436', border: '1px solid #333',
                                    borderRadius: 4, cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }, onMouseEnter: (e) => {
                                    e.currentTarget.style.background = '#2e2e50';
                                    e.currentTarget.style.borderColor = '#5566aa';
                                }, onMouseLeave: (e) => {
                                    e.currentTarget.style.background = '#242436';
                                    e.currentTarget.style.borderColor = '#333';
                                }, children: [_jsx("span", { style: { fontSize: 18 }, children: icon }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: 12, color: '#ddd' }, children: label }), _jsx("div", { style: { fontSize: 10, color: '#666' }, children: type })] })] }, type)))] }), customWidgets.length > 0 && (_jsxs("div", { children: [_jsxs("div", { style: { fontSize: 10, color: '#666', marginBottom: 6, fontWeight: 'bold' }, children: ["\uCEE4\uC2A4\uD140 \uC704\uC82F (", customWidgets.length, ")"] }), customWidgets.map((widget) => (_jsxs("div", { draggable: true, onDragStart: (e) => handleDragStart(e, widget.type, widget), onClick: () => addWidget(widget.type, {
                                    imageData: widget.imageData,
                                    imageUrl: widget.imageUrl,
                                    customWidgetId: widget.id,
                                    label: widget.label,
                                }), title: widget.description, style: {
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '7px 8px', marginBottom: 4,
                                    background: '#242436', border: '1px solid #333',
                                    borderRadius: 4, cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }, onMouseEnter: (e) => {
                                    e.currentTarget.style.background = '#2e2e50';
                                    e.currentTarget.style.borderColor = '#5566aa';
                                }, onMouseLeave: (e) => {
                                    e.currentTarget.style.background = '#242436';
                                    e.currentTarget.style.borderColor = '#333';
                                }, children: [_jsx("div", { style: {
                                            width: 24, height: 24, borderRadius: 3,
                                            backgroundColor: '#333', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            overflow: 'hidden',
                                        }, children: widget.imageData ? (_jsx("img", { src: widget.imageData, alt: widget.label, style: { width: '100%', height: '100%', objectFit: 'contain' } })) : (_jsx("span", { style: { fontSize: 12 }, children: "\uD83D\uDCE6" })) }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: 12, color: '#ddd' }, children: widget.label }), _jsx("div", { style: { fontSize: 10, color: '#666' }, children: widget.type })] })] }, widget.id)))] })), _jsx("div", { style: { marginTop: 12 }, children: _jsx("button", { type: "button", onClick: () => setShowRegistry(true), style: {
                                width: '100%',
                                padding: '8px 12px',
                                backgroundColor: '#4a5fd5',
                                color: 'white',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 12,
                                fontWeight: 'bold',
                            }, children: "\u2699\uFE0F \uC704\uC82F \uAD00\uB9AC" }) })] }), _jsx("div", { style: { padding: '6px 10px', borderTop: '1px solid #333', fontSize: 10, color: '#555' }, children: "\uD074\uB9AD \uB610\uB294 \uB4DC\uB798\uADF8\uB85C \uCD94\uAC00" }), showRegistry && (_jsx(WidgetRegistryDialog, { isOpen: showRegistry, onClose: () => setShowRegistry(false), onSave: handleCustomWidgetSave }))] }));
};
