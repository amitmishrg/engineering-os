/**
 * Run a performance profile against a URL using Puppeteer + CDP.
 */

import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";
import type { ProfileScenario, ProfileSnapshot } from "./types.js";

const WEB_VITALS_FN = `
() => {
  return new Promise((resolve) => {
    const result = { lcp_ms: null, inp_ms: null, cls: null, ttfb_ms: null, fcp_ms: null };
    try {
      const nav = performance.getEntriesByType('navigation')[0];
      if (nav) result.ttfb_ms = nav.responseStart;

      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find((e) => e.name === 'first-contentful-paint');
      if (fcp) result.fcp_ms = fcp.startTime;

      let cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) cls += entry.value;
        }
        result.cls = cls;
      }).observe({ type: 'layout-shift', buffered: true });

      new PerformanceObserver((list) => {
        const last = list.getEntries().at(-1);
        if (last) result.lcp_ms = last.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      let longTasks = 0;
      new PerformanceObserver((list) => {
        longTasks += list.getEntries().length;
      }).observe({ type: 'longtask', buffered: true });

      setTimeout(() => resolve({ ...result, longTasks }), 3000);
    } catch (e) {
      resolve(result);
    }
  });
}
`;

function findChrome(): string | null {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].filter(Boolean) as string[];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export async function runProfile(
  scenario: ProfileScenario,
  phase: "before" | "after"
): Promise<ProfileSnapshot> {
  const executablePath = findChrome();

  if (!executablePath) {
    throw new Error(
      "Chrome not found. Set CHROME_PATH or install Google Chrome for performance profiling."
    );
  }

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    const client = await page.createCDPSession();
    await client.send("Performance.enable");

    await page.goto(scenario.url, { waitUntil: "networkidle2", timeout: 60000 });

    if (scenario.actions?.length) {
      for (const action of scenario.actions) {
        const repeat = action.repeat ?? 1;
        for (let i = 0; i < repeat; i++) {
          if (action.selector) {
            await page.waitForSelector(action.selector, { timeout: 10000 }).catch(() => null);
            await page.click(action.selector).catch(() => null);
          }
          if (action.waitMs) await sleep(action.waitMs);
        }
      }
    }

    if (scenario.waitMs) await sleep(scenario.waitMs);

    // Trigger GC where supported
    try {
      await client.send("HeapProfiler.collectGarbage");
    } catch {
      // optional
    }

    const vitals = (await page.evaluate(WEB_VITALS_FN)) as {
      lcp_ms: number | null;
      inp_ms: number | null;
      cls: number | null;
      ttfb_ms: number | null;
      fcp_ms: number | null;
      longTasks?: number;
    };

    const heap = await page.metrics();
    const nodes = await page.evaluate(() => document.getElementsByTagName("*").length);

    return {
      phase,
      url: scenario.url,
      captured_at: new Date().toISOString(),
      webVitals: {
        lcp_ms: vitals.lcp_ms,
        inp_ms: vitals.inp_ms,
        cls: vitals.cls,
        ttfb_ms: vitals.ttfb_ms,
        fcp_ms: vitals.fcp_ms,
      },
      memory: {
        heap_used_mb: roundMb(heap.JSHeapUsedSize ?? 0),
        heap_total_mb: roundMb(heap.JSHeapTotalSize ?? 0),
        nodes_count: nodes,
      },
      cpu: {
        long_tasks: vitals.longTasks ?? 0,
        scripting_ms: 0,
      },
    };
  } finally {
    await browser.close();
  }
}

function roundMb(bytes: number): number {
  return Math.round((bytes / 1024 / 1024) * 10) / 10;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function loadScenario(filePath: string): ProfileScenario {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as ProfileScenario;
}

export function saveSnapshot(dir: string, snapshot: ProfileSnapshot): string {
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${snapshot.phase}.json`);
  fs.writeFileSync(file, JSON.stringify(snapshot, null, 2));
  return file;
}

export function loadSnapshot(dir: string, phase: "before" | "after"): ProfileSnapshot | null {
  const file = path.join(dir, `${phase}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as ProfileSnapshot;
}
