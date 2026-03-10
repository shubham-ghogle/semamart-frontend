import React from "react";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

type Props = {
  children: React.ReactNode;
};

export default function MedicopPageShell({ children }: Props) {
  return (
    <>
      <Header />
      <main className="bg-gray-100 min-h-[calc(100vh-180px)]">{children}</main>
      <Footer />
    </>
  );
}
