import React, { createContext, useState, useEffect } from 'react';
import { useMarket } from '../hooks/useMarket.js';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isB2B, settings } = useMarket();
  const [items, setItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      console.error('Failed to parse cart from localStorage:', e);
      return [];
    }
  });

  // Sync cart items to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // B2C Cart Addition Logic
  const addToCart = (product, quantity = 1) => {
    if (isB2B) {
      alert('Shopping cart is only available for Retail (B2C) purchases. For Wholesale (B2B) purchases, please request a quote.');
      return;
    }

    if (!product || !product._id) return;

    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.product._id === product._id);
      const stockLimit = product.stock ?? 999;

      if (existingItemIndex > -1) {
        // Item already in cart, update quantity up to stock limit
        const existingItem = prevItems[existingItemIndex];
        const newQty = existingItem.quantity + quantity;

        if (newQty > stockLimit) {
          alert(`Cannot add more. Only ${stockLimit} units are available in stock.`);
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: stockLimit,
          };
          return updatedItems;
        }

        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQty,
        };
        return updatedItems;
      } else {
        // New item in cart
        if (quantity > stockLimit) {
          alert(`Cannot add more. Only ${stockLimit} units are available in stock.`);
          return [...prevItems, { product, quantity: stockLimit }];
        }
        return [...prevItems, { product, quantity }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setItems((prevItems) => prevItems.filter((item) => item.product._id !== productId));
  };

  const remove = removeFromCart; // Alias

  // Update item quantity directly
  const updateQty = (productId, quantity) => {
    if (quantity < 1) return;

    setItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.product._id === productId) {
          const stockLimit = item.product.stock ?? 999;
          if (quantity > stockLimit) {
            alert(`Cannot update quantity. Only ${stockLimit} units are available in stock.`);
            return { ...item, quantity: stockLimit };
          }
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  // Clear cart
  const clearCart = () => {
    setItems([]);
  };

  const clear = clearCart; // Alias

  // Derived state calculations
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = items.reduce((sum, item) => sum + (item.product.retailPrice || 0) * item.quantity, 0);
  
  // Dynamic shipping cost calculation based on DB settings
  const freeShippingThreshold = settings?.retailOrderSettings?.freeShippingThreshold ?? 499;
  const flatShippingCharge = settings?.retailOrderSettings?.shippingCharge ?? 49;
  
  const shippingCost = items.length === 0 ? 0 : (cartSubtotal > freeShippingThreshold ? 0 : flatShippingCharge);
  const cartTotal = cartSubtotal + shippingCost;
  const isEmpty = items.length === 0;

  return (
    <CartContext.Provider
      value={{
        items,
        cart: items, // Alias for convenience
        addToCart,
        removeFromCart,
        remove,
        updateQty,
        clearCart,
        clear,
        cartCount,
        cartSubtotal,
        shippingCost,
        cartTotal,
        isEmpty,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
export default CartContext;
