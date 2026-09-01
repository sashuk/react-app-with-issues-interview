import { createServer } from "node:http";
import type { StreamEvent } from "../src/types";
import { getSnapshot, startSimulation } from "./simulator";

const PORT = 3001;

const clients = new Set<(event: StreamEvent) => void>();

startSimulation((event) => {
  for (const send of clients) send(event);
});

const server = createServer((req, res) => {
  if (req.url === "/api/snapshot") {
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    });
    res.end(JSON.stringify(getSnapshot()));
    return;
  }

  if (req.url === "/api/stream") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
    });

    const send = (event: StreamEvent) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    clients.add(send);
    req.on("close", () => {
      clients.delete(send);
    });
    return;
  }

  res.writeHead(404).end();
});

server.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
