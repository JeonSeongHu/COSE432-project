// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // CSS 변수를 포함한 전역 스타일 파일
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
