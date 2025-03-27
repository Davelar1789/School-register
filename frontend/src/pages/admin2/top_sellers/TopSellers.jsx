import axios from "axios";
import { useEffect, useState } from "react";
import AdminProducts from "../../../components/AdminProducts";

const TopSellers = () => {
  const [products, setProducts] = useState();
  const fetchAllProducts = async () => {
    await axios
      .get("/api/get-all-products")
      .then((res) => {
        setProducts(res.data.data);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  return (
    <div className="px-10">
      <AdminProducts products={products} title="Most Sold Products" />
    </div>
  );
};

export default TopSellers;
