import type { Service, ServiceStatus, StreamEvent } from "../src/types";

const SERVICE_NAMES = [
  "API Gateway",
  "Model Runtime",
  "Vector Store",
  "Scheduler",
  "Cache",
  "Database",
];

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(20240517);

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(random() * items.length)];
}

function between(min: number, max: number) {
  return min + random() * (max - min);
}

function round(value: number, decimals = 0) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function drift(value: number, amount: number, min: number, max: number) {
  return clamp(value + between(-amount, amount), min, max);
}

const services: Service[] = SERVICE_NAMES.map((name, index) => {
  const cpu = round(between(5, 80), 1);
  return {
    id: `svc-${index + 1}`,
    name,
    status: random() < 0.12 ? "warning" : "healthy",
    cpu,
    memory: round(between(15, 85), 1),
    requestsPerSecond: round(between(5, 600), 1),
    latency: round(between(20, 300)),
    cpuHistory: Array.from({ length: 48 }, () =>
      round(clamp(cpu + between(-8, 8), 5, 95), 1),
    ),
  };
});

export function getSnapshot() {
  return { services };
}

function metricsEvent(service: Service): StreamEvent {
  service.cpu = round(drift(service.cpu, 6, 5, 95), 1);
  service.memory = round(drift(service.memory, 3, 10, 95), 1);
  service.requestsPerSecond = round(
    drift(service.requestsPerSecond, 25, 0, 900),
    1,
  );
  service.latency = round(drift(service.latency, 20, 20, 500));

  return {
    type: "metrics",
    serviceId: service.id,
    cpu: service.cpu,
    memory: service.memory,
    requestsPerSecond: service.requestsPerSecond,
    latency: service.latency,
  };
}

function statusEvent(service: Service): StreamEvent {
  const roll = random();
  const status: ServiceStatus =
    roll < 0.6 ? "healthy" : roll < 0.9 ? "warning" : "offline";
  service.status = status;
  return { type: "status", serviceId: service.id, status };
}

export function startSimulation(emit: (event: StreamEvent) => void) {
  const timer = setInterval(() => {
    emit(metricsEvent(pick(services)));
    emit(metricsEvent(pick(services)));
    emit(metricsEvent(pick(services)));

    if (random() < 0.006) {
      emit(statusEvent(pick(services)));
    }
  }, 100);

  return () => clearInterval(timer);
}
