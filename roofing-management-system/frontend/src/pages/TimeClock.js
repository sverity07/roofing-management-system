import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TimeClock.css';

function TimeClock() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [notes, setNotes] = useState('');
  const [todayHours, setTodayHours] = useState(0);
  const [weekHours, setWeekHours] = useState(0);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

 useEffect(() => {
  fetchStatus();
  fetchJobs();
  fetchTimeEntries();
}, []);

// ADD THIS NEW useEffect RIGHT HERE
useEffect(() => {
  let interval;
  
  if (status?.isClockedIn) {
    // Update elapsed time every second
    interval = setInterval(() => {
      // Force re-render to update elapsed time
      setStatus(prevStatus => ({ ...prevStatus }));
    }, 1000);
  }
  
  return () => {
    if (interval) {
      clearInterval(interval);
    }
  };
}, [status?.isClockedIn]);
  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/time-tracking/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        if (data.activeEntry) {
          setSelectedJobId(data.activeEntry.jobId);
        }
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/jobs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter to only show active jobs
        const activeJobs = data.jobs.filter(job => job.status === 'active' || job.status === 'pending');
        setJobs(activeJobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchTimeEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      const today = new Date().toISOString().split('T')[0];
      
      const response = await fetch(`http://localhost:5000/api/time-tracking/entries?startDate=${today}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTodayHours(data.totalHours || 0);
      }
    } catch (error) {
      console.error('Error fetching time entries:', error);
    }
  };

  const handleClockIn = async () => {
    if (!selectedJobId) {
      alert('Please select a job before clocking in');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/time-tracking/clock-in', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jobId: selectedJobId,
          notes: notes
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert('Clocked in successfully!');
        fetchStatus();
        setNotes('');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to clock in');
      }
    } catch (error) {
      console.error('Error clocking in:', error);
      alert('Error clocking in');
    }
  };

  const handleClockOut = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/time-tracking/clock-out', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: notes,
          breakMinutes: 0
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Clocked out successfully! Worked ${data.timeEntry.totalHours} hours`);
        fetchStatus();
        fetchTimeEntries();
        setNotes('');
        //setSelectedJobId('');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to clock out');
      }
    } catch (error) {
      console.error('Error clocking out:', error);
      alert('Error clocking out');
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

 const calculateElapsedTime = () => {
  if (!status?.activeEntry?.clockIn) return '0:00:00';
  
  const start = new Date(status.activeEntry.clockIn);
  const now = new Date();
  const diff = now - start;
  
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  
  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (user.role !== 'employee') {
    return (
      <div className="time-clock-container">
        <h1>Access Denied</h1>
        <p>Time clock is only available for employees.</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="time-clock-container">
      <button 
        className="btn btn-secondary"
        onClick={() => navigate('/dashboard')}
        style={{ marginBottom: '20px' }}
      >
        ← Back to Dashboard
      </button>

      <h1>Time Clock</h1>

      <div className="clock-status-card">
        <div className="status-header">
          <h2>Current Status</h2>
          <div className={`status-indicator ${status?.isClockedIn ? 'active' : 'inactive'}`}>
            {status?.isClockedIn ? '● Clocked In' : '○ Clocked Out'}
          </div>
        </div>

        {status?.isClockedIn && status.activeEntry && (
          <div className="active-session">
            <div className="session-info">
              <div className="info-row">
                <strong>Job:</strong>
                <span>{status.activeEntry.job?.title || 'Unknown Job'}</span>
              </div>
              <div className="info-row">
                <strong>Clock In Time:</strong>
                <span>{formatTime(status.activeEntry.clockIn)}</span>
              </div>
              <div className="info-row">
                <strong>Elapsed Time:</strong>
                <span className="elapsed-time">{calculateElapsedTime()}</span>
              </div>
            </div>
          </div>
        )}

        <div className="clock-form">
          {!status?.isClockedIn && (
            <div className="form-group">
              <label>Select Job</label>
              <select 
                value={selectedJobId} 
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="form-control"
              >
                <option value="">-- Select a Job --</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.jobNumber} - {job.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-control"
              rows="3"
              placeholder="Add any notes about your work..."
            />
          </div>

          <div className="clock-actions">
            {status?.isClockedIn ? (
              <button 
                className="btn btn-danger btn-large"
                onClick={handleClockOut}
              >
                <i className="clock-icon">⏹</i>
                Clock Out
              </button>
            ) : (
              <button 
                className="btn btn-success btn-large"
                onClick={handleClockIn}
                disabled={!selectedJobId}
              >
                <i className="clock-icon">▶</i>
                Clock In
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="time-summary">
        <div className="summary-card">
          <h3>Today's Hours</h3>
          <div className="hours-display">{todayHours.toFixed(2)}</div>
        </div>
        <div className="summary-card">
          <h3>This Week</h3>
          <div className="hours-display">{weekHours.toFixed(2)}</div>
        </div>
      </div>

      <div className="recent-entries">
        <h3>Today's Time Entries</h3>
        <p className="coming-soon">Time entry history coming soon...</p>
      </div>
    </div>
  );
}

export default TimeClock;