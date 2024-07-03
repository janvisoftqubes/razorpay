const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Razorpay = require('razorpay');
const QRCode = require('qrcode');
const { key_id, key_secret } = require('../config/config');
const ejs = require('ejs');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

const instance = new Razorpay({
  key_id: key_id,
  key_secret: key_secret
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'index.html'));
});

app.post('/generate-qr', async (req, res) => {
  const { name, email, contact } = req.body;

  try {
    const customer = await instance.customers.create({
      name: name,
      email: email,
      contact: contact
    });

    const order = await instance.orders.create({
      amount: 50000, // amount in paise
      currency: 'INR',
      receipt: 'receipt#1',
      payment_capture: 1 // auto capture
    });

    const paymentLink = await instance.paymentLink.create({
      amount: order.amount,
      currency: 'INR',
      accept_partial: false,
      customer: {
        name: customer.name,
        email: customer.email,
        contact: customer.contact
      },
      notify: {
        sms: true,
        email: true
      },
      reminder_enable: true,
      notes: {
        order_id: order.id
      },
      callback_url: 'https://your-callback-url.com',
      callback_method: 'get'
    });

    // Generate QR code URL for the payment link
    const qrCodeUrl = await QRCode.toDataURL(paymentLink.short_url);

    // Render the QR code page
    res.render('qr', { qrCodeUrl: qrCodeUrl });
  } catch (error) {
    console.error('Error generating payment link:', error);
    res.status(500).send('An error occurred');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
