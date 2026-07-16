import Link from "next/link";
import { nav, site } from "@/data/site";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-paper-deep/50">
      {/* 브랜드 스테이트먼트 */}
      <div className="container-k border-b border-line py-14 md:py-20">
        <p className="max-w-2xl text-2xl font-bold leading-snug md:text-3xl">
          브랜드와 시장 사이의 간격을
          <br />
          전략과 실행으로 연결합니다.
        </p>
      </div>

      <div className="container-k grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:py-16">
        <div>
          <p className="text-lg font-extrabold tracking-tight">
            K<span className="text-accent">:</span>ZIP
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
            {site.positioning}
          </p>
          <dl className="mt-6 space-y-1 text-xs leading-relaxed text-ink-mute">
            <div className="flex gap-2">
              <dt className="shrink-0">대표</dt>
              <dd>{site.ceo}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0">이메일</dt>
              <dd>{site.contact.email}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0">주소</dt>
              <dd>{site.contact.address}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0">사업자등록번호</dt>
              <dd>{site.contact.businessNumber}</dd>
            </div>
          </dl>
        </div>

        <nav aria-label="푸터 메뉴">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-mute">
            Menu
          </p>
          <ul className="mt-4 space-y-2.5">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-ink-soft transition-colors hover:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-mute">
            Project
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            새로운 프로젝트를 준비하고 계신가요?
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-block border border-ink px-5 py-2.5 text-sm font-medium transition-colors hover:bg-ink hover:text-paper"
          >
            프로젝트 문의하기
          </Link>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-k flex flex-col gap-2 py-5 text-xs text-ink-mute sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} K:ZIP. All rights reserved.</p>
          <Link href="/privacy" className="transition-colors hover:text-accent">
            개인정보처리방침
          </Link>
        </div>
      </div>
    </footer>
  );
}
