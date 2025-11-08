import React, { useState } from "react";
import {
  FiHome,
  FiTag,
  FiShoppingCart,
  FiPhone,
  FiMenu,
  FiX,
} from "react-icons/fi";
import VegBazarLogo from "../../public/vegbazar.svg";
import { useOrderContext } from "../Context/OrderContext";
import { RiShoppingBag4Fill } from "react-icons/ri";
import { GiBasket } from "react-icons/gi";
import { MdLocalShipping } from "react-icons/md";


const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { navigate } = useOrderContext();

  return (
    <nav className="fixed top-0 left-0 w-full z-40 bg-white text-[#023D01] shadow-md shadow-[#023D01]/20 transition-colors duration-300">
      <div className="container max-w-7xl mx-auto px-4 pt-2 flex items-center justify-between">
        {/* Logo Section */}
        <div
          onClick={() => navigate("/")}
          className="flex flex-col items-center justify-center cursor-pointer select-none transition-transform hover:scale-105"
          style={{ fontFamily: "Trirong, serif" }}
        >
          <img
            src={VegBazarLogo}
            alt="VegBazar"
            className="w-6 sm:w-7 md:w-8 lg:w-9"
          />
          <span className="text-[#023D01] backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md text-xs sm:text-sm md:text-base font-semibold tracking-wide">
            VegBazar
          </span>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
          <li
            onClick={() => navigate("/")}
            className="flex items-center font-assistant gap-1 cursor-pointer hover:text-green-600 transition"
          >
            <FiHome className="w-4 h-4" /> Home
          </li>
          <li
            onClick={() => navigate("/offers")}
            className="flex items-center font-assistant gap-1 cursor-pointer hover:text-green-600 transition"
          >
            <GiBasket className="w-4 h-4" /> Basket
          </li>
          <li
            onClick={() => navigate("/vegetables")}
            className="flex items-center font-assistant gap-1 cursor-pointer hover:text-green-600 transition"
          >
            <RiShoppingBag4Fill className="w-4 h-4" /> Vegetables
          </li>
          <li
            onClick={() => navigate("/veg-bag")}
            className="flex items-center font-assistant gap-1 cursor-pointer hover:text-green-600 transition"
          >
            <FiShoppingCart className="w-4 h-4" /> Cart
          </li>
          <li
            onClick={() => navigate("/track-your-order")}
            className="flex items-center font-assistant gap-1 cursor-pointer hover:text-green-600 transition"
          >
            <MdLocalShipping className="w-4 h-4" /> Track Order
          </li>
          <li
            onClick={() => navigate("/Help")}
            className="flex items-center font-assistant gap-1 cursor-pointer hover:text-green-600 transition"
          >
            <FiPhone className="w-4 h-4" /> Contact
          </li>
        </ul>

        {/* Desktop Button + Mobile Toggle */}
        <div className="flex items-center font-assistant gap-4">
          <button
            onClick={() => navigate("/vegetables")}
            className="hidden md:block bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold transition transform hover:-translate-y-0.5"
          >
            Shop Now
          </button>

          <button
            className="md:hidden text-2xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <FiX className="text-[#023D01]" />
            ) : (
              <FiMenu className="text-[#023D01]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-green-700 shadow-inner animate-slideDown">
          <ul className="flex flex-col gap-2 py-3 text-sm font-medium px-4">
            <li
              onClick={() => {
                navigate("/");
                setMobileMenuOpen(false);
              }}
              className="flex items-center font-assistant gap-2 py-2 border-b border-green-700"
            >
              <FiHome className="w-4 h-4" /> Home
            </li>
            <li
              onClick={() => {
                navigate("/offers");
                setMobileMenuOpen(false);
              }}
              className="flex items-center font-assistant gap-2 py-2 border-b border-green-700"
            >
              <GiBasket className="w-4 h-4" /> Basket
            </li>
            <li
              onClick={() => {
                navigate("/vegetables");
                setMobileMenuOpen(false);
              }}
              className="flex items-center font-assistant gap-2 py-2 border-b border-green-700"
            >
              <RiShoppingBag4Fill className="w-4 h-4" /> Vegetables
            </li>
            <li
              onClick={() => {
                navigate("/veg-bag");
                setMobileMenuOpen(false);
              }}
              className="flex items-center font-assistant gap-2 py-2 border-b border-green-700"
            >
              <FiShoppingCart className="w-4 h-4" /> Cart
            </li>
            <li
              onClick={() => {
                navigate("/track-your-order");
                setMobileMenuOpen(false);
              }}
              className="flex items-center font-assistant gap-2 py-2 border-b border-green-700"
            >
              <MdLocalShipping className="w-4 h-4" /> Track Order
            </li>
            <li
              onClick={() => {
                navigate("/help");
                setMobileMenuOpen(false);
              }}
              className="flex items-center font-assistant gap-2 py-2 border-b border-green-700"
            >
              <FiPhone className="w-4 h-4" /> Contact
            </li>

            <button
              onClick={() => {
                navigate("/vegetables");
                setMobileMenuOpen(false);
              }}
              className="mt-3 w-full font-assistant bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-full font-semibold"
            >
              Shop Now
            </button>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
