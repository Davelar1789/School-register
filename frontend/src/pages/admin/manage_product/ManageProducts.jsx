import { useState, useEffect } from "react";
import "./ManageProducts.modules.css";
import UploadProduct from "../../../components/UploadProduct";
import axios from "axios";
import { MdDelete, MdEdit } from "react-icons/md";
import toast from "react-hot-toast";

const ManageProducts = () => {
  const [products, setProducts] = useState();
  const [toggleAddProduct, setToggleAddProduct] = useState(false);
  const [toggleEditProduct, setToggleEditProduct] = useState(false);
  const [productToEditDetails, setProductToEditDetails] = useState();
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
  }, [toggleAddProduct]);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;
  const totalPages = Math.ceil(products?.length / productsPerPage);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products?.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleDeleteProduct = async (productId) => {
    await axios
      .post(
        "/api/admin/manage-products/delete",
        { productId },
        {
          withCredentials: true,
        }
      )
      .then(() => {
        fetchAllProducts();
        toast.success("Product deleted successfully");
      })
      .catch((err) => console.log(err));
  };

  

  return (
    <div className="products-page">
      <div className="products-content">
        <main className="main-content">
          <div className="header-section">
            <h2>Product Stock</h2>
            {!toggleEditProduct ? (
              <button
                onClick={() => {
                  setToggleAddProduct(!toggleAddProduct);
                }}
                className="add-stock-button"
              >
                {toggleAddProduct ? "Manage Products" : "Upload Product"}
              </button>
            ) : (
              <button
                onClick={() => {
                  setToggleEditProduct(!toggleEditProduct);
                }}
                className="add-stock-button"
              >
                Manage Products
              </button>
            )}
          </div>
          <>
            {toggleEditProduct ? (
              <UploadProduct product={productToEditDetails} />
            ) : !toggleAddProduct ? (
              <>
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th className="hidden md:table-cell">Category</th>
                      <th>Price</th>
                      <th className="hidden md:table-cell">Piece</th>
                      <th className="hidden lg:table-cell">Available Color</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts?.map((product, index) => (
                      <tr key={index}>
                        <td>
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="product-image rounded-lg"
                          />
                        </td>
                        <td>{product.name}</td>
                        <td className="hidden md:table-cell">
                          {product.category}
                        </td>
                        <td>${product.price}</td>
                        <td className="hidden md:table-cell">
                          {product.numberOfProductsAvailable}
                        </td>
                        <td className="hidden lg:table-cell">
                          {product.colors.map((color, idx) => (
                            <span
                              key={idx}
                              className="color-dot"
                              style={{ backgroundColor: color }}
                            ></span>
                          ))}
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setProductToEditDetails(product);
                              setToggleEditProduct(!toggleEditProduct);
                            }}
                            className="mx-1"
                          >
                            <MdEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="mx-1"
                          >
                            <MdDelete />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pagination">
                  <button onClick={prevPage} disabled={currentPage === 1}>
                    Previous
                  </button>
                  <span>
                    Showing {indexOfFirstProduct + 1}-{indexOfLastProduct} of{" "}
                    {products?.length}
                  </span>
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <UploadProduct />
            )}
          </>
        </main>
      </div>
    </div>
  );
};

export default ManageProducts;
