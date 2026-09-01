We'd like to add two features to the dashboard.

The two tasks are independent of each other.

You may use Claude Code, Codex, Cursor, subagents, parallel agents, or any other AI-assisted development workflow you normally use.

You do not have to finish everything perfectly. Prioritize the work as you think appropriate.

## 1. Service details

When a service is selected, display a details panel containing:

- service name and status
- current CPU, memory, requests/sec and latency
- CPU history
- latency history
- average latency
- p95 latency

Keep the latest 48 latency samples per service, similar to the existing CPU history.

Do not add a charting or statistics library.

## 2. Service filtering and sorting

Add controls above the service grid.

Filter by status:

- All
- Healthy
- Warning
- Offline

Sort by:

- Name
- CPU
- Memory
- Latency
- Requests/sec

Also display:

`Showing X of Y services`

Do not mutate the original services array while sorting.

## Constraints

- Keep the existing stack.
- Do not add an external state-management library.
- Do not add large dependencies.
- Preserve good rendering performance.
- Run the build before considering the work complete.

You may organize and parallelize the work however you think is most effective.
