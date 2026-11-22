"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import {
  addItem,
  cartItemCount,
  cartSubtotal,
  loadCart,
  removeItem,
  saveCart,
  updateQty,
  type CartItem,
} from "@/lib/cart";

type ProductVariant = {
  label: string;
  price: number;
};

type CategoryRef = {
  _id: string;
  name: string;
  slug: string;
};

type Category = CategoryRef & {
  displayOrder?: number;
};

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  variants: ProductVariant[];
  images: string[];
  category: CategoryRef | string;
};

type PlacedOrderItem = {
  name: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type PlacedOrder = {
  orderNumber: string;
  totalAmount: number;
  subtotal: number;
  deliveryFee: number;
  paymentStatus: string;
  orderStatus: string;
  items: PlacedOrderItem[];
};

const WHATSAPP_NUMBER = "918266906688";
const UPI_ID = "8266906688@ybl";
const PAYEE_NAME = "The Chai Adda";
// Matches DELIVERY_FEE in server/controllers/orderController.js.
// The backend recalculates this when the order is created.
const DELIVERY_FEE = 30;

function categoryName(product: Product): string {
  if (product.category && typeof product.category === "object") {
    return product.category.name;
  }
  return "Menu";
}

function formatRupees(amount: number): string {
  return Number.isInteger(amount) ? `₹${amount}` : `₹${amount.toFixed(2)}`;
}

function selectedVariantLabel(product: Product, selected: Record<string, string>): string {
  const chosen = selected[product._id];
  if (chosen && product.variants.some((variant) => variant.label === chosen)) {
    return chosen;
  }
  return product.variants[0]?.label ?? "";
}

function unitPriceFor(product: Product, variantLabel: string): number {
  const variant = product.variants.find(
    (item) => item.label.toLowerCase() === variantLabel.toLowerCase()
  );
  return variant ? variant.price : product.price;
}

function priceLabel(product: Product): string {
  if (product.variants.length === 0) return formatRupees(product.price);
  if (product.variants.length === 1) return formatRupees(product.variants[0].price);
  return product.variants.map((variant) => formatRupees(variant.price)).join(" / ");
}

function reconcileCartPrices(cart: CartItem[], products: Product[]): CartItem[] {
  let changed = false;
  const next = cart.map((item) => {
    const product = products.find((entry) => entry._id === item.productId);
    if (!product) return item;
    const hasVariant = item.variantLabel.length > 0;
    const variant = hasVariant
      ? product.variants.find(
          (entry) => entry.label.toLowerCase() === item.variantLabel.toLowerCase()
        )
      : undefined;
    if (hasVariant && !variant) return item;
    const unitPrice = variant ? variant.price : product.price;
    if (unitPrice === item.unitPrice) return item;
    changed = true;
    return { ...item, unitPrice };
  });
  return changed ? next : cart;
}

function whatsappMessage(details: {
  order: PlacedOrder;
  customerName: string;
  customerPhone: string;
  orderType: "pickup" | "delivery";
  deliveryAddress: string;
  specialInstructions: string;
  utr: string;
}): string {
  const lines = details.order.items
    .map((item) => {
      const variant = item.variantLabel ? ` (${item.variantLabel})` : "";
      return `${item.name}${variant} x ${item.quantity} = ${formatRupees(item.lineTotal)}`;
    })
    .join("\n");

  return `Hello The Chai Adda! I have made a UPI payment and would like to submit my order for verification.

Order Number: ${details.order.orderNumber}
Customer Name: ${details.customerName}
Customer Phone: ${details.customerPhone}
Order Type: ${details.orderType.toUpperCase()}
${details.orderType === "delivery" ? `Delivery Address: ${details.deliveryAddress}` : "Collection: Pickup"}
Special Instructions: ${details.specialInstructions || "None"}

ORDER DETAILS:
${lines}

TOTAL AMOUNT: ${formatRupees(details.order.totalAmount)}
UPI ID: ${UPI_ID}
Transaction Reference / UTR: ${details.utr}

PAYMENT STATUS: PENDING OWNER VERIFICATION
Please verify the payment in your account and confirm or reject my order. Thank you!`;
}

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [utr, setUtr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const [verificationUrl, setVerificationUrl] = useState("");

  const loadMenu = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [productResult, categoryResult] = await Promise.allSettled([
        api.get<{ success: boolean; message?: string; products?: Product[] }>("/products", {
          params: { available: true, limit: 100 },
        }),
        api.get<{ success: boolean; categories?: Category[] }>("/categories"),
      ]);

      if (productResult.status === "rejected") {
        setProducts([]);
        setLoadError(getApiErrorMessage(productResult.reason, "Could not load the menu. Please try again."));
        return;
      }

      const productData = productResult.value.data;
      if (!productData.success) {
        setProducts([]);
        setLoadError(productData.message || "Could not load the menu. Please try again.");
        return;
      }

      setProducts(productData.products ?? []);

      if (categoryResult.status === "fulfilled" && categoryResult.value.data.success) {
        setCategories(categoryResult.value.data.categories ?? []);
      } else {
        setCategories([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMenu();
  }, [loadMenu]);

  useEffect(() => {
    setCart(loadCart());
    setCartReady(true);
  }, []);

  useEffect(() => {
    if (!cartReady) return;
    saveCart(cart);
  }, [cart, cartReady]);

  useEffect(() => {
    if (!cartReady || products.length === 0) return;
    setCart((current) => reconcileCartPrices(current, products));
  }, [cartReady, products]);

  const categoryOptions = useMemo(() => {
    if (categories.length > 0) {
      return ["All", ...categories.map((category) => category.name)];
    }
    const names = products.map(categoryName).filter((name, index, all) => all.indexOf(name) === index);
    return ["All", ...names];
  }, [categories, products]);

  useEffect(() => {
    if (activeCategory !== "All" && !categoryOptions.includes(activeCategory)) {
      setActiveCategory("All");
    }
  }, [activeCategory, categoryOptions]);

  const filteredItems = useMemo(() => {
    const query = search.toLowerCase().trim();
    return products.filter((item) => {
      const matchesCategory = activeCategory === "All" || categoryName(item) === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, search]);

  const menuLoaded = !loading && !loadError;

  const addToCart = (product: Product) => {
    const variantLabel = selectedVariantLabel(product, selectedVariants);
    setCart((previousCart) =>
      addItem(previousCart, {
        productId: product._id,
        name: product.name,
        variantLabel,
        unitPrice: unitPriceFor(product, variantLabel),
        quantity: 1,
        image: product.images?.[0],
      })
    );
  };

  const increaseQuantity = (cartKey: string) => {
    setCart((previousCart) => {
      const item = previousCart.find((entry) => entry.cartKey === cartKey);
      if (!item) return previousCart;
      return updateQty(previousCart, cartKey, item.quantity + 1);
    });
  };

  const decreaseQuantity = (cartKey: string) => {
    setCart((previousCart) => {
      const item = previousCart.find((entry) => entry.cartKey === cartKey);
      if (!item) return previousCart;
      return updateQty(previousCart, cartKey, item.quantity - 1);
    });
  };

  const removeFromCart = (cartKey: string) => {
    setCart((previousCart) => removeItem(previousCart, cartKey));
  };

  const totalItems = cartItemCount(cart);
  const subtotal = cartSubtotal(cart);
  const deliveryFee = orderType === "delivery" ? DELIVERY_FEE : 0;
  const estimatedTotal = subtotal + deliveryFee;

  const upiPaymentUrl = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${estimatedTotal}&cu=INR&tn=${encodeURIComponent("The Chai Adda order")}`;

  const placeOrder = async () => {
    setOrderError("");
    setPlacedOrder(null);
    setVerificationUrl("");

    if (cart.length === 0) {
      setOrderError("Please add at least one item to your cart.");
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setOrderError("Please enter your name and phone number.");
      return;
    }

    if (!/^[0-9]{10}$/.test(customerPhone.trim())) {
      setOrderError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (orderType === "delivery" && !deliveryAddress.trim()) {
      setOrderError("Please enter your delivery address.");
      return;
    }

    if (!utr.trim()) {
      setOrderError("After paying, enter your UPI transaction reference (UTR).");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post<{
        success: boolean;
        message?: string;
        order?: PlacedOrder;
      }>("/orders", {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        orderType,
        deliveryAddress: orderType === "delivery" ? deliveryAddress.trim() : "",
        specialInstructions: specialInstructions.trim(),
        items: cart.map((item) => ({
          productId: item.productId,
          variantLabel: item.variantLabel,
          quantity: item.quantity,
        })),
        utr: utr.trim(),
      });

      if (!data.success || !data.order?.orderNumber) {
        setOrderError(data.message || "The restaurant did not confirm this order. Nothing was placed.");
        return;
      }

      const message = whatsappMessage({
        order: data.order,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        orderType,
        deliveryAddress: deliveryAddress.trim(),
        specialInstructions: specialInstructions.trim(),
        utr: utr.trim(),
      });

      setPlacedOrder(data.order);
      setVerificationUrl(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`);
      setCart([]);
    } catch (error) {
      setOrderError(getApiErrorMessage(error, "The order was not placed. Please try again."));
    } finally {
      setSubmitting(false);
    }
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
          {categoryOptions.map((category) => (
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

        {loading && (
          <p className="menu-empty" role="status">
            Loading the menu...
          </p>
        )}

        {!loading && loadError && (
          <div className="menu-empty" role="alert">
            <p>{loadError}</p>
            <button type="button" className="menu-retry" onClick={() => void loadMenu()}>
              Try again
            </button>
          </div>
        )}

        {menuLoaded && (
          <>
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
                const variantLabel = selectedVariantLabel(item, selectedVariants);
                const itemNumber = String(
                  products.findIndex((product) => product._id === item._id) + 1
                ).padStart(2, "0");

                return (
                  <article
                    className="full-menu-card"
                    key={item._id}
                  >
                    <div className="full-menu-card-top">
                      <span className="full-menu-category">
                        {categoryName(item)}
                      </span>

                      <span className="full-menu-number">
                        {itemNumber}
                      </span>
                    </div>

                    <div className="full-menu-info">
                      <div className="full-menu-title-row">
                        <h3>{item.name}</h3>
                        <strong>{priceLabel(item)}</strong>
                      </div>

                      <p>{item.description}</p>

                      {item.variants.length > 1 && (
                        <div className="cart-price-selector">
                          <label htmlFor={`variant-${item._id}`}>
                            Choose option:
                          </label>
                          <select
                            id={`variant-${item._id}`}
                            value={variantLabel}
                            onChange={(event) =>
                              setSelectedVariants((previous) => ({
                                ...previous,
                                [item._id]: event.target.value,
                              }))
                            }
                          >
                            {item.variants.map((variant) => (
                              <option key={variant.label} value={variant.label}>
                                {variant.label} — {formatRupees(variant.price)}
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
                {products.length === 0
                  ? "No dishes are available right now."
                  : "No items found. Try another search."}
              </p>
            )}

            <p className="menu-price-note">
              * Menu prices come from The Chai Adda. Delivery orders include a ₹30
              delivery fee, which is confirmed when the order is placed.
            </p>
          </>
        )}
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
                {cart.map((item) => {
                  const product = products.find((entry) => entry._id === item.productId);
                  const missingProduct = menuLoaded && !product;
                  const missingVariant = Boolean(
                    product &&
                      item.variantLabel &&
                      !product.variants.some(
                        (variant) => variant.label.toLowerCase() === item.variantLabel.toLowerCase()
                      )
                  );

                  return (
                    <div className="cart-item" key={item.cartKey}>
                      <div className="cart-item-details">
                        <h4>{item.name}</h4>
                        <p>
                          {item.variantLabel ? `${item.variantLabel} · ` : ""}
                          {formatRupees(item.unitPrice)} each
                        </p>
                        <strong>
                          {formatRupees(item.unitPrice * item.quantity)}
                        </strong>
                        {(missingProduct || missingVariant) && (
                          <p className="cart-item-warning">
                            This item may no longer be available. Remove it or choose another option.
                          </p>
                        )}
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
                  );
                })}
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
              <strong>{formatRupees(subtotal)}</strong>
            </div>

            {orderType === "delivery" && (
              <div className="checkout-total-row">
                <span>Delivery fee</span>
                <strong>{formatRupees(deliveryFee)}</strong>
              </div>
            )}

            <div className="checkout-grand-total">
              <span>Estimated Total</span>
              <strong>{formatRupees(estimatedTotal)}</strong>
            </div>

            <p className="checkout-note">
              Pay the exact amount using UPI. The restaurant calculates the final
              total when you submit. Your payment stays pending until The Chai Adda
              verifies it and accepts the order.
            </p>

            {placedOrder && (
              <div className="order-success" role="status">
                <h4>Order submitted</h4>
                <p>
                  Order number: <strong>{placedOrder.orderNumber}</strong>
                </p>
                <p>
                  Confirmed total: <strong>{formatRupees(placedOrder.totalAmount)}</strong>
                </p>
                <p>
                  Payment status: pending verification. This payment has not been marked as paid.
                </p>
                {verificationUrl && (
                  <a
                    className="whatsapp-order-button order-whatsapp-link"
                    href={verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>☏</span> Send verification on WhatsApp
                  </a>
                )}
              </div>
            )}

            {orderError && (
              <p className="order-error" role="alert">
                {orderError}
              </p>
            )}

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
              <p className="upi-amount">Amount to pay: {formatRupees(estimatedTotal)}</p>
              <p className="upi-id-line">
                UPI ID: <strong>{UPI_ID}</strong>
              </p>
              <a
                className="upi-pay-button"
                href={upiPaymentUrl}
              >
                Pay {formatRupees(estimatedTotal)} via UPI
              </a>
              <p className="upi-help">
                Open your UPI app, complete the payment, then return here and
                enter the UTR above. Do not submit until payment is complete.
              </p>
            </div>

            <button
              type="button"
              className="whatsapp-order-button"
              onClick={() => void placeOrder()}
              disabled={cart.length === 0 || submitting}
            >
              <span>☏</span> {submitting ? "Submitting order..." : "Submit Order for Verification"}
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

        .add-cart-button,
        .menu-retry {
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

        .menu-retry {
          width: auto;
          min-width: 140px;
        }

        .add-cart-button:hover,
        .menu-retry:hover {
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

        .cart-item-warning {
          color: #a44c3c !important;
          margin-top: 6px !important;
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

        .order-success {
          margin: 0 0 18px;
          padding: 16px;
          border-radius: 12px;
          background: #f3faf5;
          border: 1px solid #b7dfc6;
          color: #176c3c;
        }

        .order-success h4 {
          margin: 0 0 8px;
          font-size: 17px;
        }

        .order-success p {
          margin: 0 0 8px;
          font-size: 13px;
          line-height: 1.5;
        }

        .order-error {
          margin: 0 0 16px;
          padding: 12px 14px;
          border-radius: 10px;
          background: #fff4f2;
          border: 1px solid #efc7c0;
          color: #a44c3c;
          font-size: 13px;
          line-height: 1.5;
        }

        .order-whatsapp-link {
          display: block;
          text-align: center;
          text-decoration: none;
          box-sizing: border-box;
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
