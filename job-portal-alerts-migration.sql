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

-- Canonical one-time delivery ledger.
CREATE TABLE IF NOT EXISTS sent_notifications (
  applicant_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  sent_at TEXT NOT NULL,
  PRIMARY KEY (applicant_id, job_id),
  FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
);

-- Preserve history written by the previous four-province Worker, so an
-- already-notified applicant/job pair is not emailed a second time.
CREATE TABLE IF NOT EXISTS job_notifications (
  applicant_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  job_title TEXT,
  province TEXT,
  content_hash TEXT,
  status TEXT,
  sent_at TEXT
);
INSERT OR IGNORE INTO sent_notifications (applicant_id, job_id, content_hash, sent_at)
SELECT old.applicant_id, old.job_id,
       COALESCE(old.content_hash, 'legacy-notification'),
       COALESCE(old.sent_at, CURRENT_TIMESTAMP)
FROM job_notifications AS old
INNER JOIN applicants AS a ON a.id = old.applicant_id
WHERE old.status = 'sent' AND old.job_id IS NOT NULL;
