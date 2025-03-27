import { Schema, model } from "mongoose";

const teacherSchema = new Schema(
  {
    name: String,
    class: String,
    salary: String,
    description: String,
    subject: String,
    numberOfProductsAvailable: String,
    department: Array,
    images: Array,
    quantitiesSold: Number,
    reviews: [
      {
        userId: String,
        comment: String,
        rating: String,
      },
    ],
  },
  { timestamps: true }
);

const Teachers = model("teachers", teacherSchema);
export default Teachers;
