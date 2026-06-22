import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CountryNav from "@/components/CountryNav";
import RegisterForm from "@/components/RegisterForm";
import { regionByKey, findCountry } from "@/lib/countries";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

export default async function RegisterPage({ params }: { params: Promise<{ region: string; country: string; slug: string }> }) {
  const { region: regionKey, country: countryCode, slug } = await params;
  const region = regionByKey(regionKey);
  const entry = findCountry(countryCode);
  if (!region || !entry || entry.region.key !== region.key) notFound();
  const c = entry.country;

  let event: { id: string; name: string; team_fee: number | null; currency: string | null; status: string | null } | null = null;
  let teams: { id: string; name: string; city: string | null }[] = [];

  if (supabase) {
    const { data: t } = await supabase
      .from("tournaments")
      .select("id,name,team_fee,currency,status,country_id")
      .eq("slug", slug).maybeSingle();
    if (t) {
      const tt = t as { id: string; name: string; team_fee: number | null; currency: string | null; status: string | null; country_id: string };
      event = { id: tt.id, name: tt.name, team_fee: tt.team_fee, currency: tt.currency, status: tt.status };
      const { data: tm } = await supabase.from("teams").select("id,name,city").eq("country_id", tt.country_id).order("name");
      if (tm) teams = tm as { id: string; name: string; city: string | null }[];
    }
  }
  if (!event) notFound();

  return (
    <>
      <Header />
      <CountryNav region={region.key} code={c.c} name={c.n} flag={c.f} active="events" />
      <RegisterForm
        regionKey={region.key}
        countryCode={c.c}
        countryName={c.n}
        slug={slug}
        eventId={event.id}
        eventName={event.name}
        fee={event.team_fee ?? 0}
        currency={event.currency ?? c.cur}
        status={event.status}
        teams={teams}
      />
      <Footer />
    </>
  );
}
