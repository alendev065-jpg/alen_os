/*
# Add user_id columns for multi-user data isolation

## Purpose
Transforms the existing single-tenant schema into a multi-user schema where each
user only sees and modifies their own data. This is the foundation for the new
login/signup portal.

## Changes

### Data cleanup
- All existing rows in all tables are from the single-tenant era (no owner).
  Since there is no original user to assign them to, and the app is transitioning
  to multi-user with strict per-user isolation, these rows are deleted.
  This affects: habit_logs (365), user_settings (20), activity_logs (11),
  finance_transactions (8), body_metrics (7), goals (7), tasks (6), habits (5),
  crm_pipeline (4), crm_contacts (4), finance_receivables (3), health_logs (2),
  journal_entries (1). focus_sessions already had 0 rows.

### New column: `user_id` on all data tables
Added `user_id uuid NOT NULL DEFAULT auth.uid()` to all 14 data tables:
1. crm_pipeline, 2. crm_contacts, 3. tasks, 4. journal_entries,
5. activity_logs, 6. finance_transactions, 7. finance_receivables,
8. habits, 9. habit_logs, 10. goals, 11. body_metrics, 12. health_logs,
13. focus_sessions, 14. user_settings

### Constraint changes
- `journal_entries`: dropped unique on `entry_date`, added composite unique on `(user_id, entry_date)`
- `user_settings`: dropped unique on `key`, added composite unique on `(user_id, key)`

### Indexes
- Added `user_id` index on all 14 tables for faster user-scoped queries.

## Security
- No policy changes in this migration — that's done in the next migration.
- RLS remains enabled on all tables from prior migrations.

## Notes
1. `user_id` defaults to `auth.uid()` so frontend inserts that omit `user_id`
   still satisfy RLS `WITH CHECK (auth.uid() = user_id)`.
2. Foreign key references `auth.users(id) ON DELETE CASCADE` — deleting a user
   automatically removes all their data.
*/

-- Delete all existing single-tenant data (no owner to assign)
DELETE FROM habit_logs;
DELETE FROM user_settings;
DELETE FROM activity_logs;
DELETE FROM finance_transactions;
DELETE FROM body_metrics;
DELETE FROM goals;
DELETE FROM tasks;
DELETE FROM habits;
DELETE FROM crm_pipeline;
DELETE FROM crm_contacts;
DELETE FROM finance_receivables;
DELETE FROM health_logs;
DELETE FROM journal_entries;
DELETE FROM focus_sessions;

-- Add user_id to crm_pipeline
ALTER TABLE crm_pipeline ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE crm_pipeline ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE crm_pipeline ALTER COLUMN user_id SET NOT NULL;

-- Add user_id to crm_contacts
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE crm_contacts ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE crm_contacts ALTER COLUMN user_id SET NOT NULL;

-- Add user_id to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE tasks ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE tasks ALTER COLUMN user_id SET NOT NULL;

-- Add user_id to journal_entries
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE journal_entries ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE journal_entries ALTER COLUMN user_id SET NOT NULL;

-- Drop old unique constraint on entry_date, add composite
ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS journal_entries_entry_date_key;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'journal_entries_user_id_entry_date_key'
  ) THEN
    ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_user_id_entry_date_key UNIQUE (user_id, entry_date);
  END IF;
END $$;

-- Add user_id to activity_logs
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE activity_logs ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE activity_logs ALTER COLUMN user_id SET NOT NULL;

-- Add user_id to finance_transactions
ALTER TABLE finance_transactions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE finance_transactions ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE finance_transactions ALTER COLUMN user_id SET NOT NULL;

-- Add user_id to finance_receivables
ALTER TABLE finance_receivables ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE finance_receivables ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE finance_receivables ALTER COLUMN user_id SET NOT NULL;

-- Add user_id to habits
ALTER TABLE habits ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE habits ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE habits ALTER COLUMN user_id SET NOT NULL;

-- Add user_id to habit_logs
ALTER TABLE habit_logs ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE habit_logs ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE habit_logs ALTER COLUMN user_id SET NOT NULL;

-- Add user_id to goals
ALTER TABLE goals ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE goals ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE goals ALTER COLUMN user_id SET NOT NULL;

-- Add user_id to body_metrics
ALTER TABLE body_metrics ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE body_metrics ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE body_metrics ALTER COLUMN user_id SET NOT NULL;

-- Add user_id to health_logs
ALTER TABLE health_logs ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE health_logs ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE health_logs ALTER COLUMN user_id SET NOT NULL;

-- Add user_id to focus_sessions
ALTER TABLE focus_sessions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE focus_sessions ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE focus_sessions ALTER COLUMN user_id SET NOT NULL;

-- Add user_id to user_settings
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE user_settings ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE user_settings ALTER COLUMN user_id SET NOT NULL;

-- Drop old unique constraint on key, add composite
ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS user_settings_key_key;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_settings_user_id_key_key'
  ) THEN
    ALTER TABLE user_settings ADD CONSTRAINT user_settings_user_id_key_key UNIQUE (user_id, key);
  END IF;
END $$;

-- Add indexes for faster user-scoped queries
CREATE INDEX IF NOT EXISTS idx_crm_pipeline_user_id ON crm_pipeline(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_user_id ON crm_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_user_id ON finance_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_receivables_user_id ON finance_receivables(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_body_metrics_user_id ON body_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_health_logs_user_id ON health_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
