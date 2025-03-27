import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./ProductDisplay.modules.css"; // Ensure this is the correct path
import profilePic from "../assets/images/profile-pic.jpg";
import axios from "axios";
import Section from "../components/Section";
import { addToCart } from "../utils/addToCart";

const ProductDisplay = () => {
  const [product, setProduct] = useState();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [similarProducts, setSimilarProducts] = useState();

  const params = useParams();
  const navigate = useNavigate(); // Use useNavigate hook

  const fetchSimilarProducts = async () => {
    await axios
      .get("/api/get-all-products")
      .then((res) => {
        setSimilarProducts(res.data.data);
      })
      .catch((err) => console.log(err));
  };

  const fetchProductDetails = async () => {
    await axios
      .post("/api/product-details", { productId: params.id })
      .then((res) => {
        setProduct(res.data.data);
      });
  };

  useEffect(() => {
    fetchProductDetails();
    fetchSimilarProducts();
  }, [params.id]); // Add params.id to the dependency array

  const handleQuantityChange = (type) => {
    if (type === "increment") {
      setQuantity(quantity + 1);
    } else if (type === "decrement" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const handleAddToCart = () => {
    // Add your logic to add the product to the cart here
    // For example, you could use axios to make an API call to add the item to the cart
    // Then navigate to the cart page
    navigate("/cart");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="productsPage2 overflow-hidden">
      <Header />
      <div className="productsContent2">
        <main className="mainContent2">
          {product ? (
            <>
              <div className="productDetails2">
                <img src={product.images[0]} className="productImage2" />
                <div className="productInfoAndSpecs2">
                  <h2>{product.name}</h2>
                  <p className="productPrice2">GH₵ {product.price}</p>
                  <div className="ratings2">
                    <span>★★★☆☆</span>
                  </div>
                  <div className="productSpecs2">
                    <h2>Product specs</h2>
                    <div className="specs2">
                      <div className="size2">
                        <span>Size</span>
                        <div className="sizeOptions2">
                          {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                            <button
                              key={size}
                              className={
                                selectedSize === size ? "selected" : ""
                              }
                              onClick={() => handleSizeSelect(size)}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="color2">
                        <span>Color</span>
                        <div className="colorOptions2">
                          {product?.colors?.map((color) => (
                            <button
                              key={color}
                              className={`${color.toLowerCase()} ${
                                selectedColor === color ? "selected" : ""
                              }`}
                              onClick={() => handleColorSelect(color)}
                            ></button>
                          ))}
                        </div>
                      </div>
                      <div className="quantity2">
                        <span>Quantity</span>
                        <div className="quantitySelector2">
                          <button
                            onClick={() => handleQuantityChange("decrement")}
                          >
                            -
                          </button>
                          <span>{quantity}</span>
                          <button
                            onClick={() => handleQuantityChange("increment")}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    className="add-to-cart-button"
                    onClick={(e) => addToCart(e, product._id)}
                  >
                    Add to Cart
                  </button>
                  <div className="productDescription2">
                    <p>{product.description}</p>
                  </div>
                  <div className="customerReviews2">
                    <h3>
                      Customer reviews
                      <span className="moreReviewsArrow2">→</span>
                    </h3>
                    <div className="review2">
                      <img
                        src={profilePic}
                        alt="Profile"
                        className="profilePic2"
                      />
                      <div>
                        <p>
                          <strong>John Stone</strong>
                        </p>
                        <p className="profilePic22">
                          Was good but not the exact colour I ordered.
                        </p>
                        <div className="reviewActions2">
                          <span>👍</span>
                          <span>👎</span>
                          <span>↩</span>
                        </div>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Add a comment"
                      className="commentBox2"
                    />
                  </div>
                </div>
              </div>
              <div className="similarProducts2">
                <div className="similarProductsList2">
                  <Section
                    title="Similar Products"
                    products={similarProducts}
                  />
                </div>
              </div>
            </>
          ) : (
            <p>No product selected</p>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDisplay;
