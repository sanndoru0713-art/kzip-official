"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/ui";
import { NotConnected } from "@/components/dashboard/NotConnected";

export default function SearchConsolePage() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [req, setReq] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/integrations")
      .then((r) => r.json())
      .then((d) => {
        setConnected(!!d.searchConsole?.connected);
        setReq(d.searchConsole?.requirement || "");
      })
      .catch(() => setConnected(false));
  }, []);

  return (
    <div className="d-fade">
      <PageHeader
        title="Google Search Console"
        description="노출수·클릭수·CTR·평균 게재순위·검색어·국가·기기·페이지·색인 상태를 조회합니다. 실제 계정 연동 전에는 수치를 표시하지 않습니다."
      />
      {connected ? (
        <div className="d-card p-6 text-[13px]" style={{ color: "var(--d-text-soft)" }}>
          Search Console이 연결되었습니다. 데이터 조회 UI는 2차 개발(서버 OAuth 데이터 파이프라인) 단계에서 활성화됩니다.
        </div>
      ) : (
        <NotConnected
          icon="search"
          title="Search Console 계정 미연결"
          reason="Google Search Console 데이터(노출·클릭·CTR·순위 등)를 표시하려면 서비스 계정 연동이 필요합니다. 연동 전에는 임의의 수치를 절대 표시하지 않습니다."
          requirement={req || "GOOGLE_SERVICE_ACCOUNT_JSON + GSC_SITE_URL 환경변수를 설정하고, 서비스 계정 이메일을 Search Console 속성 사용자로 추가하세요."}
          fields={["총 노출수", "총 클릭수", "평균 CTR", "평균 게재순위", "상위 검색어", "국가별", "기기별", "페이지별", "색인 상태", "사이트맵 상태", "기간별 변화", "신규/이탈 검색어"]}
        />
      )}
    </div>
  );
}
