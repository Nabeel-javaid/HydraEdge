create table agents (
  id bigint primary key generated always as identity,
  code text,
  instance text,
  ip text,
  created_at timestamptz default now(),
  updated_at timestamptz,
  deleted_at timestamptz
);

