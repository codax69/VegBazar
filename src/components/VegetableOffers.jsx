// src/components/VegetableOffers.jsx — Rebuilt VegetableOffers with v2 hairline border, Fraunces titles, mono price ledger tags, and Inter typography
import React, { useEffect, useState } from "react";
import { Package, Check, ShoppingCart, Leaf, Tag } from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";
import axios from "axios";

const VegetableOffers = () => {
  const { setSelectedOffer, setVegetableOrder, setSelectedVegetables, navigate } =
    useOrderContext();
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await axios.get(`/api/baskets`);
        const basketsData = response.data.data?.baskets || response.data.baskets || [];
        setOffers(basketsData);
      } catch (error) {
        console.error("Error fetching offers:", error);
      }
    };
    fetchOffers();
  }, []);

  const handleOfferClick = async (offer) => {
    try {
      await axios.post(`/api/baskets/click/${offer._id}`);
    } catch (error) {
      console.error("Error tracking offer click:", error);
    }
  };

  useEffect(() => {
    setVegetableOrder([]);
    setSelectedVegetables([]);
  }, []);

  const handleOfferSelect = async (offer) => {
    window.scrollTo(0, 0);
    setSelectedOffer(offer);
    handleOfferClick(offer);
    navigate("/select-vegetables");
  };

  return (
    <div className="max-w-6xl mx-auto py-5   sm:py-10 px-3 font-body transition-colors duration-150">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-4 sm:mb-6 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[var(--color-brand-green)] rounded-full mb-2">
            <Package className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-[var(--color-text-primary)] mb-1">
            Choose Your Basket
          </h2>
          <p className="text-[var(--color-text-secondary)] text-xs sm:text-sm font-body px-4">
            Select the best vegetable package that suits your needs
          </p>
        </div>

        {/* Loading State */}
        {!offers || offers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--color-text-muted)] text-xs sm:text-sm">Loading offers...</p>
          </div>
        ) : (
          <>
            {/* Offers Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {offers.map((offer) => (
                <div
                  key={offer._id}
                  className="group relative bg-[var(--color-bg-surface)] rounded-[12px] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors duration-150 cursor-pointer overflow-hidden flex flex-col"
                  onClick={() => handleOfferSelect(offer)}
                >
                  {/* Header with Icon */}
                  <div className="bg-[var(--color-tint-green)] p-4 text-center relative overflow-hidden flex-shrink-0">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-[var(--color-bg-surface)] rounded-full border border-[var(--color-border)] mb-2 group-hover:scale-105 transition-transform">
                      <ShoppingCart className="w-5 h-5 text-[var(--color-brand-green)]" />
                    </div>
                    <h3 className="text-base font-display font-semibold text-[var(--color-text-primary)] mb-1">
                      {offer.title}
                    </h3>
                    <div className="flex font-body items-center justify-center gap-1 text-[var(--color-text-secondary)] text-xs">
                      <Leaf className="w-3.5 h-3.5" />
                      <span>{offer.vegetables?.length || 0} vegetables</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    {/* Price Tag Ledger */}
                    <div className="text-center mb-3 flex-shrink-0">
                      <span className="font-mono font-medium text-lg sm:text-xl text-[var(--color-text-primary)] border border-dashed border-[var(--color-border-strong)] rounded-[6px] px-3 py-1 inline-block">
                        ₹{offer.price}
                      </span>
                    </div>

                    {/* Description */}
                    {offer.description && (
                      <p className="text-[var(--color-text-secondary)] font-body text-xs text-center mb-3 leading-relaxed flex-shrink-0">
                        {offer.description}
                      </p>
                    )}

                    {/* Vegetables List */}
                    {offer.vegetables && offer.vegetables.length > 0 && (
                      <div className="bg-[var(--color-bg-app)] rounded-[8px] p-3 mb-3 border border-[var(--color-border)] flex-shrink-0">
                        <p className="text-xs font-medium text-[var(--color-text-primary)] mb-2 flex items-center gap-1.5 font-body">
                          <Check className="w-3.5 h-3.5 text-[var(--color-brand-green)]" />
                          What's Included:
                        </p>
                        <ul className="space-y-1 font-body text-xs text-[var(--color-text-secondary)]">
                          {offer.vegetables.slice(0, 3).map((veg, index) => (
                            <li
                              key={veg._id || index}
                              className="flex items-center gap-1.5 truncate"
                            >
                              <div className="w-1 h-1 rounded-full bg-[var(--color-brand-green)] flex-shrink-0" />
                              <span className="truncate">
                                {veg.vegetable?.name || veg.name || 'Vegetable'}
                              </span>
                            </li>
                          ))}
                          {offer.vegetables.length > 3 && (
                            <li className="text-[var(--color-brand-green)] font-medium flex items-center gap-1.5 text-[11px]">
                              <div className="w-1 h-1 rounded-full bg-[var(--color-brand-green)] flex-shrink-0" />
                              +{offer.vegetables.length - 3} more vegetables
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Select Button */}
                    <button
                      aria-label={`Select ${offer.title} package`}
                      className="w-full font-body bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white font-medium py-2.5 px-3 rounded-[10px] transition-colors flex items-center justify-center gap-1.5 text-xs mt-auto"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Select Package
                    </button>
                  </div>

                  {/* Popular Badge */}
                  {offer.popular && (
                    <div className="absolute top-2 right-2 bg-[var(--color-amber)] text-[var(--color-amber-ink)] text-[10px] font-mono font-medium px-2 py-0.5 rounded-full">
                      Popular
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Info Footer */}
            <div className="mt-6 text-center px-2">
              <div className="bg-[var(--color-bg-surface)] rounded-[12px] p-4 max-w-2xl mx-auto border border-[var(--color-border)]">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Leaf className="w-4 h-4 text-[var(--color-brand-green)]" />
                  <h3 className="text-sm font-display font-semibold text-[var(--color-text-primary)]">
                    Farm Fresh Quality
                  </h3>
                </div>
                <p className="text-[var(--color-text-muted)] text-xs font-body leading-relaxed">
                  All packages include farm-fresh produce delivered directly to your doorstep. You can customize your selection in the next step.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VegetableOffers;