# Ecommerce Application

A modern ecommerce platform built with Next.js featuring product catalog, shopping cart, discount codes, and admin dashboard.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn / Radix UI
- **Testing**: Jest, React Testing Library
- **Icons**: Lucide React

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## API Routes

### Products
- `GET /api/products` - Get all products
- `GET /api/products/[id]` - Get product by ID

### Cart
- `GET /api/cart?userId=xxx` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PATCH /api/cart/update` - Update cart item quantity
- `DELETE /api/cart/remove` - Remove item from cart

### Checkout
- `POST /api/checkout` - Process checkout with payment method and optional discount code

### Discount
- `GET /api/discount` - Get current active discount code

### Admin
- `GET /api/admin/orders` - Get all orders with statistics
- `GET /api/admin/stats` - Get discount statistics
- `POST /api/admin/discount/generate` - Manually generate discount code
- `POST /api/admin/reset` - Reset store (orders, carts, discounts)

## User Flow

### 1. Products & Cart
![Products Cart](/screenshots/products_carts.png)
*Browse products and manage shopping cart*

### 2. Receive Discount Code
![Discount Code](/screenshots/discount_code_generated.png)
*View available discount codes*

### 3. Discount Applied Successfully
![Discount Applied](/screenshots/discount_applied.png)
*Discount code successfully applied to order*

### 4. Admin Dashboard
![Admin Dashboard](/screenshots/admin_portal.png)
*Admin panel for managing orders, statistics, and generating discount codes*

## Discount Code Generation

**Constant N = 5**

A discount code is automatically generated every **5 orders**. The discount code:
- Provides a 10% discount
- Expires when the order count reaches the next multiple of N
