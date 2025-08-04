const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Photo = sequelize.define('Photo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mimetype: {
    type: DataTypes.STRING
  },
  size: {
    type: DataTypes.INTEGER
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  caption: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.ENUM('before', 'during', 'after', 'issue', 'other'),
    defaultValue: 'other'
  }
});

module.exports = Photo;