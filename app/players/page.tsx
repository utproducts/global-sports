import AudienceLanding, { type AudienceContent } from "@/components/AudienceLanding";

const c: AudienceContent = {
  eyebrow: "For Players",
  titleA: "Play the world's game.",
  titleB: "One membership, every country.",
  sub: "Slow-pitch is fractured no more. Join once, play anywhere Global Sports runs, and see exactly where you stand in the world.",
  accent: "#1c3e74",
  pills: ["One global membership", "Global ranking", "Play in any country", "Real championships"],
  whyHead: "Why play with us",
  whySub: "Built for players who want the real thing.",
  valueProps: [
    { icon: "🌍", title: "One membership, worldwide", desc: "Sign up once. Your membership is valid in every country we run — play at home or abroad with no second fee." },
    { icon: "📊", title: "See where you stand", desc: "A global ranking system shows how you and your team compare by country, continent and the world." },
    { icon: "🏆", title: "Real championships", desc: "Compete toward the flagship titles — ESSC, Global Games, and the World Slow-Pitch Championship." },
    { icon: "🎫", title: "Local pricing", desc: "Pay in your own currency with local VAT, on one secure platform." },
  ],
  stepsHead: "From sign-up to first pitch in three steps.",
  steps: [
    { title: "Pick your country", desc: "Find your country and we set you up in your language and currency." },
    { title: "Create your membership", desc: "One required membership unlocks events everywhere — Standard, Select or Elite." },
    { title: "Join a team & play", desc: "Get on a roster, register for events, and start climbing the rankings." },
  ],
  ctaTitle: "Ready to get on the board?",
  ctaText: "Create your global membership and start your ranking journey today.",
  ctaLabel: "Create membership",
  ctaHref: "/membership",
};

export default function PlayersPage() {
  return <AudienceLanding c={c} />;
}
