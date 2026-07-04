ALTER TABLE activity_logs
  ADD COLUMN IF NOT EXISTS custom_category_label text;
