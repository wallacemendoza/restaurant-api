# 🍝 restaurant-api

> REST API for Bella Cucina — Express + Node.js backend that connects to [restaurant-db](https://github.com/wallacemendoza/restaurant-db) and exposes a `POST /orders` endpoint to place food orders.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

---

## Part of the Bella Cucina ecosystem

| Repo | What it does |
|---|---|
| [restaurant-db](https://github.com/wallacemendoza/restaurant-db) | PostgreSQL schema, stored procedures, HTML dashboard |
| [restaurant-ml](https://github.com/wallacemendoza/restaurant-ml) | Python / Streamlit analytics dashboard |
| **restaurant-api** | This repo — Express API to place orders |

---

## Endpoint

### `POST /orders`
Place a new food order. Calls the `place_order()` stored function defined in `restaurant-db`.

**Headers**
```
Authorization: Bearer <your-api-key>
Content-Type: application/json
```

**Request body**
```json
{
  "table_id": 3,
  "customer_id": 1,
  "waiter_id": 4,
  "items": [
    { "menu_item_id": 11, "quantity": 1, "notes": "no lemon" },
    { "menu_item_id": 30, "quantity": 2 }
  ]
}
```

**Response `201`**
```json
{
  "order_id": 9,
  "message": "Order placed successfully",
  "items_count": 2
}
```

**Error responses**

| Code | Reason |
|---|---|
| `400` | Missing required field (table_id, waiter_id, items) |
| `401` | Missing or invalid API key |
| `422` | Menu item not available or not found |
| `500` | Database or server error |

### `GET /health`
Returns service status — used by Render to verify the app is alive.

---

## Run Locally

```bash
# 1. Clone
git clone https://github.com/wallacemendoza/restaurant-api.git
cd restaurant-api

# 2. Install
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env — add your DATABASE_URL and API_KEY

# 4. Run (dev mode with auto-reload)
npm run dev

# 5. Test it
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "table_id": 3,
    "customer_id": 1,
    "waiter_id": 4,
    "items": [
      { "menu_item_id": 11, "quantity": 1 },
      { "menu_item_id": 30, "quantity": 2 }
    ]
  }'
```

---

## Deploy to Render (Free)

### Step 1 — Set up PostgreSQL on Render
1. Go to [render.com](https://render.com) → **New → PostgreSQL**
2. Name it `restaurant-db`, choose the free tier
3. After it creates, go to the database page and copy the **External Database URL**
4. Run your SQL files against it:
```bash
psql "your-external-db-url" -f sql/01_schema.sql
psql "your-external-db-url" -f sql/02_seed.sql
psql "your-external-db-url" -f sql/03_queries_views_procedures.sql
```

### Step 2 — Deploy the API on Render
1. Push this repo to GitHub
2. Go to Render → **New → Web Service**
3. Connect your `restaurant-api` GitHub repo
4. Set these values:

| Field | Value |
|---|---|
| **Runtime** | Node |
| **Build command** | `npm install` |
| **Start command** | `npm start` |

5. Under **Environment Variables**, add:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your Render PostgreSQL external URL |
| `API_KEY` | Any secret string you choose |
| `NODE_ENV` | `production` |

6. Click **Deploy** — live in ~2 minutes at `https://restaurant-api.onrender.com`

### Step 3 — Test your live API
```bash
curl -X POST https://restaurant-api.onrender.com/orders \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "table_id": 3,
    "waiter_id": 4,
    "items": [{ "menu_item_id": 22, "quantity": 1 }]
  }'
```

---

## Project Structure

```
restaurant-api/
├── src/
│   ├── server.js            # Express app entry point
│   ├── db.js                # PostgreSQL connection pool
│   ├── routes/
│   │   └── orders.js        # POST /orders handler
│   └── middleware/
│       └── auth.js          # API key authentication
├── .env.example             # Environment variable template
├── .gitignore
├── package.json
└── README.md
```
