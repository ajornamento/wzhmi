import { jsx as _jsx } from "react/jsx-runtime";
// 뷰어 앱을 브라우저 root에 마운트하는 진입점
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import '@wzhmi/widgets';
import { useViewerStore } from './store/viewerStore';
const previewJson = localStorage.getItem('hmi_preview');
if (previewJson) {
    try {
        const schema = JSON.parse(previewJson);
        useViewerStore.getState().setSchema(schema);
        localStorage.removeItem('hmi_preview');
    }
    catch { }
}
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(App, {}) }));
