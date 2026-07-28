"use client";

import { useState } from "react";
import { Icon } from "./ui";
import type { AiActionId } from "@/lib/seo/types";

const ACTION_LABEL: Record<AiActionId, string> = {
  title: "Title 생성",
  "meta-description": "Meta Description 생성",
  h1: "H1 생성",
  "h2-structure": "H2 구조 생성",
  faq: "FAQ 생성",
  "faq-schema": "FAQ Schema 생성",
  "json-ld": "JSON-LD 생성",
  "image-alt": "이미지 ALT 생성",
  "internal-links": "내부링크 추천",
  "content-brief": "콘텐츠 보강안 생성",
  "japanese-seo": "일본어 SEO 문구 생성",
  "english-seo": "영어 SEO 문구 생성",
};

export function AiPanel({ actions, context }: { actions: AiActionId[]; context: string }) {
  const [open, setOpen] = useState<AiActionId | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function run(action: AiActionId) {
    setOpen(action);
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, context }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "생성 실패");
      else setResult(data.result || "(빈 응답)");
    } catch {
      setError("AI API 호출에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (actions.length === 0) return null;

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-1.5">
        {actions.map((a) => (
          <button key={a} className="d-btn d-btn-secondary d-btn-sm" onClick={() => run(a)} disabled={loading && open === a}>
            <Icon name="ai" size={14} />
            {ACTION_LABEL[a]}
          </button>
        ))}
      </div>
      {open && (
        <div className="mt-2 rounded-xl border p-3" style={{ borderColor: "var(--d-border)", background: "var(--d-sky-softer)" }}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12px] font-bold" style={{ color: "var(--d-sky-deep)" }}>
              {ACTION_LABEL[open]} — 초안 (검토 후 사용)
            </span>
            <button className="d-btn d-btn-ghost !p-1" onClick={() => setOpen(null)} aria-label="닫기">
              <Icon name="close" size={15} />
            </button>
          </div>
          {loading && (
            <div className="flex items-center gap-2 py-3 text-[13px]" style={{ color: "var(--d-text-soft)" }}>
              <span className="d-spinner d-spinner-blue" /> AI가 초안을 작성 중입니다…
            </div>
          )}
          {error && (
            <div className="rounded-lg px-3 py-2 text-[12.5px]" style={{ background: "var(--d-orange-soft)", color: "var(--d-orange)" }}>
              {error}
            </div>
          )}
          {result && (
            <>
              <pre className="d-code max-h-72 overflow-auto">{result}</pre>
              <div className="mt-2 flex gap-2">
                <button
                  className="d-btn d-btn-primary d-btn-sm"
                  onClick={() => {
                    navigator.clipboard?.writeText(result);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  <Icon name="check" size={14} />
                  {copied ? "복사됨" : "복사"}
                </button>
                <span className="self-center text-[11px]" style={{ color: "var(--d-text-mute)" }}>
                  ⚠ 자동 적용되지 않습니다. 검토 후 직접 반영하세요.
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
