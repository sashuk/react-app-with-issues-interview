import { memo } from "react";
import ServiceCard from "./ServiceCard";
import type { Service, Thresholds } from "./types";

function ServiceGrid({
  services,
  selectedServiceId,
  onSelect,
  thresholds,
}: {
  services: Service[];
  selectedServiceId: string | null;
  onSelect: (id: string) => void;
  thresholds: Thresholds;
}) {
  return (
    <section className="service-grid">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          selected={service.id === selectedServiceId}
          onSelect={onSelect}
          thresholds={thresholds}
        />
      ))}
    </section>
  );
}

export default memo(ServiceGrid);
