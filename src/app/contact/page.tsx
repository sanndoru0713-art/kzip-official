import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
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
    <>
      <PageHero
        overline="Contact"
        title="새로운 프로젝트를 준비하고 계신가요?"
        description="목표와 현재 고민을 알려주시면 K:ZIP가 필요한 전략과 실행 방식을 함께 설계합니다."
      />

      <section>
        <div className="container-k grid gap-16 py-16 md:py-24 lg:grid-cols-[1fr_1.8fr]">
          <Reveal>
            <div className="space-y-8">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-mute">
                  이렇게 진행됩니다
                </h2>
                <ol className="mt-5 space-y-4">
                  {[
                    "문의 내용을 검토하고 2영업일 이내에 회신합니다.",
                    "미팅에서 목표와 과제를 함께 정리합니다.",
                    "필요한 전략과 실행 범위를 제안합니다.",
                  ].map((step, i) => (
                    <li key={step} className="flex items-baseline gap-4">
                      <span className="shrink-0 text-xs font-semibold text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm leading-relaxed text-ink-soft">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="border-t border-line pt-8">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-mute">
                  직접 연락
                </h2>
                <dl className="mt-5 space-y-2 text-sm text-ink-soft">
                  <div className="flex gap-3">
                    <dt className="shrink-0 font-medium">이메일</dt>
                    <dd>{site.contact.email}</dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="shrink-0 font-medium">전화</dt>
                    <dd>{site.contact.phone}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <ContactForm defaultType={type} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
