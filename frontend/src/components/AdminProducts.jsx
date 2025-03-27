/* eslint-disable react/prop-types */
import "./AdminProducts.modules.css";
import { useNavigate } from "react-router-dom";

const AdminProducts = ({ products, title }) => {
  const navigate = useNavigate();

  return (
    <div className="section">
      <h2 className="mt-6">{title}</h2>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {products?.map((product) => (
          <div
            key={product._id}
            className="border border-slate-300 px cursor-pointer"
            onClick={() => navigate(`/product/${product._id}`)}
          >
            <div>
              <img
                src={product.images[0]}
                alt=""
                className="product-image p-2 rounded-lg object-cover"
              />
            </div>
            <div className="product-details">
              <h3>{product.name}</h3>
              <p>GH₵ {product.price}</p>
              <p>{product.piecesLeft} items left</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;
