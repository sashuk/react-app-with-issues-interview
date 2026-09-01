export type ServiceStatus = "healthy" | "warning" | "offline";

export type Service = {
  id: string;
  name: string;
  status: ServiceStatus;
  cpu: number;
  memory: number;
  requestsPerSecond: number;
  latency: number;
  cpuHistory: number[];
};

export type DashboardSnapshot = {
  services: Service[];
};

export type MetricsEvent = {
  type: "metrics";
  serviceId: string;
  cpu: number;
  memory: number;
  requestsPerSecond: number;
  latency: number;
};

export type StatusEvent = {
  type: "status";
  serviceId: string;
  status: ServiceStatus;
};

export type StreamEvent = MetricsEvent | StatusEvent;

export type Thresholds = {
  cpu: number;
  memory: number;
  latency: number;
};
