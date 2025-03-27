import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Section from "../../../components/Section"; // Import the Section component for recommended products
import trashBinIcon from "../../../assets/images/trashbin.png";
import shoppingBagIcon from "../../../assets/images/shoppingbag.png";
import "./CartPage.modules.css";
import axios from "axios";
import toast from "react-hot-toast";
import { useUserContext } from "../../../context/userContext";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const { updateCartTotal, updateCartTotalQuantity } = useUserContext();

  const fetchData = async () => {
    await axios
      .get(`/api/get-cart-products`, { withCredentials: true })
      .then((res) => {
        setCartItems(res.data);
      })
      .catch((err) => console.log(err));
  };

  const fetchRecommendedProducts = async () => {
    await axios
      .get("/api/get-all-products")
      .then((res) => {
        setRecommendedProducts(res.data.data);
      })
      .catch((err) => console.log(err));
  };

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchRecommendedProducts();
    fetchData();
  }, [cartItems.length]);

  const totalPrice = cartItems.reduce((acc, item) => {
    return acc + item.productId.price * item.quantity;
  }, 0);

  const handleQuantityDecrease = async (productId, quantity) => {
    if (quantity > 1) {
      let updatedQuantity = quantity - 1;
      await axios
        .post(
          "/api/update-cart-quantity",
          { productId, quantity: updatedQuantity },
          { withCredentials: true }
        )
        .then(() => {
          fetchData();
        });
    }
  };
  const handleQuantityIncrease = async (productId, quantity) => {
    if (quantity < 30) {
      let updatedQuantity = quantity + 1;
      await axios
        .post(
          "/api/update-cart-quantity",
          { productId, quantity: updatedQuantity },
          { withCredentials: true }
        )
        .then(() => {
          fetchData();
          // toast.success("Updated");
        });
    }
  };

  const handleDeleteItem = async (productId) => {
    await axios
      .post("/api/delete-cart-item", { productId }, { withCredentials: true })
      .then(() => {
        toast.success("Deleted");
        fetchData();
      });
  };

  const openCheckout = () => {
    updateCartTotal(totalPrice);
    updateCartTotalQuantity(cartItems.length);
    navigate("/checkout");
  };

  return (
    <div className="cart-page">
      <Header />
      <div className="cart-content">
        {cartItems > 0 && (
          <div className="cart-title-section">
            <img
              src={shoppingBagIcon}
              alt="Shopping Bag"
              className="cart-title-icon"
            />
            <h2 className="cart-title">My Cart</h2>
          </div>
        )}

        <div className="cart-items">
          {cartItems.map(({ productId, quantity, _id }, index) => (
            <div className="cart-item" key={index}>
              <div
                className="cart-image-placeholder cursor-pointer"
                onClick={() => navigate(`/product/${productId._id}`)}
              >
                <img src={productId.images[0]} alt="Product" />
              </div>
              <div className="cart-product-details">
                <h3 className="cart-product-name">
                  {productId.name}
                  <button
                    className="cart-trash-bin"
                    onClick={() => handleDeleteItem(productId._id)}
                  >
                    <img src={trashBinIcon} alt="Delete" />
                  </button>
                </h3>
                <div className="cart-product-price-section">
                  <span>Product Price:</span>
                  <span className="cart-product-price">
                    GH₵ {productId.price}
                  </span>
                </div>
                <div className="cart-product-info">
                  <span>Items Selected: {quantity}</span>
                  <span className="cart-total-amount">
                    Total: GH₵ {(productId.price * quantity).toFixed(2)}
                  </span>
                </div>
                {productId.discount > 0 && (
                  <div className="cart-product-price-section">
                    <span>Discount:</span>
                    <span className="cart-product-price">
                      GH₵ {productId.discount}
                    </span>
                  </div>
                )}
                <div className="cart-quantity-controls">
                  <button
                    className="cart-quantity-minus"
                    disabled={quantity === 1}
                    onClick={() => {
                      handleQuantityDecrease(_id, quantity);
                    }}
                  >
                    -
                  </button>
                  <span className="cart-quantity-indicator">{quantity}</span>
                  <button
                    className="cart-quantity-plus"
                    onClick={async () => {
                      await handleQuantityIncrease(_id, quantity);
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cartItems.length > 0 ? (
          <div className="cart-bottom-section">
            <div className="cart-bottom-left"></div>
            <span className="cart-total-price">Total GH₵ {totalPrice}</span>
            <button className="cart-checkout-button" onClick={openCheckout}>
              Checkout
            </button>
          </div>
        ) : (
          <div className="">
            <p className="text-center">Cart is Empty</p>
          </div>
        )}

        <div className="cart-continue-shopping">
          <a href="/" className="continue-shopping-link">
            {cartItems.length > 0 ? "Continue Shopping" : "Start Shopping"}
          </a>
        </div>
      </div>
      <div className="cart-recommended-products">
        <Section
          title="Recommended Products"
          products={recommendedProducts}
          onProductClick={(product) => console.log(product)}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
