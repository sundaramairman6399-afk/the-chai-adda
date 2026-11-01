
"use client";

import { useMemo, useState } from "react";

type MenuItem = {
  id: number;
  name: string;
  category: string;
  price: string;
  description: string;
};

type CartItem = {
  cartKey: string;
  id: number;
  name: string;
  price: number;
  quantity: number;
};

const menuItems: MenuItem[] = [
  // PIZZA
  { id: 1, name: "Margarita Pizza", category: "Pizza", price: "₹160 / ₹240 / ₹310", description: "Classic margarita pizza." },
  { id: 2, name: "Tomato Pizza", category: "Pizza", price: "₹170 / ₹260 / ₹350", description: "Pizza topped with tomato." },
  { id: 3, name: "Multiveg Pizza", category: "Pizza", price: "₹180 / ₹290 / ₹370", description: "Pizza with mixed vegetables." },
  { id: 4, name: "Special Heart Pizza", category: "Pizza", price: "₹310 / ₹380", description: "Our special heart-shaped pizza." },
  { id: 5, name: "Cheese Paneer Pizza", category: "Pizza", price: "₹310 / ₹390", description: "Cheese and paneer pizza." },

  // BURGER
  { id: 6, name: "Veg Burger", category: "Burger", price: "₹90", description: "Classic vegetable burger." },
  { id: 7, name: "Veg Paneer Burger", category: "Burger", price: "₹110", description: "Vegetable burger with paneer." },
  { id: 8, name: "Cheese Burger", category: "Burger", price: "₹115", description: "Burger loaded with cheese." },
  { id: 9, name: "Cheese Paneer Burger", category: "Burger", price: "₹120", description: "Paneer and cheese burger." },

  // SANDWICH
  { id: 10, name: "Veg Sandwich", category: "Sandwich", price: "₹100", description: "Fresh vegetable sandwich." },
  { id: 11, name: "Veg Paneer Sandwich", category: "Sandwich", price: "₹110", description: "Vegetable and paneer sandwich." },
  { id: 12, name: "Veg Cheese Sandwich", category: "Sandwich", price: "₹120", description: "Vegetable sandwich with cheese." },
  { id: 13, name: "Cheese Paneer Sandwich", category: "Sandwich", price: "₹130", description: "Paneer sandwich with cheese." },
  { id: 14, name: "Pizza Sandwich", category: "Sandwich", price: "₹180", description: "Pizza-style sandwich." },

  // PETTIES
  { id: 15, name: "Aloo Peties", category: "Petties", price: "₹70", description: "Potato-filled crispy snack." },
  { id: 16, name: "Paneer Peties", category: "Petties", price: "₹80", description: "Paneer-filled snack." },
  { id: 17, name: "Cheese Peties", category: "Petties", price: "₹90", description: "Cheese-filled snack." },

  // CHINESE
  { id: 18, name: "Chowmeen", category: "Chinese", price: "₹110", description: "Classic Chinese noodles." },
  { id: 19, name: "Paneer Chowmeen", category: "Chinese", price: "₹150", description: "Noodles with paneer." },
  { id: 20, name: "Hakka Noodle", category: "Chinese", price: "₹130", description: "Hakka-style noodles." },
  { id: 21, name: "Spicy Schezwan Noodle", category: "Chinese", price: "₹130", description: "Spicy Schezwan noodles." },
  { id: 22, name: "Chilli Potato", category: "Chinese", price: "₹160", description: "Crispy potato in chilli sauce." },
  { id: 23, name: "Honey Chilli Potato", category: "Chinese", price: "₹160", description: "Crispy potato with honey chilli sauce." },
  { id: 24, name: "Chilli Paneer", category: "Chinese", price: "₹190", description: "Paneer tossed in chilli sauce." },

  // SOUTH INDIAN
  { id: 25, name: "Masala Dosa", category: "South Indian", price: "₹120", description: "Dosa with potato masala." },
  { id: 26, name: "Paneer Dosa", category: "South Indian", price: "₹130", description: "Dosa filled with paneer." },
  { id: 27, name: "Chinese Dosa", category: "South Indian", price: "₹140", description: "Dosa with Chinese-style filling." },
  { id: 28, name: "Veg Uttapam", category: "South Indian", price: "₹130", description: "Uttapam topped with vegetables." },
  { id: 29, name: "Paneer Uttapam", category: "South Indian", price: "₹140", description: "Uttapam topped with paneer." },

  // NASTA
  { id: 30, name: "Aloo Paratha", category: "Nasta", price: "₹90", description: "Potato-stuffed paratha." },
  { id: 31, name: "Paneer Paratha", category: "Nasta", price: "₹100", description: "Paneer-stuffed paratha." },
  { id: 32, name: "Mix Veg Paratha", category: "Nasta", price: "₹110", description: "Paratha stuffed with mixed vegetables." },
  { id: 33, name: "Special Cheese Paratha", category: "Nasta", price: "₹140", description: "Special paratha with cheese." },

  // BITES
  { id: 34, name: "Pav Bhaji", category: "Bites", price: "₹120", description: "Mumbai-style pav bhaji." },
  { id: 35, name: "French Fries", category: "Bites", price: "₹100", description: "Crispy golden French fries." },
  { id: 36, name: "Cheese Pav Bhaji", category: "Bites", price: "₹120", description: "Pav bhaji topped with cheese." },
  { id: 37, name: "Plain Maggi", category: "Bites", price: "₹105", description: "Classic Maggi noodles." },
  { id: 38, name: "Butter Maggi", category: "Bites", price: "₹115", description: "Maggi prepared with butter." },
  { id: 39, name: "Cheese Maggi", category: "Bites", price: "₹130", description: "Maggi topped with cheese." },
];

const categories = [
  "All",
  "Pizza",
  "Burger",
  "Sandwich",
  "Petties",
  "Chinese",
  "South Indian",
  "Nasta",
  "Bites",
];

const WHATSAPP_NUMBER = "918266906688";
const UPI_ID = "8266906688@ybl";
const PAYEE_NAME = "The Chai Adda";

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<Record<number, number>>({});
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [utr, setUtr] = useState("");

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;

      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase().trim());

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  const getPrices = (priceText: string): number[] => {
    return (priceText.match(/\d+/g) || []).map(Number);
  };

  const addToCart = (item: MenuItem) => {
    const prices = getPrices(item.price);
    const price = selectedPrices[item.id] ?? prices[0];
    const cartKey = `${item.id}-${price}`;

    setCart((previousCart) => {
      const existingItem = previousCart.find(
        (cartItem) => cartItem.cartKey === cartKey
      );

      if (existingItem) {
        return previousCart.map((cartItem) =>
          cartItem.cartKey === cartKey
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [
        ...previousCart,
        {
          cartKey,
          id: item.id,
          name: item.name,
          price,
          quantity: 1,
        },
      ];
    });
  };

  const increaseQuantity = (cartKey: string) => {
    setCart((previousCart) =>
      previousCart.map((item) =>
        item.cartKey === cartKey
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (cartKey: string) => {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (cartKey: string) => {
    setCart((previousCart) =>
      previousCart.filter((item) => item.cartKey !== cartKey)
    );
  };

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const upiPaymentUrl = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${totalPrice}&cu=INR&tn=${encodeURIComponent("The Chai Adda order")}`;

  const placeOrder = () => {
    if (cart.length === 0) {
      alert("Please add at least one item to your cart.");
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Please enter your name and phone number.");
      return;
    }

    if (!/^[0-9]{10}$/.test(customerPhone.trim())) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    if (orderType === "delivery" && !deliveryAddress.trim()) {
      alert("Please enter your delivery address.");
      return;
    }

    if (!utr.trim()) {
      alert("After paying, enter your UPI transaction reference (UTR).");
      return;
    }

    const orderLines = cart
      .map(
        (item) =>
          `${item.name} x ${item.quantity} = ₹${item.price * item.quantity}`
      )
      .join("\n");

    const message = `Hello The Chai Adda! I have made a UPI payment and would like to submit my order for verification.

Customer Name: ${customerName.trim()}
Customer Phone: ${customerPhone.trim()}
Order Type: ${orderType.toUpperCase()}
${orderType === "delivery" ? `Delivery Address: ${deliveryAddress.trim()}` : "Collection: Pickup"}
Special Instructions: ${specialInstructions.trim() || "None"}

ORDER DETAILS:
${orderLines}

Total Items: ${totalItems}
TOTAL AMOUNT: ₹${totalPrice}
UPI ID: ${UPI_ID}
Transaction Reference / UTR: ${utr.trim()}

PAYMENT STATUS: PENDING OWNER VERIFICATION
Please verify the payment in your account and confirm or reject my order. Thank you!`;

    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;

    window.location.href = whatsappURL;
  };

  return (
    <main className="full-menu-page">
      <header className="menu-page-header">
        <a href="/" className="menu-back-link">
          ← Back to Home
        </a>

        <a href="/" className="menu-page-brand">
          <img
            src="/chai-adda-logo.jpg"
            alt="The Chai Adda"
          />
          <span>
            THE CHAI <strong>ADDA</strong>
          </span>
        </a>

        <span className="menu-header-caption">
          FEEL THE TASTE OF KHULHAD
        </span>
      </header>

      <section className="menu-hero">
        <span className="eyebrow">
          MADE FRESH, SERVED WITH LOVE
        </span>

        <h1>
          A Menu Full of
          <br />
          <span>Goodness.</span>
        </h1>

        <p>
          From delicious pizzas and burgers to your favourite
          Indian snacks, discover something special at The Chai Adda.
        </p>

        <div className="menu-hero-decoration">
          <span>GOOD FOOD</span>
          <span>•</span>
          <span>GREAT TASTE</span>
          <span>•</span>
          <span>GOOD TIMES</span>
        </div>
      </section>

      <section className="menu-catalog">
        <div className="catalog-heading">
          <div>
            <span className="eyebrow">
              EXPLORE OUR SELECTION
            </span>

            <h2>
              Find Your <span>Favourite.</span>
            </h2>
          </div>

          <p>
            Something delicious is always waiting for you.
          </p>
        </div>

        <div className="menu-search-wrap">
          <span>⌕</span>
          <input
            type="search"
            placeholder="Search your favourite food..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search menu items"
          />
        </div>

        <div className="menu-filters">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={
                activeCategory === category
                  ? "menu-filter active"
                  : "menu-filter"
              }
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="catalog-result">
          <span>
            {activeCategory === "All"
              ? "Our Full Menu"
              : activeCategory}
          </span>
          <span>{filteredItems.length} ITEMS</span>
        </div>

        <div className="full-menu-grid">
          {filteredItems.map((item) => {
            const prices = getPrices(item.price);
            const selectedPrice = selectedPrices[item.id] ?? prices[0];

            return (
              <article
                className="full-menu-card"
                key={item.id}
              >
                <div className="full-menu-card-top">
                  <span className="full-menu-category">
                    {item.category}
                  </span>

                  <span className="full-menu-number">
                    {String(item.id).padStart(2, "0")}
                  </span>
                </div>

                <div className="full-menu-info">
                  <div className="full-menu-title-row">
                    <h3>{item.name}</h3>
                    <strong>
                      {prices.length === 1
                        ? `₹${prices[0]}`
                        : item.price}
                    </strong>
                  </div>

                  <p>{item.description}</p>

                  {prices.length > 1 && (
                    <div className="cart-price-selector">
                      <label htmlFor={`price-${item.id}`}>
                        Choose price:
                      </label>
                      <select
                        id={`price-${item.id}`}
                        value={selectedPrice}
                        onChange={(event) =>
                          setSelectedPrices((previous) => ({
                            ...previous,
                            [item.id]: Number(event.target.value),
                          }))
                        }
                      >
                        {prices.map((price, index) => (
                          <option key={`${price}-${index}`} value={price}>
                            ₹{price}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    type="button"
                    className="add-cart-button"
                    onClick={() => addToCart(item)}
                  >
                    <span>+</span> Add to Cart
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <p className="menu-empty">
            No items found. Try another search.
          </p>
        )}

        <p className="menu-price-note">
          * Prices include an additional ₹30 per product.
          Pizza price options each include the ₹30 increase.
        </p>
      </section>

      {/* SHOPPING CART */}
      <section className="shopping-cart-section" id="cart">
        <div className="cart-heading">
          <span className="eyebrow">YOUR ORDER</span>
          <h2>
            Your Shopping <span>Cart.</span>
          </h2>
          <p>
            Review your favourite items before placing your order.
          </p>
        </div>

        <div className="cart-container">
          <div className="cart-items-area">
            <div className="cart-topline">
              <h3>Your Items</h3>
              <span>{totalItems} items</span>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <span>🛒</span>
                <h3>Your cart is empty</h3>
                <p>
                  Add something delicious from our menu!
                </p>
              </div>
            ) : (
              <div className="cart-list">
                {cart.map((item) => (
                  <div className="cart-item" key={item.cartKey}>
                    <div className="cart-item-details">
                      <h4>{item.name}</h4>
                      <p>₹{item.price} each</p>
                      <strong>
                        ₹{item.price * item.quantity}
                      </strong>
                    </div>

                    <div className="cart-item-actions">
                      <div className="quantity-control">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(item.cartKey)}
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          onClick={() => increaseQuantity(item.cartKey)}
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="remove-cart-button"
                        onClick={() => removeFromCart(item.cartKey)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <button
                type="button"
                className="clear-cart-button"
                onClick={() => setCart([])}
              >
                Clear Cart
              </button>
            )}
          </div>

          <div className="checkout-area">
            <h3>Order Summary</h3>

            <div className="checkout-total-row">
              <span>Total Items</span>
              <strong>{totalItems}</strong>
            </div>

            <div className="checkout-total-row">
              <span>Subtotal</span>
              <strong>₹{totalPrice}</strong>
            </div>

            <div className="checkout-grand-total">
              <span>Total Amount</span>
              <strong>₹{totalPrice}</strong>
            </div>

            <p className="checkout-note">
              Pay the exact amount using UPI. Your order is not confirmed until
              The Chai Adda verifies the payment and accepts the order.
            </p>

            <div className="customer-form">
              <label htmlFor="customer-name">
                Your Name
              </label>
              <input
                id="customer-name"
                type="text"
                placeholder="Enter your name"
                value={customerName}
                onChange={(event) =>
                  setCustomerName(event.target.value)
                }
              />

              <label htmlFor="order-type">Order Type</label>
              <select
                id="order-type"
                value={orderType}
                onChange={(event) =>
                  setOrderType(event.target.value as "pickup" | "delivery")
                }
              >
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
              </select>

              {orderType === "delivery" && (
                <>
                  <label htmlFor="delivery-address">Delivery Address</label>
                  <textarea
                    id="delivery-address"
                    rows={3}
                    placeholder="Enter your complete delivery address"
                    value={deliveryAddress}
                    onChange={(event) => setDeliveryAddress(event.target.value)}
                  />
                </>
              )}

              <label htmlFor="special-instructions">Special Instructions (optional)</label>
              <textarea
                id="special-instructions"
                rows={2}
                placeholder="Any notes for your order?"
                value={specialInstructions}
                onChange={(event) => setSpecialInstructions(event.target.value)}
              />

              <label htmlFor="customer-phone">
                Phone Number
              </label>
              <input
                id="customer-phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={customerPhone}
                onChange={(event) =>
                  setCustomerPhone(
                    event.target.value.replace(/\D/g, "").slice(0, 10)
                  )
                }
              />

              <label htmlFor="utr">UPI Transaction Reference / UTR</label>
              <input
                id="utr"
                type="text"
                placeholder="Enter UTR after completing payment"
                value={utr}
                onChange={(event) => setUtr(event.target.value.trim())}
              />
            </div>

            <div className="upi-payment-box">
              <h4>Pay securely using UPI</h4>
              <p className="upi-amount">Amount to pay: ₹{totalPrice}</p>
              <p className="upi-id-line">
                UPI ID: <strong>{UPI_ID}</strong>
              </p>
              <a
                className="upi-pay-button"
                href={upiPaymentUrl}
              >
                Pay ₹{totalPrice} via UPI
              </a>
              <p className="upi-help">
                Open your UPI app, complete the payment, then return here and
                enter the UTR above. Do not submit until payment is complete.
              </p>
            </div>

            <button
              type="button"
              className="whatsapp-order-button"
              onClick={placeOrder}
              disabled={cart.length === 0}
            >
              <span>☏</span> Submit Order for Verification
            </button>

            <p className="whatsapp-number-note">
              Orders sent to +91 8266906688
            </p>
          </div>
        </div>
      </section>

      <section className="menu-page-cta">
        <span className="eyebrow">
          GOOD TIMES START HERE
        </span>

        <h2>
          Chai. Friends. <span>Memories.</span>
        </h2>

        <p>
          Bring your favourite people and enjoy the little
          moments that make life special.
        </p>

        <a href="/" className="menu-home-button">
          Back to The Chai Adda
        </a>
      </section>

      <footer className="menu-page-footer">
        <p>THE CHAI ADDA</p>
        <span>FEEL THE TASTE OF KHULHAD</span>
        <small>
          © 2026 The Chai Adda. All rights reserved.
        </small>
      </footer>

      <style jsx>{`
        .cart-price-selector {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 14px 0;
          flex-wrap: wrap;
        }

        .cart-price-selector label {
          font-size: 13px;
          color: #68452f;
          font-weight: 600;
        }

        .cart-price-selector select {
          padding: 8px 12px;
          border: 1px solid #d9ad65;
          border-radius: 8px;
          background: #fff;
          color: #3b281d;
          font: inherit;
        }

        .add-cart-button {
          width: 100%;
          margin-top: 14px;
          padding: 12px 16px;
          border: none;
          border-radius: 9px;
          background: #68452f;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .add-cart-button:hover {
          background: #3b281d;
          transform: translateY(-2px);
        }

        .add-cart-button span {
          font-size: 18px;
          margin-right: 5px;
        }

        .shopping-cart-section {
          padding: 80px 7%;
          background: #f1e7d8;
          color: #3b281d;
        }

        .cart-heading {
          text-align: center;
          margin-bottom: 38px;
        }

        .cart-heading h2 {
          font-size: clamp(30px, 4vw, 44px);
          margin: 12px 0;
        }

        .cart-heading h2 span {
          color: #9b6845;
        }

        .cart-heading p {
          color: #827366;
        }

        .cart-container {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 25px;
          max-width: 1150px;
          margin: 0 auto;
          align-items: start;
        }

        .cart-items-area,
        .checkout-area {
          background: #fff;
          border-radius: 16px;
          padding: 25px;
          box-shadow: 0 8px 30px rgba(59, 40, 29, 0.07);
        }

        .cart-topline {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .cart-topline h3,
        .checkout-area h3 {
          font-size: 20px;
          margin: 0 0 15px;
        }

        .cart-topline span {
          color: #9b6845;
          font-weight: 600;
        }

        .empty-cart {
          text-align: center;
          padding: 40px 15px;
          color: #827366;
        }

        .empty-cart > span {
          font-size: 42px;
        }

        .empty-cart h3 {
          color: #68452f;
          margin-bottom: 8px;
        }

        .cart-item {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          align-items: center;
          padding: 18px 0;
          border-bottom: 1px solid #eee5db;
        }

        .cart-item-details h4 {
          margin: 0 0 5px;
          font-size: 16px;
        }

        .cart-item-details p {
          margin: 0 0 5px;
          color: #827366;
          font-size: 13px;
        }

        .cart-item-details strong {
          color: #9b6845;
        }

        .cart-item-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .quantity-control {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #e5d6c5;
          border-radius: 8px;
          padding: 4px 8px;
        }

        .quantity-control button {
          border: none;
          background: transparent;
          color: #68452f;
          font-size: 20px;
          cursor: pointer;
          min-width: 20px;
        }

        .quantity-control span {
          font-weight: 700;
        }

        .remove-cart-button,
        .clear-cart-button {
          border: none;
          background: transparent;
          color: #a44c3c;
          font-size: 12px;
          cursor: pointer;
          text-decoration: underline;
        }

        .clear-cart-button {
          margin-top: 18px;
        }

        .checkout-area h3 {
          margin-bottom: 25px;
        }

        .checkout-total-row,
        .checkout-grand-total {
          display: flex;
          justify-content: space-between;
          padding: 13px 0;
          border-bottom: 1px solid #eee5db;
        }

        .checkout-grand-total {
          border-bottom: none;
          margin-top: 10px;
          font-size: 19px;
          font-weight: 700;
          color: #68452f;
        }

        .checkout-note {
          color: #827366;
          font-size: 12px;
          line-height: 1.6;
          margin: 10px 0 20px;
        }

        .customer-form {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .customer-form label {
          font-size: 13px;
          font-weight: 700;
          color: #68452f;
          margin-top: 8px;
        }

        .customer-form input {
          width: 100%;
          box-sizing: border-box;
          padding: 12px;
          border: 1px solid #e5d6c5;
          border-radius: 8px;
          background: #fff;
          color: #3b281d;
          font: inherit;
          outline-color: #d9ad65;
        }

        .customer-form select,
        .customer-form textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 12px;
          border: 1px solid #e5d6c5;
          border-radius: 8px;
          background: #fff;
          color: #3b281d;
          font: inherit;
          outline-color: #d9ad65;
          resize: vertical;
        }

        .upi-payment-box {
          margin-top: 22px;
          padding: 18px;
          border: 1px solid #e5d6c5;
          border-radius: 12px;
          background: #fffaf3;
        }

        .upi-payment-box h4 {
          margin: 0 0 10px;
          color: #68452f;
          font-size: 17px;
        }

        .upi-amount {
          margin: 0 0 8px;
          font-weight: 700;
          color: #3b281d;
        }

        .upi-id-line {
          margin: 0 0 14px;
          color: #68452f;
          overflow-wrap: anywhere;
        }

        .upi-pay-button {
          display: block;
          width: 100%;
          box-sizing: border-box;
          padding: 13px;
          border-radius: 9px;
          background: #68452f;
          color: #fff;
          text-align: center;
          text-decoration: none;
          font-weight: 700;
        }

        .upi-pay-button:hover {
          background: #3b281d;
        }

        .upi-help {
          margin: 12px 0 0;
          color: #827366;
          font-size: 12px;
          line-height: 1.6;
        }

        .whatsapp-order-button {
          width: 100%;
          padding: 15px;
          margin-top: 22px;
          border: none;
          border-radius: 9px;
          background: #218c50;
          color: white;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .whatsapp-order-button:hover:not(:disabled) {
          background: #176c3c;
        }

        .whatsapp-order-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .whatsapp-order-button span {
          margin-right: 7px;
        }

        .whatsapp-number-note {
          text-align: center;
          color: #827366;
          font-size: 12px;
          margin-top: 12px;
        }

        @media (max-width: 760px) {
          .shopping-cart-section {
            padding: 55px 5%;
          }

          .cart-container {
            grid-template-columns: 1fr;
          }

          .cart-items-area,
          .checkout-area {
            padding: 19px;
          }

          .cart-item {
            align-items: flex-start;
          }
        }

        @media (max-width: 420px) {
          .cart-item {
            flex-direction: column;
          }

          .cart-item-actions {
            flex-direction: row;
            align-items: center;
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </main>
  );
}
