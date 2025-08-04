require('dotenv').config();

const {
  sequelize,
  User,
  Job,
  Customer,
  TimeEntry,
  Invoice,
  Message,
  Photo,
  Document
} = require('./src/models');

async function setupDatabase() {
  try {
    console.log('Setting up complete database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Create all tables
    await sequelize.sync({ force: true });
    console.log('✅ All tables created');
    
    // Create test data
    console.log('Creating test data...');
    
    // Admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@roofing.com',
      password: 'admin123',
      name: 'Administrator',
      role: 'owner',
      phone: '555-0100'
    });
    
    // Test employee
    const employee = await User.create({
      username: 'john.doe',
      email: 'john@roofing.com',
      password: 'employee123',
      name: 'John Doe',
      role: 'employee',
      phone: '555-0101'
    });
    
    // Test customer
    const customerUser = await User.create({
      username: 'customer1',
      email: 'customer@example.com',
      password: 'customer123',
      name: 'Jane Smith',
      role: 'customer',
      phone: '555-0200'
    });
    
    const customer = await Customer.create({
      userId: customerUser.id,
      name: 'Jane Smith',
      email: 'customer@example.com',
      phone: '555-0200',
      address: '123 Main St, Anytown, ST 12345'
    });
    
    // Test job
    const job = await Job.create({
      jobNumber: 'JOB-001',
      title: 'Roof Replacement - Smith Residence',
      description: 'Complete roof replacement with architectural shingles',
      customerId: customer.id,
      createdBy: admin.id,
      status: 'active',
      priority: 'high',
      address: '123 Main St, Anytown, ST 12345',
      estimatedHours: 40,
      estimatedCost: 8500.00
    });
    
    // Assign employee to job
    await job.addAssignedEmployee(employee);
    
    console.log('\n========================================');
    console.log('✅ DATABASE SETUP COMPLETE!');
    console.log('========================================');
    console.log('\nTest accounts created:');
    console.log('\n1. Admin Account:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('\n2. Employee Account:');
    console.log('   Username: john.doe');
    console.log('   Password: employee123');
    console.log('\n3. Customer Account:');
    console.log('   Username: customer1');
    console.log('   Password: customer123');
    console.log('\nTest job created: JOB-001');
    console.log('========================================\n');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error(error);
  }
  
  process.exit();
}

setupDatabase();