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

const express = require("express");
const bodyParser = require("body-parser");
const Razorpay = require("razorpay");
const path = require("path");
const axios = require("axios");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the root directory
app.set("view engine", "ejs");

// Razorpay instance setup
const razorpay = new Razorpay({
  key_id: "YOUR_KEY_ID", // replace with your Razorpay key id
  key_secret: "YOUR_KEY_SECRET", // replace with your Razorpay key secret
});

const qrCodeId = "qr_OU2cfTAbaWzV02"; // Your QR code ID

// Route to display the QR code and payment form
app.get("/", (req, res) => {
  res.render("index");
});

// Route to handle payment requests
app.post("/pay", async (req, res) => {
  const { amount } = req.body;

  try {
    // Create a payment order linked to the QR code
    const response = await axios.post(
      `https://api.razorpay.com/v1/payments/create/qr/${qrCodeId}`,
      {
        amount: amount * 100, // amount in paise
        currency: "INR",
      },
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID, // replace with your Razorpay key id
          password: process.env.RAZORPAY_KEY_SECRET, // replace with your Razorpay key secret
        },
      }
    );
    console.log("response-->", response);
    res.render("pay", {
      qrCode: "QrCode.jpeg",
      amount: amount,
      paymentId: response.data.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating payment");
  }
});

// Webhook endpoint to handle Razorpay notifications
app.post("/razorpay/webhook", (req, res) => {
  const secret = "YOUR_WEBHOOK_SECRET"; // Replace with your webhook secret
  console.log("webhook-->", req.body);
  const crypto = require("crypto");
  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest === req.headers["x-razorpay-signature"]) {
    // Handle successful payment here
    console.log("Payment successful:", req.body);
  } else {
    console.log("Invalid signature");
  }

  res.status(200).json({ status: "ok" });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
