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

require("dotenv").config();

const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/generate-qr', async (req, res) => {
  try {
    const response = await axios.post('https://api.razorpay.com/v1/payments/qr', {
      type: 'upi_qr',
      name: 'Test QR',
      usage: 'single_use',
      fixed_amount: false,
      payment_amount: 1000,
      currency: 'INR'
    }, {
      auth: {
        username:process.env.RAZORPAY_KEY_ID, // Replace with your Razorpay Key ID
        password: process.env.RAZORPAY_KEY_SECRET  // Replace with your Razorpay Key Secret
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const qrCodeUrl = response.data.image_url;
    res.json({ qrCodeUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
