# Project Architecture

## Overview

This is a production-ready REST API built with Node.js and Express, leveraging:

- **TypeORM** for database modeling (PostgreSQL or any SQL)
- **Zod** for runtime input validation
- **JWT** + **Redis** for authentication & session management
- **Swagger** for inline API documentation
- Clear separation of concerns with modular structure

## Key Architectural Patterns

### Separation of Concerns

- Controllers: Handle requests, responses, call services
- Services: Business logic and database operations
- Entities: DB schema definitions with relations
- Schemas: Zod validation for request inputs
- Routes: Endpoint declarations with attached middleware and Swagger docs
- Middleware: Authentication, authorization, validation, error handling

### Authentication & Authorization

- JWT tokens parsed by `deserializeUser` middleware
- Redis cache for token/session validation and expiration
- Role-based access with `requireUser` and `requireAdminRole`

#### User Registration & Transaction Rollback

- User registration validates inputs with Zod and securely stores - user data.
- After saving the user, a verification email is sent.
- If email sending fails, the registration process is rolled back using a database transaction to avoid partial or inconsistent user records.

This ensures only fully registered and verified users exist in the system.

### Validation

- Zod schemas validate all API inputs at the edge
- Validation middleware rejects malformed requests before service logic

### Error Handling

- Centralized `AppError` class for typed errors
- Express error middleware sends consistent error responses

### Database Access

- TypeORM for ORM and relations
- Repositories used in services for CRUD operations

### API Documentation

- Swagger docs written inline as JSDoc in route files
- Auto-generate OpenAPI specs and interactive docs

### Order Status Workflow

- Strict order statuses with enum:
  - `pending`, `processing`, `shipped`, `delivered`, `cancelled`, `refund_requested`, `refunded`
- Controlled status transitions with validation logic
- User and admin roles enforce permissions on order actions

---

## Improvement Opportunities

| Area                      | Suggestions                                                       |
|---------------------------|------------------------------------------------------------------|
| Caching                   | Redis for product/category caching & session throttling          |
| Rate Limiting             | Apply per-route rate limits using middleware                     |
| Logging                   | Structured logs with Winston or Pino                             |
| Testing                   | Unit & integration tests with Jest/Mocha                         |
| DTOs                      | Add DTO layer to shape API responses and hide DB internals      |
| Audit Logging             | Track changes to orders & admin actions for audit purposes      |
| Email Notifications       | User alerts on order/refund status changes                       |
| Modularization            | Split features into modules/folders for better scalability      |

---

## Principles

- **Security by Design:** JWT auth, session validation, RBAC everywhere  
- **Clear Separation:** Modular code, single responsibility, easy to maintain  
- **Explicit Validation:** Zod protects every endpoint from bad data  
- **Up-to-date Docs:** Swagger close to code, always in sync  
- **Consistent Errors:** Centralized, user-friendly error responses  

---

