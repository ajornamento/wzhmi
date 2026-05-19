import { jsx as _jsx } from "react/jsx-runtime";
// 에디터 앱을 브라우저에 마운트하는 진입점
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import '@wzhmi/widgets';
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(App, {}) }));
