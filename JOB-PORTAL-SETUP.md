# Saidwali Jobs Portal — four-province email alerts

The jobs page is hosted on GitHub Pages. Applicant registration and scheduled job alerts run through the Cloudflare Worker.

## Existing Cloudflare resources

- Worker: `saidwali-jobs-api`
- D1 database: `saidwali-jobs-db`
- D1 binding on the Worker: `DB` → `saidwali-jobs-db`
- Google Apps Script is used for file uploads to Drive and sending email.

## One-time update to the existing D1 database

1. Open Cloudflare Dashboard → Workers & Pages → D1 → `saidwali-jobs-db` → Console.
2. Open `job-portal-alerts-migration.sql` in this repository.
3. Copy the complete SQL into the D1 Console and run it ONCE.
4. This migration adds the selected-provinces field, keeps existing applicant rows, carries forward the old Kunar/Nuristan preferences, and ensures the one-alert-per-applicant/job table exists. It does not delete applicant records.

For a brand-new database only, run `job-portal-schema.sql` instead of the migration.

## Update the Worker

1. Open Cloudflare Dashboard → Workers & Pages → `saidwali-jobs-api` → Edit code.
2. Replace the Worker code with the complete contents of `saidwali-jobs-api-worker-four-provinces.js`.
3. Save and Deploy.
4. Confirm the existing D1 binding is named exactly `DB`.
5. Confirm these Worker secrets/variables exist:
   - `GOOGLE_APPS_SCRIPT_URL` — the deployed Apps Script web-app URL
   - `GOOGLE_APPS_SCRIPT_TOKEN` — the matching secret token
   - Optional: `ADMIN_EMAIL` — defaults to `walizaad2@gmail.com`

The Apps Script endpoint must support the `sendEmail` and `upload` actions used by the Worker. Do not put its token in GitHub or in the public website.

## Enable scheduled alerts

In the Worker settings, open Triggers → Cron Triggers and add:

- `*/15 * * * *` (every 15 minutes)

The Worker checks the latest verified `jobs-feed.json`. It sends an alert only to active applicants who explicitly checked the email-alert consent box and whose selected province matches the vacancy.

## Alert rules

- A person selecting Kunar receives Kunar vacancies only; the same applies to Nuristan, Laghman and Nangarhar.
- Selecting “all four provinces” matches all four.
- If email alerts were not accepted, registration is still allowed but no job-alert email is sent.
- Each applicant receives each unique job ID only once, even if the vacancy record is later updated.
- Unsubscribe links switch off future job-alert emails.
- Vacancies must be verified, not expired, and have a valid email or a real online application URL.

## Verification

Open:

`https://saidwali-jobs-api.walizaad2.workers.dev/health`

It should return `success: true`, `database: true`, and `googleStorageConfigured: true`.

The health check does not prove that a Cron Trigger exists. Confirm the Cron Trigger separately in Worker → Triggers, then use a test registration and a test vacancy to verify end-to-end delivery. Never test by sending unsolicited email to real applicants.
