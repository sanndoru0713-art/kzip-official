"use client";

import { useCallback, useEffect, useState } from "react";
import { useDashboard } from "./DashboardProvider";
import type { OwnershipVerification, SecurityScanResult } from "@/lib/security/types";
import { ownershipToken } from "@/lib/security/ownership";

const NS = "kzip-seo:security";
const OWN_NS = "kzip-seo:ownership";

function read<T>(key: string, fb: T): T {
  if (typeof window === "undefined") return fb;
  try {
    const r = window.localStorage.getItem(key);
    return r ? (JSON.parse(r) as T) : fb;
  } catch {
    return fb;
  }
}
function write<T>(key: string, v: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* noop */
  }
}

export function useSecurity() {
  const { activeSite } = useDashboard();
  const [result, setResult] = useState<SecurityScanResult | null>(null);
  const [ownership, setOwnership] = useState<OwnershipVerification | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const origin = activeSite ? safeOrigin(activeSite.url) : null;

  useEffect(() => {
    if (!activeSite) {
      setResult(null);
      setOwnership(null);
      return;
    }
    setResult(read<SecurityScanResult | null>(`${NS}:${activeSite.id}`, null));
    setOwnership(read<OwnershipVerification | null>(`${OWN_NS}:${activeSite.id}`, null));
  }, [activeSite]);

  const token = activeSite && origin ? ownershipToken(activeSite.id, origin) : "";

  const scan = useCallback(async () => {
    if (!activeSite) return;
    setScanning(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: activeSite.url, ownershipToken: ownership?.verified ? token : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `보안 검사 오류 (${res.status})`);
      setResult(data as SecurityScanResult);
      write(`${NS}:${activeSite.id}`, data);
      if ((data as SecurityScanResult).error) setError((data as SecurityScanResult).error!);
    } catch (e) {
      setError(e instanceof Error ? e.message : "보안 검사에 실패했습니다.");
    } finally {
      setScanning(false);
    }
  }, [activeSite, ownership, token]);

  const verifyOwnership = useCallback(
    async (method: "meta" | "file" | "dns" | "auto") => {
      if (!activeSite || !origin) return;
      setError(null);
      try {
        const res = await fetch("/api/dashboard/ownership", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: activeSite.url, token, method }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "인증 실패");
        const rec: OwnershipVerification = {
          siteId: activeSite.id,
          origin,
          method: (method === "auto" ? "meta" : method) as OwnershipVerification["method"],
          token,
          verified: !!data.verified,
          verifiedAt: data.verified ? data.checkedAt : null,
          lastCheckedAt: data.checkedAt,
          note: data.note,
        };
        setOwnership(rec);
        write(`${OWN_NS}:${activeSite.id}`, rec);
        return data.verified as boolean;
      } catch (e) {
        setError(e instanceof Error ? e.message : "소유권 인증에 실패했습니다.");
        return false;
      }
    },
    [activeSite, origin, token],
  );

  return { activeSite, origin, token, result, ownership, scanning, error, scan, verifyOwnership };
}

function safeOrigin(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}
