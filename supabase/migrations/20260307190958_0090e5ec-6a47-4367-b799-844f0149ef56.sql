CREATE POLICY "Users can view own registrations"
ON public.registrations
FOR SELECT TO authenticated
USING (auth.uid() = user_id);