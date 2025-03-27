import { useState, useEffect } from "react";
import Header from "../../../components/Header";
import { useNavigate } from "react-router-dom";
import Footer from "../../../components/Footer";
import shippingIcon from "../../../assets/images/shoppingbag.png";
import checkoutIcon from "../../../assets/images/checkout.png";
import "./Checkout.modules.css";
import { useUserContext } from "../../../context/userContext";
import { PaystackButton } from "react-paystack";
import toast from "react-hot-toast";
import axios from "axios";

const Checkout = () => {
  const { cartTotalQuantity, currentUser } = useUserContext();
  const navigate = useNavigate();

  const [orderDetails, setOrderDetails] = useState([]);

  const fetchData = async () => {
    await axios
      .get(`/api/get-cart-products`, { withCredentials: true })
      .then((res) => {
        if (res.data.length == 0) {
          navigate("/cart");
        }
        setOrderDetails(res.data);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const cartItemIds = orderDetails.map((item) => item._id);

  const cartTotalAmount = orderDetails?.reduce((acc, item) => {
    return acc + item.productId.price * item.quantity;
  }, 0);

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("bank-transfer");
  const [selectedShippingOption, setSelectedShippingOption] =
    useState("express");
  const [showAllShippingOptions, setShowAllShippingOptions] = useState(false);
  const [note, setNote] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [address, setAddress] = useState(""); // Added state for address
  const [phoneNumber, setPhoneNumber] = useState(""); // Added state for phone number

  const taxes = 23.12;

  const orderedProducts = orderDetails.map((order) => order.productId);

  const handleConfirmOrder = async () => {
    await axios
      .post(
        "/api/confirm-order",
        {
          products: orderedProducts,
          totalAmount: cartTotalAmount,
          status: "Pending",
          deliveryAddress: address || "Legon", // Use the entered address
          phoneNumber: phoneNumber || "123", // Use the entered phone number
          paymentStatus: "Not Paid",
          cartItemsIds: cartItemIds,
        },
        { withCredentials: true }
      )
      .then(() => {
        toast.success("Order Placed successfully");
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to confirm order");
      });
  };

  const getDeliveryFee = () => {
    switch (selectedShippingOption) {
      case "express":
        return 20.0;
      case "standard":
        return 10.0;
      case "economy":
        return 5.0;
      case "basic":
      default:
        return 0.0;
    }
  };

  const handleShippingOptionClick = (option) => {
    setSelectedShippingOption(option);
    setShowAllShippingOptions(false);
  };

  const toggleShippingOptions = () => {
    setShowAllShippingOptions(!showAllShippingOptions);
  };

  const getEstimatedArrivalDate = (option) => {
    const deliveryDate = new Date(currentDate);
    switch (option) {
      case "express":
        deliveryDate.setDate(deliveryDate.getDate() + 5);
        break;
      case "standard":
        deliveryDate.setDate(deliveryDate.getDate() + 7);
        break;
      case "economy":
        deliveryDate.setDate(deliveryDate.getDate() + 10);
        break;
      default:
        break;
    }
    return deliveryDate.toDateString();
  };

  const shippingOptions = {
    express: {
      label: "Express",
      description: `Estimated arrival ${getEstimatedArrivalDate("express")}`,
      price: 20.0,
    },
    standard: {
      label: "Standard",
      description: `Estimated arrival ${getEstimatedArrivalDate("standard")}`,
      price: 10.0,
    },
    economy: {
      label: "Economy",
      description: `Estimated arrival ${getEstimatedArrivalDate("economy")}`,
      price: 5.0,
    },
    basic: {
      label: "Basic",
      description: "Pick up from store",
      price: 0.0,
    },
  };

  const config = {
    reference: new Date().getTime().toString(),
    email: currentUser?.email || "Bels@gmail.com",
    currency: "GHS",
    amount: cartTotalAmount * 100,
    publicKey: "pk_test_d2b29b341053f591f409889e71e0811823b8195d",
  };

  const handlePaystackCloseAction = () => {
    toast.success("Closed");
  };
  const handlePaystackSuccessAction = async () => {
    await axios
      .post(
        "/api/confirm-order",
        {
          products: orderedProducts,
          totalAmount: cartTotalAmount,
          status: "Pending",
          deliveryAddress: address || "Legon", // Use the entered address
          phoneNumber: phoneNumber || "123", // Use the entered phone number
          paymentStatus: "Paid",
          cartItemsIds: cartItemIds,
        },
        { withCredentials: true }
      )
      .then(() => {
        toast.success("Order Placed successfully");
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to confirm order");
      });
  };

  const componentProps = {
    ...config,
    text: `Pay NOW: GHS ${cartTotalAmount + taxes}`,
    onSuccess: (reference) => handlePaystackSuccessAction(reference),
    onClose: handlePaystackCloseAction,
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center">
        <a href="/sign-in" className="mt-10 text-blue-600">
          Login to continue
        </a>
      </div>
    );
  }

  return (
    <>
      {currentUser && (
        <div className="checkout-page">
          <Header />
          <div className="checkout-content">
            <div className="checkout-header">
              <img
                src={checkoutIcon}
                alt="Checkout"
                className="cart-title-icon2"
              />
              <h2 className="checkout-title">Checkout</h2>
            </div>
            <button className="backtocart" onClick={() => navigate("/cart")}>
              Back to Cart
            </button>
            <div className="checkout-subtotal">
              <span>Total, {cartTotalQuantity} item(s)</span>
              <span>GH₵ {cartTotalAmount}</span>
            </div>
            <div className="checkout-subtotal">
              <span>Taxes</span>
              <span>GH₵ {taxes}</span>
            </div>
            <div className="checkout-select-shipping">
              <div className="shipping-header">
                <span>Select shipping</span>
                <a onClick={toggleShippingOptions} className="see-options">
                  See all options
                </a>
              </div>
              {!showAllShippingOptions && (
                <div className="shipping-option">
                  <div className="shipping-option-detail">
                    <strong>
                      {shippingOptions[selectedShippingOption].label}
                    </strong>
                    <p>{shippingOptions[selectedShippingOption].description}</p>
                  </div>
                  <span className="shipping-price">
                    GH₵{" "}
                    {shippingOptions[selectedShippingOption].price.toFixed(2)}
                  </span>
                </div>
              )}
              {showAllShippingOptions && (
                <>
                  {Object.keys(shippingOptions).map((optionKey) => (
                    <div
                      key={optionKey}
                      className={`shipping-option ${
                        selectedShippingOption === optionKey ? "selected" : ""
                      }`}
                      onClick={() => handleShippingOptionClick(optionKey)}
                    >
                      <div className="shipping-option-detail">
                        <strong>{shippingOptions[optionKey].label}</strong>
                        <p>{shippingOptions[optionKey].description}</p>
                      </div>
                      <span className="shipping-price">
                        GH₵ {shippingOptions[optionKey].price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Added Address and Phone Number Fields */}
            {selectedShippingOption !== "basic" && (
              <div className="checkout-shipping-address">
                <div className="shipping-address-header">
                  <img
                    src={shippingIcon}
                    alt="Shipping Icon"
                    className="shipping-icon"
                  />
                  <span>Shipping Address</span>
                </div>

                {/* Address Field */}
                <div className="checkout-input">
                  <label htmlFor="address">Address</label>
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your shipping address"
                    className="shipping-address-input"
                  />
                </div>

                {/* Phone Number Field */}
                <div className="checkout-input">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                    className="shipping-phone-input"
                  />
                </div>
              </div>
            )}

            <div className="checkout-note">
              <span>Note:</span>
              <textarea
                className="note-input"
                placeholder="Enter your note here"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              ></textarea>
            </div>
            <div className="checkout-payment-methods">
              <span>Payment methods</span>
              <div className="payment-methods-options">
                <button
                  className={`payment-method ${
                    selectedPaymentMethod === "cash" ? "selected" : ""
                  }`}
                  onClick={() => setSelectedPaymentMethod("cash")}
                >
                  <span>Cash</span>
                  <p>Pay when product arrives</p>
                </button>
                <button
                  className={`payment-method ${
                    selectedPaymentMethod === "bank-transfer" ? "selected" : ""
                  }`}
                  onClick={() => setSelectedPaymentMethod("bank-transfer")}
                >
                  <span>Pay Now</span>
                  <p>Pay with Bank or Mobile Money</p>
                </button>
              </div>
            </div>
            <div className="checkout-total-section">
              <p className="checkout-total">
                Total: GH₵ {cartTotalAmount + taxes}
              </p>
              {selectedPaymentMethod === "cash" ? (
                <button
                  className="checkout-button"
                  onClick={handleConfirmOrder}
                >
                  Place Order
                </button>
              ) : (
                <button className="checkout-button">
                  <PaystackButton {...componentProps} />
                </button>
              )}
            </div>
          </div>
          <Footer />
        </div>
      )}
    </>
  );
};

export default Checkout;
