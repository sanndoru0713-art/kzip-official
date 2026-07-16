import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] items-center">
      <div className="container-k py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          404 Not Found
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
          찾으시는 페이지가 없습니다
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">
          주소가 변경되었거나 삭제된 페이지입니다. 아래 버튼으로 이동해 주세요.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/"
            className="border border-ink bg-ink px-7 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-transparent hover:text-ink"
          >
            홈으로
          </Link>
          <Link
            href="/contact"
            className="border border-ink px-7 py-3.5 text-sm font-medium transition-colors hover:bg-ink hover:text-paper"
          >
            문의하기
          </Link>
        </div>
      </div>
    </section>
  );
}
