ALTER TABLE trade_house_traders
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text;

CREATE TABLE IF NOT EXISTS trade_house_accounts (
  id serial PRIMARY KEY,
  trader_id integer NOT NULL REFERENCES trade_house_traders(id),
  platform text NOT NULL DEFAULT 'other',
  account_kind text NOT NULL DEFAULT 'demo',
  account_size integer,
  platform_login text,
  dashboard_url text,
  support_status text NOT NULL DEFAULT 'requested',
  support_reference text,
  credentials_delivered boolean NOT NULL DEFAULT false,
  issued_at timestamp,
  verified_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

ALTER TABLE trade_house_battles
  ADD COLUMN IF NOT EXISTS promo_text text,
  ADD COLUMN IF NOT EXISTS music_url text;

ALTER TABLE trade_house_entries
  ALTER COLUMN dashboard_url DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS account_id integer REFERENCES trade_house_accounts(id),
  ADD COLUMN IF NOT EXISTS invite_token_hash text,
  ADD COLUMN IF NOT EXISTS invite_last_four text,
  ADD COLUMN IF NOT EXISTS invite_expires_at timestamp,
  ADD COLUMN IF NOT EXISTS invite_revoked_at timestamp,
  ADD COLUMN IF NOT EXISTS profile_completed_at timestamp;

CREATE INDEX IF NOT EXISTS idx_trade_house_accounts_trader ON trade_house_accounts(trader_id);
CREATE INDEX IF NOT EXISTS idx_trade_house_entries_invite_hash ON trade_house_entries(invite_token_hash);
CREATE INDEX IF NOT EXISTS idx_trade_house_battles_created_at ON trade_house_battles(created_at DESC);
