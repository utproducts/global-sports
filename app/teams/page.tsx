import AudienceLanding, { type AudienceContent } from "@/components/AudienceLanding";

const c: AudienceContent = {
  eyebrow: "For Teams",
  titleA: "Run your team",
  titleB: "like a pro.",
  sub: "Manage your roster, register for events in a few clicks, and track your team's standing across the country, continent and world.",
  accent: "#7a1020",
  pills: ["Roster & invites", "One-click event entry", "Classifications", "Team world ranking"],
  whyHead: "Why manage with us",
  whySub: "Everything your team needs, in one place.",
  valueProps: [
    { icon: "👥", title: "Roster management", desc: "Add players, send invites, set jersey numbers and keep your lineup organized all season." },
    { icon: "📝", title: "Register in clicks", desc: "Enter tournaments and leagues fast — eligibility and membership checks handled for you." },
    { icon: "🏅", title: "Classifications & ratings", desc: "Your team's class and rating travel with you across events and countries." },
    { icon: "📈", title: "See your world rank", desc: "Track how your team stacks up by country, continent and worldwide." },
  ],
  stepsHead: "Get your team competing in four steps.",
  steps: [
    { title: "Create your team", desc: "Set up your club, country and division." },
    { title: "Build your roster", desc: "Invite players — each brings their global membership." },
    { title: "Register for events", desc: "Enter tournaments and league rounds in a few clicks." },
    { title: "Climb the rankings", desc: "Win games, earn points, rise in the global table." },
  ],
  ctaTitle: "Bring your team to the world stage.",
  ctaText: "Set up your team and start registering for events across Global Sports.",
  ctaLabel: "Get started",
  ctaHref: "/signup",
};

export default function TeamsPage() {
  return <AudienceLanding c={c} />;
}
