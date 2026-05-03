import { MessageCircle } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

export default function ConciergePage() {
  return (
    <ComingSoon
      eyebrow="Locally · AI concierge"
      title="Tell us what you want."
      emphasis="We'll find the local."
      description="Plain-language concierge: 'I'm in Tokyo Friday, vegetarian, want to learn ramen.' We translate that into a vetted local within minutes — no scrolling required."
      icon={MessageCircle}
      features={[
        {
          title: "Says what you want",
          body: "Type or speak. We handle the city, the activity, the language match.",
        },
        {
          title: "Watches your trip",
          body: "Knows when you land and pings you with the right local at the right hour.",
        },
        {
          title: "Books for you",
          body: "Picks the meeting spot, suggests the time, confirms when both calendars agree.",
        },
      ]}
    />
  );
}
