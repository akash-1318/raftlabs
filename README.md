# Order Management Feature (Assessment)

Production-grade full-stack implementation for the **Order Management** feature (Menu → Cart → Checkout → Order Status with real-time updates).

## Tech
- **Frontend:** React + Vite + TypeScript + React Query + Zustand + Tailwind
- **Backend:** Node.js + Express + TypeScript + Zod validation + WebSocket (ws)
- **Testing:** Jest + Supertest (backend), Vitest + React Testing Library (frontend)

## Quick Start

### 1) Backend
```bash
cd backend
npm i
npm run dev
# API on http://localhost:4000
# WS  on ws://localhost:4000/ws
```

### 2) Frontend
```bash
cd frontend
npm i
npm run dev
# UI on http://localhost:5173
```

> Frontend expects backend at `http://localhost:4000`. Adjust via `VITE_API_BASE_URL`.

## API
- `GET /api/menu`
- `POST /api/orders`
- `GET /api/orders/:id`
- `GET /api/orders/:id/events` (SSE optional)
- `PATCH /api/orders/:id/status` (admin/testing)
- Swagger UI: `GET /api/docs`
- OpenAPI JSON: `GET /api/docs.json`
- WebSocket: connect to `/ws`, then subscribe with `{ "type":"SUBSCRIBE_ORDER", "orderId":"..." }`

## Real-time status simulation
When an order is created, backend simulates:
- `ORDER_RECEIVED` → `PREPARING` → `OUT_FOR_DELIVERY` → `DELIVERED`

## Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## Notes
- Orders and menu are stored in-memory for simplicity. Repository is isolated so swapping to SQLite/Postgres is straightforward.
- Includes centralized error handling, request validation, and predictable domain model enums.
