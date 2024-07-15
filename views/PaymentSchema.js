const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    payment_request: {
      type: Date,
    },
    payment_receive: {
      type: Date,
      default: null,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    jobOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobOrder",
      required: true,
    },
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    boutiqueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mop",
      default: null,
    },
    requestStatus: {
      type: String,
      enum: ["Pending", "Approved"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
    agencyPaymentStatus: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
    amount: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Payment =
  mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

module.exports = Payment;
