import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';

const GUEST_CART_KEY = 'teddy_guest_cart';
const CartContext = createContext(null);

function readGuestCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

/**
 * REQ-3.2.1 — persistent virtual cart.
 * Guests keep a snapshot cart in localStorage; signed-in customers use the
 * server cart. The guest cart is merged into the server on login.
 */
export function CartProvider({ children }) {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [items, setItems] = useState(() => readGuestCart());
  const [loading, setLoading] = useState(false);
  const mergedForUser = useRef(null);

  // On login: merge guest cart into server cart, then load server cart.
  useEffect(() => {
    if (!user) {
      mergedForUser.current = null;
      setItems(readGuestCart());
      return;
    }

    if (mergedForUser.current === user.id) return;
    mergedForUser.current = user.id;

    const guestItems = readGuestCart();
    setLoading(true);

    const request = guestItems.length
      ? api.post('/cart/sync', {
          items: guestItems.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        })
      : api.get('/cart');

    request
      .then(({ data }) => {
        setItems(data.items || []);
        writeGuestCart([]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const addItem = useCallback(
    async (product, quantity = 1) => {
      if (user) {
        const { data } = await api.post('/cart', { product_id: product.id, quantity });
        setItems(data.items || []);
        return;
      }

      setItems((prev) => {
        const existing = prev.find((i) => i.product_id === product.id);
        let next;
        if (existing) {
          const stock = product.stock_quantity ?? existing.product.stock_quantity ?? 999;
          next = prev.map((i) =>
            i.product_id === product.id
              ? { ...i, quantity: Math.min(i.quantity + quantity, Math.max(stock, 1)) }
              : i
          );
        } else {
          next = [
            ...prev,
            {
              id: `guest-${product.id}`,
              product_id: product.id,
              quantity,
              product: {
                id: product.id,
                title: product.title,
                slug: product.slug,
                price: product.price,
                stock_quantity: product.stock_quantity,
                primary_image: product.primary_image,
              },
            },
          ];
        }
        writeGuestCart(next);
        return next;
      });
    },
    [user]
  );

  const updateQuantity = useCallback(
    async (item, quantity) => {
      if (quantity < 1) return;

      if (user) {
        const { data } = await api.put(`/cart/${item.id}`, { quantity });
        setItems(data.items || []);
        return;
      }

      setItems((prev) => {
        const stock = item.product?.stock_quantity ?? 999;
        const next = prev.map((i) =>
          i.product_id === item.product_id
            ? { ...i, quantity: Math.min(quantity, Math.max(stock, 1)) }
            : i
        );
        writeGuestCart(next);
        return next;
      });
    },
    [user]
  );

  const removeItem = useCallback(
    async (item) => {
      if (user) {
        const { data } = await api.delete(`/cart/${item.id}`);
        setItems(data.items || []);
        return;
      }

      setItems((prev) => {
        const next = prev.filter((i) => i.product_id !== item.product_id);
        writeGuestCart(next);
        return next;
      });
    },
    [user]
  );

  const clearCart = useCallback(
    async ({ remote = true } = {}) => {
      if (user && remote) {
        try {
          await api.delete('/cart');
        } catch {
          /* ignore */
        }
      }
      writeGuestCart([]);
      setItems([]);
    },
    [user]
  );

  // REQ-3.2.2 — dynamic real-time cost computation.
  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, i) => sum + Number(i.product?.price ?? 0) * i.quantity,
      0
    );
    const taxRate = Number(settings.tax_rate ?? 0);
    const tax = Math.round(subtotal * taxRate) / 100;
    const freeThreshold = Number(settings.free_shipping_threshold ?? 0);
    let shipping = items.length ? Number(settings.shipping_fee ?? 0) : 0;
    if (freeThreshold > 0 && subtotal >= freeThreshold) shipping = 0;

    return {
      subtotal,
      tax,
      taxRate,
      shipping,
      freeThreshold,
      total: subtotal + tax + shipping,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
    };
  }, [items, settings]);

  const value = useMemo(
    () => ({ items, loading, totals, addItem, updateQuantity, removeItem, clearCart }),
    [items, loading, totals, addItem, updateQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
