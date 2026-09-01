import { memo, useCallback, useEffect, useReducer, useRef, useState } from "react";
import { subscribeToEvents } from "./api";
import ServiceGrid from "./ServiceGrid";
import type { DashboardSnapshot, Service, StreamEvent } from "./types";

type State = DashboardSnapshot & { totalEvents: number };

function cloneServices(services: Service[]): Record<string, Service> {
  const byId: Record<string, Service> = {};
  for (const service of services) byId[service.id] = { ...service };
  return byId;
}

function reducer(state: State, event: StreamEvent): State {
  const totalEvents = state.totalEvents + 1;

  switch (event.type) {
    case "metrics": {
      const byId = cloneServices(state.services);
      const target = byId[event.serviceId];

      target.cpu = event.cpu;
      target.memory = event.memory;
      target.requestsPerSecond = event.requestsPerSecond;
      target.latency = event.latency;
      target.cpuHistory = [...target.cpuHistory, event.cpu];

      return {
        ...state,
        totalEvents,
        services: state.services.map((service) => byId[service.id]),
      };
    }

    case "status": {
      const byId = cloneServices(state.services);
      byId[event.serviceId].status = event.status;

      return {
        ...state,
        totalEvents,
        services: state.services.map((service) => byId[service.id]),
      };
    }
  }
}

export default function Dashboard({
  snapshot,
}: {
  snapshot: DashboardSnapshot;
}) {
  const [state, dispatch] = useReducer(reducer, { ...snapshot, totalEvents: 0 });
  const [connected, setConnected] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  );

  useEffect(() => subscribeToEvents(dispatch, setConnected), []);

  const selectService = useCallback((id: string) => {
    setSelectedServiceId((current) => (current === id ? null : id));
  }, []);

  return (
    <div className="dashboard">
      <Header connected={connected} totalEvents={state.totalEvents} />
      <ServiceGrid
        services={state.services}
        selectedServiceId={selectedServiceId}
        onSelect={selectService}
        thresholds={{ cpu: 80, memory: 85, latency: 250 }}
      />
    </div>
  );
}

const Header = memo(function Header({
  connected,
  totalEvents,
}: {
  connected: boolean;
  totalEvents: number;
}) {
  const eventsPerSecond = useEventsPerSecond(totalEvents);

  return (
    <header className="header">
      <h1>System Dashboard</h1>
      <div className="header-stats">
        <span className={connected ? "pill connected" : "pill disconnected"}>
          {connected ? "connected" : "disconnected"}
        </span>
        <span>{totalEvents.toLocaleString()} events</span>
        <span>{eventsPerSecond} events/s</span>
      </div>
    </header>
  );
});

function useEventsPerSecond(totalEvents: number) {
  const [eventsPerSecond, setEventsPerSecond] = useState(0);
  const totalRef = useRef(totalEvents);
  totalRef.current = totalEvents;

  useEffect(() => {
    let previous = totalRef.current;
    const timer = setInterval(() => {
      setEventsPerSecond(totalRef.current - previous);
      previous = totalRef.current;
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return eventsPerSecond;
}
