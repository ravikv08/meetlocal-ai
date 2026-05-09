import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Local Agreement · meetlocal.ai",
};

export default function ICAgreementPage() {
  return (
    <LegalDoc
      filename="INDEPENDENT_CONTRACTOR_AGREEMENT.md"
      title="Local Independent Contractor Agreement"
    />
  );
}
