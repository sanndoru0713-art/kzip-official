"use client";

import { PageHeader, Icon } from "@/components/dashboard/ui";
import { ROLE_LABEL, ROLE_PERMISSIONS, PERMISSION_LABEL } from "@/lib/security/types";
import type { Permission, Role } from "@/lib/security/types";

const ROLES = Object.keys(ROLE_LABEL) as Role[];
const PERMS = Object.keys(PERMISSION_LABEL) as Permission[];

export default function UsersPage() {
  return (
    <div className="d-fade">
      <PageHeader
        title="사용자 · 권한 관리"
        description="역할별 권한 모델(RBAC)입니다. 아래 매트릭스는 서버 측 권한 검증(미들웨어·API 가드)의 기준으로 사용됩니다. 프론트엔드 메뉴 숨김이 아니라 서버에서 실제 검증하도록 설계되었습니다."
      />

      <div className="d-card mb-5 flex items-start gap-3 p-4" style={{ background: "var(--d-orange-soft)" }}>
        <Icon name="warn" size={18} className="mt-0.5 shrink-0" style={{ color: "var(--d-orange)" }} />
        <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--d-text-soft)" }}>
          현재 프론트엔드 프로토타입에는 서버 인증 백엔드(세션·DB)가 아직 연결되지 않았습니다. 실제 사용자 초대·로그인·권한 강제는 1차 개발의 인증 백엔드 연동 시 활성화됩니다.
          지금은 <strong>권한 모델과 매트릭스</strong>를 확정하는 단계이며, 이 정의가 서버 가드의 규칙이 됩니다. 데모 사용자 계정이나 실제 개인정보는 표시하지 않습니다.
        </p>
      </div>

      {/* 권한 매트릭스 */}
      <div className="d-card overflow-x-auto">
        <div className="p-4 pb-2">
          <h2 className="text-[15px] font-bold">역할 × 권한 매트릭스</h2>
          <p className="text-[12px]" style={{ color: "var(--d-text-mute)" }}>각 역할이 가진 권한. 서버는 요청마다 이 규칙으로 접근을 검증합니다.</p>
        </div>
        <table className="d-table d-table-hover">
          <thead>
            <tr>
              <th>권한 \ 역할</th>
              {ROLES.map((r) => <th key={r} className="text-center">{ROLE_LABEL[r]}</th>)}
            </tr>
          </thead>
          <tbody>
            {PERMS.map((perm) => (
              <tr key={perm}>
                <td className="font-semibold">{PERMISSION_LABEL[perm]}</td>
                {ROLES.map((role) => {
                  const has = ROLE_PERMISSIONS[role].includes(perm);
                  return (
                    <td key={role} className="text-center">
                      {has ? (
                        <Icon name="check" size={16} style={{ color: "var(--d-mint)" }} className="mx-auto" />
                      ) : (
                        <span style={{ color: "var(--d-border-strong)" }}>—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 역할 카드 */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ROLES.map((role) => (
          <div key={role} className="d-card p-4">
            <p className="text-[13.5px] font-bold">{ROLE_LABEL[role]}</p>
            <p className="mt-1 text-[11px]" style={{ color: "var(--d-text-mute)" }}>{ROLE_PERMISSIONS[role].length}개 권한</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {ROLE_PERMISSIONS[role].slice(0, 5).map((p) => (
                <span key={p} className="d-badge" style={{ background: "var(--d-sky-softer)", color: "var(--d-sky-deep)", fontSize: 10 }}>{PERMISSION_LABEL[p]}</span>
              ))}
              {ROLE_PERMISSIONS[role].length > 5 && <span className="text-[10px]" style={{ color: "var(--d-text-mute)" }}>+{ROLE_PERMISSIONS[role].length - 5}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* 보안 설계 요약 */}
      <div className="d-card mt-5 p-5">
        <h2 className="mb-2 text-[15px] font-bold">계정 보안 설계 원칙</h2>
        <ul className="grid gap-1.5 text-[12.5px] sm:grid-cols-2" style={{ color: "var(--d-text-soft)" }}>
          {[
            "비밀번호는 원문 저장 금지 — bcrypt/argon2 등 해시 저장",
            "서버 측 인증 + 서버 측 권한 검증 (프론트 숨김만으로 보호 금지)",
            "HttpOnly · Secure · SameSite 쿠키로 세션 보호",
            "CSRF 토큰 검증 · 입력값 검증 · 출력 이스케이프",
            "관리자 감사 로그 (수정·삭제 불가)",
            "API Key는 서버 환경변수 저장 · 프론트 비노출 · 로그 마스킹",
            "로그인 실패 제한 · 2단계 인증 · 새 기기 알림",
            "운영/개발 환경 분리 · Secret 암호화 · 정기 백업",
          ].map((t) => (
            <li key={t} className="flex items-start gap-1.5">
              <Icon name="check" size={14} className="mt-0.5 shrink-0" style={{ color: "var(--d-mint)" }} /> {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
