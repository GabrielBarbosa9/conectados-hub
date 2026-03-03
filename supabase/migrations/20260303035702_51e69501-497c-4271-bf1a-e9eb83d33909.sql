
-- Add payment fields to events table
ALTER TABLE public.events 
ADD COLUMN price numeric DEFAULT NULL,
ADD COLUMN payment_method text DEFAULT NULL,
ADD COLUMN pix_key text DEFAULT NULL,
ADD COLUMN n8n_webhook_url text DEFAULT NULL;

-- Add payment fields to registrations table
ALTER TABLE public.registrations 
ADD COLUMN payment_status text NOT NULL DEFAULT 'free',
ADD COLUMN payment_proof_url text DEFAULT NULL;

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT DO NOTHING;

-- Allow anyone to upload payment proofs
CREATE POLICY "Anyone can upload payment proofs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-proofs');

-- Allow admins to view payment proofs
CREATE POLICY "Admins can view payment proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Allow admins to delete payment proofs
CREATE POLICY "Admins can delete payment proofs"
ON storage.objects FOR DELETE
USING (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'::public.app_role));
