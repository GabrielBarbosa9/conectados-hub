-- Add missing payment fields to events table
ALTER TABLE public.events 
ADD COLUMN accepts_credit_card BOOLEAN DEFAULT FALSE,
ADD COLUMN accepts_installments BOOLEAN DEFAULT FALSE,
ADD COLUMN max_installments INTEGER DEFAULT 1;