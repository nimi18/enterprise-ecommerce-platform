# Enterprise E-commerce Platform

Production-style e-commerce system focused on scalable backend architecture, secure payment processing, async workflows, and order lifecycle management.

---

## Overview

This repository contains a commerce system designed with real-world backend patterns including:

- Authentication & authorization
- Product catalog management
- Cart & wishlist workflows
- Coupon support
- Address management
- Checkout & order lifecycle
- Stripe payment integration
- Webhook-driven payment confirmation
- Admin fulfillment operations
- Redis + BullMQ background jobs
- Email notifications
- Swagger API documentation

---

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Redis
- BullMQ
- Stripe
- JWT
- Joi
- Nodemailer

### Tooling
- Swagger / OpenAPI
- Mocha
- Chai
- Supertest
- Nodemon

---

## Repository Structure

```text
enterprise-ecommerce-platform/
├── README.md
├── backend/
│   ├── README.md
│   ├── package.json
│   ├── src/
│   └── test/
└── frontend/ (reserved for future client app)
```

---

## Core Capabilities

### Customer Features

- User registration and login
- Browse products
- Manage cart
- Manage wishlist
- Apply coupons
- Save addresses
- Checkout and place orders
- View order history

### Admin Features

- Manage categories
- Manage products
- View all orders
- Update order status
- Add shipping / tracking details

### Platform Features

- Stripe Checkout payments
- Verified Stripe webhooks
- Async email processing with BullMQ
- Payment audit logs
- Notification logs

---

## Architecture
Layered backend architecture:

`Controller → Service → Repository → Model`

This separation keeps business logic modular, maintainable, testable, and scalable.

---

## Quick Start
See the complete backend setup guide:

`backend/README.md`

---

## API Documentation
Swagger UI available at:

`http://localhost:8000/api-docs`

---

## Status
Core commerce backend is fully operational and ready for local development, demos, and further expansion.

---

## Maintainer

**Nimita Malhotra**  
Senior Backend / Full-Stack Engineer  
8+ years of industry experience
