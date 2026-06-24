import InvoiceView from "@/components/InvoiceView";

export const runtime = "edge";

export default async function InvoicePage({ params }: { params: Promise<{ id: string; regId: string }> }) {
  const { id, regId } = await params;
  return <InvoiceView tournamentId={id} regId={regId} />;
}
