import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Refund & Cancellation · meetlocal.ai",
};

export default function RefundPage() {
  return (
    <LegalDoc
      filename="REFUND_AND_CANCELLATION.md"
      title="Refund & Cancellation Policy"
    />
  );
}
