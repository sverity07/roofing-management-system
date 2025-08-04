import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Customers.css';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/customers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      } else if (response.status === 401) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Use dummy data for now if API fails
      setCustomers([
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '(555) 123-4567',
          address: '123 Main St, Anytown, ST 12345',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
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
      const response = await fetch('http://localhost:5000/api/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers([data.customer, ...customers]);
        setShowCreateForm(false);
        resetForm();
        alert('Customer created successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create customer');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      // For now, add to local state
      const newCustomer = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      setCustomers([newCustomer, ...customers]);
      setShowCreateForm(false);
      resetForm();
      alert('Customer added locally!');
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || '',
      notes: customer.notes || ''
    });
    setShowEditForm(true);
    setShowCreateForm(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/customers/${selectedCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(customers.map(c => 
          c.id === selectedCustomer.id ? data.customer : c
        ));
        setShowEditForm(false);
        setSelectedCustomer(null);
        resetForm();
        alert('Customer updated successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update customer');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      // For now, update in local state
      setCustomers(customers.map(c => 
        c.id === selectedCustomer.id ? { ...c, ...formData } : c
      ));
      setShowEditForm(false);
      setSelectedCustomer(null);
      resetForm();
      alert('Customer updated locally!');
    }
  };

  const handleDelete = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setCustomers(customers.filter(c => c.id !== customerId));
        alert('Customer deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      // For now, delete from local state
      setCustomers(customers.filter(c => c.id !== customerId));
      alert('Customer removed locally!');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: ''
    });
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  if (loading) {
    return <div className="loading">Loading customers...</div>;
  }

  if (user.role !== 'owner') {
    return (
      <div className="customers-container">
        <h1>Access Denied</h1>
        <p>Customer management is only available for owners.</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="customers-container">
      <div className="customers-header">
        <h1>Customer Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setShowEditForm(false);
            resetForm();
          }}
        >
          {showCreateForm ? 'Cancel' : '+ New Customer'}
        </button>
      </div>

      {(showCreateForm || showEditForm) && (
        <div className="customer-form">
          <h2>{showEditForm ? 'Edit Customer' : 'Add New Customer'}</h2>
          <form onSubmit={showEditForm ? handleUpdate : handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Customer full name"
                />
              </div>
              <div className="form-group">
                <label>Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="customer@email.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone*</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="(555) 123-4567"
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
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Additional notes about the customer..."
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {showEditForm ? 'Update Customer' : 'Create Customer'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setShowCreateForm(false);
                  setShowEditForm(false);
                  setSelectedCustomer(null);
                  resetForm();
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="customers-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="customer-stats">
          Total Customers: {filteredCustomers.length}
        </div>
      </div>

      <div className="customers-grid">
        {filteredCustomers.length === 0 ? (
          <div className="no-data">
            {searchTerm ? 'No customers found matching your search.' : 'No customers yet. Add your first customer!'}
          </div>
        ) : (
          filteredCustomers.map(customer => (
            <div key={customer.id} className="customer-card">
              <div className="customer-header">
                <h3>{customer.name}</h3>
                <div className="customer-actions">
                  <button 
                    className="btn-icon"
                    onClick={() => handleEdit(customer)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-icon delete"
                    onClick={() => handleDelete(customer.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="customer-details">
                <div className="detail-item">
                  <span className="detail-label">📧 Email:</span>
                  <span className="detail-value">{customer.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">📱 Phone:</span>
                  <span className="detail-value">{customer.phone}</span>
                </div>
                {customer.address && (
                  <div className="detail-item">
                    <span className="detail-label">📍 Address:</span>
                    <span className="detail-value">{customer.address}</span>
                  </div>
                )}
                {customer.notes && (
                  <div className="detail-item">
                    <span className="detail-label">📝 Notes:</span>
                    <span className="detail-value">{customer.notes}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-label">📅 Added:</span>
                  <span className="detail-value">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="customer-footer">
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => navigate(`/jobs?customerId=${customer.id}`)}
                >
                  View Jobs
                </button>
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => navigate(`/jobs/new?customerId=${customer.id}`)}
                >
                  Create Job
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Customers;