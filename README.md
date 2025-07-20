# E-commerce Backend API

A simplified backend service for e-commerce, built with NestJS and TypeScript, designed for mobile app integration.

---

## 🚀 Features

- **Product Management**
  - CRUD operations, search, filtering, categories, featured/sale products, inventory tracking
- **Shopping Cart**
  - Session-based cart, add/remove/update items, pricing summary, size/color selection
- **RESTful API**
  - Consistent HTTP methods/status codes, error handling, validation, Swagger docs

---

## 🛠 Technology Stack

| Component      | Details                    |
| -------------- | ------------------------- |
| Framework      | NestJS                    |
| Language       | TypeScript                |
| Database       | SQLite (TypeORM)          |
| Validation     | class-validator           |
| Documentation  | Swagger/OpenAPI           |
| Testing        | Jest                      |

---

## ⚡ Prerequisites

- Node.js (v14+)
- npm or yarn

---

## 📦 Installation

```bash
git clone <repository-url>
cd ecommerce-backend
npm install
```

### Environment Setup

```bash
cp .env.example .env
# Edit .env as needed
NODE_ENV=development
PORT=3000
DATABASE_PATH=database.sqlite
JWT_SECRET=your secret
JWT_EXPIRES_IN=7d
```

### Start Application

```bash
npm run start:dev
```

API available at: [http://localhost:3000](http://localhost:3000)

---

## 📚 API Documentation

- Swagger UI: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 🔗 API Endpoints

### Health Check
- `GET /` — API health check

### Products
- `POST /api/v1/products` — Create product
- `GET /api/v1/products` — List products (filter/paginate)
- `GET /api/v1/products/:id` — Get product
- `PATCH /api/v1/products/:id` — Update product
- `DELETE /api/v1/products/:id` — Delete product
- `GET /api/v1/products/featured` — Featured products
- `GET /api/v1/products/sale` — Sale products
- `GET /api/v1/products/search?q=:searchTerm` — Search products
- `GET /api/v1/products/category/:categoryId` — By category
- `GET /api/v1/products/brand/:brand` — By brand

### Cart
- `POST /api/v1/cart/session` — Generate session ID
- `POST /api/v1/cart` — Add item
- `GET /api/v1/cart` — Get cart
- `PATCH /api/v1/cart/:itemId` — Update item
- `DELETE /api/v1/cart/:itemId` — Remove item
- `DELETE /api/v1/cart` — Clear cart
- `GET /api/v1/cart/count` — Item count
- `GET /api/v1/cart/total` — Cart total

### Authentication

- JWT-based authentication, role-based access
- **Public:** Cart, product browsing, health check
- **Protected:** Product management (admin only)

#### User Roles

| Role    | Access Level                |
| ------- | -------------------------- |
| ADMIN value:admin  | Full (incl. product mgmt)  |
| MANAGER | Management (future use)    |
| USER value:user   | Basic user                 |

#### Headers

- `Authorization: Bearer <JWT_TOKEN>`
- `x-session-id: <SESSION_ID>`

---

## 📝 Sample API Usage

**Generate Session ID**
```bash
curl -X POST http://localhost:3000/api/v1/cart/session
```

**Create Product**
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

**Add Item to Cart**
```bash
curl -X POST http://localhost:3000/api/v1/cart \
  -H "Content-Type: application/json" \
  -H "x-session-id: YOUR_SESSION_ID" \
  -d '{ ... }'
```

**Get Cart**
```bash
curl -X GET http://localhost:3000/api/v1/cart \
  -H "x-session-id: YOUR_SESSION_ID"
```

**Search Products**
```bash
curl -X GET "http://localhost:3000/api/v1/products?search=Nike&page=1&limit=10"
```

---

## 🧪 Testing

```bash
npm run test         # Unit tests
npm run test:watch   # Watch mode
```

---

## 🗄 Database Schema

### Products

| Field              | Type        | Description                  |
| ------------------ | ---------- | ---------------------------- |
| id                 | UUID       | Primary Key                  |
| name               | string     | Product name                 |
| description        | string     | Product description          |
| price              | number     | Current price                |
| originalPrice      | number     | Original price               |
| discountPercentage | number     | Calculated discount          |
| image              | string     | Main image URL               |
| images             | string[]   | Array of image URLs          |
| brand              | string     | Brand                        |
| model              | string     | Model                        |
| color              | string     | Color                        |
| sizes              | string[]   | Available sizes              |
| stock              | number     | Stock quantity               |
| status             | string     | Product status               |
| sku                | string     | SKU                          |
| rating             | number     | Rating                       |
| reviewCount        | number     | Review count                 |
| isActive           | boolean    | Active status                |
| isFeatured         | boolean    | Featured status              |
| categoryId         | UUID       | Category FK                  |
| createdAt          | timestamp  | Created                      |
| updatedAt          | timestamp  | Updated                      |

### Categories

| Field      | Type      | Description           |
| ---------- | --------- | --------------------- |
| id         | UUID      | Primary Key           |
| name       | string    | Category name         |
| description| string    | Category description  |
| icon       | string    | Icon URL              |
| isActive   | boolean   | Active status         |
| createdAt  | timestamp | Created               |
| updatedAt  | timestamp | Updated               |

### Cart Items

| Field         | Type      | Description           |
| ------------- | --------- | --------------------- |
| id            | UUID      | Primary Key           |
| sessionId     | string    | Session ID            |
| productId     | UUID      | Product FK            |
| quantity      | number    | Quantity              |
| selectedSize  | string    | Size                  |
| selectedColor | string    | Color                 |
| price         | number    | Price at add time     |
| createdAt     | timestamp | Created               |
| updatedAt     | timestamp | Updated               |

---

## 🏗 Architecture Overview

```
src/
├── common/         # Shared utilities
├── core/
│   ├── product/    # Product management
│   └── cart/       # Cart management
├── app.module.ts   # Main module
└── main.ts         # Entry point
```

---

## ⚠️ Error Handling

- Uses standard HTTP status codes (`200`, `201`, `400`, `404`, `500`)
- Error response format:
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "error": "Detailed error information",
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

---

## 🏎 Performance

- Indexed key fields
- Pagination on list endpoints
- Input validation
- TypeORM connection pooling

---

## 🔒 Security

- Input validation (`class-validator`)
- SQL injection protection (TypeORM)
- CORS enabled
- Data sanitization

---

## 🌱 Future Enhancements

- JWT authentication & authorization
- Order management
- Payment gateway integration
- Advanced inventory tracking
- Full-text search (Elasticsearch)
- Redis caching
- Image upload
- Admin panel

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Make changes
4. Add tests
5. Ensure tests pass
6. Submit a pull request

---

## 📄 License

MIT License

---

# ecommerce

