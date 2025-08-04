// Load environment variables FIRST
require('dotenv').config({ path: '../.env' });

const sequelize = require('./config/database');
const User = require('./models/User');

async function initializeDatabase() {
  try {
    console.log('Connecting to database...');
    
    // Test the connection first
    await sequelize.authenticate();
    console.log('Database connection successful!');
    
    // This will create the tables
    await sequelize.sync({ force: true });
    console.log('Database tables created!');
    
    // Create a test admin user
    await User.create({
      username: 'admin',
      email: 'admin@roofing.com',
      password: 'admin123',
      name: 'Administrator',
      role: 'owner'
    });
    
    console.log('Admin user created!');
    console.log('Username: admin');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    console.error('Make sure PostgreSQL is running and your .env file is correct');
    process.exit(1);
  }
}

initializeDatabase();