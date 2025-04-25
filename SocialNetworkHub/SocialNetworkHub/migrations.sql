-- Create sponsor_verification_status enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sponsor_verification_status') THEN
        CREATE TYPE sponsor_verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
    END IF;
END
$$;

-- Create payment_status enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
    END IF;
END
$$;

-- Create sponsors table if it doesn't exist
CREATE TABLE IF NOT EXISTS sponsors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  company_name TEXT NOT NULL,
  website TEXT,
  logo_url TEXT,
  description TEXT,
  contact_email TEXT,
  verification_status sponsor_verification_status NOT NULL DEFAULT 'PENDING',
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create sponsored_challenges table if it doesn't exist
CREATE TABLE IF NOT EXISTS sponsored_challenges (
  id SERIAL PRIMARY KEY,
  sponsor_id INTEGER NOT NULL REFERENCES sponsors(id),
  challenge_id INTEGER NOT NULL REFERENCES challenges(id),
  prize_amount NUMERIC(10, 2) NOT NULL,
  prize_description TEXT,
  payment_status payment_status NOT NULL DEFAULT 'PENDING',
  winner_selected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sponsors_user_id ON sponsors(user_id);
CREATE INDEX IF NOT EXISTS idx_sponsored_challenges_sponsor_id ON sponsored_challenges(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsored_challenges_challenge_id ON sponsored_challenges(challenge_id);