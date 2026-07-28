"use client";

import Link from "next/link";
import { useSecurity } from "@/components/dashboard/useSecurity";
import { Icon, PageHeader } from "@/components/dashboard/ui";

const VULNS: { name: string; sev: string; passive: string }[] = [
  { name: "Clickjacking (X-Frame-Options)", sev: "보통", passive: "수동 점검 가능 (헤더 관측)" },
  { name: "보안 설정 오류 (헤더 부재)", sev: "보통", passive: "수동 점검 가능" },
  { name: "민감정보/파일 노출 (.env·.git)", sev: "긴급", passive: "소유권 인증 후 (비파괴 GET)" },
  { name: "공개 디버그·에러 정보 노출", sev: "보통", passive: "소유권 인증 후" },
  { name: "디렉터리 목록 노출", sev: "높음", passive: "소유권 인증 후" },
  { name: "오픈 리디렉션", sev: "보통", passive: "소유권 인증 후 (비파괴)" },
  { name: "CORS 설정 오류", sev: "보통", passive: "헤더 관측" },
  { name: "Rate Limit 부재", sev: "보통", passive: "정책상 능동 테스트 미수행" },
  { name: "SQL Injection 가능성", sev: "높음", passive: "능동 공격 미수행 — 코드리뷰 권장" },
  { name: "XSS 가능성", sev: "높음", passive: "능동 공격 미수행 — 코드리뷰 권장" },
  { name: "CSRF 보호 여부", sev: "높음", passive: "능동 테스트 미수행" },
  { name: "인증/세션 설정 오류", sev: "높음", passive: "능동 테스트 미수행" },
  { name: "접근권한 설정 오류", sev: "높음", passive: "능동 테스트 미수행" },
  { name: "안전하지 않은 파일 업로드", sev: "높음", passive: "능동 테스트 미수행" },
  { name: "오래된 라이브러리", sev: "보통", passive: "의존성 스캔 연동 필요" },
  { name: "API 인증 누락 가능성", sev: "높음", passive: "능동 테스트 미수행" },
];

export default function VulnerabilitiesPage() {
  const { ownership } = useSecurity();
  return (
    <div className="d-fade">
      <PageHeader
        title="취약점 점검"
        description="화이트햇 정책: 실제 공격 코드 실행·데이터 변경 없이, 소유권이 인증된 사이트에 한해 안전·비파괴 범위의 '징후'만 점검합니다."
      />

      <div className="d-card mb-5 flex items-start gap-3 p-4" style={{ background: ownership?.verified ? "var(--d-mint-soft)" : "var(--d-orange-soft)" }}>
        <Icon name={ownership?.verified ? "check" : "lock"} size={18} className="mt-0.5 shrink-0" style={{ color: ownership?.verified ? "var(--d-mint)" : "var(--d-orange)" }} />
        <div>
          <p className="text-[13px] font-bold" style={{ color: ownership?.verified ? "var(--d-mint)" : "var(--d-orange)" }}>
            {ownership?.verified ? "소유권 인증됨 — 비파괴 확장 점검 가능" : "소유권 인증 필요"}
          </p>
          <p className="mt-1 text-[12.5px]" style={{ color: "var(--d-text-soft)" }}>
            SQL Injection·XSS·인증 우회 등은 능동 검증이 필요하지만, 본 도구는 <strong>실제 공격을 수행하지 않습니다</strong>. 이런 항목은 임의로 &lsquo;취약&rsquo;으로 표시하지 않으며, 코드 리뷰 또는 별도 승인된 침투 테스트로 확인하도록 안내합니다.
          </p>
          {!ownership?.verified && <Link href="/dashboard/security/ownership" className="d-btn d-btn-secondary d-btn-sm mt-2"><Icon name="lock" size={13} /> 소유권 인증</Link>}
        </div>
      </div>

      <div className="d-card overflow-x-auto">
        <table className="d-table d-table-hover">
          <thead><tr><th>점검 항목</th><th>위험도</th><th>점검 방식</th><th>상태</th></tr></thead>
          <tbody>
            {VULNS.map((v) => {
              const activeOnly = v.passive.includes("능동") || v.passive.includes("코드리뷰") || v.passive.includes("의존성");
              const status = activeOnly ? "정책상 미수행" : v.passive.includes("소유권") && !ownership?.verified ? "권한 확인 필요" : "검사 필요";
              return (
                <tr key={v.name}>
                  <td className="font-semibold">{v.name}</td>
                  <td><span className="text-[12px]" style={{ color: v.sev === "긴급" ? "var(--d-red)" : v.sev === "높음" ? "var(--d-orange)" : "var(--d-text-soft)" }}>{v.sev}</span></td>
                  <td className="text-[12px]" style={{ color: "var(--d-text-soft)" }}>{v.passive}</td>
                  <td><span className="d-badge" style={{ background: "var(--d-gray-chip)", color: "var(--d-text-mute)" }}>{status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="d-card mt-5 p-5">
        <h3 className="mb-2 text-[14px] font-bold">수행하지 않는 능동 검사 (정책)</h3>
        <div className="flex flex-wrap gap-1.5">
          {["로그인 시도", "인증 우회", "취약점 공격", "대량 요청", "포트 스캔", "디렉터리 무차별 탐색", "부하 테스트", "파일 업로드 테스트", "API 공격", "침투 테스트"].map((t) => (
            <span key={t} className="d-badge" style={{ background: "var(--d-red-soft)", color: "var(--d-red)" }}>✕ {t}</span>
          ))}
        </div>
        <p className="mt-2 text-[11.5px]" style={{ color: "var(--d-text-mute)" }}>경쟁사·권한 미확인 외부 사이트에는 공개 정보(수동)만 분석합니다.</p>
      </div>
    </div>
  );
}
