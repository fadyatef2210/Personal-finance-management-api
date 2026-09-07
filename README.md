# Personal Finance Management API

A backend application that lets users manage income, expenses, budgets, savings goals,
and view calculated financial analytics — built as a Node.js / Express.js graduation project.

## 1. Project Description

Users register, log in, and then track every income or expense as a **Transaction**
tied to a **Category** they control. On top of that raw data, the API exposes a
**Financial Analytics Engine** that computes real numbers with MongoDB aggregation
pipelines (not client-side math): total income/expenses, running balance, savings
percentage, category spending distribution, a monthly income/expense trend, and
budget usage vs. limits. Users can also set **Monthly Budgets** (overall or per
category) and track **Savings Goals** with contributions.

## 2. Technologies Used

| Layer | Technology |
|---|---|
| Runtime | Node.js (>=18) |
| Framework | Express.js 4 |
| Database | MongoDB |
| ODM | Mongoose 8 |
| Auth | JWT (jsonwebtoken) |
| Password hashing | bcryptjs |
| Security | helmet, express-mongo-sanitize, express-rate-limit, cors |
| Logging | morgan |

## 3. Features

- JWT-based authentication (register, login, logout, get/update profile, change password)
- Password hashing with bcrypt
- Role-based authorization (`user`, `admin`)
- Category management (custom + auto-seeded defaults per user, scoped to income/expense)
- Transaction management (create/read/update/delete income & expense entries)
- Transaction history with **search**, **filtering** (type, category, date range, amount range,
  payment method), **sorting**, and **pagination**
- Monthly budgets (overall or per-category) with real-time usage tracking
- Savings goals with contributions and automatic completion
- **Financial Analytics Engine** (aggregation-pipeline powered):
  - Total income / total expenses / current balance
  - Savings percentage
  - Category spending distribution (highest spending categories, ranked)
  - Monthly income/expense trend (last N months)
  - Budget usage percentage per budget
  - Combined dashboard endpoint
- Centralized error handling with a consistent JSON error shape
- Request validation on every write endpoint
- Security middleware: helmet, mongo query sanitization, rate limiting, CORS

## 4. Installation Instructions

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd personal-finance-management-api

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# then edit .env with your own values

# 4. Start MongoDB (local or Atlas — see MONGO_URI below)

# 5. Run the app
npm run dev     # development, with nodemon
npm start       # production
```

The API will be available at `http://localhost:5000/api`.

## 5. Environment Variables

Defined in `.env` (see `.env.example`):

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Environment mode | `development` / `production` |
| `PORT` | Port the server listens on | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/personal-finance-db` |
| `JWT_SECRET` | Secret used to sign JWTs — use a long random string | `super_secret_value` |
| `JWT_EXPIRES_IN` | JWT expiry | `7d` |
| `RATE_LIMIT_WINDOW_MS` | Rate-limit window (ms) | `900000` |
| `RATE_LIMIT_MAX` | Max requests per window per IP | `200` |

## 6. Database Setup

The app uses MongoDB via Mongoose. No manual schema setup is required — Mongoose
creates collections and indexes automatically on first use. Two options:

- **Local MongoDB**: install and run `mongod`, then point `MONGO_URI` to
  `mongodb://127.0.0.1:27017/personal-finance-db`.
- **MongoDB Atlas** (recommended for deployment): create a free cluster, add a
  database user, allow your IP (or `0.0.0.0/0` for cloud deploys), and copy the
  connection string into `MONGO_URI`.

When a user registers, a starter set of default categories (e.g. Food, Transport,
Salary, Freelance) is automatically seeded for them.

## 7. Authentication Instructions

1. `POST /api/auth/register` with `name`, `email`, `password` → returns a `user` object and a JWT `token`.
2. `POST /api/auth/login` with `email`, `password` → returns the same shape.
3. Send the token on every protected request:
   ```
   Authorization: Bearer <token>
   ```
4. `GET /api/auth/me` returns the currently authenticated user.

Passwords require at least 8 characters, including at least one letter and one number.
Tokens expire after `JWT_EXPIRES_IN` (default 7 days); the client should re-login after expiry.

## 8. API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | Public | Create an account |
| POST | `/login` | Public | Log in, get a JWT |
| POST | `/logout` | Private | Stateless logout (client discards token) |
| GET | `/me` | Private | Get current user profile |
| PATCH | `/me` | Private | Update name / currency |
| PATCH | `/change-password` | Private | Change password |

### Categories — `/api/categories`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/?type=income\|expense` | List my categories |
| POST | `/` | Create a category |
| GET | `/:id` | Get one category |
| PATCH | `/:id` | Update a category |
| DELETE | `/:id` | Delete a category (blocked if transactions use it) |

### Transactions — `/api/transactions`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List transactions — see query params below |
| POST | `/` | Create an income or expense transaction |
| GET | `/:id` | Get one transaction |
| PATCH | `/:id` | Update a transaction |
| DELETE | `/:id` | Delete a transaction |

**Query params for `GET /api/transactions`:**
`type`, `category`, `startDate`, `endDate`, `minAmount`, `maxAmount`, `search`
(matches description), `paymentMethod`, `sortBy` (`date`\|`amount`\|`createdAt`),
`sortOrder` (`asc`\|`desc`), `page`, `limit`.

Example: `GET /api/transactions?type=expense&category=64f...&startDate=2026-08-01&endDate=2026-08-31&search=coffee&page=1&limit=10`

### Budgets — `/api/budgets`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/?month=&year=` | List budgets |
| POST | `/` | Create a budget (category optional = overall budget) |
| GET | `/:id` | Get one budget |
| PATCH | `/:id` | Update a budget |
| DELETE | `/:id` | Delete a budget |
| GET | `/usage?month=&year=` | Budget vs. actual spend, calculated live |

### Savings Goals — `/api/savings-goals`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/?status=` | List savings goals |
| POST | `/` | Create a goal |
| GET | `/:id` | Get one goal |
| PATCH | `/:id` | Update a goal |
| DELETE | `/:id` | Delete a goal |
| POST | `/:id/contribute` | Add money toward a goal (auto-completes at 100%) |

### Analytics — `/api/analytics`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/summary?startDate=&endDate=` | Total income, expenses, balance, savings % |
| GET | `/category-distribution?type=&month=&year=&limit=` | Spending by category, ranked |
| GET | `/monthly-trend?months=` | Income/expense per month for the last N months |
| GET | `/dashboard` | All of the above + current-month budget usage in one call |

### Health
`GET /api/health` — uptime check, no auth required.

## 9. Error Response Format

Every error, regardless of source, is returned in this shape:

```json
{
  "success": false,
  "message": "Resource not found",
  "errors": [ { "field": "email", "message": "A valid email is required" } ]
}
```

`errors` is only present for field-level validation failures.

## 10. Project Structure

```
src/
├── config/        # DB connection
├── controllers/    # Route handlers (thin — delegate business logic to services)
├── middleware/     # auth, validation, centralized error handling
├── models/         # Mongoose schemas: User, Category, Transaction, Budget, SavingsGoal
├── routes/         # Express routers per resource
├── services/       # Business logic: auth, transactions, analytics (aggregation pipelines)
├── utils/          # ApiError, ApiResponse, asyncHandler, generateToken, paginate
└── server.js        # Entry point
```

## 11. Deployment Information

The app is a standard Express server and can be deployed to Render, Railway,
Fly.io, or any Node host:

1. Set `MONGO_URI` to a MongoDB Atlas connection string.
2. Set `JWT_SECRET` to a strong random value (do not reuse the example).
3. Set `NODE_ENV=production`.
4. Start command: `npm start`.
5. Health check path for the platform: `GET /api/health`.

## 12. Testing & Deployment Notes (for the final presentation)

- All source files pass a Node.js syntax check and the Express app boots and
  wires all routes without runtime errors (verified during development).
- Business logic (analytics calculations, category/user matching) sits in the
  `services/` layer so it can be unit tested independently of Express.
- Suggested manual test flow: register → login → create categories (or use the
  seeded defaults) → create a few transactions → call `/api/analytics/dashboard`
  → create a budget for the current month → call `/api/budgets/usage`.
