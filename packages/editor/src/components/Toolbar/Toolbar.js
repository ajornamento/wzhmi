import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useRef, useCallback } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { WidgetRegistryDialog } from '../WidgetRegistry';
function downloadJson(json, name) {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
}
export const Toolbar = () => {
    const { fileName, selectedId, undo, redo, loadSchema, setFileName, removeWidget, duplicateWidget, historyIndex, history } = useEditorStore();
    const fileInputRef = useRef(null);
    const fileHandleRef = useRef(null);
    const [showWidgetRegistry, setShowWidgetRegistry] = React.useState(false);
    const handleLoad = useCallback(async () => {
        if ('showOpenFilePicker' in window) {
            try {
                const [handle] = await window.showOpenFilePicker({
                    types: [{ description: 'HMI JSON', accept: { 'application/json': ['.json'] } }],
                });
                fileHandleRef.current = handle;
                const file = await handle.getFile();
                const text = await file.text();
                try {
                    loadSchema(JSON.parse(text), file.name);
                }
                catch {
                    alert('유효하지 않은 HMI 파일입니다.');
                }
            }
            catch { /* 취소 */ }
        }
        else {
            fileInputRef.current?.click();
        }
    }, [loadSchema]);
    const handleLoadFallback = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        fileHandleRef.current = null;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                loadSchema(JSON.parse(ev.target?.result), file.name);
            }
            catch {
                alert('유효하지 않은 HMI 파일입니다.');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }, [loadSchema]);
    const handleSave = useCallback(async () => {
        const { schema, fileName: name } = useEditorStore.getState();
        const json = JSON.stringify(schema, null, 2);
        if (fileHandleRef.current) {
            try {
                const writable = await fileHandleRef.current.createWritable();
                await writable.write(json);
                await writable.close();
                return;
            }
            catch { /* 권한 거부 등 → 다운로드로 대체 */ }
        }
        downloadJson(json, name);
    }, []);
    const handleSaveAs = useCallback(async () => {
        const { schema, fileName: name } = useEditorStore.getState();
        const json = JSON.stringify(schema, null, 2);
        if ('showSaveFilePicker' in window) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: name,
                    types: [{ description: 'HMI JSON', accept: { 'application/json': ['.json'] } }],
                });
                fileHandleRef.current = handle;
                const writable = await handle.createWritable();
                await writable.write(json);
                await writable.close();
                setFileName(handle.name);
            }
            catch { /* 취소 */ }
        }
        else {
            downloadJson(json, name);
        }
    }, [setFileName]);
    const handleOpenViewer = useCallback(() => {
        const json = JSON.stringify(useEditorStore.getState().schema);
        const origin = window.location.origin;
        const viewerWin = window.open('/viewer.html', 'hmi_viewer');
        if (!viewerWin)
            return;
        try {
            viewerWin.postMessage({ type: 'preview-schema', schema: json }, origin);
        }
        catch { /* 로드 중 */ }
        const onReady = (e) => {
            if (e.data?.type === 'viewer-ready') {
                viewerWin.postMessage({ type: 'preview-schema', schema: json }, origin);
                window.removeEventListener('message', onReady);
            }
        };
        window.addEventListener('message', onReady);
        setTimeout(() => window.removeEventListener('message', onReady), 15000);
    }, []);
    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;
    return (_jsxs("div", { style: {
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', background: '#12121e',
            borderBottom: '1px solid #333', height: 42, flexShrink: 0,
        }, children: [_jsx("span", { style: { color: '#88aaff', fontWeight: 'bold', fontSize: 14, marginRight: 8 }, children: "HMI Editor" }), _jsx("span", { style: { color: '#666', fontSize: 12 }, children: fileName }), _jsx("div", { style: divider }), _jsx("button", { type: "button", onClick: handleLoad, style: btn, children: "\uC5F4\uAE30" }), _jsx("input", { ref: fileInputRef, type: "file", accept: ".json", "aria-label": "HMI \uD30C\uC77C \uC5F4\uAE30", onChange: handleLoadFallback, style: { display: 'none' } }), _jsx("button", { type: "button", onClick: handleSave, style: btn, children: "\uC800\uC7A5" }), _jsx("button", { type: "button", onClick: handleSaveAs, style: btn, children: "\uC0C8\uD30C\uC77C\uB85C \uC800\uC7A5" }), _jsx("div", { style: divider }), _jsx("button", { type: "button", onClick: () => setShowWidgetRegistry(true), style: { ...btn, background: '#2a3a2a', color: '#8fa', borderColor: '#4a6' }, title: "\uC704\uC82F \uAD00\uB9AC", children: "\u2699\uFE0F \uC704\uC82F \uAD00\uB9AC" }), _jsx("button", { type: "button", onClick: undo, disabled: !canUndo, style: { ...btn, opacity: canUndo ? 1 : 0.4 }, title: "\uC2E4\uD589\uCDE8\uC18C (Ctrl+Z)", children: "\u21A9 \uC2E4\uD589\uCDE8\uC18C" }), _jsx("button", { type: "button", onClick: redo, disabled: !canRedo, style: { ...btn, opacity: canRedo ? 1 : 0.4 }, title: "\uB2E4\uC2DC\uC2E4\uD589 (Ctrl+Y)", children: "\u21AA \uB2E4\uC2DC\uC2E4\uD589" }), _jsx("div", { style: divider }), selectedId && (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", onClick: () => duplicateWidget(selectedId), style: btn, children: "\uBCF5\uC81C" }), _jsx("button", { type: "button", onClick: () => removeWidget(selectedId), style: { ...btn, color: '#f88' }, children: "\uC0AD\uC81C" }), _jsx("div", { style: divider })] })), _jsx("div", { style: { marginLeft: 'auto' }, children: _jsx("button", { type: "button", onClick: handleOpenViewer, style: { ...btn, background: '#1a3a5a', color: '#88ddff', borderColor: '#336' }, children: "\uBDF0\uC5B4\uC5D0\uC11C \uC5F4\uAE30 \u2192" }) }), showWidgetRegistry && (_jsx(WidgetRegistryDialog, { isOpen: showWidgetRegistry, onClose: () => setShowWidgetRegistry(false) }))] }));
};
const btn = {
    background: '#2a2a3a', color: '#ccc', border: '1px solid #444',
    borderRadius: 3, padding: '3px 10px', cursor: 'pointer', fontSize: 12,
    whiteSpace: 'nowrap',
};
const divider = {
    width: 1, height: 20, background: '#444', margin: '0 2px',
};
