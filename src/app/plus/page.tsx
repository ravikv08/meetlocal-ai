import { Sparkles } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

export default function PlusPage() {
  return (
    <ComingSoon
      eyebrow="meetlocal Plus · Premium tier"
      title="The members-only"
      emphasis="layer of meetlocal."
      description="$9.99/mo. Voice concierge, instant Native-tier locals, 24h trip insurance, no service fees, priority safety response. Built for travelers who go often."
      icon={Sparkles}
      features={[
        {
          title: "Voice mode",
          body: "Talk to the AI concierge while you're on the move. Hands-free booking.",
        },
        {
          title: "Native-tier first",
          body: "Born-and-raised locals get notified of your arrival before anyone else.",
        },
        {
          title: "Trip insurance",
          body: "$100K medical, cancellation refunds, theft cover during sessions. Underwritten by Lloyd's.",
        },
      ]}
      primaryHref="/become-a-local"
      primaryLabel="See pricing"
    />
  );
}
