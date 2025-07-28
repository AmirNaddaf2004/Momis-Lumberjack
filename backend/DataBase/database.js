// Import Sequelize library
const { Sequelize } = require('sequelize');

// Database connection configuration
const sequelize = new Sequelize(
    'lumberjack_db',
    'lumberjack_user', // نام کاربری اپلیکیشن
    '13831383', // رمز عبور اپلیکیشن
    {
        host: 'localhost',
        dialect: 'mysql',
        logging: false,
    }
);
// Test the database connection
sequelize.authenticate()
    .then(() => {
        console.log('Connection to the database has been established successfully.');
    })
    .catch((error) => {
        console.error('Unable to connect to the database:', error);
    });

// Export the sequelize instance for use in other parts of the application
module.exports = sequelize;