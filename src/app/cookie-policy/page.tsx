import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Cookie Policy · meetlocal.ai",
};

export default function CookiePolicyPage() {
  return <LegalDoc filename="COOKIE_POLICY.md" title="Cookie Policy" />;
}
