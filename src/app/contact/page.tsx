import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import ContactForm from "@/components/ContactForm";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "문의하기",
  description:
    "새로운 프로젝트를 준비하고 계신가요? 목표와 현재 고민을 알려주시면 K:ZIP가 필요한 전략과 실행 방식을 함께 설계합니다.",
};

type Props = { searchParams: Promise<{ type?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const { type } = await searchParams;

  return (
    <section className="lg:grid lg:min-h-[calc(100vh-80px)] lg:grid-cols-12">
      {/* 좌측 다크 패널 */}
      <div className="bg-night text-white lg:col-span-5">
        <div className="flex h-full flex-col justify-between px-6 py-16 md:px-12 md:py-20 lg:sticky lg:top-20 lg:min-h-[calc(100vh-80px)] lg:py-24">
          <div>
            <Reveal className="reveal-mask">
              <p className="overline-k text-white/40">
                <span className="text-accent">Contact</span>
              </p>
              <h1 className="display-2 mt-7 text-white">
                <span className="mask-line">
                  <span>새로운 프로젝트를</span>
                </span>
                <span className="mask-line">
                  <span>준비하고 계신가요?</span>
                </span>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-8 max-w-md text-[16px] leading-[1.85] text-white/55">
                목표와 현재 고민을 알려주시면 K:ZIP가 필요한 전략과 실행
                방식을 함께 설계합니다.
              </p>
            </Reveal>
          </div>

          <Reveal delay={250}>
            <div className="mt-16 space-y-10 lg:mt-0">
              <div>
                <h2 className="overline-k text-white/40">이렇게 진행됩니다</h2>
                <ol className="mt-6 space-y-5">
                  {[
                    "문의 내용을 검토하고 2영업일 이내에 회신합니다.",
                    "미팅에서 목표와 과제를 함께 정리합니다.",
                    "필요한 전략과 실행 범위를 제안합니다.",
                  ].map((step, i) => (
                    <li key={step} className="flex items-baseline gap-5">
                      <span className="shrink-0 text-[12px] font-bold tracking-[0.15em] text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[15px] leading-relaxed text-white/65">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="border-t border-night-line pt-8">
                <h2 className="overline-k text-white/40">직접 연락</h2>
                <dl className="mt-5 space-y-2 text-[15px] text-white/65">
                  <div className="flex gap-4">
                    <dt className="shrink-0 font-medium text-white/40">이메일</dt>
                    <dd>{site.contact.email}</dd>
                  </div>
                  <div className="flex gap-4">
                    <dt className="shrink-0 font-medium text-white/40">전화</dt>
                    <dd>{site.contact.phone}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* 우측 폼 */}
      <div className="lg:col-span-7">
        <div className="px-6 py-16 md:px-12 md:py-20 lg:px-16 lg:py-24">
          <Reveal delay={100}>
            <ContactForm defaultType={type} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
