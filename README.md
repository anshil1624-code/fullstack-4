# SnackStock — Hostel Snacks Inventory and Order Tracker

A full-stack campus/hostel workflow application for managing snack products, stock, room-delivery orders, payment approval, dispatch, and sales/profit reporting. This project is based on the supplied SnackStock source and retains its React + Vite, Spring Boot, Spring Data JPA, and relational database stack. The refreshed interface uses an ivory, forest-green, and lime visual system.

## Task 4 requirement map (21CSE354T — Full Stack Web Development)

| Task 4 / CO | Evidence in this project |
|---|---|
| CO-1 — HTML/CSS | Responsive React-rendered pages, semantic forms/tables, CSS grid/flex layouts, responsive breakpoints, product imagery and navigation. |
| CO-2 — JavaScript/React | Reusable React components, React Router views, events, state/effect hooks, Fetch-based API calls, and client validation (`frontend/src/validators.js`). |
| CO-3 — SQL/database/JDBC concepts | Relational PostgreSQL schema and seed data in `database/`; related Product → OrderItem → CustomerOrder records; CRUD endpoints and JPA persistence. |
| CO-4 — Spring Boot | REST controllers, service/business rules, entity/domain model, configuration, exception handling, and automated tests. |
| CO-5 — JPA and service/API integration | Spring Data JPA repositories and a documented, independently deployable Spring REST API boundary consumed by the React UI (`docs/api.md`). This is a separate API deployment boundary, not a claim that the codebase contains a multi-service microservice fleet. |
| Four meaningful frontend views | Customer menu/checkout, admin dashboard, inventory, orders/dispatch, quick sale, and profit insights. |
| CRUD for two related entities | Product CRUD and order/order-item workflows; see `docs/api.md`. |
| Search/filter | Product name/SKU search, low-stock report, and order status filtering. |
| Validation | Browser-side form checks plus server-side request/business validation and JSON error responses. |
| Testing | Backend business-rule tests and controller integration test under `backend/src/test`; frontend validator tests under `frontend/src`. |
| Deployment | Local H2 demonstration setup and PostgreSQL deployment instructions below. Live deployment URLs must be checked by the team before submission. |

## Main features

- Customer snack catalogue, cart, room delivery details, QR/cash demo payment selection, and order tracking.
- Admin dashboard with revenue, product count, low-stock watch, and recent orders.
- Inventory search, product creation/editing/deletion, stock quantities, SKU, category, price, cost, and reorder level.
- Order/payment review and delivery status workflow.
- Quick counter sale and profit/revenue reports.

## Prerequisites

- Java 17 or later
- Maven 3.9 or later
- Node.js 20 or later and npm
- PostgreSQL for a shared/production database (local demo uses H2)

## Run locally

Terminal 1 — backend:

```bash
cd backend
mvn spring-boot:run
```

Terminal 2 — frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The API base defaults to `http://localhost:8080/api`; change `VITE_API_BASE_URL` in `frontend/.env` if needed. Local demo data is seeded by the backend configuration. H2 console is available at `http://localhost:8080/h2-console` while the backend is running; use the JDBC settings shown in `backend/src/main/resources/application.yml`.

## Run tests and production build

```bash
cd backend
mvn test

cd ../frontend
npm install
npm test
npm run build
```

Backend tests cover service business rules and an API/controller integration path. Frontend tests cover validation helpers. Keep the generated test reports from your own final run as submission evidence; do not rely solely on previously generated build output.

## Relational database

For PostgreSQL, create a database, then execute `database/schema.sql` and `database/seed.sql`. Configure the backend using environment variables:

```text
DATABASE_URL=jdbc:postgresql://HOST:5432/DATABASE
DATABASE_USERNAME=YOUR_USERNAME
DATABASE_PASSWORD=YOUR_PASSWORD
CORS_ORIGIN=https://YOUR-FRONTEND-DOMAIN
PORT=8080
```

Use a managed PostgreSQL service such as Neon, Supabase, Railway, or Render. Never commit real credentials or production customer data. Use synthetic/authorised demo records for assessment.

## Reproducible deployment outline

1. Deploy `backend` as a Java web service on Render, Railway, Fly.io, or another host that supports a long-running Spring Boot process. Build command: `mvn clean package -DskipTests`. Start command: `java -jar target/inventory-api-1.0.0.jar`.
2. Attach PostgreSQL and set `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `CORS_ORIGIN`, and `PORT` in the backend host's environment settings.
3. Deploy `frontend` to Vercel with root directory `frontend`, framework preset Vite, and `VITE_API_BASE_URL=https://YOUR-API-HOST/api`.
4. Set `CORS_ORIGIN` to the exact deployed frontend origin and redeploy the backend.
5. Verify the live workflow: create/update a product, place an order, approve payment, advance delivery, confirm stock movement, and open reports. Add the verified URLs and screenshots to your final submission.

## Architecture and evidence documents

- `docs/architecture.md` — presentation/business/data flow and API boundary.
- `docs/erd.md` — relational entity relationship diagram.
- `docs/wireframes.md` — screen-level UI plan.
- `docs/api.md` — endpoint list and request/response examples.
- `docs/test-plan.md` — test scenarios and expected outcomes.
- `database/schema.sql` and `database/seed.sql` — schema and sample data.

## Important submission checks

- Confirm the assigned project title/domain with faculty, as required by Task 4.
- Replace/confirm team names, register numbers, class, and individual contribution statements in the presentation/report.
- Run the tests on the final source and retain the actual output.
- Verify the live URL or demonstrate the reproducible local setup; this archive does not claim a newly verified live deployment.
- Explain the API boundary and how the React UI calls it during the viva.
