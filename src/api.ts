import type { DashboardSnapshot, StreamEvent } from "./types";

export async function loadSnapshot(): Promise<DashboardSnapshot> {
  const response = await fetch("/api/snapshot");
  if (!response.ok) throw new Error(`Snapshot failed: ${response.status}`);
  return response.json();
}

export function subscribeToEvents(
  onEvent: (event: StreamEvent) => void,
  onConnectionChange?: (connected: boolean) => void,
): () => void {
  const source = new EventSource("/api/stream");

  source.onopen = () => onConnectionChange?.(true);
  source.onerror = () => onConnectionChange?.(false);
  source.onmessage = (message) => {
    onEvent(JSON.parse(message.data) as StreamEvent);
  };

  return () => source.close();
}
