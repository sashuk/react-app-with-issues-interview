# System Dashboard

A real-time monitoring dashboard showing six services with live metrics.

```bash
pnpm install
```

```bash
pnpm dev
```

```bash
pnpm build
```

## How it works

`pnpm dev` starts two processes:

- **API server** (`server/`, port 3001) — simulates the services and serves the data.
- **Vite dev server** (port 5173) — serves the React app and proxies `/api/*` to the API server.

### What the backend sends

The backend keeps an in-memory list of 6 services and mutates their metrics on a timer (seeded random, so runs are reproducible). It exposes two endpoints:

**`GET /api/snapshot`** — the full current state, fetched once on page load:

```json
{
  "services": [
    {
      "id": "svc-1",
      "name": "API Gateway",
      "status": "healthy",
      "cpu": 42.5,
      "memory": 61.3,
      "requestsPerSecond": 318.2,
      "latency": 87,
      "cpuHistory": [40.1, 43.8, "…48 samples total"]
    }
  ]
}
```

`status` is one of `healthy | warning | offline`. `cpuHistory` holds the last 48 CPU samples, oldest first.

**`GET /api/stream`** — a Server-Sent Events stream. Each message is one JSON event, and every event describes exactly **one** service:

```json
{ "type": "metrics", "serviceId": "svc-3", "cpu": 55.1, "memory": 70.2, "requestsPerSecond": 401.5, "latency": 120 }
```

```json
{ "type": "status", "serviceId": "svc-3", "status": "warning" }
```

`metrics` events arrive continuously (~30/s spread across all services) and carry a fresh reading of all four metrics. `status` events are rare and mark a service changing between healthy/warning/offline.

The event and snapshot shapes are the TypeScript types in [src/types.ts](src/types.ts), shared by server and client.

### How the widgets consume it

1. [App.tsx](src/App.tsx) fetches `/api/snapshot` and hands it to `Dashboard`.
2. [Dashboard.tsx](src/Dashboard.tsx) holds the services in a `useReducer` and subscribes to `/api/stream` ([api.ts](src/api.ts)); every incoming event is dispatched to the reducer.
3. The reducer applies the event to the service named by `serviceId`.
4. [ServiceGrid.tsx](src/ServiceGrid.tsx) renders one [ServiceCard.tsx](src/ServiceCard.tsx) per service.

Each card shows a live render counter and briefly flashes when it re-renders, so rendering behavior is directly visible in the UI. The header shows the total number of stream events received and the current events/second rate.
