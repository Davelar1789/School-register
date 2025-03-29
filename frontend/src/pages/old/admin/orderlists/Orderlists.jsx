import { useEffect, useState } from "react";
import "./Orderlists.modules.css";
import { MdDeliveryDining } from "react-icons/md";
import { FaEye } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Orderlists = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [ordersData, setOrdersData] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState(ordersData);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5; // Change this to show more or fewer items per page

  const fetchOrderListInfo = async () => {
    await axios
      .get("/api/admin/get-all-orders")
      .then((res) => {
        setOrdersData(res.data.data);
      })
      .catch((err) => console.log(err));
  };

  console.log(ordersData);

  // Search logic
  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = ordersData.filter(
      (order) =>
        order.id.toLowerCase().includes(term) ||
        order.name.toLowerCase().includes(term) ||
        order.address.toLowerCase().includes(term)
    );
    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
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

  const handleDelivery = async (orderId) => {
    await axios
      .post("/api/admin/update-order-state", { orderId: orderId })
      .then(() => {
        toast.success("Delivered");
        fetchOrderListInfo();
      })
      .catch(() => {
        toast.error("Something went wrong");
      });
  };

  useEffect(() => {
    fetchOrderListInfo();
  }, []);

  return (
    <div className="products-page2">
      <div className="products-content2">
        <main className="main-content">
          <h2>Order Lists</h2>
          <div className="header4">
            <input
              type="text"
              placeholder="Search by ID, name or address"
              value={searchTerm}
              onChange={handleSearch}
              className="search-bar"
            />
          </div>
          <div className="products-list">
            <table className="order-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th className="hidden-column">Phone</th>
                  <th className="hidden-column">Address</th>
                  <th className="hidden-column">Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {ordersData.map((order, index) => (
                  <tr key={order._id}>
                    <td>{index + 1}</td>
                    <td className="hidden-column">{order.phoneNumber} </td>
                    <td className="hidden-column">{order.deliveryAddress}</td>
                    <td className="hidden-column">{order.createdAt}</td>
                    <td
                      className={`mx-1 border border-slate-300  p-1 px-2 rounded-sm ${
                        order.deliveryStatus === "Delivered"
                          ? "text-teal-800"
                          : "text-red-800"
                      }`}
                    >
                      {order.deliveryStatus}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelivery(order._id)}
                        className={`mx-1 border border-slate-300  p-1 px-2 rounded-sm ${
                          order.deliveryStatus === "Delivered"
                            ? "bg-teal-300"
                            : "bg-slate-100"
                        }`}
                      >
                        <MdDeliveryDining />
                      </button>
                      <button
                        onClick={() => {
                          navigate(`/order/${order._id}`);
                        }}
                        className="mx-1 border border-slate-300 bg-slate-100 p-1 px-2 rounded-sm"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button onClick={prevPage} disabled={currentPage === 1}>
              Previous
            </button>
            <span>
              Showing {indexOfFirstOrder + 1}-
              {Math.min(indexOfLastOrder, filteredOrders.length)} of{" "}
              {filteredOrders.length}
            </span>
            <button onClick={nextPage} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Orderlists;
