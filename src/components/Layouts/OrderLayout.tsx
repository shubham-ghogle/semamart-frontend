import { Outlet } from "react-router";
import Header from "../Header/Header";
import MyOrder from "../Order/MyOrders";

export default function OrderLayout() {
  return (
    <>
      <Header />
      <section>
        <MyOrder />
        <main className="bg-bg-gray">
          <Outlet />
        </main>
      </section>
    </>
  );
}
