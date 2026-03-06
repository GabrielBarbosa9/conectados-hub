
-- Tabela de pastas
CREATE TABLE public.sermon_outline_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sermon_outline_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view folders" ON public.sermon_outline_folders FOR SELECT USING (true);
CREATE POLICY "Admins can insert folders" ON public.sermon_outline_folders FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update folders" ON public.sermon_outline_folders FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete folders" ON public.sermon_outline_folders FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Tabela de arquivos
CREATE TABLE public.sermon_outline_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id uuid NOT NULL REFERENCES public.sermon_outline_folders(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  title text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sermon_outline_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view files" ON public.sermon_outline_files FOR SELECT USING (true);
CREATE POLICY "Admins can insert files" ON public.sermon_outline_files FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update files" ON public.sermon_outline_files FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete files" ON public.sermon_outline_files FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Bucket para PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('sermon-outlines', 'sermon-outlines', true);

-- Storage policies
CREATE POLICY "Anyone can view sermon outlines" ON storage.objects FOR SELECT USING (bucket_id = 'sermon-outlines');
CREATE POLICY "Admins can upload sermon outlines" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'sermon-outlines' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete sermon outlines" ON storage.objects FOR DELETE USING (bucket_id = 'sermon-outlines' AND public.has_role(auth.uid(), 'admin'));
