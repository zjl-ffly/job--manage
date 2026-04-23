// src/main.tsx
import 'antd/dist/reset.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
// 不再需要导入 installApiMocks，或者导入后不调用
// import { installApiMocks } from './api' 

// if (import.meta.env.DEV) {
//   installApiMocks()
// }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)