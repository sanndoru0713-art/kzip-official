import Link from "next/link";
import { nav, site } from "@/data/site";
import { getSiteInfo } from "@/lib/notion/queries";

export default async function Footer() {
  const siteInfo = await getSiteInfo();
  return (
    <footer className="border-t border-line bg-paper">
      {/* 초대형 워드마크 — 아웃라인 타이포 */}
      <div className="container-k overflow-hidden pt-16 md:pt-24">
        <p
          aria-hidden
          className="select-none text-[clamp(5rem,18vw,16rem)] font-extrabold leading-[0.85] tracking-[-0.04em] text-transparent"
          style={{ WebkitTextStroke: "1px #d9dce2" }}
        >
          K:ZIP
        </p>
      </div>

      <div className="container-k grid gap-12 border-t border-line py-14 md:grid-cols-[1.6fr_1fr_1fr] md:py-20">
        <div>
          <p className="text-lg font-extrabold tracking-tight">
            K<span className="text-accent">:</span>ZIP
          </p>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink-soft">
            {site.positioning}. 브랜드와 시장 사이의 간격을 전략과 실행으로
            연결합니다.
          </p>
          <dl className="mt-8 space-y-1.5 text-[13px] leading-relaxed text-ink-mute">
            <div className="flex gap-3">
              <dt className="shrink-0">대표</dt>
              <dd>{siteInfo.ceo}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="shrink-0">이메일</dt>
              <dd>{siteInfo.email}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="shrink-0">주소</dt>
              <dd>{siteInfo.address}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="shrink-0">사업자등록번호</dt>
              <dd>{siteInfo.businessNumber}</dd>
            </div>
          </dl>
        </div>

        <nav aria-label="푸터 메뉴">
          <p className="overline-k">Menu</p>
          <ul className="mt-5 space-y-3">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="link-slide text-[15px] text-ink-soft transition-colors hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="overline-k">Project</p>
          <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
            새로운 프로젝트를
            <br />
            준비하고 계신가요?
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-block rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-deep"
          >
            프로젝트 문의하기
          </Link>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-k flex flex-col gap-2 py-6 text-[13px] text-ink-mute sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} K:ZIP. All rights reserved.</p>
          <Link href="/privacy" className="transition-colors hover:text-ink">
            개인정보처리방침
          </Link>
        </div>
      </div>
    </footer>
  );
}
