"use client";

import { usePathname } from "next/navigation";

/** 대시보드(/dashboard)에서는 사이트 공통 Header/Footer를 렌더하지 않는다 */
export default function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/dashboard")) return null;
  return <>{children}</>;
}
