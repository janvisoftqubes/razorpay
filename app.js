const express = require("express");
const bodyParser = require("body-parser");
const Razorpay = require("razorpay");
const dotenv = require("dotenv");
const crypto = require("crypto");
const axios = require("axios");
const customerPayment = require("./views/customerPaymentSchema");
const paymentSchema = require("./views/PaymentSchema");
const orderSchema = require("./views/orderSchema");
const dbConnect = require("./views/dbConnect");
dotenv.config();
dbConnect();
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // For parsing application/json
app.set("view engine", "ejs");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.get("/", (req, res) => {
  res.render("index", { order: null, qrCode: null, error: null });
});

app.post("/create-order", async (req, res) => {
  const {
    amount,
    currency,
    receipt,
    customerName,
    customerEmail,
    customerContact,
  } = req.body;

  const options = {
    amount: amount * 100, // Amount in paise
    currency,
    receipt,
    notes: {
      customerName,
    },
  };

  try {
    const order = await razorpay.orders.create(options);
    const qrCodeResponse = await axios.post(
      "https://api.razorpay.com/v1/payment_links",
      {
        amount: amount * 100,
        currency: currency,
        accept_partial: false,
        description: `Payment for order ${order.id}`,
        customer: {
          name: customerName,
          email: customerEmail,
          contact: customerContact,
        },
        notify: {
          sms: true,
          email: true,
        },
        reminder_enable: true,
        callback_url: "https://your-callback-url.com/",
        callback_method: "get",
      },
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_KEY_SECRET,
        },
      }
    );

    res.render("index", {
      order,
      qrCode: qrCodeResponse.data.short_url,
      error: null,
    });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.render("index", {
      order: null,
      qrCode: null,
      error: "Error creating order or QR code",
    });
  }
});

app.post("/razorpay/webhook", async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  console.log("secret-->", secret);
  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest === req.headers["x-razorpay-signature"]) {
    console.log("Webhook verified successfully");

    // Handle the event
    const event = req.body.event;
    const payload = req.body.payload;

    console.log("req.body-->", req.body, "\n");

    console.log("event-->", event);
    console.log("payload-->", payload);

    const notes = payload.payment.entity.notes;
    const upi = payload.payment.entity.upi;

    console.log("notes--->", notes);
    console.log("upi--->", upi);

    if (event === "payment.captured") {
      const orderId = payload.payment.entity.order_id;
      console.log(`Payment captured for order ID: ${orderId}`);

      // Update the order status in your database
      const updateCustomerPayment = await customerPayment.updateOne(
        { orderId: notes.receipt },
        { $set: { paymentStatus: "Completed", completedAt: new Date() } }
      );

      const updateOrder = await orderSchema.updateOne(
        { _id: notes.receipt },
        { $set: { paymentStatus: "Completed", completedAt: new Date() } }
      );

      const updatePayment = await paymentSchema.updateOne(
        { orderId: notes.receipt },
        {
          $set: {
            requestStatus: "Approved",
            paymentStatus: "Completed",
            agencyPaymentStatus: "Completed",
          },
        }
      );

      console.log("updateCustomerPayment-->", updateCustomerPayment);
      console.log("updateOrder-->", updateOrder);
      console.log("updatePayment-->", updatePayment);
    }

    res.status(200).send("Webhook received");
  } else {
    console.log("Webhook verification failed");
    res.status(400).send("Invalid signature");
  }
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
