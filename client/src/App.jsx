import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import NewReceipt from './pages/NewReceipt';
import Receipts from './pages/Receipts';
import Donors from './pages/Donors';
import './index.css';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🙏</div>
        <div className="sidebar-logo-text">
          <div className="org-name">समर्थ मित्र मंडळ</div>
          <div className="org-sub">वर्गणी व्यवस्थापन</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span className="nav-active-bar"></span>
          <span className="nav-icon">📊</span>
          <span className="nav-label">डॅशबोर्ड</span>
        </NavLink>
        <NavLink to="/new-receipt" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span className="nav-active-bar"></span>
          <span className="nav-icon">📝</span>
          <span className="nav-label">नवीन पावती</span>
        </NavLink>
        <NavLink to="/receipts" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span className="nav-active-bar"></span>
          <span className="nav-icon">📄</span>
          <span className="nav-label">सर्व पावत्या</span>
        </NavLink>
        <NavLink to="/donors" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span className="nav-active-bar"></span>
          <span className="nav-icon">👥</span>
          <span className="nav-label">वर्गणीदार</span>
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-footer-text">🕉️ नवरात्री उत्सव २०२५</div>
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#2a1200',
            color: '#FFD700',
            border: '1px solid rgba(200,134,10,0.4)',
            fontFamily: 'Noto Sans Devanagari, sans-serif'
          },
          success: { iconTheme: { primary: '#FFD700', secondary: '#2a1200' } },
          error: { iconTheme: { primary: '#E74C3C', secondary: '#2a1200' } }
        }}
      />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new-receipt" element={<NewReceipt />} />
            <Route path="/receipts" element={<Receipts />} />
            <Route path="/donors" element={<Donors />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
