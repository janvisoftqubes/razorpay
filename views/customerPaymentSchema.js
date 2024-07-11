const mongoose = require("mongoose");

const customerPaymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    shortUrl: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    completedAt: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
    paymentId: {
      type: String,
    },
  },
  { timestamps: true }
);

const customerPayment = mongoose.model(
  "customerPayment",
  customerPaymentSchema
);

module.exports = customerPayment;
