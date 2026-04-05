import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navigation.css';
import API_URL from './config';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const hideNav = ['/login', '/register'].includes(location.pathname);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.error('Logout error:', e);
    }
    navigate('/login');
  };

  if (hideNav) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">SAS App</div>
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Create Post</Link>
        </li>
        <li className="nav-item">
          <Link to="/analytics" className={location.pathname === '/analytics' ? 'active' : ''}>Analytics</Link>
        </li>
        <li className="nav-item">
          <Link to="/analytics-dashboard" className={location.pathname === '/analytics-dashboard' ? 'active' : ''}>Dashboard</Link>
        </li>
        <li className="nav-item">
            <Link to="/post-monitoring" className={location.pathname === '/post-monitoring' ? 'active' : ''}>Monitoring</Link>
        </li>
        <li className="nav-item">
          <Link to="/connect-social" className={location.pathname === '/connect-social' ? 'active' : ''}>Connect Accounts</Link>
        </li>
        <li className="nav-item">
            <button onClick={handleLogout} className="logout-btn">Logout</button>
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;
