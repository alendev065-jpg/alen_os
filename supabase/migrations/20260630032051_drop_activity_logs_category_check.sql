/*
# Remove category CHECK constraint from activity_logs

1. Changes
- Drop the CHECK constraint on activity_logs.category that restricted it to only 'study', 'work', 'rest', 'exercise', 'waste'.
- This allows the expanded category list (meal, social, commute, reading, creative, admin, custom) to be stored.

2. Security
- No RLS changes. Existing policies remain intact.

3. Notes
- The constraint name is auto-generated; we drop it by looking it up in pg_constraint.
- Idempotent: if the constraint doesn't exist, the DO block does nothing.
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'activity_logs_category_check'
      AND conrelid = 'activity_logs'::regclass
  ) THEN
    ALTER TABLE activity_logs DROP CONSTRAINT activity_logs_category_check;
  END IF;
END $$;
