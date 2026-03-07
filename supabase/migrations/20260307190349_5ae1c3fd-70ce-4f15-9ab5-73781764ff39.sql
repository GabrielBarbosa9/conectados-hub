ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS payment_type text,
  ADD COLUMN IF NOT EXISTS payment_mode text,
  ADD COLUMN IF NOT EXISTS installments_total integer,
  ADD COLUMN IF NOT EXISTS credit_card_payment_date date,
  ADD COLUMN IF NOT EXISTS user_id uuid;