import type { Metadata } from "next";
import "./dashboard.css";
import DashboardProvider from "@/components/dashboard/DashboardProvider";
import Shell from "@/components/dashboard/Shell";

export const metadata: Metadata = {
  title: {
    default: "K:ZIP Search Lab — SEO·AEO·GEO 분석 대시보드",
    template: "%s | K:ZIP Search Lab",
  },
  description: "K:ZIP 내부 운영용 SEO·AEO·GEO 진단 및 경쟁사 분석 대시보드",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <Shell>{children}</Shell>
    </DashboardProvider>
  );
}
