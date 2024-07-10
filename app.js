require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const Razorpay = require('razorpay');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const qr = require('qrcode');


const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static('public')); // Serve static files from 'public' directory

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Route to render index page
app.get('/', (req, res) => {
  res.render('index', { order: null, qrCodeImage: null, error: null });
});

// Route to handle form submission and QR code generation
app.post('/create-order', async (req, res) => {
  const { amount, currency, receipt, customerName, customerEmail, customerContact } = req.body;

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

  // Create payment link in Razorpay
  const qrCodeResponse = await axios.post(
    'https://api.razorpay.com/v1/payment_links',
    {
      amount: amount * 100,
      currency: currency,
      accept_partial: false,
      description: `Payment for order ${order.id}`,
      customer: {
        name: customerName,
        email: customerEmail,
        contact: customerContact
      },
      notify: {
        sms: true,
        email: true
      },
      reminder_enable: true,
      callback_url: 'https://your-callback-url.com/',
      callback_method: 'get'
    },
    {
      auth: {
        username: process.env.RAZORPAY_KEY_ID,
        password: process.env.RAZORPAY_KEY_SECRET
      }
    }
  );

   // Generate QR code from the URL
   const qrCodeImageUrl = qrCodeResponse.data.short_url;
   const qrCodeFilePath = path.join(__dirname, 'public', 'qr_codes', `qrcode_${order.id}.png`);

   qr.toFile(qrCodeFilePath, qrCodeImageUrl, (err) => {
     if (err) {
       console.error('Error generating QR code:', err);
       res.render('index', { order: null, qrCodeImage: null, error: 'Error creating QR code' });
     } else {
       console.log(`QR code saved successfully: ${qrCodeFilePath}`);
       res.render('index', { order, qrCodeImage: `/qr_codes/qrcode_${order.id}.png`, error: null });
     }
   });

} catch (error) {
  console.error('Error generating QR code:', error);
  res.render('index', { order: null, qrCodeImage: null, error: 'Error creating order or QR code' });
}
});

// Razorpay webhook endpoint
app.post('/razorpay/webhook', (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest === req.headers['x-razorpay-signature']) {
    console.log('Webhook verified successfully');

    // Handle the event
    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured') {
      const orderId = payload.payment.entity.order_id;
      console.log(`Payment captured for order ID: ${orderId}`);
      // Update the order status in your database
    }

    res.status(200).send('Webhook received');
  } else {
    console.log('Webhook verification failed');
    res.status(400).send('Invalid signature');
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
