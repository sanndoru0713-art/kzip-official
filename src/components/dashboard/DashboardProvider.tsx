"use client";

/**
 * 대시보드 전역 상태 — localStorage 영속 + 분석 실행.
 * 가중치 변경 시 파생 점수는 각 화면에서 즉시 재계산된다 (원시 크롤 데이터 저장 방식).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  CompetitorEntry,
  CompetitorGroup,
  CrawlResult,
  DashboardSettings,
  ImprovementTask,
  PsiMetrics,
  Scan,
  SiteEntry,
  SiteType,
  TaskStatus,
} from "@/lib/seo/types";
import { storage, uid } from "@/lib/seo/storage";
import { DEFAULT_WEIGHTS } from "@/lib/seo/scoring";

interface ScanProgress {
  targetId: string;
  stage: string;
}

interface DashboardState {
  ready: boolean;
  sites: SiteEntry[];
  competitors: CompetitorEntry[];
  groups: CompetitorGroup[];
  settings: DashboardSettings;
  tasks: ImprovementTask[];
  activeSite: SiteEntry | null;
  scans: Scan[]; // 활성 사이트의 스캔 이력 (오래된 → 최신)
  latestScan: Scan | null;
  prevScan: Scan | null;
  scanning: ScanProgress | null;
  scanError: string | null;
  /* actions */
  setActiveSiteId: (id: string) => void;
  addSite: (name: string, url: string, type: SiteType, memo?: string) => SiteEntry;
  updateSite: (site: SiteEntry) => void;
  removeSite: (id: string) => void;
  addCompetitor: (name: string, url: string, type: SiteType, groupId?: string) => void;
  updateCompetitor: (c: CompetitorEntry) => void;
  removeCompetitor: (id: string) => void;
  addGroup: (name: string, type: SiteType) => void;
  removeGroup: (id: string) => void;
  saveSettings: (s: DashboardSettings) => void;
  runScan: (target: SiteEntry | CompetitorEntry) => Promise<Scan | null>;
  runPsi: (scan: Scan) => Promise<void>;
  getScansFor: (targetId: string) => Scan[];
  setTaskStatus: (siteId: string, checkId: string, status: TaskStatus, assignee?: string) => void;
  taskFor: (siteId: string, checkId: string) => ImprovementTask | undefined;
}

const Ctx = createContext<DashboardState | null>(null);

export function useDashboard(): DashboardState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDashboard must be used within DashboardProvider");
  return v;
}

export default function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [sites, setSites] = useState<SiteEntry[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorEntry[]>([]);
  const [groups, setGroups] = useState<CompetitorGroup[]>([]);
  const [settings, setSettings] = useState<DashboardSettings>({ weights: DEFAULT_WEIGHTS });
  const [tasks, setTasks] = useState<ImprovementTask[]>([]);
  const [scansVersion, setScansVersion] = useState(0);
  const [scanning, setScanning] = useState<ScanProgress | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    setSites(storage.getSites());
    setCompetitors(storage.getCompetitors());
    setGroups(storage.getGroups());
    setSettings(storage.getSettings());
    setTasks(storage.getTasks());
    setReady(true);
  }, []);

  const activeSite = useMemo(
    () => sites.find((s) => s.id === settings.activeSiteId) || sites[0] || null,
    [sites, settings.activeSiteId],
  );

  const scans = useMemo(() => {
    void scansVersion;
    return activeSite ? storage.getScans(activeSite.id) : [];
  }, [activeSite, scansVersion]);

  const latestScan = scans.length > 0 ? scans[scans.length - 1] : null;
  const prevScan = scans.length > 1 ? scans[scans.length - 2] : null;

  const saveSettingsCb = useCallback((s: DashboardSettings) => {
    setSettings(s);
    storage.saveSettings(s);
  }, []);

  const setActiveSiteId = useCallback(
    (id: string) => saveSettingsCb({ ...settings, activeSiteId: id }),
    [settings, saveSettingsCb],
  );

  const addSite = useCallback(
    (name: string, url: string, type: SiteType, memo?: string): SiteEntry => {
      const entry: SiteEntry = {
        id: uid(),
        name,
        url,
        type,
        memo,
        createdAt: new Date().toISOString(),
        isCompetitor: false,
      };
      setSites((prev) => {
        const next = [...prev, entry];
        storage.saveSites(next);
        return next;
      });
      saveSettingsCb({ ...settings, activeSiteId: entry.id });
      return entry;
    },
    [settings, saveSettingsCb],
  );

  const updateSite = useCallback((site: SiteEntry) => {
    setSites((prev) => {
      const next = prev.map((s) => (s.id === site.id ? site : s));
      storage.saveSites(next);
      return next;
    });
  }, []);

  const removeSite = useCallback((id: string) => {
    setSites((prev) => {
      const next = prev.filter((s) => s.id !== id);
      storage.saveSites(next);
      return next;
    });
    storage.deleteScans(id);
    setScansVersion((v) => v + 1);
  }, []);

  const addCompetitor = useCallback((name: string, url: string, type: SiteType, groupId?: string) => {
    const entry: CompetitorEntry = {
      id: uid(),
      name,
      url,
      type,
      groupId,
      createdAt: new Date().toISOString(),
      isCompetitor: true,
    };
    setCompetitors((prev) => {
      const next = [...prev, entry];
      storage.saveCompetitors(next);
      return next;
    });
  }, []);

  const updateCompetitor = useCallback((c: CompetitorEntry) => {
    setCompetitors((prev) => {
      const next = prev.map((x) => (x.id === c.id ? c : x));
      storage.saveCompetitors(next);
      return next;
    });
  }, []);

  const removeCompetitor = useCallback((id: string) => {
    setCompetitors((prev) => {
      const next = prev.filter((x) => x.id !== id);
      storage.saveCompetitors(next);
      return next;
    });
    storage.deleteScans(id);
    setScansVersion((v) => v + 1);
  }, []);

  const addGroup = useCallback((name: string, type: SiteType) => {
    setGroups((prev) => {
      const next = [...prev, { id: uid(), name, type, createdAt: new Date().toISOString() }];
      storage.saveGroups(next);
      return next;
    });
  }, []);

  const removeGroup = useCallback((id: string) => {
    setGroups((prev) => {
      const next = prev.filter((g) => g.id !== id);
      storage.saveGroups(next);
      return next;
    });
  }, []);

  const runScan = useCallback(
    async (target: SiteEntry | CompetitorEntry): Promise<Scan | null> => {
      setScanning({ targetId: target.id, stage: "크롤링 중… (robots.txt·sitemap·페이지 수집)" });
      setScanError(null);
      try {
        const res = await fetch("/api/dashboard/crawl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: target.url }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `크롤 API 오류 (${res.status})`);
        }
        const crawl = (await res.json()) as CrawlResult;
        const scan: Scan = {
          id: uid(),
          targetId: target.id,
          targetUrl: target.url,
          targetType: target.type,
          isCompetitor: target.isCompetitor,
          scannedAt: new Date().toISOString(),
          crawl,
        };
        storage.addScan(scan);
        setScansVersion((v) => v + 1);
        if (crawl.error) setScanError(crawl.error);
        return scan;
      } catch (e) {
        setScanError(e instanceof Error ? e.message : "분석 실행에 실패했습니다.");
        return null;
      } finally {
        setScanning(null);
      }
    },
    [],
  );

  const runPsi = useCallback(
    async (scan: Scan): Promise<void> => {
      setScanning({ targetId: scan.targetId, stage: "PageSpeed Insights 측정 중… (최대 60초)" });
      setScanError(null);
      try {
        const res = await fetch("/api/dashboard/psi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: scan.targetUrl, key: settings.psiApiKey || undefined }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `PSI 오류 (${res.status})`);
        const updated: Scan = { ...scan, psi: data as PsiMetrics };
        storage.updateScan(updated);
        setScansVersion((v) => v + 1);
      } catch (e) {
        setScanError(
          e instanceof Error
            ? `PageSpeed 측정 실패: ${e.message}`
            : "PageSpeed 측정에 실패했습니다.",
        );
      } finally {
        setScanning(null);
      }
    },
    [settings.psiApiKey],
  );

  const getScansFor = useCallback(
    (targetId: string) => {
      void scansVersion;
      return storage.getScans(targetId);
    },
    [scansVersion],
  );

  const setTaskStatus = useCallback((siteId: string, checkId: string, status: TaskStatus, assignee?: string) => {
    setTasks((prev) => {
      const id = `${siteId}:${checkId}`;
      const existing = prev.find((t) => t.id === id);
      const next = existing
        ? prev.map((t) => (t.id === id ? { ...t, status, assignee: assignee ?? t.assignee, updatedAt: new Date().toISOString() } : t))
        : [...prev, { id, siteId, checkId, status, assignee, updatedAt: new Date().toISOString() }];
      storage.saveTasks(next);
      return next;
    });
  }, []);

  const taskFor = useCallback(
    (siteId: string, checkId: string) => tasks.find((t) => t.id === `${siteId}:${checkId}`),
    [tasks],
  );

  const value: DashboardState = {
    ready,
    sites,
    competitors,
    groups,
    settings,
    tasks,
    activeSite,
    scans,
    latestScan,
    prevScan,
    scanning,
    scanError,
    setActiveSiteId,
    addSite,
    updateSite,
    removeSite,
    addCompetitor,
    updateCompetitor,
    removeCompetitor,
    addGroup,
    removeGroup,
    saveSettings: saveSettingsCb,
    runScan,
    runPsi,
    getScansFor,
    setTaskStatus,
    taskFor,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
