
ALTER TABLE crm_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_receivables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_crm_pipeline" ON crm_pipeline FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_crm_contacts" ON crm_contacts FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_tasks" ON tasks FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_journal" ON journal_entries FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_activity_logs" ON activity_logs FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_finance_tx" ON finance_transactions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_finance_recv" ON finance_receivables FOR ALL TO anon USING (true) WITH CHECK (true);
