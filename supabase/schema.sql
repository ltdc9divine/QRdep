create extension if not exists pgcrypto;

do $$
begin
  create type public.order_status as enum ('PENDING', 'PAID', 'FAILED');
exception
  when duplicate_object then null;
end;
$$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  "orderCode" bigint not null unique,
  "templateId" text not null,
  amount integer not null check (amount > 0),
  status public.order_status not null default 'PENDING',
  "createdAt" timestamptz not null default now(),
  client_ip_hash text not null,
  access_token_hash text
);

alter table public.orders add column if not exists access_token_hash text;
create unique index if not exists orders_access_token_hash_idx
  on public.orders (access_token_hash)
  where access_token_hash is not null;

create index if not exists orders_pending_ip_created_at_idx
  on public.orders (client_ip_hash, "createdAt")
  where status = 'PENDING';

alter table public.orders enable row level security;
revoke all on table public.orders from anon, authenticated;
grant all on table public.orders to service_role;

drop function if exists public.create_pending_order(bigint, text, integer, text);

create or replace function public.create_pending_order(
  p_order_code bigint,
  p_template_id text,
  p_amount integer,
  p_client_ip_hash text,
  p_access_token_hash text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  pending_count integer;
  new_order_id uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_client_ip_hash, 0));

  select count(*)::integer
    into pending_count
    from public.orders
   where client_ip_hash = p_client_ip_hash
     and status = 'PENDING'
     and "createdAt" > now() - interval '15 minutes';

  if pending_count >= 5 then
    raise exception 'ORDER_RATE_LIMITED' using errcode = 'P0001';
  end if;

  insert into public.orders ("orderCode", "templateId", amount, status, client_ip_hash, access_token_hash)
  values (p_order_code, p_template_id, p_amount, 'PENDING', p_client_ip_hash, p_access_token_hash)
  returning id into new_order_id;

  return new_order_id;
end;
$$;

revoke all on function public.create_pending_order(bigint, text, integer, text, text) from public, anon, authenticated;
grant execute on function public.create_pending_order(bigint, text, integer, text, text) to service_role;
