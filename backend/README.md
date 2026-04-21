# Backend Service

Node.js + Express backend powering the Enterprise E-commerce Platform.

---

## Features

- JWT authentication
- Role-based access control
- Category & product APIs
- Cart & wishlist APIs
- Coupon validation
- Address management
- Checkout & orders
- Stripe payments
- Stripe webhook verification
- BullMQ + Redis email queue
- Admin fulfillment APIs
- Swagger docs
- Seed script

---

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Redis
- BullMQ
- Stripe
- Joi
- JWT
- Nodemailer

---

## Folder Structure

```text
backend/
├── package.json
├── .env
├── README.md
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   ├── constants/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── queues/
│   ├── repositories/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   └── workers/
└── test/
```

---

## Environment Setup

Create:

`backend/.env`

Use:
```env
NODE_ENV=development
PORT=8000

MONGODB_URI=mongodb://127.0.0.1:27017/enterprise_ecommerce_platform

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://127.0.0.1:8000

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_google_app_password
```

---

## Installation

```bash
npm install
```

---

## Seed Data

```bash
npm run seed
```

### Creates sample data

**Users**:

**Admin**
- Email: `admin@example.com`
- Password: `password123`

**Customer**
- Email: `customer@example.com`
- Password: `password123`

### Additional Seed Data

- Categories
- Products
- Coupons
- Addresses

---

## Run Application

### Start API Server

```bash
npm run dev
```

### Start Email Worker

```bash
node src/workers/email.worker.js
```

### Start Redis

```bash
brew services start redis
```

### Start Stripe Webhook Listener

```bash
stripe listen --forward-to localhost:8000/api/webhooks/stripe
```

---

## API Docs

Swagger UI available at:

`http://127.0.0.1:8000/api/docs`

---

## Main API Modules

### Public / Customer

- /api/auth
- /api/products
- /api/cart
- /api/wishlist
- /api/addresses
- /api/checkout
- /api/orders
- /api/payments

### Admin

- /api/categories
- /api/products
- /api/admin/orders

### Internal

- /api/webhooks/stripe

---

## Payment Flow

```text
Customer Checkout
    ↓
Stripe Checkout Session
    ↓
Payment Completed
    ↓
Webhook Verification
    ↓
Order Updated
    ↓
Email Queued
```

---

## Testing

```bash
npm test
```

---

## Notes

- Orders store snapshots of products and addresses
- Webhook acts as payment source of truth
- Queue processing keeps webhook response lightweight
