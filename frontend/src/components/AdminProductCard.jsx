import "./AdminProductCard.modules.css";

const AdminProductCard = ({
  name,
  price,
  piecesLeft,
  discount,
  onClick,
  images,
}) => {
  return (
    <div className="border border-slate-300 px" onClick={onClick}>
      {discount && <div className="discount-tag">{discount}</div>}
      <div>
        <img
          src={images[0]}
          alt=""
          className="product-image w-full p-2 rounded-lg object-contain mix-blend-multiply"
        />
      </div>
      <div className="product-details">
        <h3>{name}</h3>
        <p>GH₵ {price}</p>
        <p>{piecesLeft} items left</p>
      </div>
    </div>
  );
};

export default AdminProductCard;
