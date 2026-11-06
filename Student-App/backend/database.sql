CREATE DATABASE IF NOT EXISTS okoa_sem
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE okoa_sem;

CREATE TABLE IF NOT EXISTS uploads (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category ENUM('notes', 'assignments', 'past_papers') NOT NULL,
  unit_code VARCHAR(64) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(127) NOT NULL,
  size_bytes BIGINT UNSIGNED NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_uploads_stored_name (stored_name),
  KEY idx_uploads_category_uploaded (category, uploaded_at),
  KEY idx_uploads_unit_code (unit_code)
) ENGINE=InnoDB;
