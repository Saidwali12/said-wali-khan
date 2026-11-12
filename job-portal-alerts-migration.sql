-- Saidwali Jobs: safe additive migration for the existing D1 database.
-- Run this ONCE in saidwali-jobs-db. It does not delete applicant records.

ALTER TABLE applicants ADD COLUMN selected_provinces TEXT NOT NULL DEFAULT '[]';

-- Preserve province preferences from older registrations.
UPDATE applicants
SET selected_provinces = CASE
  WHEN province = 'kunar' THEN '["kunar"]'
  WHEN province = 'nuristan' THEN '["nuristan"]'
  WHEN province = 'laghman' THEN '["laghman"]'
  WHEN province = 'nangarhar' THEN '["nangarhar"]'
  WHEN province = 'all' THEN '["kunar","nuristan","laghman","nangarhar"]'
  WHEN province = 'both' THEN '["kunar","nuristan"]'
  ELSE '[]'
END
WHERE selected_provinces = '[]';

CREATE INDEX IF NOT EXISTS applicants_alert_eligibility
ON applicants(active, consent, province);

-- The Worker uses this key to prevent a second alert for the same
-- applicant + unique job ID. Existing records are kept if the table exists.
CREATE TABLE IF NOT EXISTS sent_notifications (
  applicant_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  sent_at TEXT NOT NULL,
  PRIMARY KEY (applicant_id, job_id),
  FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
);
