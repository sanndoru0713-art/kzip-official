import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center">
      <div className="container-k py-24">
        <p
          aria-hidden
          className="select-none text-[clamp(6rem,20vw,16rem)] font-extrabold leading-[0.9] tracking-[-0.04em] text-transparent"
          style={{ WebkitTextStroke: "1.5px #d9dce2" }}
        >
          404
        </p>
        <h1 className="display-2 mt-8">찾으시는 페이지가 없습니다</h1>
        <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink-soft">
          주소가 변경되었거나 삭제된 페이지입니다. 아래 버튼으로 이동해 주세요.
        </p>
        <div className="mt-11 flex flex-wrap items-center gap-5">
          <Link
            href="/"
            className="group inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-accent"
          >
            홈으로
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
          <Link href="/contact" className="link-slide text-[15px] font-semibold">
            문의하기
          </Link>
        </div>
      </div>
    </section>
  );
}
