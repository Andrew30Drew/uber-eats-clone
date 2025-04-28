import React, { useState } from "react";

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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {/* Restaurant info header */}
        {restaurant && (
          <div className="flex items-center gap-4 p-4 border-b">
            {restaurant.logo && (
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
                className="w-12 h-12 rounded-full object-cover border"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-lg">{restaurant.name}</span>
                {restaurant.badges &&
                  restaurant.badges.map((badge) => (
                    <span
                      key={badge}
                      className="bg-pink-500 text-white text-xs px-2 py-1 rounded ml-1"
                    >
                      {badge}
                    </span>
                  ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {restaurant.rating !== undefined && (
                  <span className="flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    {restaurant.rating.toFixed(1)}
                  </span>
                )}
                {restaurant.reviewCount !== undefined && (
                  <span>({restaurant.reviewCount})</span>
                )}
                {restaurant.cuisine && (
                  <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs ml-2">
                    {restaurant.cuisine}
                  </span>
                )}
              </div>
              {(restaurant.deliveryTimeMin || restaurant.deliveryTimeMax) && (
                <div className="text-xs text-gray-500 mt-1">
                  {restaurant.deliveryTimeMin || 15}-
                  {restaurant.deliveryTimeMax || 30} min delivery
                </div>
              )}
              {restaurant.serviceCharge && (
                <div className="text-xs text-gray-500 mt-1">
                  Service charge: ${restaurant.serviceCharge.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Image */}
        {menuItem.image && (
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-t-lg overflow-hidden">
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
          </div>
        )}
        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">{menuItem.name}</h2>
          <p className="text-gray-600 mb-4">{menuItem.description}</p>
          {/* Ingredients/allergens section if available */}
          {menuItem.ingredients && (
            <div className="mb-4 text-sm text-gray-700">
              <span className="font-semibold">Ingredients:</span>{" "}
              {menuItem.ingredients}
            </div>
          )}
          {menuItem.allergens && (
            <div className="mb-4 text-sm text-red-600">
              <span className="font-semibold">Allergens:</span>{" "}
              {menuItem.allergens}
            </div>
          )}
          <div className="text-xl font-semibold mb-4">
            ${basePrice.toFixed(2)}
          </div>

          {/* Options */}
          {menuItem.options && menuItem.options.length > 0 && (
            <div className="mb-4">
              {menuItem.options.map((group) => (
                <div key={group.name} className="mb-3">
                  <div className="flex items-center mb-1">
                    <span className="font-medium">{group.name}</span>
                    {group.required && (
                      <span className="ml-2 text-xs text-pink-600 bg-pink-100 px-2 py-0.5 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {group.choices.map((choice) => (
                      <label
                        key={choice.label}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={group.name}
                          value={choice.label}
                          checked={selectedOptions[group.name] === choice.label}
                          onChange={() =>
                            handleOptionChange(group.name, choice.label)
                          }
                          className="mr-2 accent-primary"
                        />
                        <span>{choice.label}</span>
                        {choice.price > 0 && (
                          <span className="ml-2 text-gray-500 text-sm">
                            +${choice.price}
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
            <div className="mb-4">
              <div className="flex items-center mb-1">
                <span className="font-medium">Often ordered together</span>
                <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  Optional
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {menuItem.addOns.map((addOn) => (
                  <label
                    key={addOn.label}
                    className="flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={addOn.label}
                      checked={selectedAddOns.includes(addOn.label)}
                      onChange={() => handleAddOnChange(addOn.label)}
                      className="mr-2 accent-primary"
                    />
                    <span>{addOn.label}</span>
                    <span className="ml-2 text-gray-500 text-sm">
                      +${addOn.price}
                    </span>
                    <span
                      className="ml-1 text-gray-400 cursor-pointer"
                      title="More info about this add-on"
                    >
                      &#9432;
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector */}
          <div className="flex items-center mb-6">
            <button
              className="px-3 py-1 bg-gray-200 rounded-l hover:bg-gray-300"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity === 1}
            >
              -
            </button>
            <span className="px-4 py-1 border-t border-b border-gray-200 bg-white">
              {quantity}
            </span>
            <button
              className="px-3 py-1 bg-gray-200 rounded-r hover:bg-gray-300"
              onClick={() => setQuantity((q) => q + 1)}
            >
              +
            </button>
          </div>

          {/* Add to cart button */}
          <button
            className={`w-full py-3 rounded-md text-white font-semibold text-lg transition-colors ${
              allRequiredSelected
                ? "bg-primary hover:bg-primary-hover"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            onClick={handleAddToCart}
            disabled={!allRequiredSelected}
          >
            Add to cart (${totalPrice.toFixed(2)})
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemModal;
