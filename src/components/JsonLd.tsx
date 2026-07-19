/**
 * JSON-LD 출력 컴포넌트 (서버 컴포넌트).
 * "<" 문자를 이스케이프해 </script> 조기 종료·XSS를 방지합니다.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
