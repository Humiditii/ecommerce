# E-commerce Backend API

A simplified e-commerce backend service API built with NestJS and TypeScript, following the mobile app design requirements.

## Features

- **Product Management**
  - Create, read, update, and delete products
  - Product search and filtering
  - Category-based product organization
  - Featured products and sale products
  - Stock management with inventory tracking

- **Shopping Cart**
  - Session-based cart management
  - Add/remove items from cart
  - Update item quantities
  - Cart summary with pricing calculations
  - Size and color selection support

- **RESTful API Design**
  - Consistent HTTP methods and status codes
  - Proper error handling and validation
  - Comprehensive API documentation with Swagger

## Technology Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: SQLite (with TypeORM)
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ecommerce-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file if needed
NODE_ENV=development
PORT=3000
DATABASE_PATH=database.sqlite
JWT_SECRET=your secret
JWT_EXPIRES_IN=7d
```

4. Start the application:
```bash
# Development mode
npm run start:dev


The API will be available at `http://localhost:3000`

## API Documentation

Once the application is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:3000/api/docs`

## API Endpoints

### Health Check
- `GET /` - API health check

### Products
- `POST /api/v1/products` - Create a new product
- `GET /api/v1/products` - Get all products (with filtering and pagination)
- `GET /api/v1/products/:id` - Get a specific product
- `PATCH /api/v1/products/:id` - Update a product
- `DELETE /api/v1/products/:id` - Delete a product
- `GET /api/v1/products/featured` - Get featured products
- `GET /api/v1/products/sale` - Get products on sale
- `GET /api/v1/products/search?q=:searchTerm` - Search products
- `GET /api/v1/products/category/:categoryId` - Get products by category
- `GET /api/v1/products/brand/:brand` - Get products by brand

### Cart
- `POST /api/v1/cart/session` - Generate a new session ID
- `POST /api/v1/cart` - Add item to cart
- `GET /api/v1/cart` - Get cart contents
- `PATCH /api/v1/cart/:itemId` - Update cart item
- `DELETE /api/v1/cart/:itemId` - Remove item from cart
- `DELETE /api/v1/cart` - Clear cart
- `GET /api/v1/cart/count` - Get cart item count
- `GET /api/v1/cart/total` - Get cart total

### Authentication
The API uses JWT (JSON Web Tokens) for authentication with role-based access control:

- **Public Routes**: Cart operations, product browsing, health check
- **Protected Routes**: Product management (admin only)
- **Admin Required**: Creating, updating, and deleting products

#### User Roles
- `ADMIN`: Full access to all operations including product management
- `MANAGER`: Management access (extensible for future features)
- `USER`: Basic user access

#### Headers
- `Authorization: Bearer <JWT_TOKEN>` for authenticated requests
- `x-session-id: <SESSION_ID>` for cart operations

## Sample API Usage

### 1. Generate Session ID
```bash
curl -X POST http://localhost:3000/api/v1/cart/session
```

### 2. Create a Product
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nike Air Max 270",
    "description": "Comfortable running shoes with air cushioning",
    "price": 299.43,
    "originalPrice": 399.99,
    "brand": "Nike",
    "model": "Air Max 270",
    "color": "Red",
    "sizes": ["6", "6.5", "7", "7.5", "8", "8.5"],
    "stock": 50,
    "image": "https://example.com/shoe.jpg"
  }'
```

### 3. Add Item to Cart
```bash
curl -X POST http://localhost:3000/api/v1/cart \
  -H "Content-Type: application/json" \
  -H "x-session-id: YOUR_SESSION_ID" \
  -d '{
    "productId": "PRODUCT_UUID",
    "quantity": 1,
    "selectedSize": "7",
    "selectedColor": "Red"
  }'
```

### 4. Get Cart
```bash
curl -X GET http://localhost:3000/api/v1/cart \
  -H "x-session-id: YOUR_SESSION_ID"
```

### 5. Search Products
```bash
curl -X GET "http://localhost:3000/api/v1/products?search=Nike&page=1&limit=10"
```

## Testing

Run the test suite:
```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## Database Schema

### Products Table
- `id` - UUID (Primary Key)
- `name` - Product name
- `description` - Product description
- `price` - Current price
- `originalPrice` - Original price (for discounts)
- `discountPercentage` - Calculated discount percentage
- `image` - Main product image URL
- `images` - Array of image URLs
- `brand` - Product brand
- `model` - Product model
- `color` - Product color
- `sizes` - Available sizes (JSON array)
- `stock` - Stock quantity
- `status` - Product status
- `sku` - Stock Keeping Unit
- `rating` - Product rating
- `reviewCount` - Number of reviews
- `isActive` - Whether product is active
- `isFeatured` - Whether product is featured
- `categoryId` - Foreign key to categories
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Categories Table
- `id` - UUID (Primary Key)
- `name` - Category name
- `description` - Category description
- `icon` - Category icon URL
- `isActive` - Whether category is active
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Cart Items Table
- `id` - UUID (Primary Key)
- `sessionId` - User session identifier
- `productId` - Foreign key to products
- `quantity` - Item quantity
- `selectedSize` - Selected size
- `selectedColor` - Selected color
- `price` - Price at time of adding to cart
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Design Decisions

### 1. Session-Based Cart Management
- **Decision**: Use session IDs instead of user authentication for cart management
- **Rationale**: Simplifies the API and allows guest users to use the cart
- **Trade-off**: Carts are not persistent across different devices/browsers

### 2. SQLite Database
- **Decision**: Use SQLite for data storage
- **Rationale**: Lightweight, serverless, and easy to set up for development
- **Trade-off**: Limited concurrent write operations compared to PostgreSQL/MySQL

### 3. TypeORM with Active Record Pattern
- **Decision**: Use TypeORM with Repository pattern
- **Rationale**: Type-safe database operations and better testability
- **Trade-off**: Slight learning curve for developers unfamiliar with ORMs

### 4. Price Calculation at Cart Level
- **Decision**: Store price in cart items when added
- **Rationale**: Prevents price changes from affecting existing cart items
- **Trade-off**: Requires cart cleanup if prices change significantly

### 5. Comprehensive Validation
- **Decision**: Use class-validator for request validation
- **Rationale**: Ensures data integrity and provides clear error messages
- **Trade-off**: Adds slight overhead to request processing

### 6. Repository Pattern
- **Decision**: Implement repository pattern for database operations
- **Rationale**: Better separation of concerns and easier testing
- **Trade-off**: Additional abstraction layer

## Architecture Overview

```
src/
├── common/                 # Shared utilities and base classes
│   ├── appResponse.parser.ts
│   └── baseRepository.repository.ts
├── core/                   # Business logic modules
│   ├── product/           # Product management
│   │   ├── dto/           # Data Transfer Objects
│   │   ├── entities/      # Database entities
│   │   ├── repository/    # Database operations
│   │   ├── product.controller.ts
│   │   ├── product.service.ts
│   │   └── product.module.ts
│   └── cart/              # Cart management
│       ├── dto/
│       ├── entities/
│       ├── repository/
│       ├── cart.controller.ts
│       ├── cart.service.ts
│       └── cart.module.ts
├── app.module.ts          # Main application module
└── main.ts               # Application entry point
```

## Error Handling

The API follows standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

Error responses include:
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "error": "Detailed error information",
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

## Performance Considerations

1. **Database Indexing**: Key fields are indexed for better query performance
2. **Pagination**: All list endpoints support pagination to handle large datasets
3. **Validation**: Input validation prevents invalid data from reaching the database
4. **Connection Pooling**: TypeORM handles database connection pooling automatically

## Security Considerations

1. **Input Validation**: All inputs are validated using class-validator
2. **SQL Injection Prevention**: TypeORM provides protection against SQL injection
3. **CORS**: Configured to allow cross-origin requests for web applications
4. **Data Sanitization**: User inputs are sanitized before database operations

## Future Enhancements

1. **Authentication & Authorization**: Add JWT-based authentication
2. **Order Management**: Implement order creation and management
3. **Payment Integration**: Add payment gateway integration
4. **Inventory Management**: Advanced stock tracking and alerts
5. **Search Optimization**: Implement full-text search with Elasticsearch
6. **Caching**: Add Redis caching for frequently accessed data
7. **Image Upload**: Add file upload capabilities for product images
8. **Admin Panel**: Create admin interface for managing products and orders

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.
# ecommerce
