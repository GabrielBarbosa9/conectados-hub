-- Fix installment proofs storage policy to verify registration ownership
-- This ensures users can only upload files for their own registrations

-- Drop the existing permissive policy
DROP POLICY IF EXISTS "Authenticated users can upload installment proofs" ON storage.objects;

-- Create a restrictive policy that checks registration ownership
CREATE POLICY "Users can upload own installment proofs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'installment-proofs' AND
    -- Extract registration_id from the path (format: registrationId/installmentId.ext)
    (split_part(name, '/', 1)) IN (
      SELECT id FROM public.registrations WHERE user_id = auth.uid()
    )
  );

-- Allow users to update their own proof files
CREATE POLICY "Users can update own installment proofs"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'installment-proofs' AND
    (split_part(name, '/', 1)) IN (
      SELECT id FROM public.registrations WHERE user_id = auth.uid()
    )
  );

-- Allow users to delete their own proof files
CREATE POLICY "Users can delete own installment proofs"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'installment-proofs' AND
    (split_part(name, '/', 1)) IN (
      SELECT id FROM public.registrations WHERE user_id = auth.uid()
    )
  );
