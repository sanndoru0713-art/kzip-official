"use client";

import Link from "next/link";
import { PageHeader, Icon } from "@/components/dashboard/ui";

export default function AccountSecurityPage() {
  const features = [
    { g: "인증", items: ["이메일·비밀번호 로그인", "Google OAuth", "2단계 인증(OTP)", "복구 코드"] },
    { g: "로그인 보호", items: ["로그인 실패 횟수 제한", "비정상 로그인 차단", "새 기기 로그인 알림", "관리자 IP 제한"] },
    { g: "세션", items: ["세션 만료", "전체 기기 로그아웃", "HttpOnly·Secure·SameSite 쿠키"] },
    { g: "비밀번호", items: ["강력한 비밀번호 정책", "이전 비밀번호 재사용 제한", "비밀번호 재설정", "해시 저장(원문 금지)"] },
    { g: "계정 수명주기", items: ["휴면 계정 잠금", "관리자 접근 기록", "역할 기반 권한(RBAC)"] },
  ];
  return (
    <div className="d-fade">
      <PageHeader title="로그인 · 계정 보안" description="계정 보안 기능 설계입니다. 비밀번호는 원문 저장하지 않고 안전한 해시(bcrypt/argon2)로 처리하며, 인증·권한은 서버에서 검증합니다." />

      <div className="d-card mb-5 flex items-start gap-3 p-4" style={{ background: "var(--d-orange-soft)" }}>
        <Icon name="info" size={18} className="mt-0.5 shrink-0" style={{ color: "var(--d-orange)" }} />
        <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--d-text-soft)" }}>
          현재는 프론트엔드 프로토타입 단계로, 실제 로그인·세션은 1차 개발의 인증 백엔드 연동 시 활성화됩니다. 화면에는 데모 계정이나 실제 개인정보를 표시하지 않습니다. 권한 모델은 <Link href="/dashboard/users" className="font-semibold" style={{ color: "var(--d-sky-deep)" }}>사용자·권한 관리</Link>에서 확인하세요.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
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
