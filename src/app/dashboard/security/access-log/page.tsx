"use client";

import { PageHeader, Icon } from "@/components/dashboard/ui";
import { NotConnected } from "@/components/dashboard/NotConnected";

export default function AccessLogPage() {
  return (
    <div className="d-fade">
      <PageHeader title="접속 기록 · 감사 로그" description="로그인·권한 변경·사이트 추가/삭제·보안검사·설정 변경·리포트 다운로드 등 주요 활동을 기록합니다. 감사 로그는 일반 사용자가 수정·삭제할 수 없습니다(append-only)." />

      <div className="d-card mb-5 p-5">
        <h2 className="mb-2 text-[15px] font-bold">기록 대상 활동</h2>
        <div className="flex flex-wrap gap-1.5">
          {["로그인", "로그인 실패", "로그아웃", "사용자 초대", "권한 변경", "사이트 추가/삭제", "API 연결/해제", "보안검사 실행", "설정 변경", "분석 결과 삭제", "리포트 다운로드", "AI 생성 사용", "중요 데이터 열람"].map((t) => (
            <span key={t} className="d-badge" style={{ background: "var(--d-sky-softer)", color: "var(--d-sky-deep)" }}>{t}</span>
          ))}
        </div>
        <p className="mt-3 text-[12px]" style={{ color: "var(--d-text-soft)" }}>
          <Icon name="info" size={14} className="mr-1 inline align-text-bottom" style={{ color: "var(--d-sky)" }} />
          각 로그에 사용자·시간·IP·기기·브라우저·실행 기능·대상 사이트·실행 결과가 기록됩니다.
        </p>
      </div>

      <NotConnected
        icon="history"
        title="감사 로그 저장소 미연결"
        reason="감사 로그는 변조 불가능한 서버 저장소(append-only DB/로그)에 기록되어야 합니다. 실제 사용자 인증 백엔드가 연결되기 전에는 로그를 남기지 않으며, 데모 로그를 만들어 표시하지 않습니다."
        requirement="1차 개발의 인증 백엔드 + 감사 로그 저장소(append-only) 연동 후 활성화됩니다."
        fields={["사용자", "시간", "IP", "기기", "브라우저", "실행 기능", "대상 사이트", "실행 결과"]}
      />
    </div>
  );
}
