import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Updated navigation function to handle all routes properly
  const handleCardClick = (path) => {
    // Routes that are already implemented
    if (path === 'jobs') {
      navigate('/jobs');
    } else if (path === 'time-clock') {
      navigate('/timeclock'); // Note: your route is /timeclock not /time-clock
    } else if (path === 'customers') {
      navigate('/customers'); // This was missing - now it will navigate properly
    } 
    // Routes that need to be built still
    else if (path === 'employees') {
      alert('Employee management coming soon!');
    } else if (path === 'reports') {
      alert('Reports feature coming soon!');
    } else if (path === 'my-jobs') {
      alert('My Jobs feature coming soon!');
    } else if (path === 'timesheet') {
      alert('Timesheet feature coming soon!');
    } else if (path === 'my-projects') {
      alert('My Projects feature coming soon!');
    } else if (path === 'invoices') {
      alert('Invoices feature coming soon!');
    } else if (path === 'messages') {
      alert('Messages feature coming soon!');
    } else {
      alert(`Navigating to ${path} (Feature coming soon!)`);
    }
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-content">
          <h2>Roofing Management</h2>
          <div className="navbar-right">
            <span className="user-name">Welcome, {user.name}</span>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <h1>Dashboard</h1>
        <p>Role: {user.role}</p>

        {/* Stats Section for Owner */}
        {user.role === 'owner' && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">12</div>
              <div className="stat-label">Active Jobs</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">8</div>
              <div className="stat-label">Employees</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">45</div>
              <div className="stat-label">Total Customers</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">$124.5K</div>
              <div className="stat-label">Revenue This Month</div>
            </div>
          </div>
        )}
        
        <div className="dashboard-grid">
          {user.role === 'owner' && (
            <>
              <div className="dashboard-card" onClick={() => handleCardClick('jobs')}>
                <h3>Jobs</h3>
                <p>Manage roofing projects</p>
              </div>
              <div className="dashboard-card" onClick={() => handleCardClick('employees')}>
                <h3>Employees</h3>
                <p>Manage your team</p>
              </div>
              <div className="dashboard-card" onClick={() => handleCardClick('customers')}>
                <h3>Customers</h3>
                <p>View customer information</p>
              </div>
              <div className="dashboard-card" onClick={() => handleCardClick('reports')}>
                <h3>Reports</h3>
                <p>View business analytics</p>
              </div>
            </>
          )}
          
          {user.role === 'employee' && (
            <>
              <div className="dashboard-card" onClick={() => handleCardClick('time-clock')}>
                <h3>Time Clock</h3>
                <p>Clock in/out of jobs</p>
              </div>
              <div className="dashboard-card" onClick={() => handleCardClick('my-jobs')}>
                <h3>My Jobs</h3>
                <p>View assigned jobs</p>
              </div>
              <div className="dashboard-card" onClick={() => handleCardClick('timesheet')}>
                <h3>My Timesheet</h3>
                <p>View your hours</p>
              </div>
            </>
          )}

          {user.role === 'customer' && (
            <>
              <div className="dashboard-card" onClick={() => handleCardClick('my-projects')}>
                <h3>My Projects</h3>
                <p>View your roofing projects</p>
              </div>
              <div className="dashboard-card" onClick={() => handleCardClick('invoices')}>
                <h3>Invoices</h3>
                <p>View and pay invoices</p>
              </div>
              <div className="dashboard-card" onClick={() => handleCardClick('messages')}>
                <h3>Messages</h3>
                <p>Communicate with us</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;