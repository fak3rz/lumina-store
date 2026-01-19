import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Forgot from './pages/Forgot.jsx';

function Layout({ children }) {
  return (
    <div className="app-container">
      <nav className="app-nav">
        <div className="brand">Lumina Store</div>
        <div className="spacer" />
        <Link className="back-btn" to="/">Home</Link>
      </nav>
      <div className="content">{children}</div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
        <Route path="/forgot" element={<Layout><Forgot /></Layout>} />
        <Route path="*" element={<Layout><div className="panel"><h2>Halaman tidak ditemukan</h2></div></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}
