const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('contract', 'quote', 'permit', 'warranty', 'other'),
    defaultValue: 'other'
  },
  size: {
    type: DataTypes.INTEGER
  },
  mimetype: {
    type: DataTypes.STRING
  }
});

module.exports = Document;