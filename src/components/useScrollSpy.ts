"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 뷰포트 중앙 부근을 지나는 항목의 인덱스를 추적하는 스크롤 스파이.
 * IntersectionObserver 하나만 사용하고, 스크롤 리스너는 등록하지 않습니다.
 */
export function useScrollSpy<T extends HTMLElement>(count: number) {
  const [active, setActive] = useState(0);
  const refs = useRef<(T | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(count - 1);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(
              (entry.target as HTMLElement).dataset.spyIndex ?? 0,
            );
            setActive(index);
          }
        });
      },
      // 뷰포트 세로 중앙 ±15% 구간을 통과할 때 활성화
      { rootMargin: "-42% 0px -42% 0px" },
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [count]);

  const setRef = (index: number) => (el: T | null) => {
    refs.current[index] = el;
  };

  return { active, setRef };
}
