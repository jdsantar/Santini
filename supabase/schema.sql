create extension if not exists pgcrypto;

create table if not exists public.album_cards (
  id text primary key,
  number text not null,
  player text not null,
  country text not null,
  position text not null,
  card_group text not null,
  rarity text not null check (rarity in ('standard', 'bonus')),
  accent text not null
);

insert into public.album_cards (id, number, player, country, position, card_group, rarity, accent)
values
  ('argentina-messi', '001', 'Lionel Messi', 'Argentina', 'Forward', 'Group A Favorites', 'standard', '#5ec2ff'),
  ('argentina-alvarez', '002', 'Julian Alvarez', 'Argentina', 'Forward', 'Group A Favorites', 'standard', '#5ec2ff'),
  ('argentina-mac-allister', '003', 'Alexis Mac Allister', 'Argentina', 'Midfielder', 'Group A Favorites', 'standard', '#5ec2ff'),
  ('argentina-enzo', '004', 'Enzo Fernandez', 'Argentina', 'Midfielder', 'Group A Favorites', 'standard', '#5ec2ff'),
  ('argentina-romero', '005', 'Cristian Romero', 'Argentina', 'Defender', 'Group A Favorites', 'standard', '#5ec2ff'),
  ('argentina-martinez', '006', 'Emiliano Martinez', 'Argentina', 'Goalkeeper', 'Group A Favorites', 'standard', '#5ec2ff'),
  ('brazil-vinicius', '007', 'Vinicius Junior', 'Brazil', 'Winger', 'South American Fire', 'standard', '#17b978'),
  ('brazil-rodrygo', '008', 'Rodrygo', 'Brazil', 'Forward', 'South American Fire', 'standard', '#17b978'),
  ('brazil-raphinha', '009', 'Raphinha', 'Brazil', 'Winger', 'South American Fire', 'standard', '#17b978'),
  ('brazil-guimaraes', '010', 'Bruno Guimaraes', 'Brazil', 'Midfielder', 'South American Fire', 'standard', '#17b978'),
  ('brazil-militao', '011', 'Eder Militao', 'Brazil', 'Defender', 'South American Fire', 'standard', '#17b978'),
  ('brazil-alisson', '012', 'Alisson Becker', 'Brazil', 'Goalkeeper', 'South American Fire', 'standard', '#17b978'),
  ('france-mbappe', '013', 'Kylian Mbappe', 'France', 'Forward', 'European Elite', 'standard', '#3958ff'),
  ('france-dembele', '014', 'Ousmane Dembele', 'France', 'Winger', 'European Elite', 'standard', '#3958ff'),
  ('france-camavinga', '015', 'Eduardo Camavinga', 'France', 'Midfielder', 'European Elite', 'standard', '#3958ff'),
  ('france-tchouameni', '016', 'Aurelien Tchouameni', 'France', 'Midfielder', 'European Elite', 'standard', '#3958ff'),
  ('france-saliba', '017', 'William Saliba', 'France', 'Defender', 'European Elite', 'standard', '#3958ff'),
  ('france-maignan', '018', 'Mike Maignan', 'France', 'Goalkeeper', 'European Elite', 'standard', '#3958ff'),
  ('england-bellingham', '019', 'Jude Bellingham', 'England', 'Midfielder', 'European Elite', 'standard', '#f97316'),
  ('england-kane', '020', 'Harry Kane', 'England', 'Forward', 'European Elite', 'standard', '#f97316'),
  ('england-saka', '021', 'Bukayo Saka', 'England', 'Winger', 'European Elite', 'standard', '#f97316'),
  ('england-foden', '022', 'Phil Foden', 'England', 'Attacking Mid', 'European Elite', 'standard', '#f97316'),
  ('england-stones', '023', 'John Stones', 'England', 'Defender', 'European Elite', 'standard', '#f97316'),
  ('england-pickford', '024', 'Jordan Pickford', 'England', 'Goalkeeper', 'European Elite', 'standard', '#f97316'),
  ('spain-yamal', '025', 'Lamine Yamal', 'Spain', 'Winger', 'Creative Core', 'standard', '#9333ea'),
  ('spain-pedri', '026', 'Pedri', 'Spain', 'Midfielder', 'Creative Core', 'standard', '#9333ea'),
  ('spain-gavi', '027', 'Gavi', 'Spain', 'Midfielder', 'Creative Core', 'standard', '#9333ea'),
  ('spain-olmo', '028', 'Dani Olmo', 'Spain', 'Attacking Mid', 'Creative Core', 'standard', '#9333ea'),
  ('spain-cucurella', '029', 'Marc Cucurella', 'Spain', 'Defender', 'Creative Core', 'standard', '#9333ea'),
  ('spain-simon', '030', 'Unai Simon', 'Spain', 'Goalkeeper', 'Creative Core', 'standard', '#9333ea'),
  ('germany-musiala', '031', 'Jamal Musiala', 'Germany', 'Attacking Mid', 'Creative Core', 'standard', '#c084fc'),
  ('germany-wirtz', '032', 'Florian Wirtz', 'Germany', 'Attacking Mid', 'Creative Core', 'standard', '#c084fc'),
  ('germany-havertz', '033', 'Kai Havertz', 'Germany', 'Forward', 'Creative Core', 'standard', '#c084fc'),
  ('germany-gundogan', '034', 'Ilkay Gundogan', 'Germany', 'Midfielder', 'Creative Core', 'standard', '#c084fc'),
  ('germany-rudiger', '035', 'Antonio Rudiger', 'Germany', 'Defender', 'Creative Core', 'standard', '#c084fc'),
  ('germany-ter-stegen', '036', 'Marc-Andre ter Stegen', 'Germany', 'Goalkeeper', 'Creative Core', 'standard', '#c084fc'),
  ('mexico-gimenez', '037', 'Santiago Gimenez', 'Mexico', 'Forward', 'Host Nation Watch', 'standard', '#16a34a'),
  ('mexico-quinones', '038', 'Julian Quinones', 'Mexico', 'Forward', 'Host Nation Watch', 'standard', '#16a34a'),
  ('mexico-alvarez', '039', 'Edson Alvarez', 'Mexico', 'Midfielder', 'Host Nation Watch', 'standard', '#16a34a'),
  ('mexico-chavez', '040', 'Luis Chavez', 'Mexico', 'Midfielder', 'Host Nation Watch', 'standard', '#16a34a'),
  ('mexico-montes', '041', 'Cesar Montes', 'Mexico', 'Defender', 'Host Nation Watch', 'standard', '#16a34a'),
  ('mexico-malagon', '042', 'Luis Malagon', 'Mexico', 'Goalkeeper', 'Host Nation Watch', 'standard', '#16a34a'),
  ('united-states-pulisic', '043', 'Christian Pulisic', 'United States', 'Winger', 'Host Nation Watch', 'standard', '#ef4444'),
  ('united-states-balogun', '044', 'Folarin Balogun', 'United States', 'Forward', 'Host Nation Watch', 'standard', '#ef4444'),
  ('united-states-mckennie', '045', 'Weston McKennie', 'United States', 'Midfielder', 'Host Nation Watch', 'standard', '#ef4444'),
  ('united-states-reyna', '046', 'Giovanni Reyna', 'United States', 'Attacking Mid', 'Host Nation Watch', 'standard', '#ef4444'),
  ('united-states-robinson', '047', 'Antonee Robinson', 'United States', 'Defender', 'Host Nation Watch', 'standard', '#ef4444'),
  ('united-states-turner', '048', 'Matt Turner', 'United States', 'Goalkeeper', 'Host Nation Watch', 'standard', '#ef4444'),
  ('canada-davies', '049', 'Alphonso Davies', 'Canada', 'Left Back', 'Host Nation Watch', 'standard', '#dc2626'),
  ('canada-david', '050', 'Jonathan David', 'Canada', 'Forward', 'Host Nation Watch', 'standard', '#dc2626'),
  ('canada-buchanan', '051', 'Tajon Buchanan', 'Canada', 'Winger', 'Host Nation Watch', 'standard', '#dc2626'),
  ('canada-eustaquio', '052', 'Stephen Eustaquio', 'Canada', 'Midfielder', 'Host Nation Watch', 'standard', '#dc2626'),
  ('canada-bombito', '053', 'Moise Bombito', 'Canada', 'Defender', 'Host Nation Watch', 'standard', '#dc2626'),
  ('canada-crepeau', '054', 'Maxime Crepeau', 'Canada', 'Goalkeeper', 'Host Nation Watch', 'standard', '#dc2626'),
  ('japan-kubo', '055', 'Takefusa Kubo', 'Japan', 'Winger', 'Global Contenders', 'standard', '#06b6d4'),
  ('japan-mitoma', '056', 'Kaoru Mitoma', 'Japan', 'Winger', 'Global Contenders', 'standard', '#06b6d4'),
  ('japan-endo', '057', 'Wataru Endo', 'Japan', 'Midfielder', 'Global Contenders', 'standard', '#06b6d4'),
  ('japan-doan', '058', 'Ritsu Doan', 'Japan', 'Forward', 'Global Contenders', 'standard', '#06b6d4'),
  ('japan-tomiyasu', '059', 'Takehiro Tomiyasu', 'Japan', 'Defender', 'Global Contenders', 'standard', '#06b6d4'),
  ('japan-suzuki', '060', 'Zion Suzuki', 'Japan', 'Goalkeeper', 'Global Contenders', 'standard', '#06b6d4'),
  ('morocco-hakimi', '061', 'Achraf Hakimi', 'Morocco', 'Right Back', 'Global Contenders', 'standard', '#eab308'),
  ('morocco-ziyech', '062', 'Hakim Ziyech', 'Morocco', 'Winger', 'Global Contenders', 'standard', '#eab308'),
  ('morocco-ounahi', '063', 'Azzedine Ounahi', 'Morocco', 'Midfielder', 'Global Contenders', 'standard', '#eab308'),
  ('morocco-amrabat', '064', 'Sofyan Amrabat', 'Morocco', 'Midfielder', 'Global Contenders', 'standard', '#eab308'),
  ('morocco-aguerd', '065', 'Nayef Aguerd', 'Morocco', 'Defender', 'Global Contenders', 'standard', '#eab308'),
  ('morocco-bounou', '066', 'Yassine Bounou', 'Morocco', 'Goalkeeper', 'Global Contenders', 'standard', '#eab308'),
  ('south-korea-son', '067', 'Son Heung-min', 'South Korea', 'Forward', 'Global Contenders', 'standard', '#0ea5e9'),
  ('south-korea-lee', '068', 'Lee Kang-in', 'South Korea', 'Attacking Mid', 'Global Contenders', 'standard', '#0ea5e9'),
  ('south-korea-hwang', '069', 'Hwang Hee-chan', 'South Korea', 'Forward', 'Global Contenders', 'standard', '#0ea5e9'),
  ('south-korea-park', '070', 'Park Yong-woo', 'South Korea', 'Midfielder', 'Global Contenders', 'standard', '#0ea5e9'),
  ('south-korea-kim', '071', 'Kim Min-jae', 'South Korea', 'Defender', 'Global Contenders', 'standard', '#0ea5e9'),
  ('south-korea-jo', '072', 'Jo Hyeon-woo', 'South Korea', 'Goalkeeper', 'Global Contenders', 'standard', '#0ea5e9'),
  ('bonus-santini', 'B-20', 'Bonus Pack Ticket', 'Santini', 'Special Reward', 'Rare Bonus', 'bonus', '#f59e0b')
on conflict (id) do update
set
  number = excluded.number,
  player = excluded.player,
  country = excluded.country,
  position = excluded.position,
  card_group = excluded.card_group,
  rarity = excluded.rarity,
  accent = excluded.accent;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  display_name text not null,
  is_admin boolean not null default false,
  packs_opened integer not null default 0 check (packs_opened >= 0),
  pack_credits integer not null default 5 check (pack_credits >= 0),
  bonus_codes text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  invite_token_hash text not null unique,
  invite_hint text not null,
  invited_name text,
  role text not null default 'collector' check (role in ('collector', 'admin')),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null default timezone('utc', now()) + interval '14 days',
  accepted_at timestamptz,
  accepted_by uuid references auth.users (id) on delete set null
);

create table if not exists public.user_cards (
  user_id uuid not null references public.profiles (id) on delete cascade,
  card_id text not null references public.album_cards (id) on delete cascade,
  copies integer not null default 0 check (copies >= 0),
  primary key (user_id, card_id)
);

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  code_hint text not null,
  pack_count integer not null check (pack_count > 0),
  created_by uuid references public.profiles (id) on delete set null,
  source text not null default 'admin' check (source in ('admin', 'bonus')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.promo_code_redemptions (
  promo_code_id uuid not null references public.promo_codes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (promo_code_id, user_id)
);

create table if not exists public.trade_offers (
  id uuid primary key default gen_random_uuid(),
  offered_by uuid not null references public.profiles (id) on delete cascade,
  offered_to uuid not null references public.profiles (id) on delete cascade,
  offered_card_id text not null references public.album_cards (id) on delete cascade,
  requested_card_id text not null references public.album_cards (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;
alter table public.invites enable row level security;
alter table public.user_cards enable row level security;
alter table public.promo_codes enable row level security;
alter table public.promo_code_redemptions enable row level security;
alter table public.trade_offers enable row level security;
alter table public.album_cards enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pending_invite public.invites%rowtype;
  provided_invite_token text := nullif(trim(coalesce(new.raw_user_meta_data ->> 'invite_token', '')), '');
begin
  select *
  into pending_invite
  from public.invites
  where lower(email) = lower(coalesce(new.email, ''))
    and accepted_at is null
    and expires_at > timezone('utc', now())
    and provided_invite_token is not null
    and invite_token_hash = crypt(provided_invite_token, invite_token_hash)
  order by created_at desc
  limit 1
  for update;

  if pending_invite.id is null then
    raise exception 'This Santini album is invite-only. A valid invite is required for this email.';
  end if;

  insert into public.profiles (id, email, display_name, is_admin)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(pending_invite.invited_name, ''),
      split_part(coalesce(new.email, 'collector'), '@', 1)
    ),
    pending_invite.role = 'admin'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    display_name = excluded.display_name,
    is_admin = excluded.is_admin;

  update public.invites
  set
    accepted_at = timezone('utc', now()),
    accepted_by = new.id
  where id = pending_invite.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.bump_card_copy(target_user_id uuid, target_card_id text, amount integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_cards (user_id, card_id, copies)
  values (target_user_id, target_card_id, amount)
  on conflict (user_id, card_id)
  do update set copies = public.user_cards.copies + excluded.copies;
end;
$$;

create or replace function public.issue_secure_code(prefix text)
returns text
language plpgsql
as $$
begin
  return upper(prefix) || '-' || upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 16));
end;
$$;

create or replace function public.create_invite(
  input_email text,
  input_invited_name text default null,
  input_role text default 'collector'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_email text := lower(trim(input_email));
  generated_code text := public.issue_secure_code('INVITE');
begin
  if current_user_id is null then
    raise exception 'You must be signed in to create an invite.';
  end if;

  if input_role not in ('collector', 'admin') then
    raise exception 'Unsupported invite role.';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = current_user_id
      and is_admin = true
  ) then
    raise exception 'Only admin collectors can create invites.';
  end if;

  if normalized_email = '' then
    raise exception 'Invite email is required.';
  end if;

  update public.invites
  set expires_at = timezone('utc', now())
  where lower(email) = normalized_email
    and accepted_at is null
    and expires_at > timezone('utc', now());

  insert into public.invites (
    email,
    invite_token_hash,
    invite_hint,
    invited_name,
    role,
    created_by
  )
  values (
    normalized_email,
    crypt(generated_code, gen_salt('bf')),
    right(generated_code, 4),
    nullif(trim(input_invited_name), ''),
    input_role,
    current_user_id
  );

  return jsonb_build_object(
    'email', normalized_email,
    'invite_code', generated_code,
    'role', input_role
  );
end;
$$;

create or replace function public.validate_invite(
  input_email text,
  input_token text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_row public.invites%rowtype;
  normalized_email text := lower(trim(input_email));
  normalized_token text := upper(trim(input_token));
begin
  select *
  into invite_row
  from public.invites
  where lower(email) = normalized_email
    and accepted_at is null
    and expires_at > timezone('utc', now())
    and invite_token_hash = crypt(normalized_token, invite_token_hash)
  order by created_at desc
  limit 1;

  if invite_row.id is null then
    raise exception 'Invite not found or already used.';
  end if;

  return jsonb_build_object(
    'email', invite_row.email,
    'expires_at', invite_row.expires_at
  );
end;
$$;

create or replace function public.get_album_snapshot()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'You must be signed in to load the album.';
  end if;

  return jsonb_build_object(
    'active_user_id',
    current_user_id,
    'users',
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', profile_rows.id,
          'name', profile_rows.display_name,
          'isAdmin', profile_rows.is_admin,
          'collection',
            coalesce(
              (
                select jsonb_object_agg(user_cards.card_id, user_cards.copies)
                from public.user_cards
                where user_cards.user_id = profile_rows.id
                  and user_cards.copies > 0
                  and (
                    profile_rows.id = current_user_id
                    or user_cards.copies > 1
                  )
              ),
              '{}'::jsonb
            ),
          'packsOpened', profile_rows.packs_opened,
          'packCredits',
            case
              when profile_rows.id = current_user_id then profile_rows.pack_credits
              else 0
            end
        )
        order by profile_rows.display_name
      )
      from public.profiles as profile_rows
    ),
    'incoming_offers',
    (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', trade_offers.id,
            'offeredBy', trade_offers.offered_by,
            'offeredByName', offered_by_profile.display_name,
            'offeredTo', trade_offers.offered_to,
            'offeredToName', offered_to_profile.display_name,
            'offeredCardId', trade_offers.offered_card_id,
            'requestedCardId', trade_offers.requested_card_id,
            'status', trade_offers.status
          )
          order by trade_offers.created_at desc
        ),
        '[]'::jsonb
      )
      from public.trade_offers
      join public.profiles offered_by_profile on offered_by_profile.id = trade_offers.offered_by
      join public.profiles offered_to_profile on offered_to_profile.id = trade_offers.offered_to
      where trade_offers.offered_to = current_user_id
        and trade_offers.status = 'pending'
    ),
    'outgoing_offers',
    (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', trade_offers.id,
            'offeredBy', trade_offers.offered_by,
            'offeredByName', offered_by_profile.display_name,
            'offeredTo', trade_offers.offered_to,
            'offeredToName', offered_to_profile.display_name,
            'offeredCardId', trade_offers.offered_card_id,
            'requestedCardId', trade_offers.requested_card_id,
            'status', trade_offers.status
          )
          order by trade_offers.created_at desc
        ),
        '[]'::jsonb
      )
      from public.trade_offers
      join public.profiles offered_by_profile on offered_by_profile.id = trade_offers.offered_by
      join public.profiles offered_to_profile on offered_to_profile.id = trade_offers.offered_to
      where trade_offers.offered_by = current_user_id
        and trade_offers.status = 'pending'
    )
  );
end;
$$;

create or replace function public.open_pack()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  next_packs_opened integer;
  has_bonus boolean;
  bonus_code text;
  sampled_ids text[];
  pack_cards jsonb;
begin
  if current_user_id is null then
    raise exception 'You must be signed in to open a pack.';
  end if;

  update public.profiles
  set
    pack_credits = pack_credits - 1,
    packs_opened = packs_opened + 1
  where id = current_user_id
    and pack_credits > 0
  returning packs_opened into next_packs_opened;

  if next_packs_opened is null then
    raise exception 'No pack credits left.';
  end if;

  select array_agg(sampled_cards.id)
  into sampled_ids
  from (
    with missing_cards as (
      select album_cards.id
      from public.album_cards
      left join public.user_cards
        on user_cards.card_id = album_cards.id
       and user_cards.user_id = current_user_id
      where album_cards.rarity = 'standard'
        and coalesce(user_cards.copies, 0) = 0
      order by random()
      limit 4
    ),
    filler_cards as (
      select album_cards.id
      from public.album_cards
      where album_cards.rarity = 'standard'
        and album_cards.id not in (select id from missing_cards)
      order by random()
      limit greatest(0, 5 - (select count(*) from missing_cards))
    )
    select id from missing_cards
    union all
    select id from filler_cards
  ) as sampled_cards;

  select jsonb_agg(to_jsonb(album_cards.*))
  into pack_cards
  from public.album_cards
  where id = any(sampled_ids);

  insert into public.user_cards (user_id, card_id, copies)
  select current_user_id, unnest(sampled_ids), 1
  on conflict (user_id, card_id)
  do update set copies = public.user_cards.copies + 1;

  has_bonus := mod(next_packs_opened, 20) = 0;

  if has_bonus then
    bonus_code := public.issue_secure_code('BONUS');

    update public.profiles
    set bonus_codes = array_append(bonus_codes, bonus_code)
    where id = current_user_id;

    insert into public.promo_codes (code_hash, code_hint, pack_count, created_by, source)
    values (
      crypt(bonus_code, gen_salt('bf')),
      right(bonus_code, 4),
      1,
      current_user_id,
      'bonus'
    );

    pack_cards := coalesce(pack_cards, '[]'::jsonb) || jsonb_build_array(
      (
        select to_jsonb(album_cards.*)
        from public.album_cards
        where id = 'bonus-santini'
      )
    );
  end if;

  return jsonb_build_object(
    'cards', coalesce(pack_cards, '[]'::jsonb),
    'bonus_code', bonus_code
  );
end;
$$;

create or replace function public.create_promo_code(input_pack_count integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  generated_code text := public.issue_secure_code('PACK');
begin
  if current_user_id is null then
    raise exception 'You must be signed in to create a code.';
  end if;

  if input_pack_count not in (1, 3, 5) then
    raise exception 'Unsupported pack amount.';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = current_user_id
      and is_admin = true
  ) then
    raise exception 'Only admin collectors can create promo codes.';
  end if;

  insert into public.promo_codes (code_hash, code_hint, pack_count, created_by, source)
  values (
    crypt(generated_code, gen_salt('bf')),
    right(generated_code, 4),
    input_pack_count,
    current_user_id,
    'admin'
  );

  return jsonb_build_object(
    'code', generated_code,
    'pack_count', input_pack_count
  );
end;
$$;

create or replace function public.redeem_promo_code(input_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  matched_code public.promo_codes%rowtype;
begin
  if current_user_id is null then
    raise exception 'You must be signed in to redeem a code.';
  end if;

  select *
  into matched_code
  from public.promo_codes
  where code_hash = crypt(upper(trim(input_code)), code_hash)
  limit 1;

  if matched_code.id is null then
    raise exception 'That code is invalid.';
  end if;

  insert into public.promo_code_redemptions (promo_code_id, user_id)
  values (matched_code.id, current_user_id)
  on conflict do nothing;

  if not found then
    raise exception 'This collector already redeemed that code.';
  end if;

  update public.profiles
  set pack_credits = pack_credits + matched_code.pack_count
  where id = current_user_id;

  return jsonb_build_object(
    'code', 'REDEEMED-' || matched_code.code_hint,
    'pack_count', matched_code.pack_count
  );
end;
$$;

create or replace function public.create_trade_offer(
  input_partner_id uuid,
  input_offered_card_id text,
  input_requested_card_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_offer_copies integer;
  partner_request_copies integer;
begin
  if current_user_id is null then
    raise exception 'You must be signed in to create a trade offer.';
  end if;

  if input_partner_id = current_user_id then
    raise exception 'You cannot trade with yourself.';
  end if;

  select copies into current_offer_copies
  from public.user_cards
  where user_id = current_user_id
    and card_id = input_offered_card_id;

  if coalesce(current_offer_copies, 0) < 2 then
    raise exception 'You can only trade duplicate cards.';
  end if;

  select copies into partner_request_copies
  from public.user_cards
  where user_id = input_partner_id
    and card_id = input_requested_card_id;

  if coalesce(partner_request_copies, 0) < 2 then
    raise exception 'Your trade partner must also trade a duplicate.';
  end if;

  insert into public.trade_offers (
    offered_by,
    offered_to,
    offered_card_id,
    requested_card_id
  )
  values (
    current_user_id,
    input_partner_id,
    input_offered_card_id,
    input_requested_card_id
  );
end;
$$;

create or replace function public.respond_trade_offer(
  input_offer_id uuid,
  input_action text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  offer_row public.trade_offers%rowtype;
  current_offer_copies integer;
  partner_offer_copies integer;
begin
  if current_user_id is null then
    raise exception 'You must be signed in to respond to a trade offer.';
  end if;

  if input_action not in ('accept', 'reject') then
    raise exception 'Unsupported trade action.';
  end if;

  select *
  into offer_row
  from public.trade_offers
  where id = input_offer_id
  for update;

  if offer_row.id is null then
    raise exception 'Trade offer not found.';
  end if;

  if offer_row.offered_to <> current_user_id then
    raise exception 'Only the invited collector can respond to this offer.';
  end if;

  if offer_row.status <> 'pending' then
    raise exception 'This trade offer is no longer pending.';
  end if;

  if input_action = 'reject' then
    update public.trade_offers
    set status = 'rejected', updated_at = timezone('utc', now())
    where id = offer_row.id;
    return;
  end if;

  select copies into current_offer_copies
  from public.user_cards
  where user_id = offer_row.offered_by
    and card_id = offer_row.offered_card_id
  for update;

  if coalesce(current_offer_copies, 0) < 2 then
    raise exception 'The offering collector no longer has that duplicate.';
  end if;

  select copies into partner_offer_copies
  from public.user_cards
  where user_id = offer_row.offered_to
    and card_id = offer_row.requested_card_id
  for update;

  if coalesce(partner_offer_copies, 0) < 2 then
    raise exception 'You no longer have the requested duplicate.';
  end if;

  update public.user_cards
  set copies = copies - 1
  where user_id = offer_row.offered_by
    and card_id = offer_row.offered_card_id
    and copies > 1;

  if not found then
    raise exception 'The offering collector no longer has that duplicate.';
  end if;

  update public.user_cards
  set copies = copies - 1
  where user_id = offer_row.offered_to
    and card_id = offer_row.requested_card_id
    and copies > 1;

  if not found then
    raise exception 'You no longer have the requested duplicate.';
  end if;

  perform public.bump_card_copy(offer_row.offered_to, offer_row.offered_card_id, 1);
  perform public.bump_card_copy(offer_row.offered_by, offer_row.requested_card_id, 1);

  update public.trade_offers
  set status = 'accepted', updated_at = timezone('utc', now())
  where id = offer_row.id;
end;
$$;

drop policy if exists "users can see own trade offers" on public.trade_offers;
create policy "users can see own trade offers"
on public.trade_offers
for select
to authenticated
using (auth.uid() = offered_by or auth.uid() = offered_to);

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "users can update themselves" on public.profiles;
create policy "users can update themselves"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "cards are viewable by authenticated users" on public.user_cards;
create policy "cards are viewable by authenticated users"
on public.user_cards
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "album cards are viewable by everyone" on public.album_cards;
create policy "album cards are viewable by everyone"
on public.album_cards
for select
to authenticated, anon
using (true);

drop policy if exists "admins can view invites" on public.invites;
create policy "admins can view invites"
on public.invites
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_admin = true
  )
);

grant execute on function public.get_album_snapshot() to authenticated;
grant execute on function public.open_pack() to authenticated;
grant execute on function public.create_promo_code(integer) to authenticated;
grant execute on function public.redeem_promo_code(text) to authenticated;
grant execute on function public.create_invite(text, text, text) to authenticated;
grant execute on function public.validate_invite(text, text) to anon, authenticated;
revoke all on function public.get_album_snapshot() from public;
revoke all on function public.open_pack() from public;
revoke all on function public.create_promo_code(integer) from public;
revoke all on function public.redeem_promo_code(text) from public;
revoke all on function public.create_trade_offer(uuid, text, text) from public;
revoke all on function public.respond_trade_offer(uuid, text) from public;
revoke all on function public.create_invite(text, text, text) from public;
revoke all on function public.validate_invite(text, text) from public;
grant execute on function public.create_trade_offer(uuid, text, text) to authenticated;
grant execute on function public.respond_trade_offer(uuid, text) to authenticated;
