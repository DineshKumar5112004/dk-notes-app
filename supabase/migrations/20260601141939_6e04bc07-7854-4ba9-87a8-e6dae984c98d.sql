-- Folders / notebooks
CREATE TABLE public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'folder',
  color TEXT NOT NULL DEFAULT 'default',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.folders TO authenticated;
GRANT ALL ON public.folders TO service_role;

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "folders_select_own" ON public.folders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "folders_insert_own" ON public.folders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "folders_update_own" ON public.folders FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "folders_delete_own" ON public.folders FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER touch_folders_updated_at BEFORE UPDATE ON public.folders
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Notes upgrades: soft delete, folder, reminder, word count
ALTER TABLE public.notes
  ADD COLUMN folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  ADD COLUMN deleted_at TIMESTAMPTZ,
  ADD COLUMN reminder_at TIMESTAMPTZ,
  ADD COLUMN word_count INTEGER NOT NULL DEFAULT 0;

CREATE INDEX idx_notes_user_updated ON public.notes(user_id, updated_at DESC);
CREATE INDEX idx_notes_folder ON public.notes(folder_id);
CREATE INDEX idx_notes_deleted ON public.notes(deleted_at);

-- Auto-update updated_at on notes too (was missing)
CREATE TRIGGER touch_notes_updated_at BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Profile table for settings (display name, avatar)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_emoji TEXT NOT NULL DEFAULT '✨',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER touch_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();