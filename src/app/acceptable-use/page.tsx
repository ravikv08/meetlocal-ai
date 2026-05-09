import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Acceptable Use Policy · meetlocal.ai",
};

export default function AcceptableUsePage() {
  return (
    <LegalDoc
      filename="ACCEPTABLE_USE_POLICY.md"
      title="Acceptable Use Policy"
    />
  );
}
