CREATE TABLE IF NOT EXISTS trade_house_traders (
  id serial PRIMARY KEY,
  user_id integer REFERENCES users(id),
  handle text NOT NULL UNIQUE,
  display_name text NOT NULL,
  avatar_url text,
  logo_url text,
  bio text,
  default_division text NOT NULL DEFAULT 'trading',
  default_platform text NOT NULL DEFAULT 'other',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trade_house_seasons (
  id serial PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  format text NOT NULL DEFAULT 'league',
  status text NOT NULL DEFAULT 'forming',
  starts_at timestamp,
  ends_at timestamp,
  rule_config text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trade_house_battles (
  id serial PRIMARY KEY,
  season_id integer REFERENCES trade_house_seasons(id),
  room_id text NOT NULL UNIQUE,
  name text NOT NULL,
  format text NOT NULL,
  mode text NOT NULL,
  account_size integer,
  sponsor_name text,
  sponsor_url text,
  rule_config text,
  status text NOT NULL DEFAULT 'scheduled',
  started_at timestamp,
  ended_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trade_house_entries (
  id serial PRIMARY KEY,
  battle_id integer NOT NULL REFERENCES trade_house_battles(id),
  trader_id integer NOT NULL REFERENCES trade_house_traders(id),
  dashboard_url text NOT NULL,
  side text,
  slot integer,
  starting_balance numeric(14,2),
  ending_balance numeric(14,2),
  pnl numeric(14,2),
  return_pct numeric(8,4),
  max_drawdown_pct numeric(8,4),
  placement integer,
  season_points integer NOT NULL DEFAULT 0,
  result text NOT NULL DEFAULT 'active',
  verified boolean NOT NULL DEFAULT false,
  started_at timestamp,
  finished_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trade_house_entries_battle ON trade_house_entries(battle_id);
CREATE INDEX IF NOT EXISTS idx_trade_house_entries_trader ON trade_house_entries(trader_id);
CREATE INDEX IF NOT EXISTS idx_trade_house_battles_season ON trade_house_battles(season_id);
