import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    name: String,
    category: String,
    price: String,
    description: String,
    discount: String,
    numberOfProductsAvailable: String,
    colors: Array,
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

const Products = model("Product", productSchema);
export default Products;
