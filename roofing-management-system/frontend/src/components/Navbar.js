import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Don't show navbar on login page
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <h2 
            className="navbar-brand"
            onClick={() => navigate('/dashboard')}
          >
            🏠 Roofing Management
          </h2>
          <div className="nav-links">
            <button 
              className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </button>
            
            {user.role === 'owner' && (
              <>
                <button 
                  className={`nav-link ${location.pathname === '/jobs' ? 'active' : ''}`}
                  onClick={() => navigate('/jobs')}
                >
                  Jobs
                </button>
                <button 
                  className={`nav-link ${location.pathname === '/customers' ? 'active' : ''}`}
                  onClick={() => navigate('/customers')}
                >
                  Customers
                </button>
                <button 
                  className={`nav-link ${location.pathname === '/employees' ? 'active' : ''}`}
                  onClick={() => navigate('/employees')}
                >
                  Employees
                </button>
                <button 
                  className={`nav-link ${location.pathname === '/reports' ? 'active' : ''}`}
                  onClick={() => navigate('/reports')}
                >
                  Reports
                </button>
              </>
            )}
            
            {user.role === 'employee' && (
              <>
                <button 
                  className={`nav-link ${location.pathname === '/time-clock' ? 'active' : ''}`}
                  onClick={() => navigate('/time-clock')}
                >
                  Time Clock
                </button>
                <button 
                  className={`nav-link ${location.pathname === '/my-jobs' ? 'active' : ''}`}
                  onClick={() => navigate('/my-jobs')}
                >
                  My Jobs
                </button>
                <button 
                  className={`nav-link ${location.pathname === '/timesheet' ? 'active' : ''}`}
                  onClick={() => navigate('/timesheet')}
                >
                  Timesheet
                </button>
              </>
            )}
            
            {user.role === 'customer' && (
              <>
                <button 
                  className={`nav-link ${location.pathname === '/my-projects' ? 'active' : ''}`}
                  onClick={() => navigate('/my-projects')}
                >
                  My Projects
                </button>
                <button 
                  className={`nav-link ${location.pathname === '/invoices' ? 'active' : ''}`}
                  onClick={() => navigate('/invoices')}
                >
                  Invoices
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="navbar-right">
          <span className="user-info">
            👤 {user.name} ({user.role})
          </span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;