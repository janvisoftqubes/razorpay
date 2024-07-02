// app.js
require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.json());

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

let qrCodeCache = null;

const createStaticQRCode = async () => {
    if (qrCodeCache) {
        return qrCodeCache;
    }
    const params = {
        type: 'upi_qr',
        name: 'Test Merchant',
        usage: 'multiple_use',
        fixed_amount: false, // Allow any amount
    };

    try {
        qrCodeCache = await razorpayInstance.qrCode.create(params);
        console.log('Static QR Code created:', qrCodeCache);
        return qrCodeCache;
    } catch (error) {
        console.error('Error creating QR Code:', error);
    }
};

app.get('/generate-qr', async (req, res) => {
    const qrCode = await createStaticQRCode();
    res.render('qr', { qrCode });
});

app.post('/razorpay/webhook', (req, res) => {
    const secret = process.env.WEBHOOK_SECRET;
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest === req.headers['x-razorpay-signature']) {
        console.log('Payment verified:', req.body);
        res.status(200).send('OK');
    } else {
        console.log('Invalid signature');
        res.status(400).send('Invalid signature');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
