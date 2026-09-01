import { memo, useRef } from "react";
import type { Service, Thresholds } from "./types";

function Sparkline({ samples }: { samples: number[] }) {
  const points = samples
    .map((value, index) => {
      const x = (index / Math.max(samples.length - 1, 1)) * 60;
      const y = 18 - (value / 100) * 18;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg className="sparkline" viewBox="0 0 60 18" preserveAspectRatio="none">
      <polyline points={points} />
    </svg>
  );
}

function ServiceCard({
  service,
  selected,
  onSelect,
  thresholds,
}: {
  service: Service;
  selected: boolean;
  onSelect: (id: string) => void;
  thresholds: Thresholds;
}) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <button
      type="button"
      className={`service-card ${service.status} ${selected ? "selected" : ""}`}
      onClick={() => onSelect(service.id)}
    >
      <span key={renderCount.current} className="render-flash" />

      <div className="service-card-head">
        <span className="service-name">{service.name}</span>
        <span className="service-status">{service.status}</span>
      </div>

      <Sparkline samples={service.cpuHistory} />

      <dl className="metrics">
        <div>
          <dt>CPU</dt>
          <dd className={service.cpu > thresholds.cpu ? "over" : undefined}>
            {service.cpu.toFixed(1)}%
          </dd>
        </div>
        <div>
          <dt>Memory</dt>
          <dd
            className={service.memory > thresholds.memory ? "over" : undefined}
          >
            {service.memory.toFixed(1)}%
          </dd>
        </div>
        <div>
          <dt>Req/s</dt>
          <dd>{service.requestsPerSecond.toFixed(0)}</dd>
        </div>
        <div>
          <dt>Latency</dt>
          <dd
            className={service.latency > thresholds.latency ? "over" : undefined}
          >
            {service.latency}ms
          </dd>
        </div>
      </dl>

      <span className="render-count">renders: {renderCount.current}</span>
    </button>
  );
}

export default memo(ServiceCard);
