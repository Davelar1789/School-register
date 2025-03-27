import React, { useRef } from "react";
import ProductCard from "./ProductCard";
import "./Section.modules.css";

const Section = ({ title, products, onProductClick }) => {
  const sectionRef = useRef(null);

  const scrollLeft = () => {
    sectionRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    sectionRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };
  

  return (
    <div className="section">
      <h2>{title}</h2>
      <div className="section-wrapper">
        <button className="scroll-arrow left-arrow" onClick={scrollLeft}>
          &#8249;
        </button>
        <div className="product-list" ref={sectionRef}>
          {products?.map((product, index) => (
            <ProductCard
              image={product.images[0]}
              key={index}
              id={product._id}
              name={product.name}
              price={product.price}
              piecesLeft={product.numberOfProductsAvailable}
              discount={product.discount}
              onClick={() => onProductClick(product)}
            />
          ))}
        </div>
        <button className="scroll-arrow right-arrow" onClick={scrollRight}>
          &#8250;
        </button>
      </div>
    </div>
  );
};

export default Section;
