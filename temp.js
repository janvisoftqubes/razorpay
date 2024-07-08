const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

const RAZORPAY_KEY_ID = 'rzp_test_IH2CWaGPAr4psQ';
const RAZORPAY_KEY_SECRET = '9qpZc5C4EXEl2uMNQjjpwFZg';
const QR_CODE_ID = 'qr_OU2cfTAbaWzV02'; // The QR code ID you have

// Endpoint to create a payment
app.get('/create-payment', async (req, res) => {
  try {
    // Prepare the payment request data
    const paymentRequestData = {
      amount: 1000, // amount in paise (1000 paise = 10 INR)
      currency: 'INR',
      qr_id: QR_CODE_ID,
      receipt: 'receipt_id',
      notes: {
        note1: 'This is a note',
        note2: 'This is another note'
      }
    };

    // Make the payment request to Razorpay
    const response = await axios.post('https://api.razorpay.com/v1/payments', paymentRequestData, {
      auth: {
        username: RAZORPAY_KEY_ID,
        password: RAZORPAY_KEY_SECRET
      }
    });

    // Handle the response
    res.json({
      message: 'Payment created successfully',
      data: response.data
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      message: 'Failed to create payment',
      error: error.message
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
