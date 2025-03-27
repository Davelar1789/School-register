import { useState } from "react";
import "./Orderlists.modules.css";
import { MdDeliveryDining } from "react-icons/md";
import { FaEye } from "react-icons/fa";

const ordersData = [
  {
    id: "00001",
    name: "Christine Brooks",
    address: "089 Kutch Green Apt. 448",
    date: "04 Jan 2024",
    type: "Electric",
    status: "Delivered",
  },
  {
    id: "00002",
    name: "Rosie Pearson",
    address: "979 Immanuel Ferry Suite 526",
    date: "28 May 2024",
    type: "Book",
    status: "Processing",
  },
  {
    id: "00003",
    name: "Darrell Caldwell",
    address: "8587 Frida Ports",
    date: "23 Nov 2023",
    type: "Medicine",
    status: "Rejected",
  },
  {
    id: "00003",
    name: "Darrell Caldwell",
    address: "8587 Frida Ports",
    date: "23 Nov 2023",
    type: "Medicine",
    status: "Paid",
  },
];

const Orderlists = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrders, setFilteredOrders] = useState(ordersData);

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    if (term === "") {
      setFilteredOrders(ordersData);
    } else {
      setFilteredOrders(
        ordersData.filter(
          (order) =>
            order.id.includes(term) ||
            order.name.toLowerCase().includes(term.toLowerCase()) ||
            order.address.toLowerCase().includes(term.toLowerCase())
        )
      );
    }
  };

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
                  <th>ID</th>
                  <th>Name</th>
                  <th className="hidden-column">Address</th>
                  <th className="hidden-column">Date</th>
                  <th>Status</th>
                  <th className="hidden-column">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.name}</td>
                    <td className="hidden-column">{order.address}</td>
                    <td className="hidden-column">{order.date}</td>

                    <td className={order.status.toLowerCase().replace(" ", "")}>
                      {order.status}
                    </td>
                    <td className="hidden-column">
                      <button className="mx-1 border border-slate-300 bg-slate-100 p-1 px-2 rounded-sm">
                        <MdDeliveryDining />
                      </button>
                      <button className="mx-1 border border-slate-300 bg-slate-100 p-1 px-2 rounded-sm">
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Orderlists;
