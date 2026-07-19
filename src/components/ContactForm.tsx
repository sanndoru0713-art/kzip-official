"use client";

import { useRef, useState, type FormEvent } from "react";
import { site } from "@/data/site";
import { trackEvent } from "@/lib/analytics";

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
 * 문의 폼 — 제출 시 서버 API(/api/contact)를 통해 Notion CRM에 저장됩니다.
 * 서버에 Notion이 설정되지 않은 경우(503) 메일 작성 화면 폴백으로 동작합니다.
 * API 키는 서버에서만 사용되며 브라우저에 노출되지 않습니다.
 */
export default function ContactForm({
  defaultType,
  contactEmail = site.contact.email,
}: {
  defaultType?: string;
  contactEmail?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const submittingRef = useRef(false); // 중복 제출 방지

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    const form = event.currentTarget;
    const data = new FormData(form);

    if (!data.get("consent")) {
      setStatus("error");
      setErrorMessage("개인정보 수집·이용에 동의해 주세요.");
      return;
    }

    const payload = {
      company: String(data.get("company") ?? ""),
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      type: String(data.get("type") ?? ""),
      schedule: String(data.get("schedule") ?? ""),
      budget: String(data.get("budget") ?? ""),
      message: String(data.get("message") ?? ""),
      consent: data.get("consent") === "on",
      website: String(data.get("website") ?? ""), // honeypot
    };

    submittingRef.current = true;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus("success");
        // 개인정보 미포함 — 문의 유형만 전송합니다.
        trackEvent("contact_submit", { inquiry_type: payload.type });
        form.reset();
        return;
      }

      if (res.status === 503) {
        // 서버에 Notion 미설정 — 메일 작성 폴백
        const fields: [string, string][] = [
          ["회사명", payload.company],
          ["담당자명", payload.name],
          ["이메일", payload.email],
          ["연락처", payload.phone],
          ["문의 유형", payload.type],
          ["예상 일정", payload.schedule],
          ["예상 예산", payload.budget],
          ["문의 내용", payload.message],
        ];
        const bodyText = fields.map(([k, v]) => `${k}: ${v}`).join("\n");
        const subject = `[K:ZIP 문의] ${payload.type} — ${payload.company}`;
        window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(
          subject,
        )}&body=${encodeURIComponent(bodyText)}`;
        setStatus("mailto");
        trackEvent("contact_mailto_fallback");
        return;
      }

      const { error } = (await res.json().catch(() => ({}))) as { error?: string };
      setStatus("error");
      trackEvent("contact_submit_error", { reason: error ?? "unknown" });
      setErrorMessage(
        error === "invalid_email"
          ? "이메일 형식을 확인해 주세요."
          : error === "invalid_phone"
            ? "연락처 형식을 확인해 주세요."
            : error === "consent_required"
              ? "개인정보 수집·이용에 동의해 주세요."
              : error === "duplicate_submission"
                ? "동일한 문의가 방금 접수되었습니다. 잠시 후 다시 시도해 주세요."
                : error === "missing_required"
                  ? "필수 항목을 모두 입력해 주세요."
                  : "접수 중 문제가 발생했습니다. 잠시 후 다시 시도하거나 이메일로 문의해 주세요.",
      );
    } catch {
      setStatus("error");
      setErrorMessage(
        "네트워크 오류가 발생했습니다. 잠시 후 다시 시도하거나 이메일로 문의해 주세요.",
      );
    } finally {
      submittingRef.current = false;
    }
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
            maxLength={100}
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
            maxLength={50}
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
            maxLength={100}
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
            maxLength={30}
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
            maxLength={200}
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
            maxLength={200}
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
            maxLength={2000}
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
          <p className="border-l-2 border-accent bg-paper-deep/60 px-6 py-5 text-[15px] leading-relaxed">
            문의가 정상적으로 접수되었습니다.
            <br />
            확인 후 2영업일 이내에 연락드리겠습니다.
          </p>
        )}
        {status === "mailto" && (
          <p className="border-l-2 border-accent bg-paper-deep/60 px-6 py-5 text-[15px] leading-relaxed">
            메일 작성 화면이 열렸습니다. 열리지 않는 경우{" "}
            <strong>{contactEmail}</strong> 로 직접 보내 주세요.
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
