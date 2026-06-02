-- Add public sharing to notes
ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_notes_share_token ON public.notes(share_token) WHERE share_token IS NOT NULL;

-- Allow anonymous read of public notes via share token (only when is_public = true and token present)
DROP POLICY IF EXISTS "Public notes are readable via share token" ON public.notes;
CREATE POLICY "Public notes are readable via share token"
ON public.notes
FOR SELECT
TO anon, authenticated
USING (is_public = true AND share_token IS NOT NULL AND deleted_at IS NULL);

-- Grant anon SELECT so RLS can be evaluated
GRANT SELECT ON public.notes TO anon;