// config/config.js
require('dotenv').config();

module.exports = {
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
};
