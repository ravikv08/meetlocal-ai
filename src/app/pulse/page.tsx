import { Activity } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

export default function PulsePage() {
  return (
    <ComingSoon
      eyebrow="Pulse · Live in your city"
      title="Open the app."
      emphasis="See what's happening tonight."
      description="A real-time feed of what locals are doing right now in your city. Pop-ups, gallery openings, ferry departures, whisky tastings. Tap one to grab a local going there."
      icon={Activity}
      features={[
        {
          title: "Right-now feed",
          body: "Updated continuously by the locals who are out and about tonight.",
        },
        {
          title: "Tap to join",
          body: "See a local heading somewhere interesting? Ask to tag along.",
        },
        {
          title: "Citywide signal",
          body: "Where the energy actually is — neighborhoods, venues, hours.",
        },
      ]}
    />
  );
}
