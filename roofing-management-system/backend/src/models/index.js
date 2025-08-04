const sequelize = require('../config/database');
const User = require('./User');
const Job = require('./Job');
const Customer = require('./Customer');
const TimeEntry = require('./TimeEntry');
const Invoice = require('./Invoice');
const Message = require('./Message');
const Photo = require('./Photo');
const Document = require('./Document');

// Define relationships

// Customer relationships
Customer.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Customer.hasMany(Job, { foreignKey: 'customerId', as: 'jobs' });
Customer.hasMany(Invoice, { foreignKey: 'customerId', as: 'invoices' });

// Job relationships
Job.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Job.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Job.hasMany(TimeEntry, { foreignKey: 'jobId', as: 'timeEntries' });
Job.hasMany(Photo, { foreignKey: 'jobId', as: 'photos' });
Job.hasMany(Document, { foreignKey: 'jobId', as: 'documents' });
Job.hasMany(Invoice, { foreignKey: 'jobId', as: 'invoices' });

// Job-Employee many-to-many relationship
const JobAssignment = sequelize.define('JobAssignment', {
  id: {
    type: require('sequelize').DataTypes.UUID,
    defaultValue: require('sequelize').DataTypes.UUIDV4,
    primaryKey: true
  }
});

Job.belongsToMany(User, { 
  through: JobAssignment, 
  as: 'assignedEmployees',
  foreignKey: 'jobId'
});
User.belongsToMany(Job, { 
  through: JobAssignment, 
  as: 'assignedJobs',
  foreignKey: 'userId'
});

// TimeEntry relationships
TimeEntry.belongsTo(User, { foreignKey: 'userId', as: 'employee' });
TimeEntry.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

// Message relationships
Message.belongsTo(User, { foreignKey: 'fromUserId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'toUserId', as: 'receiver' });
Message.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

// Photo relationships
Photo.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });
Photo.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

// Document relationships
Document.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });
Document.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

// Invoice relationships
Invoice.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Invoice.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Invoice.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// User relationships (additional)
User.hasMany(TimeEntry, { foreignKey: 'userId', as: 'timeEntries' });
User.hasMany(Message, { foreignKey: 'fromUserId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'toUserId', as: 'receivedMessages' });
User.hasMany(Photo, { foreignKey: 'uploadedBy', as: 'uploadedPhotos' });
User.hasMany(Document, { foreignKey: 'uploadedBy', as: 'uploadedDocuments' });

module.exports = {
  sequelize,
  User,
  Job,
  Customer,
  TimeEntry,
  Invoice,
  Message,
  Photo,
  Document,
  JobAssignment
};