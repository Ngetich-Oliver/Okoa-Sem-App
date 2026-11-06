ALTER TABLE uploads
  ADD COLUMN unit_code VARCHAR(64) NOT NULL DEFAULT '' AFTER category,
  ADD KEY idx_uploads_unit_code (unit_code);
