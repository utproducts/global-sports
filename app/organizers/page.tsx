import AudienceLanding, { type AudienceContent } from "@/components/AudienceLanding";

const c: AudienceContent = {
  eyebrow: "For Tournament Organizers",
  titleA: "Run world-class",
  titleB: "events.",
  sub: "Everything you need to host great tournaments and leagues — brackets, scheduling, online registration, payments and payouts — reaching a global player base.",
  accent: "#8a6a00",
  pills: ["Brackets & scheduling", "Online registration", "Payments & payouts", "Global reach"],
  whyHead: "Why organize with us",
  whySub: "Professional tools, global audience.",
  valueProps: [
    { icon: "🗓️", title: "Brackets & scheduling", desc: "Pools, brackets, fields and game scheduling — run a smooth event from draw to final." },
    { icon: "💳", title: "Registration & payments", desc: "Teams register and pay online in their local currency; you collect entry fees with VAT handled." },
    { icon: "💸", title: "Get paid", desc: "Director payouts via Stripe Connect, with clear financials per event." },
    { icon: "🌍", title: "Global reach", desc: "List your event in front of players across the continent and the world — and feed the global ranking." },
  ],
  stepsHead: "Launch an event in four steps.",
  steps: [
    { title: "Create your event", desc: "Set dates, venue, classes, fees and capacity." },
    { title: "Open registration", desc: "Teams sign up and pay online automatically." },
    { title: "Run the tournament", desc: "Manage pools, brackets, scores and schedules." },
    { title: "Get paid & ranked", desc: "Receive payouts; results roll into the global rankings." },
  ],
  ctaTitle: "Ready to host with Global Sports?",
  ctaText: "Become an organizer and bring your tournament or league onto the platform.",
  ctaLabel: "Become an organizer",
  ctaHref: "/signup",
};

export default function OrganizersPage() {
  return <AudienceLanding c={c} />;
}
