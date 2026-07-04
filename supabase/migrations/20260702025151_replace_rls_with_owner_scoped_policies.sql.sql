/*
# Replace single-tenant RLS policies with owner-scoped authenticated policies

## Purpose
Replaces all existing `anon` / `USING (true)` policies with strict
owner-scoped policies that only allow authenticated users to access their own
data. This enforces per-user data isolation via Row Level Security.

## Changes

### Policy replacement on all 14 data tables
For each table, the old `anon_all_*` policy (or `anon_select/insert/update/delete_*`)
is dropped and replaced with 4 separate owner-scoped policies:
- SELECT: `USING (auth.uid() = user_id)`
- INSERT: `WITH CHECK (auth.uid() = user_id)`
- UPDATE: `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`
- DELETE: `USING (auth.uid() = user_id)`

All policies are scoped `TO authenticated` — only signed-in users can read/write.
The anon role (unauthenticated) gets zero access to all tables.

### Tables affected
1. crm_pipeline, 2. crm_contacts, 3. tasks, 4. journal_entries,
5. activity_logs, 6. finance_transactions, 7. finance_receivables,
8. habits, 9. habit_logs, 10. goals, 11. body_metrics, 12. health_logs,
13. focus_sessions, 14. user_settings

## Security
- Every policy uses `auth.uid()` — never `current_user`.
- `user_id` columns default to `auth.uid()` so inserts that omit `user_id`
  still satisfy the INSERT policy's `WITH CHECK`.
- Unauthenticated requests (anon role) get zero rows from every table.
- Users can only see, create, update, and delete their own rows.

## Notes
1. The old policies used `FOR ALL` with `USING (true) WITH CHECK (true)` —
   these are replaced with 4 separate per-verb policies as required.
2. All old policy names are dropped with `IF EXISTS` for idempotency.
3. This migration is safe to re-run — all drops use `IF EXISTS` and all
   creates use `IF NOT EXISTS` via the drop-first pattern.
*/

-- ============ crm_pipeline ============
DROP POLICY IF EXISTS "anon_all_crm_pipeline" ON crm_pipeline;
DROP POLICY IF EXISTS "select_own_crm_pipeline" ON crm_pipeline;
DROP POLICY IF EXISTS "insert_own_crm_pipeline" ON crm_pipeline;
DROP POLICY IF EXISTS "update_own_crm_pipeline" ON crm_pipeline;
DROP POLICY IF EXISTS "delete_own_crm_pipeline" ON crm_pipeline;
CREATE POLICY "select_own_crm_pipeline" ON crm_pipeline FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_crm_pipeline" ON crm_pipeline FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_crm_pipeline" ON crm_pipeline FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_crm_pipeline" ON crm_pipeline FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ crm_contacts ============
DROP POLICY IF EXISTS "anon_all_crm_contacts" ON crm_contacts;
DROP POLICY IF EXISTS "select_own_crm_contacts" ON crm_contacts;
DROP POLICY IF EXISTS "insert_own_crm_contacts" ON crm_contacts;
DROP POLICY IF EXISTS "update_own_crm_contacts" ON crm_contacts;
DROP POLICY IF EXISTS "delete_own_crm_contacts" ON crm_contacts;
CREATE POLICY "select_own_crm_contacts" ON crm_contacts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_crm_contacts" ON crm_contacts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_crm_contacts" ON crm_contacts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_crm_contacts" ON crm_contacts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ tasks ============
DROP POLICY IF EXISTS "anon_all_tasks" ON tasks;
DROP POLICY IF EXISTS "select_own_tasks" ON tasks;
DROP POLICY IF EXISTS "insert_own_tasks" ON tasks;
DROP POLICY IF EXISTS "update_own_tasks" ON tasks;
DROP POLICY IF EXISTS "delete_own_tasks" ON tasks;
CREATE POLICY "select_own_tasks" ON tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_tasks" ON tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_tasks" ON tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_tasks" ON tasks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ journal_entries ============
DROP POLICY IF EXISTS "anon_all_journal" ON journal_entries;
DROP POLICY IF EXISTS "select_own_journal" ON journal_entries;
DROP POLICY IF EXISTS "insert_own_journal" ON journal_entries;
DROP POLICY IF EXISTS "update_own_journal" ON journal_entries;
DROP POLICY IF EXISTS "delete_own_journal" ON journal_entries;
CREATE POLICY "select_own_journal" ON journal_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_journal" ON journal_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_journal" ON journal_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_journal" ON journal_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ activity_logs ============
DROP POLICY IF EXISTS "anon_all_activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "select_own_activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "insert_own_activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "update_own_activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "delete_own_activity_logs" ON activity_logs;
CREATE POLICY "select_own_activity_logs" ON activity_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_activity_logs" ON activity_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_activity_logs" ON activity_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_activity_logs" ON activity_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ finance_transactions ============
DROP POLICY IF EXISTS "anon_all_finance_tx" ON finance_transactions;
DROP POLICY IF EXISTS "select_own_finance_tx" ON finance_transactions;
DROP POLICY IF EXISTS "insert_own_finance_tx" ON finance_transactions;
DROP POLICY IF EXISTS "update_own_finance_tx" ON finance_transactions;
DROP POLICY IF EXISTS "delete_own_finance_tx" ON finance_transactions;
CREATE POLICY "select_own_finance_tx" ON finance_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_finance_tx" ON finance_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_finance_tx" ON finance_transactions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_finance_tx" ON finance_transactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ finance_receivables ============
DROP POLICY IF EXISTS "anon_all_finance_recv" ON finance_receivables;
DROP POLICY IF EXISTS "select_own_finance_recv" ON finance_receivables;
DROP POLICY IF EXISTS "insert_own_finance_recv" ON finance_receivables;
DROP POLICY IF EXISTS "update_own_finance_recv" ON finance_receivables;
DROP POLICY IF EXISTS "delete_own_finance_recv" ON finance_receivables;
CREATE POLICY "select_own_finance_recv" ON finance_receivables FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_finance_recv" ON finance_receivables FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_finance_recv" ON finance_receivables FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_finance_recv" ON finance_receivables FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ habits ============
DROP POLICY IF EXISTS "anon_all_habits" ON habits;
DROP POLICY IF EXISTS "select_own_habits" ON habits;
DROP POLICY IF EXISTS "insert_own_habits" ON habits;
DROP POLICY IF EXISTS "update_own_habits" ON habits;
DROP POLICY IF EXISTS "delete_own_habits" ON habits;
CREATE POLICY "select_own_habits" ON habits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_habits" ON habits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_habits" ON habits FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_habits" ON habits FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ habit_logs ============
DROP POLICY IF EXISTS "anon_all_habit_logs" ON habit_logs;
DROP POLICY IF EXISTS "select_own_habit_logs" ON habit_logs;
DROP POLICY IF EXISTS "insert_own_habit_logs" ON habit_logs;
DROP POLICY IF EXISTS "update_own_habit_logs" ON habit_logs;
DROP POLICY IF EXISTS "delete_own_habit_logs" ON habit_logs;
CREATE POLICY "select_own_habit_logs" ON habit_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_habit_logs" ON habit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_habit_logs" ON habit_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_habit_logs" ON habit_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ goals ============
DROP POLICY IF EXISTS "anon_all_goals" ON goals;
DROP POLICY IF EXISTS "select_own_goals" ON goals;
DROP POLICY IF EXISTS "insert_own_goals" ON goals;
DROP POLICY IF EXISTS "update_own_goals" ON goals;
DROP POLICY IF EXISTS "delete_own_goals" ON goals;
CREATE POLICY "select_own_goals" ON goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_goals" ON goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_goals" ON goals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_goals" ON goals FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ body_metrics ============
DROP POLICY IF EXISTS "anon_select_body_metrics" ON body_metrics;
DROP POLICY IF EXISTS "anon_insert_body_metrics" ON body_metrics;
DROP POLICY IF EXISTS "anon_update_body_metrics" ON body_metrics;
DROP POLICY IF EXISTS "anon_delete_body_metrics" ON body_metrics;
DROP POLICY IF EXISTS "select_own_body_metrics" ON body_metrics;
DROP POLICY IF EXISTS "insert_own_body_metrics" ON body_metrics;
DROP POLICY IF EXISTS "update_own_body_metrics" ON body_metrics;
DROP POLICY IF EXISTS "delete_own_body_metrics" ON body_metrics;
CREATE POLICY "select_own_body_metrics" ON body_metrics FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_body_metrics" ON body_metrics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_body_metrics" ON body_metrics FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_body_metrics" ON body_metrics FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ health_logs ============
DROP POLICY IF EXISTS "anon_select_health_logs" ON health_logs;
DROP POLICY IF EXISTS "anon_insert_health_logs" ON health_logs;
DROP POLICY IF EXISTS "anon_update_health_logs" ON health_logs;
DROP POLICY IF EXISTS "anon_delete_health_logs" ON health_logs;
DROP POLICY IF EXISTS "select_own_health_logs" ON health_logs;
DROP POLICY IF EXISTS "insert_own_health_logs" ON health_logs;
DROP POLICY IF EXISTS "update_own_health_logs" ON health_logs;
DROP POLICY IF EXISTS "delete_own_health_logs" ON health_logs;
CREATE POLICY "select_own_health_logs" ON health_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_health_logs" ON health_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_health_logs" ON health_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_health_logs" ON health_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ focus_sessions ============
DROP POLICY IF EXISTS "anon_select_focus_sessions" ON focus_sessions;
DROP POLICY IF EXISTS "anon_insert_focus_sessions" ON focus_sessions;
DROP POLICY IF EXISTS "anon_update_focus_sessions" ON focus_sessions;
DROP POLICY IF EXISTS "anon_delete_focus_sessions" ON focus_sessions;
DROP POLICY IF EXISTS "select_own_focus_sessions" ON focus_sessions;
DROP POLICY IF EXISTS "insert_own_focus_sessions" ON focus_sessions;
DROP POLICY IF EXISTS "update_own_focus_sessions" ON focus_sessions;
DROP POLICY IF EXISTS "delete_own_focus_sessions" ON focus_sessions;
CREATE POLICY "select_own_focus_sessions" ON focus_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_focus_sessions" ON focus_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_focus_sessions" ON focus_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_focus_sessions" ON focus_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ user_settings ============
DROP POLICY IF EXISTS "anon_select_user_settings" ON user_settings;
DROP POLICY IF EXISTS "anon_insert_user_settings" ON user_settings;
DROP POLICY IF EXISTS "anon_update_user_settings" ON user_settings;
DROP POLICY IF EXISTS "anon_delete_user_settings" ON user_settings;
DROP POLICY IF EXISTS "select_own_user_settings" ON user_settings;
DROP POLICY IF EXISTS "insert_own_user_settings" ON user_settings;
DROP POLICY IF EXISTS "update_own_user_settings" ON user_settings;
DROP POLICY IF EXISTS "delete_own_user_settings" ON user_settings;
CREATE POLICY "select_own_user_settings" ON user_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_user_settings" ON user_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_user_settings" ON user_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_user_settings" ON user_settings FOR DELETE TO authenticated USING (auth.uid() = user_id);
