/**
 * Types for performance profiling results.
 */

export type WebVitalsMetrics = {
  lcp_ms: number | null;
  inp_ms: number | null;
  cls: number | null;
  ttfb_ms: number | null;
  fcp_ms: number | null;
};

export type MemoryMetrics = {
  heap_used_mb: number;
  heap_total_mb: number;
  nodes_count: number;
};

export type CpuMetrics = {
  long_tasks: number;
  scripting_ms: number;
};

export type ProfileSnapshot = {
  phase: "before" | "after";
  url: string;
  captured_at: string;
  webVitals: WebVitalsMetrics;
  memory: MemoryMetrics;
  cpu: CpuMetrics;
};

export type ProfileScenario = {
  name?: string;
  url: string;
  actions?: Array<{ type: "click"; selector?: string; repeat?: number; waitMs?: number }>;
  waitMs?: number;
};

export function rateVital(name: keyof WebVitalsMetrics, value: number | null): string {
  if (value === null) return "unknown";
  const thresholds: Record<string, [number, number]> = {
    lcp_ms: [2500, 4000],
    inp_ms: [200, 500],
    cls: [0.1, 0.25],
    ttfb_ms: [800, 1800],
    fcp_ms: [1800, 3000],
  };
  const t = thresholds[name];
  if (!t) return "unknown";
  if (value <= t[0]) return "good";
  if (value <= t[1]) return "needs-improvement";
  return "poor";
}
