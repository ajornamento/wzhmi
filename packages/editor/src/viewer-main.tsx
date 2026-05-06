import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '../../viewer/src/App';
import '@wzhmi/widgets';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
