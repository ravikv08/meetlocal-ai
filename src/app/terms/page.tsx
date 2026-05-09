import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Terms of Service · meetlocal.ai",
};

export default function TermsPage() {
  return <LegalDoc filename="TERMS_OF_SERVICE.md" title="Terms of Service" />;
}
