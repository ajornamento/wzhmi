import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import '@wzhmi/widgets';
import { useViewerStore } from './store/viewerStore';
import type { HmiSchema } from '@wzhmi/core';

const previewJson = localStorage.getItem('hmi_preview');
if (previewJson) {
  try {
    const schema: HmiSchema = JSON.parse(previewJson);
    useViewerStore.getState().setSchema(schema);
    localStorage.removeItem('hmi_preview');
  } catch {}
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
