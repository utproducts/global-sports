import TournamentSchedule from "@/components/TournamentSchedule";

export const runtime = "edge";

export default async function SchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TournamentSchedule id={id} />;
}
