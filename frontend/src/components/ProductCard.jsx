import React from "react";
import "./ProductCard.modules.css";
import { useNavigate } from "react-router-dom";

const ProductCard = ({
  name,
  price,
  piecesLeft,
  discount,
  onClick,
  image,
  id,
}) => {
  const navigate = useNavigate();
  return (
    <div className="product-card" onClick={() => navigate(`/product/${id}`)}>
      {discount > 0 && <div className="discount-tag">-{discount}%</div>}
      <img src={image} className="product-image object-fill" />
      <div className="product-details border-slate-300 border-t">
        <h3>{name}</h3>
        <p>GH₵ {price}</p>
        <p>{piecesLeft} items left</p>
      </div>
    </div>
  );
};

export default ProductCard;
