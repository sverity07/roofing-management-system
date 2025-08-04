// This is a temporary file to create a test customer
async function createTestCustomer() {
  const token = localStorage.getItem('token');
  
  const customerData = {
    name: 'Bob Johnson',
    email: 'bob@example.com',
    phone: '555-0123',
    address: '789 Oak St, Anytown, ST 12345'
  };
  
  try {
    const response = await fetch('http://localhost:5000/api/customers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customerData)
    });
    
    const data = await response.json();
    console.log('Customer created:', data);
  } catch (error) {
    console.error('Error creating customer:', error);
  }
}

// Run it
createTestCustomer();