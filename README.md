# E-Commerce Product API

A local Node.js/Express REST API for a product catalog, built to demonstrate proper RESTful design, idempotent operations, standardized error responses, and a GraphQL endpoint that solves REST's over-fetching problem.

Built for the **E-Commerce Platform API Modernization** assignment (AWT3).

## Tech Stack

- Node.js + Express
- In-memory data store (no database setup required)
- GraphQL (`graphql` + `express-graphql`) for the over-fetching solution

## Setup & Running

```bash
npm install
npm start
```

The server starts at `http://localhost:3000`.

- REST base: `http://localhost:3000/api/v1/products`
- GraphQL endpoint + playground: `http://localhost:3000/graphql` (open in a browser for GraphiQL)

> Note: `express-graphql` shows an npm deprecation warning on install — it still works fine here (pinned with `graphql@^15`), it's just no longer actively maintained upstream. Chosen over the newer `graphql-http` because it ships a built-in GraphiQL browser UI, which makes demoing/grading the GraphQL endpoint easier.

## Module 1 — REST Resource Modeling

Noun-based URIs, correct verbs, filtering, pagination:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/products` | List products. Supports `?category=`, `?limit=`, `?page=`, `?fields=` |
| GET | `/api/v1/products/:id` | Get one product. Supports `?fields=` |
| POST | `/api/v1/products` | Create a product → `201 Created` |
| PUT | `/api/v1/products/:id` | Full replace of a product — **idempotent** |
| DELETE | `/api/v1/products/:id` | Delete a product — **idempotent** |

**Idempotency:**
- `PUT` always sets the resource to the exact state described in the request body. Calling it 5 times in a row with the same payload leaves the product in the same final state as calling it once — no compounding side effects, which is exactly what prevents the "duplicate order on network retry" bug described in the brief.
- `DELETE` on an already-deleted (or never-existing) id returns a clean `404` every time instead of crashing or behaving differently on repeat calls — repeated calls never produce a worse or different outcome than the first.

### Example requests

```bash
# List with filter + pagination
curl "http://localhost:3000/api/v1/products?category=electronics&limit=2&page=1"

# Create
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Product","price":9.99,"category":"electronics","stock":10}'

# Full replace (idempotent — run this twice, state is identical both times)
curl -X PUT http://localhost:3000/api/v1/products/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Earbuds","price":19.99,"category":"electronics","stock":100}'

# Delete (idempotent — second call returns 404, doesn't error out)
curl -X DELETE http://localhost:3000/api/v1/products/2
```

## Module 2 — Standardized Error Schema

Every error response — regardless of cause — follows the same JSON shape:

```json
{
  "error_code": "PRODUCT_NOT_FOUND",
  "message": "Product with id 999 does not exist",
  "timestamp": "2026-09-23T03:54:07.130Z"
}
```

| Scenario | Status | error_code |
|---|---|---|
| Missing/invalid fields in POST/PUT body | 400 | `VALIDATION_ERROR` |
| Non-numeric or non-positive `:id` | 400 | `INVALID_ID` |
| Product id doesn't exist | 404 | `PRODUCT_NOT_FOUND` |
| Unknown route entirely | 404 | `ROUTE_NOT_FOUND` |
| Successful creation | 201 | — |
| Any unexpected server bug | 500 | `INTERNAL_SERVER_ERROR` |

A single centralized error-handling middleware (`middleware/errorHandler.js`) catches everything — no raw stack traces or Express default error pages ever reach the client, so a client-side mistake can never crash the app the way it did in the old system described in the brief.

## Module 3 — Solving Over-Fetching

**Two solutions are implemented, either of which satisfies the requirement on its own:**

**1. `?fields=` query parameter on REST endpoints**

```bash
# Full ~15-field payload (the old over-fetching problem)
curl http://localhost:3000/api/v1/products/1

# Only what a mobile banner actually needs
curl "http://localhost:3000/api/v1/products/1?fields=title,price"
```

**2. GraphQL endpoint at `/graphql`**

```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ products { title price } }"}'
```

Or open `http://localhost:3000/graphql` in a browser for the interactive GraphiQL explorer and try:

```graphql
{
  products(category: "electronics") {
    title
    price
  }
}

query {
  product(id: 1) {
    title
    vendor {
      name
      country
    }
  }
}
```

In both cases, the client dictates exactly which fields come back — no wasted bandwidth on `description`, `dimensionsCm`, `vendor`, etc. when only `title` and `price` are needed.

## Project Structure

```
ecommerce-api/
├── server.js                 # App entry point
├── data/products.js          # In-memory product store + CRUD helpers
├── routes/products.js        # REST route handlers
├── middleware/
│   ├── errorHandler.js       # Centralized error handler + standardized schema
│   └── validate.js           # Request body / id validation
├── utils/ApiError.js         # Custom error class
├── graphql/schema.js         # GraphQL types, Query, resolvers
└── package.json
```

## Notes

- Data resets on server restart (in-memory only — no DB setup needed, keeps `npm install && npm start` fully self-contained per assignment requirements).
- Valid `category` values: `electronics`, `home-goods`, `fashion`, `books`, `sports`, `other`.
