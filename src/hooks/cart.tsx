import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cart = (await AsyncStorage.getItem(
        '@GoMarketplace:cart',
      )) as string;

      setProducts(JSON.parse(cart) || []);
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function setProds(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    }
    setProds();
  }, [products]);

  const addToCart = useCallback(
    async (product: Product) => {
      const existProduct = products.find(item => item.id === product.id);
      if (existProduct) {
        setProducts(
          products.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }
    },
    [products],
  );

  const increment = useCallback(
    async (id: string) => {
      setProducts(
        products.map(item =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async (id: string) => {
      const { quantity } = products.find(
        product => product.id === id,
      ) as Product;

      if (quantity > 1) {
        setProducts(
          products.map(item =>
            item.id === id && item.quantity
              ? { ...item, quantity: item.quantity - 1 }
              : item,
          ),
        );
      } else {
        setProducts(products.filter(item => item.id !== id));
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
