import { jsx as _jsx } from "react/jsx-runtime";
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
