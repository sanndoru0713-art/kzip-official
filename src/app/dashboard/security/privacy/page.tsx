"use client";

import { PageHeader, Icon } from "@/components/dashboard/ui";

export default function PrivacyPage() {
  return (
    <div className="d-fade">
      <PageHeader title="개인정보 · 데이터 보호" description="수집 최소화·암호화·고객사별 데이터 분리 원칙입니다. 병원 데이터와 일반 데이터를 논리적으로 분리하고, 환자 민감정보는 분석 대상에서 제외합니다." />

      <div className="d-card mb-5 flex items-start gap-3 p-4" style={{ background: "var(--d-mint-soft)" }}>
        <Icon name="privacy" size={18} className="mt-0.5 shrink-0" style={{ color: "var(--d-mint)" }} />
        <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--d-text-soft)" }}>
          <strong>병원 사이트 분석 시</strong> 환자의 이름·연락처·예약정보·진료정보 등 민감정보는 분석·저장 대상에서 제외됩니다. 크롤러는 공개 페이지의 SEO 신호만 수집하며, 민감정보로 보이는 문자열은 마스킹 처리합니다.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { g: "데이터 최소화·암호화", items: ["수집 데이터 최소화", "개인정보 암호화 저장", "전송구간 TLS 암호화", "민감정보 마스킹 표시"] },
          { g: "데이터 분리", items: ["사용자별 데이터 분리", "고객사별 데이터 분리", "병원/관광 데이터 논리 분리", "환자 민감정보 분석 제외"] },
          { g: "보관·삭제", items: ["데이터 보관기간 설정", "데이터 삭제 요청 처리", "계정 탈퇴 시 데이터 처리"] },
          { g: "정책·기록", items: ["개인정보처리방침·이용약관·쿠키 정책", "접속기록 관리", "관리자 열람 기록", "리포트 다운로드 기록"] },
        ].map((f) => (
          <div key={f.g} className="d-card p-4">
            <p className="mb-2 text-[13.5px] font-bold">{f.g}</p>
            <ul className="space-y-1 text-[12.5px]" style={{ color: "var(--d-text-soft)" }}>
              {f.items.map((i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <Icon name="check" size={13} className="mt-0.5 shrink-0" style={{ color: "var(--d-mint)" }} /> {i}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
