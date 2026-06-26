-- Optional Phase 2 schema for saved player cards.
-- Run this in Supabase SQL Editor when you are ready to persist submissions.

create table if not exists player_cards (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  games integer not null,
  points integer not null,
  rebounds integer not null,
  assists integer not null,
  steals integer not null,
  blocks integer not null,
  turnovers integer not null,
  fouls integer not null,
  fg_pct numeric not null,
  three_pct numeric not null,
  ft_pct numeric not null,
  win_pct numeric not null,
  image_url text,
  evaluation jsonb
);

-- Optional storage bucket name: player-card-images
