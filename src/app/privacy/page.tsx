import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Privacy Policy · meetlocal.ai",
};

export default function PrivacyPage() {
  return <LegalDoc filename="PRIVACY_POLICY.md" title="Privacy Policy" />;
}
