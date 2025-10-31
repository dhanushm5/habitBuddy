const fs = require('fs');
const path = require('path');

const repoRootEnv = path.resolve(__dirname, '..', '..', '.env');
if (fs.existsSync(repoRootEnv)) {
  require('dotenv').config({ path: repoRootEnv });
} else {
  require('dotenv').config();
}

module.exports = {
  development: {
    username: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || null,
    database: process.env.MYSQL_DB || 'habitbuddy_development',
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql'
  },
  test: {
    username: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || null,
    database: process.env.MYSQL_DB_TEST || 'habitbuddy_test',
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql'
  },
  production: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql'
  }
};
