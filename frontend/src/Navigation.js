import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we should hide navigation (e.g., on login/register pages)
  const hideNav = ['/login', '/register'].includes(location.pathname);

  const handleLogout = () => {
    // In a real app, you'd call the backend to invalidate the session
    // For now, just redirect to login
    // document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; // Naive cookie clear
    window.location.href = '/login'; 
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
