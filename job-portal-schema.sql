CREATE TABLE IF NOT EXISTS applicants (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  father_name TEXT NOT NULL,
  education TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL COLLATE NOCASE,
  province TEXT NOT NULL CHECK (province IN ('kunar','nuristan','both')),
  consent INTEGER NOT NULL DEFAULT 0 CHECK (consent IN (0,1)),
  unsubscribe_token TEXT NOT NULL UNIQUE,
  photo_key TEXT,
  photo_name TEXT,
  photo_type TEXT,
  cv_key TEXT,
  cv_name TEXT,
  cv_type TEXT,
  created_at TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  selected_provinces TEXT NOT NULL DEFAULT '[]'
);
CREATE UNIQUE INDEX IF NOT EXISTS applicants_active_email
ON applicants(email) WHERE active = 1;
CREATE INDEX IF NOT EXISTS applicants_province_active
ON applicants(province, active, consent);
CREATE TABLE IF NOT EXISTS sent_notifications (
  applicant_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  sent_at TEXT NOT NULL,
  PRIMARY KEY (applicant_id, job_id),
  FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
);
