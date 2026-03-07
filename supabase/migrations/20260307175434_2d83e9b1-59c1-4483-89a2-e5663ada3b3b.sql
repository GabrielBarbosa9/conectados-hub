ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS accepts_credit_card boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS accepts_installments boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS max_installments integer NOT NULL DEFAULT 1;