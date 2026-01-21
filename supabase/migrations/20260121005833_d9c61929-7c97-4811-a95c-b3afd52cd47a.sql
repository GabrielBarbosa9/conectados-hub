-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create events table
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    location TEXT,
    max_capacity INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create event_custom_fields table
CREATE TABLE public.event_custom_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    field_name TEXT NOT NULL,
    field_type TEXT NOT NULL DEFAULT 'text',
    is_required BOOLEAN NOT NULL DEFAULT false,
    field_order INTEGER NOT NULL DEFAULT 0,
    options JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on event_custom_fields
ALTER TABLE public.event_custom_fields ENABLE ROW LEVEL SECURITY;

-- Create registrations table
CREATE TABLE public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT,
    age INTEGER,
    custom_fields JSONB,
    checked_in BOOLEAN NOT NULL DEFAULT false,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on registrations
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Create donations table
CREATE TABLE public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(10,2) NOT NULL,
    donor_name TEXT,
    notes TEXT,
    donation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on donations
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Create gallery_albums table
CREATE TABLE public.gallery_albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    cover_photo_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on gallery_albums
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;

-- Create gallery_photos table
CREATE TABLE public.gallery_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID REFERENCES public.gallery_albums(id) ON DELETE CASCADE NOT NULL,
    photo_url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on gallery_photos
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

-- Create settings table
CREATE TABLE public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- user_roles: Only admins can read
CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- profiles: Users can view and update their own
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- events: Public read, admin write
CREATE POLICY "Anyone can view active events" ON public.events
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all events" ON public.events
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert events" ON public.events
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update events" ON public.events
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete events" ON public.events
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- event_custom_fields: Public read, admin write
CREATE POLICY "Anyone can view event custom fields" ON public.event_custom_fields
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert event custom fields" ON public.event_custom_fields
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update event custom fields" ON public.event_custom_fields
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete event custom fields" ON public.event_custom_fields
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- registrations: Public insert, admin full access
CREATE POLICY "Anyone can register for events" ON public.registrations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all registrations" ON public.registrations
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update registrations" ON public.registrations
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete registrations" ON public.registrations
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- donations: Admin only
CREATE POLICY "Admins can view donations" ON public.donations
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert donations" ON public.donations
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update donations" ON public.donations
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete donations" ON public.donations
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- gallery_albums: Public read, admin write
CREATE POLICY "Anyone can view albums" ON public.gallery_albums
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert albums" ON public.gallery_albums
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update albums" ON public.gallery_albums
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete albums" ON public.gallery_albums
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- gallery_photos: Public read, admin write
CREATE POLICY "Anyone can view photos" ON public.gallery_photos
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert photos" ON public.gallery_photos
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update photos" ON public.gallery_photos
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete photos" ON public.gallery_photos
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- settings: Public read, admin write
CREATE POLICY "Anyone can view settings" ON public.settings
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert settings" ON public.settings
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update settings" ON public.settings
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for gallery photos
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);

-- Storage policies for gallery bucket
CREATE POLICY "Anyone can view gallery photos" ON storage.objects
FOR SELECT
USING (bucket_id = 'gallery');

CREATE POLICY "Admins can upload gallery photos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update gallery photos" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete gallery photos" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.settings (key, value) VALUES 
    ('whatsapp_number', ''),
    ('whatsapp_message', 'Olá! Gostaria de saber mais sobre o Conectados.'),
    ('instagram_url', ''),
    ('pix_key', ''),
    ('pix_name', ''),
    ('about_text', 'Conectados — Uma geração conectada com Deus e com pessoas');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();