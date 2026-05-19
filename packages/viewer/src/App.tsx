// HMI 뷰어 화면과 컨트롤을 렌더링하는 메인 컴포넌트
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { HmiCanvas } from './components/HmiCanvas';
import { useViewerStore } from './store/viewerStore';
import type { HmiSchema, Widget, UserRole } from '@wzhmi/core';
import type { DataSourceMode } from './store/viewerStore';

const ROLES: UserRole[] = ['VIEWER', 'OPERATOR', 'ADMIN'];

const ROLE_COLOR: Record<UserRole, string> = {
  VIEWER: '#888',
  OPERATOR: '#4a9eff',
  ADMIN: '#ff7b4a',
};

export const App: React.FC = () => {
  const {
    schema, scale, setSchema, setScale,
    serverUrl, setServerUrl,
    currentUser, setCurrentUser,
    dataSourceMode, setDataSourceMode,
    pollInterval, setPollInterval,
  } = useViewerStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [serverFiles, setServerFiles] = useState<string[]>([]);
  const apiBase = serverUrl.replace('ws://', 'http://').replace('wss://', 'https://');

  // 에디터 창으로부터 스키마를 postMessage로 수신
  useEffect(() => {
    // 에디터에 "뷰어 준비 완료" 알림
    if (window.opener) {
      window.opener.postMessage({ type: 'viewer-ready' }, '*');
    }
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'preview-schema') {
        try {
          const parsed: HmiSchema = JSON.parse(e.data.schema);
          setSchema(parsed);
          // 스케일은 HmiCanvas ResizeObserver가 캔버스 크기 기준으로 자동 재계산
        } catch {
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
      .catch(() => {});
  }, [apiBase]);

  useEffect(() => {
    (window as any).myCustomClickAction = (widget: Widget) => {
      alert(`위젯 클릭: ${widget.name} (${widget.id})`);
      console.log('myCustomClickAction 호출됨', widget);
    };

    return () => {
      delete (window as any).myCustomClickAction;
    };
  }, []);

  const handleServerLoad = useCallback((fileName: string) => {
    fetch(`${apiBase}/api/hmi/${fileName}`)
      .then((r) => r.json())
      .then((json: HmiSchema) => setSchema(json))
      .catch(() => alert('서버에서 파일을 불러오지 못했습니다.'));
  }, [apiBase, setSchema]);

  const handleFileLoad = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json: HmiSchema = JSON.parse(ev.target?.result as string);
        setSchema(json);
      } catch {
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

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#111', overflow: 'hidden' }}>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 12px', background: 'rgba(20,20,30,0.95)',
        borderBottom: '1px solid #333', backdropFilter: 'blur(4px)',
      }}>
        <span style={{ color: '#88aaff', fontWeight: 'bold', fontSize: 14, marginRight: 8 }}>
          HMI Viewer
        </span>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={btnStyle}
        >
          파일 열기
        </button>
        <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileLoad} />

        {serverFiles.length > 0 && (
          <select
            aria-label="서버 HMI 파일 선택"
            title="서버 HMI 파일 선택"
            style={{ background: '#2a2a3a', color: '#ccc', border: '1px solid #444', borderRadius: 3, padding: '2px 6px', fontSize: 12, cursor: 'pointer' }}
            defaultValue=""
            onChange={(e) => { if (e.target.value) handleServerLoad(e.target.value); }}
          >
            <option value="" disabled>서버 파일...</option>
            {serverFiles.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        )}

        <div style={{ width: 1, height: 20, background: '#444', margin: '0 4px' }} />

        <button onClick={handleFitScale} style={btnStyle}>화면 맞춤</button>
        <button onClick={() => setScale(1)} style={btnStyle}>100%</button>

        <input
          type="range" min="0.2" max="2" step="0.05"
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
          style={{ width: 80 }}
        />
        <span style={{ color: '#aaa', fontSize: 12, minWidth: 40 }}>
          {Math.round(scale * 100)}%
        </span>

        <div style={{ width: 1, height: 20, background: '#444', margin: '0 4px' }} />

        <span style={{ color: '#888', fontSize: 12 }}>서버:</span>
        <input
          type="text" value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value)}
          style={{
            background: '#1a1a2a', border: '1px solid #444', color: '#ccc',
            borderRadius: 3, padding: '2px 6px', fontSize: 12, width: 180,
          }}
        />

        <div style={{ width: 1, height: 20, background: '#444', margin: '0 4px' }} />
        <span style={{ color: '#888', fontSize: 12 }}>소스:</span>
        {(['websocket', 'polling'] as DataSourceMode[]).map((mode) => (
          <button type="button" key={mode} onClick={() => setDataSourceMode(mode)} style={{
            ...btnStyle,
            borderColor: dataSourceMode === mode ? '#4a9eff' : '#444',
            color: dataSourceMode === mode ? '#4a9eff' : '#888',
          }}>
            {mode === 'websocket' ? 'WS' : 'HTTP'}
          </button>
        ))}
        {dataSourceMode === 'polling' && (
          <>
            <span style={{ color: '#888', fontSize: 12 }}>주기:</span>
            <select
              aria-label="폴링 주기 선택"
              value={pollInterval}
              onChange={(e) => setPollInterval(Number(e.target.value))}
              style={{ background: '#2a2a3a', color: '#ccc', border: '1px solid #444', borderRadius: 3, padding: '2px 4px', fontSize: 12 }}
            >
              <option value={500}>0.5s</option>
              <option value={1000}>1s</option>
              <option value={2000}>2s</option>
              <option value={5000}>5s</option>
            </select>
          </>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#666', fontSize: 11 }}>
            {schema.canvas.width}×{schema.canvas.height} | {schema.widgets.length}개 위젯
          </span>
          <div style={{ width: 1, height: 20, background: '#444' }} />
          <span style={{ color: '#888', fontSize: 12 }}>역할:</span>
          {ROLES.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setCurrentUser({ id: currentUser.id, role })}
              style={{
                ...btnStyle,
                borderColor: currentUser.role === role ? ROLE_COLOR[role] : '#444',
                color: currentUser.role === role ? ROLE_COLOR[role] : '#888',
                fontWeight: currentUser.role === role ? 'bold' : 'normal',
              }}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div style={{ paddingTop: 40, width: '100%', height: '100%' }}>
        <HmiCanvas />
      </div>
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  background: '#2a2a3a', color: '#ccc', border: '1px solid #444',
  borderRadius: 3, padding: '3px 10px', cursor: 'pointer', fontSize: 12,
};
