import { Outlet } from "react-router";
import Header from "../Header/Header";
import AccountNavbar from "../Account/AccountNavbar";

export default function AccountLayout() {
  return (
    <>
      <Header />
      <section className="container mx-auto grid grid-cols-1 md:grid-cols-[250px_1fr] min-h-[calc(100vh-80px)]">
        <AccountNavbar />
        <main className="bg-bg-gray">
          <Outlet /> 
        </main>
      </section>
    </>
  );
}
