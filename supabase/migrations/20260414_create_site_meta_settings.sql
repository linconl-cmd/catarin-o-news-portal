CREATE TABLE IF NOT EXISTS public.site_meta_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  og_title text NOT NULL DEFAULT 'O Catarinão - Notícias de Santa Catarina',
  og_description text NOT NULL DEFAULT 'Portal de notícias de Santa Catarina.',
  og_image_url text DEFAULT '',
  og_url text NOT NULL DEFAULT 'https://ocatarinao.vercel.app',
  twitter_card text NOT NULL DEFAULT 'summary_large_image',
  updated_at timestamp with time zone DEFAULT now()
);

-- Garante que só existe uma linha de configuração
INSERT INTO public.site_meta_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- RLS: somente usuários autenticados podem editar
ALTER TABLE public.site_meta_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage meta settings" ON public.site_meta_settings
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public can read meta settings" ON public.site_meta_settings
  FOR SELECT USING (true);
