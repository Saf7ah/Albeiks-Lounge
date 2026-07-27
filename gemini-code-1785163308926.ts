import React, { useState, useEffect, useMemo, createContext, useContext } from "react";
import { 
  Shirt, Instagram, ShoppingBag, Plus, Search, X, ImageOff, Mail, 
  Lock, Truck, Zap, Star, Trash2, ShieldCheck, LogOut, Check 
} from "lucide-react";

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================
const CATEGORIES = ["All", "Tops", "Bottoms", "Dresses", "Knitwear", "Jackets", "Shoes", "Caps", "Accessories"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
const WAIST_SIZES = [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 36, 38, 40, 42];
const LENGTH_SIZES = [28, 30, 32, 34, 36];
const CAP_SIZES = ["S/M (54-57cm)", "L/XL (58-61cm)", "Adjustable / One Size"];
const CONTACT_EMAIL = "albeikabdulmalek3@gmail.com";
const REVIEW_WORD_LIMIT = 250;

const STANDARD_LIGHT = 6.00;  // Weight <= 1000g
const STANDARD_HEAVY = 10.00; // Weight > 1000g
const EXPRESS_FLAT = 15.00;

const INITIAL_LISTINGS = [
  {
    id: "item-1",
    title: "Archive Flannel Jacket",
    price: 85,
    category: "Jackets",
    size: "L",
    weight: 1200,
    description: "Heavyweight boxy cut archive flannel. Vintage wash with original distressing.",
    seller: "Albeiks Vault",
    photo: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80",
    instagram: "https://instagram.com",
    vinted: "",
    createdAt: Date.now() - 86400000
  },
  {
    id: "item-2",
    title: "Japanese Selvedge Denim W32 L32",
    price: 110,
    category: "Bottoms",
    size: "W32 L32",
    weight: 850,
    description: "14oz raw selvedge denim. Straight leg fit with custom hardware.",
    seller: "Albeiks Vault",
    photo: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    instagram: "",
    vinted: "https://vinted.com",
    createdAt: Date.now() - 172800000
  }
];

function calculateShipping(weightGrams, method) {
  if (method === "express") return EXPRESS_FLAT;
  const w = Number(weightGrams) || 0;
  return w > 1000 ? STANDARD_HEAVY : STANDARD_LIGHT;
}

function wordCount(str) {
  const trimmed = str.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

// ============================================================================
// GLOBAL STATE CONTEXT
// ============================================================================
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [listings, setListings] = useState(() => {
    const saved = localStorage.getItem("albeiks_listings");
    return saved ? JSON.parse(saved) : INITIAL_LISTINGS;
  });

  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem("albeiks_reviews");
    return saved ? JSON.parse(saved) : [];
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("albeiks_admin_auth") === "true";
  });

  useEffect(() => {
    localStorage.setItem("albeiks_listings", JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem("albeiks_reviews", JSON.stringify(reviews));
  }, [reviews]);

  const addListing = (item) => {
    const newItem = { ...item, id: `item-${Date.now()}`, createdAt: Date.now() };
    setListings((prev) => [newItem, ...prev]);
  };

  const deleteListing = (id) => {
    setListings((prev) => prev.filter((item) => item.id !== id));
  };

  const addReview = (review) => {
    const newReview = { ...review, id: `rev-${Date.now()}`, createdAt: Date.now() };
    setReviews((prev) => [newReview, ...prev]);
  };

  const login = (pin) => {
    if (pin === "078507") {
      setIsAuthenticated(true);
      sessionStorage.setItem("albeiks_admin_auth", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("albeiks_admin_auth");
  };

  return (
    <AppContext.Provider value={{
      listings, reviews, isAuthenticated, addListing, deleteListing, addReview, login, logout
    }}>
      {children}
    </AppContext.Provider>
  );
}

const useApp = () => useContext(AppContext);

// ============================================================================
// UI COMPONENTS
// ============================================================================

function Header({ currentView, setView }) {
  const { isAuthenticated, logout } = useApp();

  return (
    <header className="header-bar">
      <div className="header-container">
        <div className="brand-logo" onClick={() => setView("storefront")} style={{ cursor: "pointer" }}>
          <div className="logo-badge">AL</div>
          <div className="brand-titles">
            <span className="brand-name">ALBEIKS LOUNGE</span>
            <span className="brand-sub">ARCHIVE E-COMMERCE</span>
          </div>
        </div>

        <nav className="nav-actions">
          {currentView === "storefront" ? (
            <button className="nav-btn-secondary" onClick={() => setView("admin")}>
              <Lock size={14} /> {isAuthenticated ? "Seller Dashboard" : "Seller Portal"}
            </button>
          ) : (
            <button className="nav-btn-secondary" onClick={() => setView("storefront")}>
              <ShoppingBag size={14} /> Customer Storefront
            </button>
          )}

          {isAuthenticated && currentView === "admin" && (
            <button className="nav-btn-danger" onClick={logout}>
              <LogOut size={14} /> Exit Admin
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

function ProductCard({ listing, onSelectBuy, isOwner, onDelete }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="product-card">
      {isOwner && (
        <button 
          className="delete-card-btn" 
          onClick={(e) => { e.stopPropagation(); if (confirm("Remove piece from catalog?")) onDelete(listing.id); }}
          title="Delete Item"
        >
          <Trash2 size={13} />
        </button>
      )}

      <div className="product-image-wrap">
        {listing.photo && !imgError ? (
          <img src={listing.photo} alt={listing.title} onError={() => setImgError(true)} />
        ) : (
          <div className="image-fallback">
            <ImageOff size={28} strokeWidth={1.2} />
          </div>
        )}
        <div className="price-tag">€{Number(listing.price).toFixed(2)}</div>
      </div>

      <div className="product-details">
        <div className="product-meta">{listing.category} · Size {listing.size}</div>
        <h3 className="product-title">{listing.title}</h3>
        {listing.description && <p className="product-desc">{listing.description}</p>}
        <div className="seller-attribution">Archive Source: <strong>{listing.seller}</strong></div>

        <button className="buy-action-btn" onClick={() => onSelectBuy(listing)}>
          <ShoppingBag size={14} /> Acquire Piece
        </button>

        {(listing.instagram || listing.vinted) && (
          <div className="external-links">
            {listing.instagram && (
              <a href={listing.instagram} target="_blank" rel="noreferrer" className="ext-link">
                <Instagram size={12} /> Instagram
              </a>
            )}
            {listing.vinted && (
              <a href={listing.vinted} target="_blank" rel="noreferrer" className="ext-link">
                Vinted
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CheckoutModal({ listing, onClose }) {
  const [shippingMethod, setShippingMethod] = useState("standard");
  const shippingCost = calculateShipping(listing.weight, shippingMethod);
  const totalCost = (Number(listing.price) + shippingCost).toFixed(2);

  const mailtoBody = encodeURIComponent(
    `Hello Albeiks Lounge,\n\nI wish to purchase the following item:\n\n` +
    `Item: ${listing.title} (ID: ${listing.id})\n` +
    `Price: €${listing.price}\n` +
    `Shipping Method: ${shippingMethod.toUpperCase()} (€${shippingCost.toFixed(2)})\n` +
    `Total Amount: €${totalCost}\n\n` +
    `Please provide invoice payment instructions.`
  );

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-body">
        <div className="modal-header">
          <div>
            <div className="modal-subtitle">Acquisition Checkout</div>
            <h2 className="modal-title">{listing.title}</h2>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="checkout-summary">
          <div className="summary-row"><span>Base Item Price</span><span>€{Number(listing.price).toFixed(2)}</span></div>
          
          <div className="shipping-selector">
            <label className={`ship-option ${shippingMethod === "standard" ? "active" : ""}`}>
              <input 
                type="radio" 
                name="ship" 
                checked={shippingMethod === "standard"} 
                onChange={() => setShippingMethod("standard")} 
              />
              <div className="ship-info">
                <div className="ship-title"><Truck size={14} /> Standard Delivery</div>
                <div className="ship-desc">{listing.weight ? `${listing.weight}g` : "<1000g"}: €{calculateShipping(listing.weight, "standard").toFixed(2)}</div>
              </div>
            </label>

            <label className={`ship-option ${shippingMethod === "express" ? "active" : ""}`}>
              <input 
                type="radio" 
                name="ship" 
                checked={shippingMethod === "express"} 
                onChange={() => setShippingMethod("express")} 
              />
              <div className="ship-info">
                <div className="ship-title"><Zap size={14} /> Priority Express</div>
                <div className="ship-desc">Flat Rate Premium: €15.00</div>
              </div>
            </label>
          </div>

          <div className="summary-row"><span>Calculated Shipping</span><span>€{shippingCost.toFixed(2)}</span></div>
          <div className="summary-row total-row"><span>Total Investment</span><span>€{totalCost}</span></div>
        </div>

        <a 
          className="submit-btn" 
          style={{ display: "block", textAlign: "center", textDecoration: "none" }}
          href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Order Request: ${listing.title}`)}&body=${mailtoBody}`}
        >
          Dispatch Acquisition Request
        </a>
      </div>
    </div>
  );
}

function ReviewSection() {
  const { reviews, addReview } = useApp();
  const [name, setName] = useState("");
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const words = wordCount(text);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return setError("Name is required.");
    if (words === 0) return setError("Review body cannot be blank.");
    if (words > REVIEW_WORD_LIMIT) return setError(`Keep reviews under ${REVIEW_WORD_LIMIT} words.`);
    
    addReview({ name: name.trim(), stars, text: text.trim() });
    setName(""); setText(""); setStars(5); setError("");
  };

  const avgRating = reviews.length 
    ? (reviews.reduce((acc, r) => acc + r.stars, 0) / reviews.length).toFixed(1)
    : "5.0";

  return (
    <section className="reviews-wrapper">
      <div className="reviews-header">
        <div>
          <span className="section-eyebrow">Client Feedback</span>
          <h2 className="section-title">Lounge Reviews ({reviews.length})</h2>
        </div>
        <div className="avg-rating-box">
          <Star size={16} fill="#C83E2B" color="#C83E2B" />
          <span>{avgRating} / 5.0 Average</span>
        </div>
      </div>

      <form className="review-form" onSubmit={handleSubmit}>
        {error && <div className="form-error-banner">{error}</div>}
        <div className="form-row">
          <input 
            type="text" 
            placeholder="Your Name / Handle" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="form-input"
          />
          <select value={stars} onChange={(e) => setStars(Number(e.target.value))} className="form-input">
            {[5, 4, 3, 2, 1].map((num) => (
              <option key={num} value={num}>{num} Star{num > 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>
        <textarea 
          placeholder="Share your experience regarding item condition and delivery speed..." 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          rows={3} 
          className="form-input"
        />
        <div className="word-count-indicator">{words}/{REVIEW_WORD_LIMIT} words</div>
        <button type="submit" className="submit-btn-secondary">Submit Client Entry</button>
      </form>

      <div className="reviews-grid">
        {reviews.map((rev) => (
          <div key={rev.id} className="review-item-card">
            <div className="review-item-head">
              <strong>{rev.name}</strong>
              <div className="star-row">
                {Array.from({ length: rev.stars }).map((_, i) => (
                  <Star key={i} size={12} fill="#121212" color="#121212" />
                ))}
              </div>
            </div>
            <p className="review-item-body">{rev.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// MAIN VIEWS
// ============================================================================

function CustomerStorefront() {
  const { listings, deleteListing, isAuthenticated } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [checkoutItem, setCheckoutItem] = useState(null);

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
      const matchesQuery = !searchQuery.trim() || 
        `${item.title} ${item.seller} ${item.description}`.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [listings, selectedCategory, searchQuery]);

  return (
    <main className="storefront-layout">
      <section className="hero-banner">
        <span className="hero-eyebrow">CURATED SECONDHAND ARCHIVE</span>
        <h1 className="hero-headline">Timeless Apparel. Refined Aesthetics.</h1>
        <p className="hero-subtext">
          Browse our catalog of authentic, hand-picked garments. Dedicated to quality, heritage cuts, and modern streetwear culture.
        </p>
      </section>

      <section className="catalog-controls">
        <div className="search-bar">
          <Search size={16} color="#6B655A" />
          <input 
            type="text" 
            placeholder="Search catalog by keyword, piece title, or seller..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-pills">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat} 
              className={`pill-btn ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {filteredListings.length === 0 ? (
        <div className="empty-catalog-state">
          <h3>No items matching current parameters.</h3>
          <p>Try modifying your filter categories or clearing search terms.</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredListings.map((item) => (
            <ProductCard 
              key={item.id} 
              listing={item} 
              onSelectBuy={setCheckoutItem} 
              isOwner={isAuthenticated}
              onDelete={deleteListing}
            />
          ))}
        </div>
      )}

      <ReviewSection />

      {checkoutItem && (
        <CheckoutModal listing={checkoutItem} onClose={() => setCheckoutItem(null)} />
      )}
    </main>
  );
}

function SellerPortal() {
  const { isAuthenticated, login, addListing, listings, deleteListing } = useApp();
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Tops");
  const [size, setSize] = useState("M");
  const [waist, setWaist] = useState("30");
  const [length, setLength] = useState("32");
  const [capSize, setCapSize] = useState(CAP_SIZES[0]);
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [seller, setSeller] = useState("Albeiks Vault");
  const [photo, setPhoto] = useState("");
  const [instagram, setInstagram] = useState("");
  const [vinted, setVinted] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!login(pinInput)) {
      setPinError("Invalid Admin PIN Signature.");
      setPinInput("");
    } else {
      setPinError("");
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !price || isNaN(Number(price))) {
      return setFormError("Title and a numeric price are required.");
    }

    let finalSize = size;
    if (category === "Bottoms") finalSize = `W${waist} L${length}`;
    if (category === "Caps") finalSize = capSize;

    addListing({
      title: title.trim(),
      price: Number(price),
      category,
      size: finalSize,
      weight: Number(weight) || 0,
      description: description.trim(),
      seller: seller.trim() || "Albeiks Vault",
      photo: photo.trim(),
      instagram: instagram.trim(),
      vinted: vinted.trim()
    });

    setTitle(""); setPrice(""); setWeight(""); setDescription(""); setPhoto("");
    setFormError(""); setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="portal-auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Lock size={24} color="#C83E2B" />
            <h2>Seller Security Portal</h2>
            <p>Enter administrative passkey to access inventory mutation options.</p>
          </div>
          <form onSubmit={handleLoginSubmit}>
            {pinError && <div className="form-error-banner">{pinError}</div>}
            <input 
              type="password" 
              maxLength={6} 
              placeholder="Enter 6-Digit PIN" 
              value={pinInput} 
              onChange={(e) => setPinInput(e.target.value)} 
              className="form-input text-center"
            />
            <button type="submit" className="submit-btn mt-4">Authenticate Portal Access</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <main className="seller-dashboard-layout">
      <div className="dashboard-header">
        <div>
          <span className="section-eyebrow">Administrative Control</span>
          <h1 className="section-title">Inventory Management</h1>
        </div>
        <div className="system-status-pill">
          <ShieldCheck size={14} color="#2D5A27" /> Portal Authenticated
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <h3>Publish New Archive Item</h3>
          {formError && <div className="form-error-banner">{formError}</div>}
          {formSuccess && <div className="form-success-banner"><Check size={14} /> Item published to active catalog!</div>}

          <form onSubmit={handleAddSubmit} className="admin-form">
            <div className="form-row">
              <div className="form-field">
                <label>Item Title *</label>
                <input type="text" placeholder="e.g., Vintage Carhartt Detroit Jacket" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="form-field narrow">
                <label>Price (€) *</label>
                <input type="number" placeholder="120" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {category === "Bottoms" ? (
                <>
                  <div className="form-field narrow">
                    <label>Waist (W)</label>
                    <select value={waist} onChange={(e) => setWaist(e.target.value)}>
                      {WAIST_SIZES.map(w => <option key={w} value={w}>W{w}</option>)}
                    </select>
                  </div>
                  <div className="form-field narrow">
                    <label>Length (L)</label>
                    <select value={length} onChange={(e) => setLength(e.target.value)}>
                      {LENGTH_SIZES.map(l => <option key={l} value={l}>L{l}</option>)}
                    </select>
                  </div>
                </>
              ) : category === "Caps" ? (
                <div className="form-field">
                  <label>Cap Size</label>
                  <select value={capSize} onChange={(e) => setCapSize(e.target.value)}>
                    {CAP_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ) : (
                <div className="form-field narrow">
                  <label>Size</label>
                  <select value={size} onChange={(e) => setSize(e.target.value)}>
                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}

              <div className="form-field narrow">
                <label>Weight (g)</label>
                <input type="number" placeholder="650" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
            </div>

            <div className="form-field">
              <label>Description & Condition Flaws</label>
              <textarea rows={3} placeholder="Provide details regarding distressing, measurements, material..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="form-field">
              <label>Photo Resource URL</label>
              <input type="url" placeholder="https://images.unsplash.com/..." value={photo} onChange={(e) => setPhoto(e.target.value)} />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Seller Alias / Handle</label>
                <input type="text" value={seller} onChange={(e) => setSeller(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Instagram URL</label>
                <input type="url" placeholder="https://instagram.com/..." value={instagram} onChange={(e) => setInstagram(e.target.value)} />
              </div>
            </div>

            <button type="submit" className="submit-btn">Commit Piece to Live Storefront</button>
          </form>
        </div>

        <div className="dashboard-panel">
          <h3>Active Inventory ({listings.length})</h3>
          <div className="admin-inventory-list">
            {listings.map((item) => (
              <div key={item.id} className="admin-inventory-row">
                <div className="admin-item-info">
                  <strong>{item.title}</strong>
                  <span>{item.category} · Size {item.size} · €{item.price}</span>
                </div>
                <button className="delete-icon-btn" onClick={() => deleteListing(item.id)} title="Delete Item">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

export default function App() {
  const [currentView, setView] = useState("storefront");

  return (
    <AppProvider>
      <div className="app-viewport">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

          :root {
            --bg-primary: #F7F5F0;
            --bg-card: #FFFFFF;
            --text-dark: #121212;
            --text-muted: #6B655A;
            --accent-red: #C83E2B;
            --accent-green: #2D5A27;
            --border-color: #E2DDD3;
            --border-dark: #121212;
            --font-main: 'Inter', sans-serif;
            --font-mono: 'Space Mono', monospace;
          }

          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: var(--bg-primary); color: var(--text-dark); font-family: var(--font-main); -webkit-font-smoothing: antialiased; }

          .header-bar { background: var(--bg-card); border-bottom: 2px solid var(--border-dark); position: sticky; top: 0; z-index: 100; }
          .header-container { max-width: 1200px; margin: 0 auto; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; }
          .brand-logo { display: flex; align-items: center; gap: 12px; }
          .logo-badge { background: var(--text-dark); color: var(--bg-primary); font-family: var(--font-mono); font-weight: 700; padding: 6px 10px; border-radius: 4px; font-size: 14px; }
          .brand-titles { display: flex; flex-direction: column; }
          .brand-name { font-family: var(--font-mono); font-weight: 700; font-size: 16px; letter-spacing: 1px; }
          .brand-sub { font-size: 9px; color: var(--text-muted); letter-spacing: 1.5px; }

          .nav-actions { display: flex; gap: 10px; }
          .nav-btn-secondary { background: var(--bg-primary); border: 1.5px solid var(--border-dark); color: var(--text-dark); padding: 8px 14px; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; }
          .nav-btn-secondary:hover { background: var(--text-dark); color: var(--bg-primary); }
          .nav-btn-danger { background: #FDF2F0; border: 1.5px solid var(--accent-red); color: var(--accent-red); padding: 8px 14px; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; }

          .storefront-layout, .seller-dashboard-layout { max-width: 1200px; margin: 0 auto; padding: 30px 20px; }
          .hero-banner { border-bottom: 1.5px solid var(--border-color); padding-bottom: 24px; margin-bottom: 24px; }
          .hero-eyebrow { font-family: var(--font-mono); font-size: 11px; color: var(--accent-red); letter-spacing: 2px; }
          .hero-headline { font-family: var(--font-mono); font-size: 32px; font-weight: 700; margin: 8px 0; }
          .hero-subtext { color: var(--text-muted); font-size: 15px; max-width: 600px; }

          .catalog-controls { display: flex; flex-direction: column; gap: 16px; margin-bottom: 30px; }
          .search-bar { display: flex; align-items: center; gap: 10px; background: var(--bg-card); border: 1.5px solid var(--border-dark); border-radius: 6px; padding: 10px 14px; }
          .search-bar input { border: none; outline: none; background: transparent; font-size: 14px; width: 100%; font-family: var(--font-main); }
          .category-pills { display: flex; gap: 8px; flex-wrap: wrap; }
          .pill-btn { background: var(--bg-card); border: 1px solid var(--border-color); padding: 6px 14px; border-radius: 20px; font-size: 12px; cursor: pointer; font-family: var(--font-mono); }
          .pill-btn.active { background: var(--text-dark); color: var(--bg-primary); border-color: var(--text-dark); }

          .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; margin-bottom: 50px; }
          .product-card { background: var(--bg-card); border: 1.5px solid var(--border-dark); border-radius: 8px; overflow: hidden; position: relative; transition: transform 0.2s; }
          .product-card:hover { transform: translateY(-3px); }
          .delete-card-btn { position: absolute; top: 10px; right: 10px; z-index: 10; background: var(--accent-red); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
          
          .product-image-wrap { width: 100%; aspect-ratio: 4/3; background: var(--bg-primary); position: relative; overflow: hidden; }
          .product-image-wrap img { width: 100%; height: 100%; object-fit: cover; }
          .image-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
          .price-tag { position: absolute; bottom: 10px; right: 10px; background: var(--accent-red); color: white; font-family: var(--font-mono); font-weight: 700; font-size: 13px; padding: 4px 10px; border-radius: 4px; }

          .product-details { padding: 16px; }
          .product-meta { font-family: var(--font-mono); font-size: 11px; color: var(--accent-green); text-transform: uppercase; margin-bottom: 4px; }
          .product-title { font-size: 16px; font-weight: 700; margin-bottom: 6px; line-height: 1.3; }
          .product-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 12px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
          .seller-attribution { font-size: 11px; color: var(--text-muted); margin-bottom: 14px; }

          .buy-action-btn { width: 100%; background: var(--text-dark); color: var(--bg-primary); border: none; padding: 10px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
          .buy-action-btn:hover { background: var(--accent-green); }

          .external-links { display: flex; gap: 8px; margin-top: 10px; }
          .ext-link { font-size: 11px; text-decoration: none; color: var(--text-dark); border: 1px solid var(--border-color); padding: 4px 8px; border-radius: 4px; display: flex; align-items: center; gap: 4px; }

          .reviews-wrapper { background: var(--bg-card); border: 1.5px solid var(--border-dark); border-radius: 8px; padding: 24px; margin-top: 40px; }
          .reviews-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; }
          .avg-rating-box { display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 13px; font-weight: 700; }
          .review-form { display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px; }
          .form-row { display: flex; gap: 12px; }
          .form-input { border: 1.5px solid var(--border-color); border-radius: 6px; padding: 10px; font-size: 13px; font-family: var(--font-main); outline: none; flex: 1; }
          .form-input:focus { border-color: var(--text-dark); }
          .word-count-indicator { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-align: right; }
          .submit-btn-secondary { background: var(--text-dark); color: white; border: none; padding: 10px; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer; align-self: flex-start; }

          .reviews-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
          .review-item-card { border: 1px solid var(--border-color); border-radius: 6px; padding: 14px; background: var(--bg-primary); }
          .review-item-head { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }

          .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
          .modal-body { background: var(--bg-card); border: 2px solid var(--border-dark); border-radius: 8px; max-width: 480px; width: 100%; padding: 24px; }
          .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
          .modal-subtitle { font-family: var(--font-mono); font-size: 10px; color: var(--accent-red); text-transform: uppercase; }
          .modal-title { font-size: 20px; font-weight: 700; }
          .close-btn { background: none; border: none; cursor: pointer; }

          .checkout-summary { margin-bottom: 20px; }
          .summary-row { display: flex; justify-content: space-between; font-size: 14px; padding: 8px 0; border-bottom: 1px dashed var(--border-color); }
          .total-row { font-weight: 700; font-size: 16px; border-bottom: none; padding-top: 12px; }
          
          .shipping-selector { display: flex; flex-direction: column; gap: 10px; margin: 16px 0; }
          .ship-option { display: flex; align-items: center; gap: 12px; border: 1.5px solid var(--border-color); padding: 12px; border-radius: 6px; cursor: pointer; }
          .ship-option.active { border-color: var(--accent-green); background: #F2F7F3; }
          .ship-title { font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 6px; }
          .ship-desc { font-size: 11px; color: var(--text-muted); }

          .submit-btn { width: 100%; background: var(--accent-green); color: white; border: none; padding: 12px; border-radius: 6px; font-weight: 700; font-size: 14px; cursor: pointer; }
          .submit-btn:hover { background: #1E3D1A; }

          .portal-auth-container { max-width: 400px; margin: 80px auto; padding: 0 20px; }
          .auth-card { background: var(--bg-card); border: 2px solid var(--border-dark); border-radius: 8px; padding: 30px; text-align: center; }
          .auth-header h2 { font-family: var(--font-mono); font-size: 18px; margin: 10px 0 6px; }
          .auth-header p { font-size: 12px; color: var(--text-muted); margin-bottom: 20px; }

          .dashboard-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; border-bottom: 1.5px solid var(--border-color); padding-bottom: 16px; }
          .system-status-pill { background: #EAF2EA; border: 1px solid var(--accent-green); color: var(--accent-green); font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 20px; display: flex; align-items: center; gap: 6px; }

          .dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
          @media (max-width: 768px) { .dashboard-grid { grid-template-columns: 1fr; } }
          
          .dashboard-panel { background: var(--bg-card); border: 1.5px solid var(--border-dark); border-radius: 8px; padding: 20px; }
          .dashboard-panel h3 { font-family: var(--font-mono); font-size: 16px; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; }

          .admin-form { display: flex; flex-direction: column; gap: 14px; }
          .form-field { display: flex; flex-direction: column; gap: 4px; flex: 1; }
          .form-field.narrow { flex: 0 0 100px; }
          .form-field label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }
          .form-field input, .form-field select, .form-field textarea { border: 1.5px solid var(--border-color); border-radius: 6px; padding: 8px 10px; font-size: 13px; font-family: var(--font-main); outline: none; }
          .form-field input:focus, .form-field select:focus, .form-field textarea:focus { border-color: var(--text-dark); }

          .admin-inventory-list { display: flex; flex-direction: column; gap: 10px; max-height: 500px; overflow-y: auto; }
          .admin-inventory-row { display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border-color); padding: 10px 12px; border-radius: 6px; background: var(--bg-primary); }
          .admin-item-info { display: flex; flex-direction: column; font-size: 12px; }
          .delete-icon-btn { background: #FDF2F0; border: 1px solid var(--accent-red); color: var(--accent-red); border-radius: 4px; padding: 6px; cursor: pointer; }

          .form-error-banner { background: #FDF2F0; border: 1px solid var(--accent-red); color: var(--accent-red); padding: 8px 12px; border-radius: 6px; font-size: 12px; margin-bottom: 12px; }
          .form-success-banner { background: #EAF2EA; border: 1px solid var(--accent-green); color: var(--accent-green); padding: 8px 12px; border-radius: 6px; font-size: 12px; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }

          .text-center { text-align: center; }
          .mt-4 { margin-top: 16px; }
        `}</style>

        <Header currentView={currentView} setView={setView} />

        {currentView === "storefront" ? (
          <CustomerStorefront />
        ) : (
          <SellerPortal />
        )}
      </div>
    </AppProvider>
  );
}