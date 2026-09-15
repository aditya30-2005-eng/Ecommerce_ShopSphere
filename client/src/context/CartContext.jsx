import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import cartService from '../services/cartService';
import { AuthContext } from './AuthContext';
import { calculateCartTotals } from '../utils/cartCalculations';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await cartService.getCart();
      setItems(res.cart.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load the persisted cart whenever the user logs in; clear it on logout.
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(async (productId, quantity = 1) => {
    const res = await cartService.addToCart(productId, quantity);
    setItems(res.cart.items || []);
  }, []);

  const updateItem = useCallback(async (productId, quantity) => {
    const res = await cartService.updateCartItem(productId, quantity);
    setItems(res.cart.items || []);
  }, []);

  const removeItem = useCallback(async (productId) => {
    const res = await cartService.removeCartItem(productId);
    setItems(res.cart.items || []);
  }, []);

  const clearCartLocally = useCallback(() => setItems([]), []);

  const totals = calculateCartTotals(items);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    items,
    loading,
    error,
    itemCount,
    totals,
    addItem,
    updateItem,
    removeItem,
    refreshCart,
    clearCartLocally,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
