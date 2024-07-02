// const express = require('express');
// const bodyParser = require('body-parser');
// const axios = require('axios');
// const path = require('path');
// const app = express();
// const port = 3000;

// // Set up EJS for templating
// app.set('view engine', 'ejs');

// // Middleware
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, 'public')));

// // Razorpay credentials
// const razorpay_key_id = 'rzp_test_cWUE45iCTiy1ya';
// const razorpay_key_secret = 'MEWk1W9ahVt9YQDWN3STIrit';
// const qr_code_id = 'qr_OTFyRzWDs12ejM';

// // Route to display QR code
// app.get('/', (req, res) => {
//     res.render('index');
// });

// // Route to handle payment amount input
// app.post('/pay', async (req, res) => {
//     const amount = req.body.amount;
//     try {
//         const response = await axios.post(
//             `https://api.razorpay.com/v1/payments/qr/${qr_code_id}/pay`,
//             { amount: amount * 100 }, // Amount in paise
//             {
//                 auth: {
//                     username: razorpay_key_id,
//                     password: razorpay_key_secret,
//                 },
//             }
//         );
//         res.send('Payment initiated successfully');
//     } catch (error) {
//         console.log(error)
//         res.send('Error initiating payment');
//     }
// });

// app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
// });

const Razorpay = require('razorpay');
const razorpay =  new Razorpay({
    key_id: "rzp_test_cWUE45iCTiy1ya",
    key_secret: "MEWk1W9ahVt9YQDWN3STIrit",
  });
  
  // Assuming qrCodeId is the ID of the QR code you have
  const qrCodeId = 'qr_OS93i44rc1mrcY';
  
  // Step 1: Fetch QR code details
  razorpay.qrcodes.fetch(qrCodeId, (err, qrCode) => {
    if (err) {
      console.error('Error fetching QR code:', err);
      return;
    }
  
    // Step 2: Create payment for the amount mentioned in the QR code
    const paymentData = {
      amount: qrCode.amount, // Amount from the QR code details
      currency: 'INR',
      receipt: `receipt_${Date.now()}`, // You can generate a receipt ID dynamically
      payment_capture: 1, // Auto-capture payment
      notes: {
        qrCodeId: qrCodeId,
        description: 'Payment for XYZ', // Optional description
      },
    };
  
    razorpay.payments.create(paymentData, (err, payment) => {
      if (err) {
        console.error('Error creating payment:', err);
        return;
      }
  
      console.log('Payment details:', payment);
      // Redirect or handle the payment success as per your application flow
    });
  });
  