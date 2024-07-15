const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    contactNo: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    houseNo: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
    completedAt: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
    orderDetails: [
      {
        images: [
          {
            image: {
              type: String,
            },
          },
        ],
        productStatus: {
          type: String,
          enum: ["Pending", "Completed"],
          default: "Pending",
        },
        orderDate: {
          type: Date,
          required: true,
        },
        deliveryDate: {
          type: Date,
          required: true,
        },
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productQuantity: {
          type: Number,
          required: true,
        },
        profit: {
          type: Number,
          default: 10,
        },
        // productMaterial: {
        //   type: mongoose.Schema.Types.ObjectId,
        //   ref: "ProductMaterial",
        // },
        productMaterial: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProductMaterial",
          },
        ],
        price: {
          type: Number,
          required: true,
        },
        advancePayment: {
          type: Number,
        },
        description: {
          type: String,
        },
        advancePayment: {
          type: Number,
          default: 0,
        },
        attributesValues: {
          type: [
            {
              attribute: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "ProductAttributes",
                required: true,
              },
              value: {
                type: Number,
                required: true,
              },
            },
          ],
          default: [],
        },
      },
    ],
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
