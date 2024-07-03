// src/index.js
const Razorpay = require('razorpay');
const QRCode = require('qrcode');
const fs = require('fs');
const { key_id, key_secret } = require('../config/config');

const instance = new Razorpay({
  key_id: key_id,
  key_secret: key_secret
});

const createCustomer = async () => {
  try {
    const customer = await instance.customers.create({
      name: 'John Doe',
      email: 'prutha@example.com',
      contact: '+911234567791'
    });
    console.log('Customer created:', customer);
    return customer;
  } catch (error) {
    console.error('Error creating customer:', error);
  }
};

const createOrder = async () => {
  try {
    const order = await instance.orders.create({
      amount: 1000, // amount in paise
      currency: 'INR',
      receipt: 'receipt#1',
      payment_capture: 1 // auto capture
    });
    console.log('Order created:', order);
    return order;
  } catch (error) {
    console.error('Error creating order:', error);
  }
};

const generatePaymentLink = async (customer, order) => {
  try {
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
    console.log('Payment link created:', paymentLink);

    // Generate QR code for the payment link and save as an image file
    QRCode.toFile('payment_qr_code.png', paymentLink.short_url, function (err) {
      if (err) {
        console.error('Error generating QR code:', err);
      } else {
        console.log('QR code saved as payment_qr_code.png');
      }
    });

    return paymentLink;
  } catch (error) {
    console.error('Error creating payment link:', error);
  }
};

const main = async () => {
  const customer = await createCustomer();
  const order = await createOrder();

  if (customer && order) {
    const paymentLink = await generatePaymentLink(customer, order);
    console.log(`Customer ID: ${customer.id}, Order ID: ${order.id}, Payment Link ID: ${paymentLink.id}`);
    console.log('QR code saved as payment_qr_code.png for the payment link.');
  }
};

main();
