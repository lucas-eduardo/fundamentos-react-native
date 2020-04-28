import React, { useState, useEffect } from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';

import { View, ListRenderItem } from 'react-native';

import formatValue from '../../utils/formatValue';
import { useCart } from '../../hooks/cart';
import api from '../../services/api';

import FloatingCart from '../../components/FloatingCart';

import {
  Container,
  ProductContainer,
  ProductImage,
  ProductList,
  Product,
  ProductTitle,
  PriceContainer,
  ProductPrice,
  ProductButton,
} from './styles';

interface ProductItem {
  id: string;
  title: string;
  image_url: string;
  price: number;
}

const Dashboard: React.FC = () => {
  const { addToCart } = useCart();

  const [products, setProducts] = useState<ProductItem[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const { data } = await api.get<ProductItem[]>('products');
      setProducts(data);
    }

    loadProducts();
  }, []);

  function handleAddToCart(item: ProductItem): void {
    addToCart({ ...item, quantity: 0 });
  }

  const renderItem: ListRenderItem<ProductItem> = ({ item }) => (
    <Product>
      <ProductImage source={{ uri: item.image_url }} />
      <ProductTitle>{item.title}</ProductTitle>
      <PriceContainer>
        <ProductPrice>{formatValue(item.price)}</ProductPrice>
        <ProductButton
          testID={`add-to-cart-${item.id}`}
          onPress={() => handleAddToCart(item)}
        >
          <FeatherIcon size={20} name="plus" color="#C4C4C4" />
        </ProductButton>
      </PriceContainer>
    </Product>
  );

  return (
    <Container>
      <ProductContainer>
        <ProductList
          data={products}
          keyExtractor={item => item.id}
          ListFooterComponent={<View />}
          ListFooterComponentStyle={{
            height: 80,
          }}
          renderItem={renderItem}
        />
      </ProductContainer>
      <FloatingCart />
    </Container>
  );
};

export default Dashboard;
