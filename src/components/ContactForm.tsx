"use client";

import { useState, type FormEvent } from "react";
import { site } from "@/data/site";

export const inquiryTypes = [
  "프로젝트 문의",
  "공공 프로젝트 협업",
  "일본 마케팅",
  "글로벌 제휴",
  "콘텐츠 제작",
  "기타",
] as const;

type Status = "idle" | "sending" | "success" | "error" | "mailto";

/**
 * 문의 폼.
 * - NEXT_PUBLIC_FORM_ENDPOINT가 설정되면 해당 엔드포인트로 POST 전송합니다.
 *   (Formspree 등 무료 폼 서비스 URL — README 참고)
 * - 미설정 시 메일 앱 작성 화면을 여는 안전한 폴백으로 동작합니다.
 */
export default function ContactForm({ defaultType }: { defaultType?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const endpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // 스팸 봇 차단용 honeypot — 값이 있으면 조용히 무시
    if (data.get("website")) {
      setStatus("success");
      return;
    }

    if (!data.get("consent")) {
      setStatus("error");
      setErrorMessage("개인정보 수집·이용에 동의해 주세요.");
      return;
    }

    const fields: [string, string][] = [
      ["회사명", String(data.get("company") ?? "")],
      ["담당자명", String(data.get("name") ?? "")],
      ["이메일", String(data.get("email") ?? "")],
      ["연락처", String(data.get("phone") ?? "")],
      ["문의 유형", String(data.get("type") ?? "")],
      ["예상 일정", String(data.get("schedule") ?? "")],
      ["예상 예산", String(data.get("budget") ?? "")],
      ["문의 내용", String(data.get("message") ?? "")],
    ];

    if (endpoint) {
      setStatus("sending");
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: data,
        });
        if (!res.ok) throw new Error(`전송 실패 (${res.status})`);
        setStatus("success");
        form.reset();
      } catch {
        setStatus("error");
        setErrorMessage(
          "전송 중 문제가 발생했습니다. 잠시 후 다시 시도하거나 이메일로 직접 문의해 주세요.",
        );
      }
      return;
    }

    // 폼 엔드포인트 미설정 시: 메일 작성 화면 폴백
    const body = fields.map(([k, v]) => `${k}: ${v}`).join("\n");
    const subject = `[K:ZIP 문의] ${data.get("type")} — ${data.get("company")}`;
    window.location.href = `mailto:${site.contact.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setStatus("mailto");
  }

  const inputClass =
    "field-k w-full bg-transparent px-0 py-3.5 text-base text-ink placeholder:text-ink-mute";
  const labelClass =
    "block text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-mute";

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* honeypot — 화면에 보이지 않음 */}
      <div className="hidden" aria-hidden>
        <label>
          웹사이트
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
        <div>
          <label htmlFor="company" className={labelClass}>
            회사명 <span className="text-accent">*</span>
          </label>
          <input
            id="company"
            name="company"
            type="text"
            required
            placeholder="회사명 또는 기관명"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="name" className={labelClass}>
            담당자명 <span className="text-accent">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="담당자 성함"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            이메일 <span className="text-accent">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="reply@example.com"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            연락처
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="010-0000-0000"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="type" className={labelClass}>
            문의 유형 <span className="text-accent">*</span>
          </label>
          <select
            id="type"
            name="type"
            required
            defaultValue={
              defaultType && (inquiryTypes as readonly string[]).includes(defaultType)
                ? defaultType
                : ""
            }
            className={inputClass}
          >
            <option value="" disabled>
              문의 유형을 선택하세요
            </option>
            {inquiryTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="schedule" className={labelClass}>
            예상 일정
          </label>
          <input
            id="schedule"
            name="schedule"
            type="text"
            placeholder="예: 2026년 3분기 착수 희망"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="budget" className={labelClass}>
            예상 예산
          </label>
          <input
            id="budget"
            name="budget"
            type="text"
            placeholder="예: 미정 / 월 000만 원 수준"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="message" className={labelClass}>
            문의 내용 <span className="text-accent">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            placeholder="현재 상황, 목표, 고민 중인 과제를 자유롭게 적어 주세요."
            className={`${inputClass} resize-y`}
          />
        </div>
      </div>

      <label className="flex items-start gap-3 text-[14px] leading-relaxed text-ink-soft">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-1 h-4 w-4 shrink-0 accent-[#1f3fff]"
        />
        <span>
          개인정보 수집·이용에 동의합니다. 수집된 정보는 문의 응대 목적으로만
          사용됩니다.{" "}
          <a href="/privacy" className="underline underline-offset-2 hover:text-accent">
            개인정보처리방침 보기
          </a>
        </span>
      </label>

      <div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="group inline-flex items-center gap-3 rounded-full bg-accent px-10 py-4.5 text-base font-semibold text-white transition-colors hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "sending" ? "전송 중…" : "문의 보내기"}
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </button>
      </div>

      <div aria-live="polite">
        {status === "success" && (
          <p className="border-l-2 border-accent bg-paper-deep/60 px-6 py-5 text-[15px]">
            문의가 접수되었습니다. 확인 후 빠르게 연락드리겠습니다.
          </p>
        )}
        {status === "mailto" && (
          <p className="border-l-2 border-accent bg-paper-deep/60 px-6 py-5 text-[15px] leading-relaxed">
            메일 작성 화면이 열렸습니다. 열리지 않는 경우{" "}
            <strong>{site.contact.email}</strong> 로 직접 보내 주세요.
            <br />
            <span className="text-ink-mute">
              (사이트에서 바로 전송하려면 README의 폼 엔드포인트 설정을
              참고하세요.)
            </span>
          </p>
        )}
        {status === "error" && (
          <p className="border-l-2 border-accent bg-paper-deep/60 px-6 py-5 text-[15px] text-accent-deep">
            {errorMessage}
          </p>
        )}
      </div>
    </form>
  );
}
