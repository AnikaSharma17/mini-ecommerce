# Mini E-Commerce

A high-performance, responsive e-commerce web application built with **React**.  
This project demonstrates **advanced state management**, **performance optimizations**, and **robust edge-case handling**, using real-time data from the DummyJSON API.

🔗 **Live Demo (Vercel)**:  
https://ecommerce-kohl-delta.vercel.app/

---

## Key Features

### Product Listing & Filtering
- **Dynamic Product Grid** displaying product image, title, category, price, and stock status
- **Real-time Search** with **debounce logic** to reduce unnecessary re-renders
- **Category Filtering** and **Price Sorting** (Low → High / High → Low)
- **Clear All Filters** option to instantly reset the view

---

### Shopping Cart Logic
- **Stock-aware Cart**: Users cannot add quantities beyond available inventory
- **Real-time Cart Updates**: Add, remove, and update quantities instantly
- **Live Cart Summary**: Automatically calculates total items and total price

---

### Performance & User Experience
- **Memoized Components**: Uses `React.memo` to prevent unnecessary re-renders
- **Optimized Callbacks**: `useCallback` ensures stable function references
- **Derived State Optimization**: `useMemo` for efficient calculations
- **Independent Rendering**: Product list does **not re-render when cart state changes**
- **Persistent Cart**: Cart data stored in `localStorage` and restored on refresh
- **Empty States**: Graceful UI handling for:
  - No products found
  - Empty cart

---

## 🛠️ Technical Constraints Met
- Functional components only
- React Hooks: `useState`, `useEffect`, `useMemo`, `useCallback`
- No UI libraries (100% custom CSS)
- Clean, readable, and modular code structure

---

## Installation & Setup

### Clone the Repository
git clone https://github.com/AnikaSharma17/mini-ecommerce.git
cd mini-ecommerce

### Install Dependencies
npm install

### Run the App Locally
npm start

The application will be available at:
http://localhost:3000
