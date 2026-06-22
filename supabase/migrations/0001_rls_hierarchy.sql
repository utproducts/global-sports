-- ============================================================================
-- Global Sports — Row-Level Security: role hierarchy (PHASE 1)
-- ============================================================================
-- SAFETY: This is a REVIEW migration. Do NOT apply to the production project
-- directly — the legacy USSSA Europe site reads these tables with the anon key.
-- Validate on a Supabase BRANCH first.
--
-- Phase 1 design (safe): keep SELECT open (matches today's public reads so the
-- live site keeps working) while making WRITES role-scoped. Phase 2 will tighten
-- reads once the legacy site moves to authenticated access.
-- ============================================================================

-- ---- Helper functions -------------------------------------------------------
-- The public.users row id for the currently authenticated Supabase user.
create or replace function public.gs_uid() returns uuid
  language sql stable security definer set search_path = public as $$
  select id from public.users where supabase_auth_id = auth.uid()
$$;

-- Super admin = global-scoped director role, or users.role = 'hq_admin'.
create or replace function public.gs_is_super_admin() returns boolean
  language sql stable security definer set search_path = public as $$
  select coalesce(
    exists (select 1 from public.director_roles dr
            where dr.user_id = public.gs_uid() and dr.is_active and dr.scope_type = 'global')
    or exists (select 1 from public.users u
               where u.id = public.gs_uid() and u.role::text in ('hq_admin','super_admin')),
  false)
$$;

-- Director/Country-Director coverage for a given country (by countries.id).
create or replace function public.gs_manages_country(cid uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select public.gs_is_super_admin() or coalesce(exists (
    select 1
    from public.director_roles dr
    left join public.countries c on c.id = cid
    left join public.country_regions cr on cr.country_id = cid
    left join public.regions r on r.id = cr.region_id
    where dr.user_id = public.gs_uid() and dr.is_active
      and (
        (dr.scope_type = 'country'  and dr.scope_value = c.code)
        or (dr.scope_type = 'region' and dr.scope_value = r.code)
      )
  ), false)
$$;

-- ---- users ------------------------------------------------------------------
alter table public.users enable row level security;

create policy users_select_all on public.users
  for select using (true);                                  -- phase 1: open reads

create policy users_update_self on public.users
  for update using (id = public.gs_uid() or public.gs_is_super_admin())
            with check (id = public.gs_uid() or public.gs_is_super_admin());

create policy users_admin_write on public.users
  for insert with check (public.gs_is_super_admin() or supabase_auth_id = auth.uid());

-- ---- director_roles (who holds power) --------------------------------------
alter table public.director_roles enable row level security;

create policy dr_select_all on public.director_roles
  for select using (true);

create policy dr_super_admin_manage on public.director_roles
  for all using (public.gs_is_super_admin()) with check (public.gs_is_super_admin());

-- ---- teams ------------------------------------------------------------------
alter table public.teams enable row level security;

create policy teams_select_all on public.teams
  for select using (true);

-- coach/owner of the team, a director over the team's country, or super admin
create policy teams_write on public.teams
  for all using (
    public.gs_manages_country(country_id)
    or head_coach_id = public.gs_uid()
    or owner_id = public.gs_uid()
  ) with check (
    public.gs_manages_country(country_id)
    or head_coach_id = public.gs_uid()
    or owner_id = public.gs_uid()
  );

-- ---- ipr_memberships (player membership) -----------------------------------
alter table public.ipr_memberships enable row level security;

create policy ipr_select_all on public.ipr_memberships
  for select using (true);

create policy ipr_owner_or_admin on public.ipr_memberships
  for all using (player_id = public.gs_uid() or public.gs_is_super_admin())
            with check (player_id = public.gs_uid() or public.gs_is_super_admin());

-- ---- tournament_registrations ----------------------------------------------
alter table public.tournament_registrations enable row level security;

create policy treg_select_all on public.tournament_registrations
  for select using (true);

-- the registering user, a director over the tournament's country, or super admin
create policy treg_write on public.tournament_registrations
  for all using (
    registered_by = public.gs_uid()
    or public.gs_is_super_admin()
    or exists (select 1 from public.tournaments t
               where t.id = tournament_id and public.gs_manages_country(t.country_id))
  ) with check (
    registered_by = public.gs_uid()
    or public.gs_is_super_admin()
    or exists (select 1 from public.tournaments t
               where t.id = tournament_id and public.gs_manages_country(t.country_id))
  );

-- ============================================================================
-- ROLLBACK (if needed during branch testing):
--   alter table public.users disable row level security;  (etc. per table)
--   drop policy ... ; drop function public.gs_uid() cascade; ...
-- ============================================================================
