import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './config/router.tsx';
import Monitor from '@rr-utils/monitor';

window.monitor_debug = true;

const monitor = Monitor.init({
  internal: 5000,
  consumer: () => {},
  shouldMonitorElem: true,
});

window.monitor = monitor;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
