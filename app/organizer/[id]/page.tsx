import OrganizerManage from "@/components/OrganizerManage";

export const runtime = "edge";

export default async function ManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrganizerManage id={id} />;
}
