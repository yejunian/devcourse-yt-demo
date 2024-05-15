const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  express: {
    port: parseInt(process.env.EXPRESS_PORT) || 3000,
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
  },
};
