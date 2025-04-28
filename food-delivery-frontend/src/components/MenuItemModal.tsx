import React, { useState, useEffect } from "react";
import {
  X,
  Heart,
  Star,
  Clock,
  Tag,
  Plus,
  Minus,
  ShoppingBag,
  Info,
  AlertCircle,
  Check,
} from "lucide-react";

interface OptionChoice {
  label: string;
  price: number;
}

interface OptionGroup {
  name: string;
  required: boolean;
  choices: OptionChoice[];
}

interface AddOn {
  label: string;
  price: number;
}

interface RestaurantInfo {
  name: string;
  logo?: string | null;
  rating?: number;
  reviewCount?: number;
  cuisine?: string;
  badges?: string[];
  deliveryTimeMin?: number;
  deliveryTimeMax?: number;
  serviceCharge?: number;
}

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string | null;
  options?: OptionGroup[];
  addOns?: AddOn[];
  ingredients?: string;
  allergens?: string;
}

interface MenuItemModalProps {
  menuItem: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: any) => void;
  restaurant?: RestaurantInfo;
}

const MenuItemModal: React.FC<MenuItemModalProps> = ({
  menuItem,
  isOpen,
  onClose,
  onAddToCart,
  restaurant,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: string;
  }>({});
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  // Reset state when modal opens with a new item
  useEffect(() => {
    if (isOpen && menuItem) {
      setSelectedOptions({});
      setSelectedAddOns([]);
      setQuantity(1);
      setIsAddedToCart(false);
    }
  }, [isOpen, menuItem]);

  if (!isOpen || !menuItem) return null;

  // Calculate total price
  const basePrice = menuItem.price;
  const optionPrice =
    menuItem.options?.reduce((sum, group) => {
      const selected = selectedOptions[group.name];
      const choice = group.choices.find((c) => c.label === selected);
      return sum + (choice ? choice.price : 0);
    }, 0) || 0;
  const addOnsPrice =
    menuItem.addOns?.reduce((sum, addOn) => {
      return sum + (selectedAddOns.includes(addOn.label) ? addOn.price : 0);
    }, 0) || 0;
  const totalPrice = (basePrice + optionPrice + addOnsPrice) * quantity;

  // Check if all required options are selected
  const allRequiredSelected = (menuItem.options || []).every(
    (group) => !group.required || selectedOptions[group.name]
  );

  const handleOptionChange = (groupName: string, label: string) => {
    setSelectedOptions((prev) => ({ ...prev, [groupName]: label }));
  };

  const handleAddOnChange = (label: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleAddToCart = () => {
    if (!allRequiredSelected) return;
    onAddToCart({
      ...menuItem,
      selectedOptions,
      selectedAddOns,
      quantity,
      totalPrice,
    });

    // Show success animation
    setIsAddedToCart(true);

    // Close modal after animation
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto relative max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success overlay that shows after adding to cart */}
        {isAddedToCart && (
          <div className="absolute inset-0 bg-primary/95 z-20 flex flex-col items-center justify-center animate-fade-in text-white">
            <div className="rounded-full bg-white/20 p-4 mb-4">
              <Check className="h-12 w-12" />
            </div>
            <p className="text-xl font-bold mb-2">Added to cart!</p>
            <p className="text-white/80 mb-6">
              {menuItem.name} × {quantity}
            </p>
          </div>
        )}

        {/* Close button */}
        <button
          className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-gray-100 transition-colors shadow-md text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Restaurant info header */}
        {restaurant && (
          <div className="flex items-center gap-4 p-5 border-b border-gray-100 bg-white/90 backdrop-blur-sm relative z-[5]">
            {restaurant.logo && (
              <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 shadow-sm">
                <img
                  src={
                    restaurant.logo.startsWith("http") ||
                    restaurant.logo.startsWith("/uploads/")
                      ? `http://localhost:30006${
                          restaurant.logo.startsWith("/")
                            ? restaurant.logo
                            : `/${restaurant.logo}`
                        }`
                      : `data:image/jpeg;base64,${restaurant.logo}`
                  }
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-lg truncate">
                  {restaurant.name}
                </span>
              </div>
              <div className="flex items-center flex-wrap gap-2 text-sm text-gray-700">
                {restaurant.rating !== undefined && (
                  <span className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span>{restaurant.rating.toFixed(1)}</span>
                    {restaurant.reviewCount !== undefined && (
                      <span className="text-gray-500 ml-1">
                        ({restaurant.reviewCount})
                      </span>
                    )}
                  </span>
                )}
                {restaurant.cuisine && (
                  <span className="flex items-center">
                    <Tag className="h-3.5 w-3.5 text-gray-400 mr-1" />
                    <span>{restaurant.cuisine}</span>
                  </span>
                )}
                {(restaurant.deliveryTimeMin || restaurant.deliveryTimeMax) && (
                  <span className="flex items-center">
                    <Clock className="h-3.5 w-3.5 text-gray-400 mr-1" />
                    <span>
                      {restaurant.deliveryTimeMin || 15}-
                      {restaurant.deliveryTimeMax || 30} min
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Show badges as pills */}
            {restaurant.badges && restaurant.badges.length > 0 && (
              <div className="absolute top-4 right-12 flex flex-col gap-2 items-end">
                {restaurant.badges.map((badge) => (
                  <span
                    key={badge}
                    className="bg-gradient-to-r from-primary/80 to-pink-500/80 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Image section */}
        {menuItem.image && (
          <div className="relative w-full h-64 md:h-80 bg-gray-50 overflow-hidden">
            <img
              src={
                menuItem.image.startsWith("http") ||
                menuItem.image.startsWith("/uploads/")
                  ? `http://localhost:30006${
                      menuItem.image.startsWith("/")
                        ? menuItem.image
                        : `/${menuItem.image}`
                    }`
                  : `data:image/jpeg;base64,${menuItem.image}`
              }
              alt={menuItem.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            <button className="absolute bottom-4 right-4 p-2.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
              <Heart className="h-5 w-5 text-white" />
            </button>
          </div>
        )}

        {/* Scrollable content container */}
        <div className="flex-1 overflow-y-auto">
          {/* Content */}
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">
              {menuItem.name}
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              {menuItem.description}
            </p>

            {/* Ingredients/allergens section if available */}
            <div className="space-y-3 mb-6">
              {menuItem.ingredients && (
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 flex">
                  <Info className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium block text-gray-800 mb-1">
                      Ingredients
                    </span>
                    {menuItem.ingredients}
                  </div>
                </div>
              )}
              {menuItem.allergens && (
                <div className="bg-red-50 p-3 rounded-lg text-sm text-red-700 flex">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium block text-red-800 mb-1">
                      Allergens
                    </span>
                    {menuItem.allergens}
                  </div>
                </div>
              )}
            </div>

            <div className="text-xl font-bold mb-6 text-primary">
              ${basePrice.toFixed(2)}
            </div>

            {/* Options */}
            {menuItem.options && menuItem.options.length > 0 && (
              <div className="mb-6">
                {menuItem.options.map((group) => (
                  <div
                    key={group.name}
                    className="mb-4 bg-gray-50 p-4 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-gray-800">
                        {group.name}
                      </span>
                      {group.required && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                          Required
                        </span>
                      )}
                    </div>
                    <div className="space-y-2.5">
                      {group.choices.map((choice) => (
                        <label
                          key={choice.label}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                            selectedOptions[group.name] === choice.label
                              ? "bg-primary/10 border border-primary/20"
                              : "bg-white border border-gray-200 hover:border-primary/20"
                          }`}
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name={group.name}
                              value={choice.label}
                              checked={
                                selectedOptions[group.name] === choice.label
                              }
                              onChange={() =>
                                handleOptionChange(group.name, choice.label)
                              }
                              className="mr-3 h-4 w-4 accent-primary"
                            />
                            <span className="font-medium text-gray-800">
                              {choice.label}
                            </span>
                          </div>
                          {choice.price > 0 && (
                            <span className="font-medium text-primary text-sm">
                              +${choice.price.toFixed(2)}
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add-ons */}
            {menuItem.addOns && menuItem.addOns.length > 0 && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-800">
                    Add extras
                  </span>
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full font-medium">
                    Optional
                  </span>
                </div>
                <div className="space-y-2.5">
                  {menuItem.addOns.map((addOn) => (
                    <label
                      key={addOn.label}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                        selectedAddOns.includes(addOn.label)
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-white border border-gray-200 hover:border-primary/20"
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          value={addOn.label}
                          checked={selectedAddOns.includes(addOn.label)}
                          onChange={() => handleAddOnChange(addOn.label)}
                          className="mr-3 h-4 w-4 accent-primary rounded"
                        />
                        <span className="font-medium text-gray-800">
                          {addOn.label}
                        </span>
                      </div>
                      <span className="font-medium text-primary text-sm">
                        +${addOn.price.toFixed(2)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity selector */}
            <div className="flex items-center justify-between mb-6 bg-gray-50 p-4 rounded-lg">
              <span className="font-semibold text-gray-800">Quantity</span>
              <div className="flex items-center">
                <button
                  className="w-9 h-9 flex items-center justify-center bg-white rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity === 1}
                >
                  <Minus className="h-4 w-4 text-gray-700" />
                </button>
                <span className="w-12 text-center font-bold text-gray-800">
                  {quantity}
                </span>
                <button
                  className="w-9 h-9 flex items-center justify-center bg-white rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <Plus className="h-4 w-4 text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky footer for add to cart button */}
        <div className="sticky bottom-0 border-t border-gray-100 bg-white p-4 flex items-center justify-between shadow-lg">
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-1">Total price</div>
            <div className="text-xl font-bold text-gray-900">
              ${totalPrice.toFixed(2)}
            </div>
          </div>
          <button
            className={`px-6 py-3 rounded-lg text-white font-semibold text-base transition-all flex items-center shadow-lg ${
              allRequiredSelected
                ? "bg-gradient-to-r from-primary to-pink-600 hover:shadow-primary/30 transform hover:-translate-y-0.5 active:translate-y-0"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            onClick={handleAddToCart}
            disabled={!allRequiredSelected}
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemModal;
