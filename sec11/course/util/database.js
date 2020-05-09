const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(
  'node_complete',
  'node_complete',
  'node_complete',
  { 
    host: 'localhost', 
    dialect: 'mysql' 
  }
)

module.exports = sequelize