import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import VerifyOtp from './pages/VerifyOtp.jsx';
import Forgot from './pages/Forgot.jsx';

function Layout({ children }) {
  return (
    <div className="app-container">
      <nav className="app-nav">
        <div className="brand">Lumina Store</div>
        <div className="spacer" />
        {/* Use standard anchor tag to force full page reload for Home */}
        <a className="back-btn" href="/">Home</a>
      </nav>
      <div className="content">{children}</div>
    </div>
  );
}

// Component to force reload if user lands on / inside React
function ForceHomeRedirect() {
  React.useEffect(() => {
    // Redirect to /home to bypass potential root shadowing by React build
    window.location.href = '/home';
  }, []);
  return <div style={{ padding: 20, textAlign: 'center' }}>Redirecting to Home...</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* If React handles /, force reload to get static site */}
        <Route path="/" element={<ForceHomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="*" element={<Layout><div className="panel"><h2>Halaman tidak ditemukan</h2></div></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}
