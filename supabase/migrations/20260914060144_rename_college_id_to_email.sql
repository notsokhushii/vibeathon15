/*
# Add email column to students table

1. Changes
- Add `email` column (text, not null, unique) to the `students` table.
  - This replaces the `college_id` column as the primary identifier for IGDTUW verification.
  - Students will sign in with their IGDTUW college email address.
- Keep `college_id` column for backwards compatibility (existing rows may have it populated).
2. Security
- No RLS policy changes needed — existing policies already allow full CRUD for anon/authenticated.
- Email is stored as-is; no sensitive metadata beyond name and email.
*/

ALTER TABLE students ADD COLUMN IF NOT EXISTS email text NOT NULL DEFAULT '';

-- Create unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS students_email_unique ON students(email) WHERE email != '';
