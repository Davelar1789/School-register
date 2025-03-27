import { Schema, model } from "mongoose";

const emailSchema = new Schema(
  {
    to: String,
    subject: String,
    body: String,
    label: String,
    liked: Boolean,
  },
  { timestamps: true }
);

const Email = model("Email", emailSchema);

export default Email;
