// const express = require('express');
// const path = require('path');
// const app = express();

// // Serve static files from the 'public' directory
// app.use(express.static('public'));

// // Route to serve the QR code image
// app.get('/qr-code', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'QrCode.png')); // Update with your actual file name
// });

// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const Razorpay = require('razorpay');
const path = require('path');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Razorpay instance setup
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // replace with your Razorpay key id
  key_secret:process.env.RAZORPAY_KEY_SECRET // replace with your Razorpay key secret
});

// Route to display the QR code and payment form
app.get('/', (req, res) => {
  res.render('index');
});

// Webhook endpoint to handle Razorpay notifications
app.post('/razorpay/webhook', (req, res) => {
  // Handle webhook here
  console.log("inside webhook--",req.body);
  res.status(200).json({ status: 'ok' });
});

// Route to handle payment requests
app.post('/pay', async (req, res) => {
    const { amount } = req.body;
  
    const payment_capture = 1;
    const currency = 'INR';
    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency,
      payment_capture
    };
  
    try {
      const response = await razorpay.orders.create(options);
      res.json({
        id: response.id,
        currency: response.currency,
        amount: response.amount
      });
    } catch (error) {
      console.log(error);
      res.status(500).send('Error creating order');
    }
  });
  

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
