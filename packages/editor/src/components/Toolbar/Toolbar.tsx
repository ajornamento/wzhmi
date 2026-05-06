import React, { useRef, useCallback } from 'react';
import { useEditorStore } from '../../store/editorStore';
import type { HmiSchema } from '@wzhmi/core';

function downloadJson(json: string, name: string) {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export const Toolbar: React.FC = () => {
  const { fileName, selectedId, undo, redo, loadSchema, setFileName, removeWidget, duplicateWidget, historyIndex, history } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileHandleRef = useRef<any>(null);

  const handleLoad = useCallback(async () => {
    if ('showOpenFilePicker' in window) {
      try {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [{ description: 'HMI JSON', accept: { 'application/json': ['.json'] } }],
        });
        fileHandleRef.current = handle;
        const file = await handle.getFile();
        const text = await file.text();
        try {
          loadSchema(JSON.parse(text) as HmiSchema, file.name);
        } catch {
          alert('유효하지 않은 HMI 파일입니다.');
        }
      } catch { /* 취소 */ }
    } else {
      fileInputRef.current?.click();
    }
  }, [loadSchema]);

  const handleLoadFallback = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    fileHandleRef.current = null;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        loadSchema(JSON.parse(ev.target?.result as string) as HmiSchema, file.name);
      } catch {
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
      } catch { /* 권한 거부 등 → 다운로드로 대체 */ }
    }
    downloadJson(json, name);
  }, []);

  const handleSaveAs = useCallback(async () => {
    const { schema, fileName: name } = useEditorStore.getState();
    const json = JSON.stringify(schema, null, 2);
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: name,
          types: [{ description: 'HMI JSON', accept: { 'application/json': ['.json'] } }],
        });
        fileHandleRef.current = handle;
        const writable = await handle.createWritable();
        await writable.write(json);
        await writable.close();
        setFileName(handle.name);
      } catch { /* 취소 */ }
    } else {
      downloadJson(json, name);
    }
  }, [setFileName]);

  const handleOpenViewer = useCallback(() => {
    const json = JSON.stringify(useEditorStore.getState().schema);
    const origin = window.location.origin;
    const viewerWin = window.open('/viewer.html', 'hmi_viewer');
    if (!viewerWin) return;
    try {
      viewerWin.postMessage({ type: 'preview-schema', schema: json }, origin);
    } catch { /* 로드 중 */ }
    const onReady = (e: MessageEvent) => {
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

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', background: '#12121e',
      borderBottom: '1px solid #333', height: 42, flexShrink: 0,
    }}>
      <span style={{ color: '#88aaff', fontWeight: 'bold', fontSize: 14, marginRight: 8 }}>
        HMI Editor
      </span>
      <span style={{ color: '#666', fontSize: 12 }}>{fileName}</span>

      <div style={divider} />

      <button type="button" onClick={handleLoad} style={btn}>열기</button>
      <input ref={fileInputRef} type="file" accept=".json" aria-label="HMI 파일 열기" onChange={handleLoadFallback} style={{ display: 'none' }} />
      <button type="button" onClick={handleSave} style={btn}>저장</button>
      <button type="button" onClick={handleSaveAs} style={btn}>새파일로 저장</button>

      <div style={divider} />

      <button type="button" onClick={undo} disabled={!canUndo} style={{ ...btn, opacity: canUndo ? 1 : 0.4 }} title="실행취소 (Ctrl+Z)">↩ 실행취소</button>
      <button type="button" onClick={redo} disabled={!canRedo} style={{ ...btn, opacity: canRedo ? 1 : 0.4 }} title="다시실행 (Ctrl+Y)">↪ 다시실행</button>

      <div style={divider} />

      {selectedId && (
        <>
          <button type="button" onClick={() => duplicateWidget(selectedId)} style={btn}>복제</button>
          <button type="button" onClick={() => removeWidget(selectedId)} style={{ ...btn, color: '#f88' }}>삭제</button>
          <div style={divider} />
        </>
      )}

      <div style={{ marginLeft: 'auto' }}>
        <button type="button" onClick={handleOpenViewer} style={{ ...btn, background: '#1a3a5a', color: '#88ddff', borderColor: '#336' }}>
          뷰어에서 열기 →
        </button>
      </div>
    </div>
  );
};

const btn: React.CSSProperties = {
  background: '#2a2a3a', color: '#ccc', border: '1px solid #444',
  borderRadius: 3, padding: '3px 10px', cursor: 'pointer', fontSize: 12,
  whiteSpace: 'nowrap',
};

const divider: React.CSSProperties = {
  width: 1, height: 20, background: '#444', margin: '0 2px',
};
