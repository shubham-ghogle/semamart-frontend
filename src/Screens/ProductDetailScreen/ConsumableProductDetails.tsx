// Final complete and combined component without errors
// Filename: ProductPageWithHeader.tsx

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AiOutlineHeart,
  AiOutlineShoppingCart,
  AiOutlineSearch,
  AiOutlineHome,
  AiOutlineUser,
  AiOutlineArrowRight,
  AiOutlineQuestionCircle,
} from "react-icons/ai";
import { IoIosArrowForward } from "react-icons/io";
import { ActionBtn, SecondryBtn } from "../../components/UI/Buttons";
import { Logo } from "../../components/UI/Logo";
import { useUserStore } from "../../store/userStore";
import { useSellerStore } from "../../store/sellerStore";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { ProductDetailsIcons } from "../../components/UI/ProductDetailsIcons";
import ProductImage from "../../components/UI/ProductImage";
import RelatedProductCard from "../../components/UI/RelatedProductCard";
import { CashOnDelivery } from "../../components/UI/CashOnDelivery";
import offer from "../../../public/offer.png";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "";

const relatedProducts = [
  {
    _id: "1",
    name: "Comfort Scrub Top",
    originalPrice: 799,
    discountPrice: 499,
    ratings: 4.2,
    images: ["image1.png"],
  },
  // More products if needed
];

export default function ProductPageWithHeader() {
  const cart = useCartStore((state) => state.cart) || [];
  const wishlist = useWishlistStore((state) => state.wishlist) || [];
  const { user, removeUser } = useUserStore((state) => state);
  const { seller, removeSeller } = useSellerStore((state) => state);
  const isAdmin = user && user.role === "Admin";
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedName, setSelectedName] = useState("");
 type Offer = {
  title: string;
  details: string;
};

const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  const [selectedPack, setSelectedPack] = useState("100 Pack");

  const names = ["Equipment", "Consumables", "Pharmaceutical"];
  const packs = ["100 Pack", "500 Pack", "1000 Pack"];
  const offers = [
    {
      title: "Bank Offers",
      details: "Get 10% off with HDFC Bank debit/credit cards.",
    },
    {
      title: "Partner Offers",
      details: "Flat ₹50 off when you pay via PhonePe.",
    },
  ];

  const categories = [
    {
      label: "Medical Furniture",
      icon: <ProductDetailsIcons show={[0]} />,
      options: ["Hospital Bed", "Examination Table", "Stretcher"],
    },
  ];

 const getIcon = (name: string): JSX.Element | null => {
  switch (name) {
    case "Equipment":
      return <ProductDetailsIcons show={[4]} />;
    case "Consumables":
      return <ProductDetailsIcons show={[5]} />;
    case "Pharmaceutical":
      return <ProductDetailsIcons show={[6]} />;
    default:
      return null;
  }
};


  const logoutHandler = async () => {
    try {
      let url = "/api/v2/user/logout";
      if (seller) url = "/api/v2/shop/logout";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Something went wrong");
      removeUser();
      removeSeller();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <header className="w-11/12 mx-auto flex items-center justify-between h-24">
        <Logo />
        <div className="w-[402px] h-[42px] relative">
          <input
            type="text"
            placeholder="Search"
            className="w-full h-full pl-4 pr-10 text-sm rounded-full text-[#1C647C] bg-white outline-none"
          />
          <AiOutlineSearch size={28} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1C647C]" />
        </div>
        <div className="flex items-center gap-4">
          {!user && !seller ? (
            <Link to="/signup-seller">
              <ActionBtn>
                Become Seller <IoIosArrowForward className="ml-1" />
              </ActionBtn>
            </Link>
          ) : (
            <SecondryBtn onClick={logoutHandler}>Logout</SecondryBtn>
          )}
          <section className="flex items-center gap-4">
            <Link to="/">
              <div className="bg-[#006666] p-2 rounded-full">
                <AiOutlineHome size={24} color="white" />
              </div>
            </Link>
            <button onClick={() => setIsCartOpen((prev) => !prev)}>
              <div className="relative bg-[#006666] p-2 rounded-full">
                <AiOutlineShoppingCart size={24} color="white" />
                <span className="absolute -top-1 -right-1 bg-[#3bc177] w-4 h-4 text-white text-[10px] flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              </div>
            </button>
            <button onClick={() => setIsWishlistOpen((prev) => !prev)}>
              <div className="relative bg-[#006666] p-2 rounded-full">
                <AiOutlineHeart size={24} color="white" />
                <span className="absolute -top-1 -right-1 bg-[#3bc177] w-4 h-4 text-white text-[10px] flex items-center justify-center rounded-full">
                  {wishlist.length}
                </span>
              </div>
            </button>
           <div className="bg-[#006666] p-2 rounded-full">
  {user || seller ? (
    <Link to={isAdmin ? "/admin" : seller ? "/seller" : "/user"}>
      <ProfileAvatar src={seller?.avatar || user?.avatar} />
    </Link>
  ) : (
    <Link to="/login">
      <AiOutlineUser size={24} color="white" />
    </Link>
  )}
</div>

          </section>
        </div>
      </header>

      <div className="mx-auto text-center border-t mb-3">
        <div className="flex justify-center my-8">
          <div className="flex gap-[60px] bg-white border border-gray-300 rounded-full px-[19px] py-[5px] shadow-inner">
            {names.map((name) => (
              <button
                key={name}
                onClick={() => setSelectedName(name)}
                className={`flex items-center gap-2 px-10 py-2 text-lg rounded-full font-semibold transition ${
                  selectedName === name ? "bg-[#1C647C] text-white" : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                {getIcon(name)}
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-4 rounded-b-xl shadow-md bg-[#1C647C] text-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm font-bold">
            {categories.map((cat) => (
              <div key={cat.label} className="relative">
                <div className="absolute top-1/2 left-3 -translate-y-1/2 text-white">
                  {cat.icon}
                </div>
                <select className="w-full pl-10 pr-4 py-2 text-white rounded bg-[#1C647C] outline-none">
                  <option value="" disabled>{cat.label}</option>
                  {cat.options.map((opt) => (
                    <option key={opt} className="text-black bg-white">{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Section */}
      <div className="max-w-6xl mx-auto mt-6 flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-[40%]">
          <ProductImage />
        </div>

        <div className="w-full lg:w-[60%] space-y-4">
          <h2 className="text-2xl font-semibold">Women’s pleated short sleeve scrubs</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span style={{ color: "#FB9573" }}>★★★★☆</span>
            <span>(128 reviews)</span>
          </div>
          <div className="flex justify-between">
            <span className="line-through text-gray-400">₹790.00</span>
            <span className="text-orange-500 text-lg font-bold">₹499.00</span>
          </div>
          <div className="flex gap-2 items-center">
            <img src={offer} alt="Offer Icon" className="w-6 h-6" />
            <span>Offers</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {offers.map((offer) => (
              <div
                key={offer.title}
                className="border rounded p-2 text-sm cursor-pointer"
                onClick={() => setSelectedOffer(offer)}
              >
                <strong>{offer.title}</strong>
                <p className="text-xs text-gray-600">{offer.details}</p>
              </div>
            ))}
          </div>

          {selectedOffer && (
            <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg border-l p-5 z-50">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">{selectedOffer.title}</h2>
                <button onClick={() => setSelectedOffer(null)} className="text-xl">×</button>
              </div>
              <p>{selectedOffer.details}</p>
            </div>
          )}

          <CashOnDelivery />
        </div>
      </div>

      {/* Related Products */}
      <div className="max-w-6xl mx-auto mt-10">
        <h2 className="font-medium text-lg mb-4">Related Products</h2>
        <div className="flex flex-wrap justify-around">
          {relatedProducts.map((product) => (
            <RelatedProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </>
  );
}

function ProfileAvatar({ src }: { src?: string }) {
  const imageUrl = src?.startsWith("http") ? src : `${BASE_URL}/${src ?? "placeholder.png"}`;
  return (
    <img
      src={imageUrl}
      alt="profile avatar"
      className="w-[35px] h-[35px] rounded-full border bg-white"
      width={35}
    />
  );
}

