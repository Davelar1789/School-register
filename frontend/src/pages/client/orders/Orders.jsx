"use client";

import { MdArrowBack } from "react-icons/md";
import { useNavigation } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { IoEyeOutline } from "react-icons/io5";
import Header from "../../../components/Header";

const OrdersClient = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigation();

  const fetchOrders = async () => {
    await axios
      .get("/api/get-orders", { withCredentials: true })
      .then((res) => {
        setOrders(res.data.data);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col gap-1 items-center justify-center m-auto mt-10 md:mt-16">
        <p className="text-3xl text-slate-800">No Orders Placed</p>
        <p
          onClick={() => navigate("/")}
          className=" text-slate-600 text-[13px] underline pb-2 hover:font-bold cursor-pointer transition flex gap-1 items-center"
        >
          <MdArrowBack />
          Start Shopping
        </p>
      </div>
    );
  }

  console.log(orders);

  return (
    <div>
      <Header />
      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 mt-[65px] px-4 md:px-8">
        {orders.map((order) => {
          return (
            <div className="flex flex-col gap-5 " key={order.id}>
              {order.products.map((product) => {
                return (
                  <div
                    className="flex gap-6 bg-slate-50 py-3  overflow-hidden px-2 rounded-xl cursor-default"
                    key={product.id}
                  >
                    <div className="aspect-square overflow-hidden h-[130px] relative w-[100px]">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="object-cover rounded-sm w-full h-full "
                      />
                    </div>

                    <div className="flex flex-col gap-2 relative flex-1">
                      <p className="font-bold text-slate-800 w-full overflow-hidden h-[25px]  text-lg">
                        {product.name}
                      </p>

                      <div>
                        {order.deliveryStatus === "Delivered" && (
                          <p className="text-green-500 py-[1px]  text-[12px] font-medium">
                            DELIVERED
                          </p>
                        )}
                        {order.deliveryStatus !== "Delivered" && (
                          <p className="text-[12px] text-slate-600 py-[1px]  font-medium">
                            NOT YET DELIVERED
                          </p>
                        )}
                      </div>

                      <div>
                        {order.deliveryStatus === "Delivered" && (
                          <p className="text-slate-500 text-[12px] font-medium ">
                            Delivered Between: {order.updatedAt}
                          </p>
                        )}
                        {order.deliveryStatus !== "Delivered" && (
                          <p className="text-slate-500 text-[12px] font-medium ">
                            Will be delivered on: {order.createdAt}
                          </p>
                        )}
                      </div>

                      <button
                        className="flex flex-row bg-slate-300 py-2 rounded-lg px-3 text-slate-600  gap-2 text-[13px] items-center cursor-pointer  transition hover:bg-slate-400 text-base"
                        onClick={() => navigate(`/order/${order.id}`)}
                      >
                        <IoEyeOutline />
                        View Order
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersClient;
