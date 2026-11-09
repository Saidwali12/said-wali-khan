# Saidwali Jobs Portal — setup

This is a separate backend for the existing GitHub Pages jobs page. It does not change the current jobs feed or application mailto flow.

## Create Cloudflare resources
1. Create a new D1 database named `saidwali-jobs-db`.
2. Open its Console and run all SQL from `job-portal-schema.sql`.
3. Create an R2 bucket named `saidwali-jobs-files`.
4. Create a Worker named `saidwali-jobs-api` and paste `job-portal-worker.js`.
5. Add bindings: D1 variable `DB` -> `saidwali-jobs-db`; R2 variable `FILES` -> `saidwali-jobs-files`.
6. Add Worker secrets/variables:
   - `ADMIN_EMAIL` = `walizaad2@gmail.com`
   - `GMAIL_FROM` = `walizaad2@gmail.com`
   - `GOOGLE_CLIENT_ID` (secret)
   - `GOOGLE_CLIENT_SECRET` (secret)
   - `GOOGLE_REFRESH_TOKEN` (secret)
   - `ADMIN_TOKEN` (secret, random long value)
7. Add a Cron Trigger: every 15 minutes. This checks the public jobs-feed.json and sends only new/changed matching vacancies to applicants who consented.
8. Test `https://saidwali-jobs-api.walizaad2.workers.dev/health`. It should show database, fileStorage, gmailConfigured true.

## Gmail API authorization
The Worker uses Gmail API OAuth2; it does not store a Gmail password. In Google Cloud Console, create/select a project, enable Gmail API, configure OAuth consent, create an OAuth Client ID, and obtain a refresh token with the Gmail `https://www.googleapis.com/auth/gmail.send` scope for `walizaad2@gmail.com`. Store the client ID, client secret, and refresh token only as Worker secrets. Do not paste them into GitHub or this website. If Google marks the app as Testing, refresh tokens can expire after seven days; publish/verify the OAuth app as appropriate for durable operation.

## Important
- R2 is required for photo and CV storage. Do not make the bucket public.
- Accepted photo: JPG/PNG/WebP up to 5 MB. CV: PDF/DOC/DOCX up to 10 MB.
- Applicant information is private; admin endpoints require the ADMIN_TOKEN bearer header.
- The first deployment is not complete until D1, R2, Gmail OAuth secrets, and Cron are configured and the health endpoint confirms all bindings.
- Cron checks the current GitHub jobs-feed every 15 minutes. It sends an email when a vacancy is first seen or its relevant details change. It cannot discover vacancies that have not been added to jobs-feed.json.
- This version sends applicant registration details and uploaded files to the admin Gmail. Do not share the admin token or OAuth secrets.
