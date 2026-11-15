# Cloudflare Control — Safe Setup (Read Only)

This folder is an isolated administration helper. It does not modify the website, existing Workers, Pages projects, or D1 databases.

## Current safety boundary

The workflow in `.github/workflows/cloudflare-readonly-inventory.yml` can only make these Cloudflare API GET requests:

- List Workers scripts
- List D1 databases
- List Pages projects

It contains no deploy command, no SQL endpoint, no write API request, and no arbitrary URL or shell-command input. Do not add write operations until the token has been narrowed and each operation has been separately reviewed.

## Required GitHub settings (manual)

Before running the workflow, configure these in the repository:

1. Open **Settings → Secrets and variables → Actions**.
2. Under **Variables**, add:
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: the Cloudflare Account ID for the intended account.
3. Under **Secrets**, add:
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: a newly created Cloudflare API token.

Never paste the token into chat, a source file, an issue, or a commit. The existing broad token should not be reused for this read-only workflow. Create a separate token with only read permissions required to list Workers scripts, D1 databases, and Pages projects. Do not grant edit, deploy, D1 write, account administration, or user permissions.

If Cloudflare's permission picker offers separate read-only roles, select only the read roles for Workers Scripts, D1, and Cloudflare Pages. If a required read permission is unclear, stop and verify it in Cloudflare's current token documentation rather than granting broad permissions.

## How to run (after review)

1. Open **Actions** in this repository.
2. Select **Cloudflare read-only inventory**.
3. Choose `all`, `workers`, `d1`, or `pages`.
4. Click **Run workflow**.
5. Review the run summary and logs.

This first stage is intentionally manual. ChatGPT's connected GitHub tools can create and review repository files, but this connection does not provide a workflow-dispatch action or repository-secret management. The user must add the secret and start the workflow in GitHub.

## Explicitly not included

- No Worker creation, editing, or deployment
- No D1 SQL execution or schema/data changes
- No Pages deployment or settings changes
- No changes to existing Cloudflare Workers or website files
- No automatic recurring execution

A future write-capable stage must use a separate least-privilege token, fixed allowlisted operations, explicit per-operation confirmation, audit logging, and a protected GitHub Environment. Destructive SQL and deployment must remain disabled until separately reviewed and approved.
