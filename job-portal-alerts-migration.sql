-- Saidwali Jobs: safe additive migration for existing D1 data.
-- Run this once in the existing saidwali-jobs-db database.
-- It preserves existing applicant rows and existing sent_notifications records.

ALTER TABLE applicants ADD COLUMN selected_provinces TEXT NOT NULL DEFAULT '[]';

-- Existing two-province registrations keep their previous meaning.
UPDATE applicants
SET selected_provinces = CASE
  WHEN province = 'kunar' THEN '["kunar"]'
  WHEN province = 'nuristan' THEN '["nuristan"]'
  WHEN province = 'both' THEN '["kunar","nuristan"]'
  ELSE '[]'
END
WHERE selected_provinces = '[]';

CREATE INDEX IF NOT EXISTS applicants_alert_eligibility
ON applicants(active, consent, province);

-- One notification per applicant per unique job ID is enforced by the
-- existing sent_notifications primary key (applicant_id, job_id).
