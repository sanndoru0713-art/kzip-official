/**
 * 내부 링크 이동 시 짧은 페이드 전환.
 * template은 네비게이션마다 다시 마운트되므로 진입 애니메이션만 적용되고,
 * 뒤로 가기 등 브라우저 기본 동작에는 관여하지 않습니다.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-fade">{children}</div>;
}
