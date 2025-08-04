import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Jobs.css';

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    customerId: '',
    estimatedHours: '',
    estimatedCost: '',
    priority: 'medium'
  });
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs();
    fetchCustomers();
  }, []);

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
        setJobs(data.jobs || []);
      } else if (response.status === 401) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    // For now, we'll use dummy data
    setCustomers([
      { id: '1', name: 'John Smith' },
      { id: '2', name: 'Jane Doe' },
      { id: '3', name: 'Bob Johnson' }
    ]);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const token = localStorage.getItem('token');
    
    // Clean the data before sending
    const jobData = {
      title: formData.title,
      description: formData.description,
      address: formData.address,
      estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
      estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null,
      priority: formData.priority,
      customerId: formData.customerId === '' ? null : formData.customerId  // This is the key fix
    };
    
    const response = await fetch('http://localhost:5000/api/jobs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jobData)
    });

    if (response.ok) {
      const data = await response.json();
      setJobs([data.job, ...jobs]);
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        address: '',
        customerId: '',
        estimatedHours: '',
        estimatedCost: '',
        priority: 'medium'
      });
      alert('Job created successfully!');
    } else {
      const error = await response.json();
      console.log('Error details:', error);
      alert(error.message || 'Failed to create job');
    }
  } catch (error) {
    console.error('Error creating job:', error);
    alert('Error creating job');
  }
};

  const getStatusColor = (status) => {
    const colors = {
      pending: '#F59E0B',
      active: '#3B82F6',
      completed: '#10B981',
      cancelled: '#EF4444'
    };
    return colors[status] || '#6B7280';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      urgent: '#DC2626'
    };
    return colors[priority] || '#6B7280';
  };

 const handleViewJob = (job) => {
  setSelectedJob(job);
  setShowJobModal(true);
};

const closeJobModal = () => {
  setSelectedJob(null);
  setShowJobModal(false);
};

  if (loading) {
    return <div className="loading">Loading jobs...</div>;
  }

return (
    <div className="jobs-container">
      <button 
        className="btn btn-secondary"
        onClick={() => navigate('/dashboard')}
        style={{ marginBottom: '20px' }}
      >
        ← Back to Dashboard
      </button>
      <div className="jobs-header">
        <h1>Jobs Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ New Job'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-job-form">
          <h2>Create New Job</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Job Title*</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Roof Replacement - Smith Residence"
                />
              </div>
              <div className="form-group">
                <label>Customer</label>
                <select
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleInputChange}
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Job details and requirements..."
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main St, City, State ZIP"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Estimated Hours</label>
                <input
                  type="number"
                  name="estimatedHours"
                  value={formData.estimatedHours}
                  onChange={handleInputChange}
                  placeholder="40"
                />
              </div>
              <div className="form-group">
                <label>Estimated Cost ($)</label>
                <input
                  type="number"
                  name="estimatedCost"
                  value={formData.estimatedCost}
                  onChange={handleInputChange}
                  placeholder="5000"
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Create Job
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="jobs-stats">
        <div className="stat-card">
          <div className="stat-value">{jobs.filter(j => j.status === 'active').length}</div>
          <div className="stat-label">Active Jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{jobs.filter(j => j.status === 'pending').length}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{jobs.filter(j => j.status === 'completed').length}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{jobs.length}</div>
          <div className="stat-label">Total Jobs</div>
        </div>
      </div>

      <div className="jobs-table-container">
        <table className="jobs-table">
          <thead>
            <tr>
              <th>Job Number</th>
              <th>Title</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  No jobs found. Create your first job!
                </td>
              </tr>
            ) : (
              jobs.map(job => (
                <tr key={job.id}>
                  <td className="job-number">{job.jobNumber}</td>
                  <td className="job-title">{job.title}</td>
                  <td>{job.customer?.name || 'N/A'}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(job.status) }}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(job.priority) }}
                    >
                      {job.priority}
                    </span>
                  </td>
                  <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn-action"
                      onClick={() => handleViewJob(job)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Job Details Modal - ADD THIS ENTIRE SECTION */}
      {showJobModal && selectedJob && (
        <div className="modal-backdrop" onClick={closeJobModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Job Details - {selectedJob.jobNumber}</h2>
              <button className="btn-close" onClick={closeJobModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="job-details">
                <div className="detail-row">
                  <strong>Title:</strong> {selectedJob.title}
                </div>
                <div className="detail-row">
                  <strong>Customer:</strong> {selectedJob.customer?.name || 'No customer assigned'}
                </div>
                <div className="detail-row">
                  <strong>Status:</strong> 
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(selectedJob.status), marginLeft: '10px' }}
                  >
                    {selectedJob.status}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Priority:</strong>
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(selectedJob.priority), marginLeft: '10px' }}
                  >
                    {selectedJob.priority}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Address:</strong> {selectedJob.address || 'No address provided'}
                </div>
                <div className="detail-row">
                  <strong>Description:</strong> {selectedJob.description || 'No description provided'}
                </div>
                <div className="detail-row">
                  <strong>Estimated Hours:</strong> {selectedJob.estimatedHours || 'Not specified'}
                </div>
                <div className="detail-row">
                  <strong>Estimated Cost:</strong> ${selectedJob.estimatedCost || '0'}
                </div>
                <div className="detail-row">
                  <strong>Created:</strong> {new Date(selectedJob.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeJobModal}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => alert('Edit feature coming soon!')}>
                Edit Job
              </button>
           </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Jobs;