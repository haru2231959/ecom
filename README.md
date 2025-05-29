# Express E-commerce RESTful API

A robust, scalable, and enterprise-grade RESTful API built with Express.js, MySQL, and Sequelize ORM for e-commerce applications.

## 🚀 Features

### Core Features
- **RESTful API Design** - Clean, consistent API endpoints
- **Enterprise Architecture** - Scalable, maintainable codebase
- **MySQL Database** - Reliable relational database with Sequelize ORM
- **JWT Authentication** - Secure authentication with refresh tokens
- **Role-based Authorization** - Admin, Moderator, User roles
- **Input Validation** - Comprehensive request validation with Joi
- **Error Handling** - Centralized error handling and logging
- **Rate Limiting** - Protection against abuse and DDoS
- **File Uploads** - Image and document upload support
- **Pagination** - Efficient data pagination
- **Search & Filtering** - Advanced product search capabilities

## 📋 Prerequisites

- Node.js (v16.0.0 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd express-ecom
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration values.

4. **Database setup**
   ```bash
   # Create database
   mysql -u root -p -e "CREATE DATABASE express_ecom_dev;"
   
   # Run migrations
   npm run migrate
   
   # Run seeders (optional)
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## 🌐 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh-token` - Refresh JWT token
- `POST /api/v1/auth/forgot-password` - Request password reset

### Users
- `GET /api/v1/users` - Get all users (Admin)
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `GET /api/v1/users/profile` - Get current user profile

### Products
- `GET /api/v1/products` - Get products with filters
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products` - Create product (Admin)
- `PUT /api/v1/products/:id` - Update product (Admin)

### Categories
- `GET /api/v1/categories` - Get categories
- `POST /api/v1/categories` - Create category (Admin)

### Orders
- `GET /api/v1/orders` - Get user orders
- `POST /api/v1/orders` - Create order

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm start               # Start production server

# Database
npm run migrate         # Run database migrations
npm run seed           # Run database seeders

# Testing
npm test               # Run tests
npm run lint           # Check code style
```

## 🏗️ Project Structure

```
src/
├── app.js                 # Application entry point
├── server.js             # Server configuration
├── config/               # Configuration files
├── controllers/          # Request handlers
├── middlewares/          # Custom middleware
├── models/              # Database models
├── routes/              # API routes
├── services/            # Business logic
├── utils/               # Utility functions
└── database/            # Migrations & seeders
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-access-token>
```

## 📝 Response Format

### Success Response
```javascript
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": { ... },
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

### Error Response
```javascript
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

## 🧪 Testing

```bash
npm test
```

## 🚀 Deployment

### Using PM2
```bash
npm install -g pm2
npm run pm2:start
```

## 📄 License

This project is licensed under the MIT License.

---

**Happy Coding! 🚀**