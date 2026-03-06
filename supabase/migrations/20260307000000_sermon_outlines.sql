-- Sermon outline folders (themes)
CREATE TABLE public.sermon_outline_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sermon_outline_folders ENABLE ROW LEVEL SECURITY;

-- Sermon outline files (PDFs)
CREATE TABLE public.sermon_outline_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID NOT NULL REFERENCES public.sermon_outline_folders(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    title TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sermon_outline_files ENABLE ROW LEVEL SECURITY;

-- RLS: sermon_outline_folders - public read, admin write
CREATE POLICY "Anyone can view sermon folders" ON public.sermon_outline_folders
FOR SELECT USING (true);

CREATE POLICY "Admins can insert sermon folders" ON public.sermon_outline_folders
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update sermon folders" ON public.sermon_outline_folders
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete sermon folders" ON public.sermon_outline_folders
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS: sermon_outline_files - public read, admin write
CREATE POLICY "Anyone can view sermon files" ON public.sermon_outline_files
FOR SELECT USING (true);

CREATE POLICY "Admins can insert sermon files" ON public.sermon_outline_files
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update sermon files" ON public.sermon_outline_files
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete sermon files" ON public.sermon_outline_files
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for sermon outline PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('sermon-outlines', 'sermon-outlines', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Anyone can view sermon outlines" ON storage.objects
FOR SELECT USING (bucket_id = 'sermon-outlines');

CREATE POLICY "Admins can upload sermon outlines" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'sermon-outlines' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update sermon outlines" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'sermon-outlines' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete sermon outlines" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'sermon-outlines' AND public.has_role(auth.uid(), 'admin'));
