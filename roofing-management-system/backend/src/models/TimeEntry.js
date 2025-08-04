const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TimeEntry = sequelize.define('TimeEntry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  clockIn: {
    type: DataTypes.DATE,
    allowNull: false
  },
  clockOut: {
    type: DataTypes.DATE
  },
  totalHours: {
    type: DataTypes.FLOAT
  },
  breakMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'approved', 'rejected'),
    defaultValue: 'active'
  },
  approvedBy: {
    type: DataTypes.UUID
  },
  approvedAt: {
    type: DataTypes.DATE
  }
});

module.exports = TimeEntry;