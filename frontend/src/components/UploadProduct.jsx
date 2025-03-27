import { useState } from "react";
import "./UploadProduct.modules.css";
import { FaCheck, FaCloudUploadAlt } from "react-icons/fa";
import { uploadImage } from "../utils/uploadImage";
import axios from '../api/axios';
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const colorsList = [
  { name: "Red", value: "red" },
  { name: "Blue", value: "blue" },
  { name: "Green", value: "green" },
  { name: "Yellow", value: "yellow" },
  { name: "Black", value: "black" },
  { name: "White", value: "white" },
  { name: "Purple", value: "purple" },
  { name: "Orange", value: "orange" },
  { name: "Pink", value: "pink" },
];

const UploadProduct = ({ product }) => {
  const navigate = useNavigate();
  const [productDetails, setProductDetails] = useState({
    name: product?.name || "",
    category: product?.category || "",
    price: product?.price || "",
    discount: product?.discount || 0,
    description: product?.description || "",
    numberOfProductsAvailable: product?.numberOfProductsAvailable || 1,
    colors: product?.colors || [],
    images: product?.images || [],
    id: product?._id || "",
  });

  // console.log(product._id);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;

    setProductDetails((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    const uploadedImageUrl = await uploadImage(file);

    setProductDetails((prev) => ({
      ...prev,
      images: [...prev.images, uploadedImageUrl],
    }));
    setUploadingImage(false);
  };

  const handleColorSelect = (selectedColor) => {
    setProductDetails((prev) => ({
      ...prev,
      colors: [...prev.colors, selectedColor],
    }));
  };

  const handleImageRemove = (index) => {
    const newProductImage = [...productDetails.images];
    newProductImage.splice(index, 1);

    setProductDetails((prev) => {
      return {
        ...prev,
        images: [...newProductImage],
      };
    });
  };

  const handleUploadProduct = (event) => {
    event.preventDefault();
    if (productDetails.category === "") {
      return toast.error("Select a product category");
    }

    if (productDetails.images.length === 0) {
      return toast.error("Upload at least one Image");
    }

    delete productDetails.id;
    axios
      .post("/api/admin/manage-products/add", productDetails)
      .then(() => {
        setProductDetails({
          name: "",
          category: "",
          price: "",
          discount: 0,
          numberOfProductsAvailable: 1,
          colors: [],
          images: [],
          description: "",
        });
        toast.success("Product Uploaded");
      })
      .catch(() => toast.error("Something went wrong"));
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (productDetails.category === "") {
      return toast.error("Select a product category");
    }

    if (productDetails.images.length === 0) {
      return toast.error("Upload at least one Image");
    }
    await axios
      .put("/api/admin/manage-products/edit", productDetails, {
        withCredentials: true,
      })
      .then(() => {
        navigate(0);
        toast.success("Product Updated");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="product-page">
      <div className="product-content">
        <main className="main-content">
          <form className="product-form">
            <div className="product-fields">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="productName">Product Name</label>
                  <input
                    required
                    type="text"
                    id="name"
                    className="form-input"
                    placeholder="Enter Product Name"
                    value={productDetails.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    className="form-input"
                    value={productDetails.category}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      Select Category
                    </option>
                    <option value="Fire Safety">Fire Safety</option>
                    <option value="Fall Protection">Fall Protection</option>
                    <option value="PPE">PPE</option>
                  </select>
                </div>
              </div>
              <div className="form-row ">
                <div className="form-group">
                  <label htmlFor="price">Description</label>
                  <div className="cur-group">
                    <textarea
                      type="text"
                      id="description"
                      required
                      className="bg-slate-100 p-2 min-h-40 max-h-40 border rounded outline-slate-400"
                      placeholder="Enter Product Description"
                      value={productDetails.description}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              <div className="form-row mt-32">
                <div className="form-group">
                  <label htmlFor="price">Price</label>
                  <div className="cur-group">
                    <input
                      type="number"
                      id="price"
                      required
                      className="form-input"
                      placeholder="Enter Price"
                      value={productDetails.price}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Discount</label>
                  <div className="cur-group">
                    <input
                      type="number"
                      id="discount"
                      className="form-input"
                      placeholder="Enter Discount"
                      value={productDetails.discount}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="pieces">Number of Pieces Available</label>
                <input
                  type="number"
                  id="numberOfProductsAvailable"
                  className="form-input"
                  placeholder="Enter Number of Pieces"
                  value={productDetails.numberOfProductsAvailable}
                  onChange={handleChange}
                />
              </div>
              <div className="form-row">
                <div className="form-group mt-8">
                  <label htmlFor="colors">Tick Colors Available</label>
                  <div className="color-dropdown">
                    {colorsList.map((color) => (
                      <div
                        key={color.value}
                        className="color-option"
                        onClick={() => handleColorSelect(color.value)}
                      >
                        <div
                          className="color-circle"
                          style={{
                            backgroundColor: color.value,
                          }}
                        ></div>
                        {productDetails.colors.includes(color.value) && (
                          <FaCheck className="color-tick" />
                        )}
                        <span>{color.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="form-group mt-8 w-full">
              <label htmlFor="productImage" className="font-bold text-xl mb-2">
                Upload Image
              </label>
              <label htmlFor="uploadImageInput">
                <div className="p-2 bg-slate-100  cursor-pointer flex justify-center items-center border  rounded h-32 w-full  ">
                  <div className="text-slate-500  flex justify-center items-center flex-col gap-1">
                    <span className="text-4xl">
                      <FaCloudUploadAlt />
                    </span>
                    <p className="text-sm">Upload Product Image</p>
                    <input
                      type="file"
                      id="uploadImageInput"
                      className="hidden"
                      onClick={() => setUploadingImage(true)}
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
              </label>
              <div className="uploaded-images">
                <>
                  {productDetails.images?.map((img, index) => (
                    <div key={index} className="uploaded-image-box">
                      <img
                        src={img}
                        alt={`Product ${index}`}
                        className="uploaded-image"
                      />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => handleImageRemove(index)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}

                  {uploadingImage && (
                    <div className="uploaded-image-box bg-slate-300 animate-pulse">
                      <div className="uploaded-image " />
                      <button
                        type="button"
                        onClick={() => setUploadingImage(false)}
                        className="remove-image"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </>
              </div>
            </div>
            <div className="save-button-container">
              {!product?._id ? (
                <button
                  type="submit"
                  onClick={handleUploadProduct}
                  className="save-button"
                >
                  Upload Product
                </button>
              ) : (
                <button
                  type="submit"
                  onClick={handleEditProduct}
                  className="save-button"
                >
                  Edit Product
                </button>
              )}
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default UploadProduct;
