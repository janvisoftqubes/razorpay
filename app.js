const express = require('express');
const bodyParser = require('body-parser');
const Razorpay = require('razorpay');
const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.get('/', (req, res) => {
  res.render('index', { order: null, qrCode: null, error: null });
});

app.post('/create-order', async (req, res) => {
  const { amount, currency, receipt, customerName } = req.body;

  const options = {
    amount: amount * 100, // Amount in paise
    currency,
    receipt,
    notes: {
      customerName
    }
  };

  try {
    const order = await razorpay.orders.create(options);
    const qrCodeResponse = await axios.post(
      'https://api.razorpay.com/v1/payments/qr_codes',
      {
        type: 'upi_qr',
        name: customerName,
        usage: 'single_use',
        fixed_amount: true,
        amount: amount * 100,
        description: `Payment for order ${order.id}`,
        currency,
      },
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_KEY_SECRET
        }
      }
    );

    res.render('index', { order, qrCode: qrCodeResponse.data, error: null });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.render('index', { order: null, qrCode: null, error: 'Error creating order or QR code' });
  }
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
