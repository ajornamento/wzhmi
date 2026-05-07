import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useRef, useState, useEffect } from 'react';
import { HmiCanvas } from './components/HmiCanvas';
import { useViewerStore } from './store/viewerStore';
export const App = () => {
    const { schema, scale, setSchema, setScale, serverUrl, setServerUrl } = useViewerStore();
    const fileInputRef = useRef(null);
    const [serverFiles, setServerFiles] = useState([]);
    const apiBase = serverUrl.replace('ws://', 'http://').replace('wss://', 'https://');
    // 에디터 창으로부터 스키마를 postMessage로 수신
    useEffect(() => {
        // 에디터에 "뷰어 준비 완료" 알림
        if (window.opener) {
            window.opener.postMessage({ type: 'viewer-ready' }, '*');
        }
        const handleMessage = (e) => {
            if (e.data?.type === 'preview-schema') {
                try {
                    const parsed = JSON.parse(e.data.schema);
                    setSchema(parsed);
                    // 스케일은 HmiCanvas ResizeObserver가 캔버스 크기 기준으로 자동 재계산
                }
                catch {
                    // 잘못된 JSON 무시
                }
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [setSchema]);
    useEffect(() => {
        fetch(`${apiBase}/api/hmi`)
            .then((r) => r.json())
            .then(setServerFiles)
            .catch(() => { });
    }, [apiBase]);
    const handleServerLoad = useCallback((fileName) => {
        fetch(`${apiBase}/api/hmi/${fileName}`)
            .then((r) => r.json())
            .then((json) => setSchema(json))
            .catch(() => alert('서버에서 파일을 불러오지 못했습니다.'));
    }, [apiBase, setSchema]);
    const handleFileLoad = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const json = JSON.parse(ev.target?.result);
                setSchema(json);
            }
            catch {
                alert('유효하지 않은 HMI 파일입니다.');
            }
        };
        reader.readAsText(file);
    }, [setSchema]);
    const handleFitScale = useCallback(() => {
        const sw = window.innerWidth / schema.canvas.width;
        const sh = window.innerHeight / schema.canvas.height;
        setScale(Math.min(sw, sh) * 0.95);
    }, [schema.canvas, setScale]);
    return (_jsxs("div", { style: { width: '100vw', height: '100vh', background: '#111', overflow: 'hidden' }, children: [_jsxs("div", { style: {
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px', background: 'rgba(20,20,30,0.95)',
                    borderBottom: '1px solid #333', backdropFilter: 'blur(4px)',
                }, children: [_jsx("span", { style: { color: '#88aaff', fontWeight: 'bold', fontSize: 14, marginRight: 8 }, children: "HMI Viewer" }), _jsx("button", { onClick: () => fileInputRef.current?.click(), style: btnStyle, children: "\uD30C\uC77C \uC5F4\uAE30" }), _jsx("input", { ref: fileInputRef, type: "file", accept: ".json", style: { display: 'none' }, onChange: handleFileLoad }), serverFiles.length > 0 && (_jsxs("select", { "aria-label": "\uC11C\uBC84 HMI \uD30C\uC77C \uC120\uD0DD", title: "\uC11C\uBC84 HMI \uD30C\uC77C \uC120\uD0DD", style: { background: '#2a2a3a', color: '#ccc', border: '1px solid #444', borderRadius: 3, padding: '2px 6px', fontSize: 12, cursor: 'pointer' }, defaultValue: "", onChange: (e) => { if (e.target.value)
                            handleServerLoad(e.target.value); }, children: [_jsx("option", { value: "", disabled: true, children: "\uC11C\uBC84 \uD30C\uC77C..." }), serverFiles.map((f) => _jsx("option", { value: f, children: f }, f))] })), _jsx("div", { style: { width: 1, height: 20, background: '#444', margin: '0 4px' } }), _jsx("button", { onClick: handleFitScale, style: btnStyle, children: "\uD654\uBA74 \uB9DE\uCDA4" }), _jsx("button", { onClick: () => setScale(1), style: btnStyle, children: "100%" }), _jsx("input", { type: "range", min: "0.2", max: "2", step: "0.05", value: scale, onChange: (e) => setScale(Number(e.target.value)), style: { width: 80 } }), _jsxs("span", { style: { color: '#aaa', fontSize: 12, minWidth: 40 }, children: [Math.round(scale * 100), "%"] }), _jsx("div", { style: { width: 1, height: 20, background: '#444', margin: '0 4px' } }), _jsx("span", { style: { color: '#888', fontSize: 12 }, children: "\uC11C\uBC84:" }), _jsx("input", { type: "text", value: serverUrl, onChange: (e) => setServerUrl(e.target.value), style: {
                            background: '#1a1a2a', border: '1px solid #444', color: '#ccc',
                            borderRadius: 3, padding: '2px 6px', fontSize: 12, width: 180,
                        } }), _jsx("div", { style: { marginLeft: 'auto', display: 'flex', gap: 8 }, children: _jsxs("span", { style: { color: '#666', fontSize: 11 }, children: [schema.canvas.width, "\u00D7", schema.canvas.height, " | ", schema.widgets.length, "\uAC1C \uC704\uC82F"] }) })] }), _jsx("div", { style: { paddingTop: 40, width: '100%', height: '100%' }, children: _jsx(HmiCanvas, {}) })] }));
};
const btnStyle = {
    background: '#2a2a3a', color: '#ccc', border: '1px solid #444',
    borderRadius: 3, padding: '3px 10px', cursor: 'pointer', fontSize: 12,
};
