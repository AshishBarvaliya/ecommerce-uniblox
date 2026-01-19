import type { Product } from '@/types';

// Static dummy products
export const dummyProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Wireless Bluetooth Headphones',
    description:
      'Premium noise-cancelling wireless headphones with 30-hour battery life and crystal-clear sound quality.',
    price: 200,
    category: 'Electronics',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Smart Watch Pro',
    description:
      'Feature-rich smartwatch with health tracking, GPS, and water resistance up to 50 meters.',
    price: 350,
    category: 'Electronics',
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'prod-3',
    name: 'Organic Cotton T-Shirt',
    description:
      'Comfortable 100% organic cotton t-shirt, available in multiple colors. Sustainable and eco-friendly.',
    price: 30,
    category: 'Clothing',
    createdAt: new Date('2024-01-20').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString(),
  },
  {
    id: 'prod-4',
    name: 'Leather Backpack',
    description:
      'Handcrafted genuine leather backpack with multiple compartments and laptop sleeve. Perfect for daily commute.',
    price: 150,
    category: 'Accessories',
    createdAt: new Date('2024-02-10').toISOString(),
    updatedAt: new Date('2024-02-10').toISOString(),
  },
  {
    id: 'prod-5',
    name: 'Stainless Steel Water Bottle',
    description:
      'Insulated 32oz stainless steel water bottle keeps drinks cold for 24 hours or hot for 12 hours.',
    price: 40,
    category: 'Accessories',
    createdAt: new Date('2024-01-25').toISOString(),
    updatedAt: new Date('2024-01-25').toISOString(),
  },
  {
    id: 'prod-6',
    name: 'Wireless Charging Pad',
    description:
      'Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator.',
    price: 25,
    category: 'Electronics',
    createdAt: new Date('2024-02-05').toISOString(),
    updatedAt: new Date('2024-02-05').toISOString(),
  },
  {
    id: 'prod-7',
    name: 'Running Shoes',
    description:
      'Lightweight running shoes with advanced cushioning technology and breathable mesh upper.',
    price: 130,
    category: 'Clothing',
    createdAt: new Date('2024-01-30').toISOString(),
    updatedAt: new Date('2024-01-30').toISOString(),
  },
  {
    id: 'prod-8',
    name: 'Sunglasses Classic',
    description:
      'UV-protected polarized sunglasses with scratch-resistant lenses and premium frame materials.',
    price: 80,
    category: 'Accessories',
    createdAt: new Date('2024-02-15').toISOString(),
    updatedAt: new Date('2024-02-15').toISOString(),
  },
  {
    id: 'prod-9',
    name: 'Portable Bluetooth Speaker',
    description:
      'Compact waterproof Bluetooth speaker with 360-degree sound and 20-hour battery life.',
    price: 90,
    category: 'Electronics',
    createdAt: new Date('2024-02-20').toISOString(),
    updatedAt: new Date('2024-02-20').toISOString(),
  },
];
