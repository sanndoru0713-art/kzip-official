"use client";

import { PageHeader, Icon } from "@/components/dashboard/ui";

const TRIGGERS = [
  "SSL 인증서 만료 임박", "사이트 접속 불가", "HTTPS 오류", "긴급 취약점 발견",
  "API Key 노출 가능성", "악성코드 의심", "사이트 변조", "관리자 로그인 실패 반복",
  "새로운 국가·기기 로그인", "비정상 대량 API 요청", "robots.txt 변경", "sitemap.xml 변경",
  "보안 헤더 삭제", "관리자 권한 변경",
];

const CHANNELS = [
  { name: "대시보드 알림", connected: true, note: "기본 활성 (앱 내)" },
  { name: "이메일", connected: false, note: "SMTP/발송 서비스 연동 필요" },
  { name: "Slack", connected: false, note: "Webhook URL 연동 필요" },
  { name: "Google Chat", connected: false, note: "Webhook URL 연동 필요" },
  { name: "웹푸시", connected: false, note: "푸시 구독 연동 필요" },
];

export default function AlertsPage() {
  return (
    <div className="d-fade">
      <PageHeader title="보안 알림" description="보안 이벤트 발생 시 알림을 발송합니다. 채널이 연결되지 않은 경우 가짜 발송 완료를 표시하지 않고 '채널 연결 필요'로 표시합니다." />

      <div className="d-card mb-5 p-5">
        <h2 className="mb-3 text-[15px] font-bold">알림 채널</h2>
        <div className="space-y-2">
          {CHANNELS.map((c) => (
            <div key={c.name} className="flex items-center justify-between gap-2 rounded-xl border p-3" style={{ borderColor: "var(--d-border)" }}>
              <div>
                <p className="text-[13px] font-semibold">{c.name}</p>
                <p className="text-[11.5px]" style={{ color: "var(--d-text-mute)" }}>{c.note}</p>
              </div>
              <span className="d-badge" style={{ background: c.connected ? "var(--d-mint-soft)" : "var(--d-orange-soft)", color: c.connected ? "var(--d-mint)" : "var(--d-orange)" }}>
                {c.connected ? "연결됨" : "채널 연결 필요"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="d-card p-5">
        <h2 className="mb-3 text-[15px] font-bold">알림 트리거</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {TRIGGERS.map((t) => (
            <div key={t} className="flex items-center gap-2 rounded-lg px-3 py-2 text-[12.5px]" style={{ background: "var(--d-sky-softer)" }}>
              <Icon name="bell" size={14} style={{ color: "var(--d-sky)" }} /> {t}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11.5px]" style={{ color: "var(--d-text-mute)" }}>
          인증서 만료 알림 기준: 30일·14일·7일·1일 전. 자동 발송은 2차 개발의 백그라운드 스케줄러 + 채널 연동 후 활성화됩니다.
        </p>
      </div>
    </div>
  );
}
