import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "K:ZIP 개인정보처리방침",
  robots: { index: false },
};

const sections = [
  {
    title: "1. 수집하는 개인정보 항목",
    body: [
      "K:ZIP(이하 “회사”)는 문의 접수 및 응대를 위해 다음 정보를 수집합니다.",
      "필수 항목: 회사명, 담당자명, 이메일 / 선택 항목: 연락처, 예상 일정, 예상 예산, 문의 내용에 포함된 정보",
    ],
  },
  {
    title: "2. 개인정보의 수집·이용 목적",
    body: [
      "수집된 개인정보는 문의 내용 확인, 답변 및 상담 진행, 프로젝트 제안 등 문의 응대 목적으로만 이용됩니다.",
    ],
  },
  {
    title: "3. 보유 및 이용 기간",
    body: [
      "문의 응대 완료 후 1년간 보관하며, 이후 지체 없이 파기합니다. 단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.",
    ],
  },
  {
    title: "4. 개인정보의 제3자 제공",
    body: [
      "회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 근거한 요청이 있는 경우는 예외로 합니다.",
    ],
  },
  {
    title: "5. 개인정보 처리의 위탁",
    body: [
      "문의 폼 전송을 위해 외부 폼 처리 서비스를 이용하는 경우, 해당 서비스명과 위탁 범위를 이 항목에 명시합니다. [폼 서비스 확정 후 입력 필요]",
    ],
  },
  {
    title: "6. 정보주체의 권리",
    body: [
      "이용자는 언제든지 자신의 개인정보에 대한 열람, 정정, 삭제, 처리정지를 요구할 수 있습니다. 요청은 아래 연락처로 접수해 주세요.",
    ],
  },
  {
    title: "7. 개인정보 보호책임자",
    body: [
      `개인정보 보호책임자: ${site.ceo} / 이메일: ${site.contact.email}`,
      "[시행일 입력 필요] 본 방침은 시행일로부터 적용됩니다.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero overline="Privacy Policy" title="개인정보처리방침" />
      <section>
        <div className="container-k max-w-3xl py-16 md:py-20">
          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-lg font-bold">{section.title}</h2>
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-3 text-sm leading-relaxed text-ink-soft"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>
          <p className="mt-14 border-t border-line pt-8 text-xs leading-relaxed text-ink-mute">
            이 문서는 기본 구조 초안입니다. 실제 서비스 운영 형태(폼 처리 서비스,
            분석 도구 사용 여부 등)가 확정되면 법률 검토를 거쳐 내용을
            확정하세요.
          </p>
        </div>
      </section>
    </>
  );
}
