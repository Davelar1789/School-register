import { Schema, model } from "mongoose";

const OrderSchema = new Schema(
  {
    userId: String,
    products: Array,
    totalAmount: Number,
    deliveryAddress: String,
    deliveryDate: String,
    deliveryStatus: { type: String, default: "Not Delivered" },
    phoneNumber: String,
    paymentStatus: { type: String, default: "Not Paid" },
  },
  {
    timestamps: true,
  }
);

const Order = model("Order", OrderSchema);

export default Order;
