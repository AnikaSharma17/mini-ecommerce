import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./App.css";

// --- CUSTOM HOOK: useDebounce (Bonus) ---
// Delays updating the search term until the user stops typing
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// --- COMPONENT: Product Card ---
// Memoized to prevent re-renders when Cart state changes, 
// unless this specific product's props change.
const ProductCard = React.memo(({ product, addToCart }) => {
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="product-card">
      <div className="image-container">
        <img src={product.thumbnail} alt={product.title} loading="lazy" />
        {isOutOfStock && <span className="badge-oos">Out of Stock</span>}
      </div>
      <div className="product-info">
        <span className="category">{product.category}</span>
        <h3>{product.title}</h3>
        <div className="price-row">
          <span className="price">${product.price}</span>
          <span className="stock-info">Stock: {product.stock}</span>
        </div>
        <button
          className="btn-primary"
          onClick={() => addToCart(product)}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? "Sold Out" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
});

// --- COMPONENT: Cart Item ---
const CartItem = ({ item, updateQuantity, removeFromCart }) => {
  return (
    <div className="cart-item">
      <div className="cart-item-info">
        <h4>{item.title}</h4>
        <span className="cart-price">${(item.price * item.quantity).toFixed(2)}</span>
      </div>
      <div className="cart-controls">
        <div className="quantity-wrapper">
          <button 
            onClick={() => updateQuantity(item.id, item.quantity - 1, item.stock)}
            disabled={item.quantity <= 1}
          >-</button>
          <span>{item.quantity}</span>
          <button 
            onClick={() => updateQuantity(item.id, item.quantity + 1, item.stock)}
            disabled={item.quantity >= item.stock}
          >+</button>
        </div>
        <button className="btn-remove" onClick={() => removeFromCart(item.id)}>
          Remove
        </button>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT: App ---
export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // -- Filter States --
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300); // 300ms delay
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState(""); // '' | 'low' | 'high'

  // -- Cart State (Initialize from LocalStorage - Bonus) --
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // -- 1. Data Fetching --
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Using dummyjson as it provides 'stock' data which acts as inventory
        const res = await fetch("https://dummyjson.com/products?limit=20");
        const data = await res.json();
        setProducts(data.products);
      } catch (err) {
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // -- 2. Persist Cart (Bonus) --
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // -- 3. Filter & Sort Logic --
  // We derive unique categories from the product list
  const categories = useMemo(() => {
    return ["all", ...new Set(products.map((p) => p.category))];
  }, [products]);

  // This is the derived list displayed in UI. 
  // Efficiently recalculates only when dependencies change.
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => 
        p.title.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
      .filter((p) => 
        selectedCategory === "all" || p.category === selectedCategory
      )
      .sort((a, b) => {
        if (sortOrder === "low") return a.price - b.price;
        if (sortOrder === "high") return b.price - a.price;
        return 0;
      });
  }, [products, debouncedSearch, selectedCategory, sortOrder]);

  // -- 4. Cart Handlers --
  
  // Callback for adding items (Passed to memoized ProductCard)
  const addToCart = useCallback((product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity < product.stock) {
          return prevCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return prevCart; // Max stock reached
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, newQty, maxStock) => {
    if (newQty < 1 || newQty > maxStock) return;
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortOrder("");
  };

  // -- 5. Calculated Totals --
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="app-container">
      {/* --- HEADER --- */}
      <header className="header">
        <h1>Mini Shop</h1>
        <div className="cart-summary-badge">
          🛒 {totalItems} Items | ${totalPrice.toFixed(2)}
        </div>
      </header>

      <div className="main-layout">
        {/* --- LEFT: PRODUCT LISTING --- */}
        <main className="product-section">
          {/* Controls / Filter Bar */}
          <div className="controls">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="select-input"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="select-input"
            >
              <option value="">Sort by Price</option>
              <option value="low">Low to High</option>
              <option value="high">High to Low</option>
            </select>

            <button onClick={clearFilters} className="btn-secondary">
              Clear Filters
            </button>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <p>No products found matching your criteria.</p>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  addToCart={addToCart}
                />
              ))}
            </div>
          )}
        </main>

        {/* --- RIGHT: CART SIDEBAR --- */}
        <aside className="cart-sidebar">
          <h2>Your Cart</h2>
          {cart.length === 0 ? (
            <div className="empty-cart-state">
              <p>Your cart is empty.</p>
            </div>
          ) : (
            <div className="cart-items-container">
              {cart.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  updateQuantity={updateQuantity}
                  removeFromCart={removeFromCart}
                />
              ))}
            </div>
          )}
          
          <div className="cart-footer">
            <div className="cart-total-row">
              <span>Total:</span>
              <span className="total-amount">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}