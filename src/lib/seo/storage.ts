/**
 * 로컬 저장소 (브라우저 localStorage 기반).
 * 향후 서버 DB로 교체 가능하도록 저장소 인터페이스를 한 곳에 모았다.
 */

import type {
  CompetitorEntry,
  CompetitorGroup,
  DashboardSettings,
  ImprovementTask,
  Scan,
  SiteEntry,
} from "./types";
import { DEFAULT_WEIGHTS } from "./scoring";

const NS = "kzip-seo";
const MAX_SCANS_PER_TARGET = 40;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(`${NS}:${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${NS}:${key}`, JSON.stringify(value));
  } catch (e) {
    // 용량 초과 시 가장 오래된 스캔 제거 후 재시도
    if (e instanceof DOMException && (e.name === "QuotaExceededError" || e.code === 22)) {
      pruneOldScans();
      try {
        window.localStorage.setItem(`${NS}:${key}`, JSON.stringify(value));
      } catch {
        /* 최종 실패 — 무시 */
      }
    }
  }
}

function pruneOldScans(): void {
  const index = read<string[]>("scan-index", []);
  for (const targetId of index) {
    const scans = read<Scan[]>(`scans:${targetId}`, []);
    if (scans.length > 5) write(`scans:${targetId}`, scans.slice(-5));
  }
}

export const storage = {
  getSites: (): SiteEntry[] => read("sites", []),
  saveSites: (sites: SiteEntry[]) => write("sites", sites),

  getCompetitors: (): CompetitorEntry[] => read("competitors", []),
  saveCompetitors: (list: CompetitorEntry[]) => write("competitors", list),

  getGroups: (): CompetitorGroup[] => read("groups", []),
  saveGroups: (groups: CompetitorGroup[]) => write("groups", groups),

  getScans: (targetId: string): Scan[] => read(`scans:${targetId}`, []),
  addScan: (scan: Scan): void => {
    const scans = read<Scan[]>(`scans:${scan.targetId}`, []);
    scans.push(scan);
    write(`scans:${scan.targetId}`, scans.slice(-MAX_SCANS_PER_TARGET));
    const index = read<string[]>("scan-index", []);
    if (!index.includes(scan.targetId)) write("scan-index", [...index, scan.targetId]);
  },
  updateScan: (scan: Scan): void => {
    const scans = read<Scan[]>(`scans:${scan.targetId}`, []);
    const idx = scans.findIndex((s) => s.id === scan.id);
    if (idx >= 0) {
      scans[idx] = scan;
      write(`scans:${scan.targetId}`, scans);
    }
  },
  deleteScans: (targetId: string): void => {
    if (typeof window !== "undefined") window.localStorage.removeItem(`${NS}:scans:${targetId}`);
  },

  getSettings: (): DashboardSettings =>
    read("settings", { weights: DEFAULT_WEIGHTS } as DashboardSettings),
  saveSettings: (s: DashboardSettings) => write("settings", s),

  getTasks: (): ImprovementTask[] => read("tasks", []),
  saveTasks: (tasks: ImprovementTask[]) => write("tasks", tasks),
};

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
