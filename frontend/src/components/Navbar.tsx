import { Link, useLocation } from 'react-router-dom';
import { Activity, History as HistoryIcon, Home } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  return (
    <div className="container">
      <nav className="navbar" style={{ padding: '1rem 0', margin: '0', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '6px', background: 'var(--accent-gradient)', borderRadius: '10px' }}>
            <Activity color="white" size={20} />
          </div>
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Neuro<span className="gradient-text">Detect</span></h2>
        </div>
        
        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Home size={18} /> <span className="hide-mobile">New Scan</span>
          </Link>
          <Link to="/history" className={`nav-link ${location.pathname === '/history' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HistoryIcon size={18} /> <span className="hide-mobile">History</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
