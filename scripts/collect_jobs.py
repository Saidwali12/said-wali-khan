#!/usr/bin/env python3
"""Conservative ACBAR collector for Saidwali Jobs.

A listing card is never enough to publish a vacancy. Each candidate's detail
page must be reachable, still open, explicitly name one of the four target
provinces, show a future closing date on the listing, and provide an application
email or an explicit external Apply/Application link.
"""
from __future__ import annotations

import json
import re
from datetime import date, datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
FEED_PATH = ROOT / "jobs-feed.json"
BASE = "https://acbar.org"
LIST_URL = BASE + "/en/jobs?page={page}"
TARGETS = {
    "kunar": ("kunar", "کونړ", "کنړ"),
    "nuristan": ("nuristan", "نورستان"),
    "laghman": ("laghman", "لغمان"),
    "nangarhar": ("nangarhar", "ننګرهار", "ننگرهار"),
}
DATE_RE = re.compile(r"\b(20\d{2}-\d{2}-\d{2})\b")
EMAIL_RE = re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.I)
SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": "SaidwaliJobsBot/2.0 (+https://saidwali12.github.io/said-wali-khan/)",
    "Accept": "text/html,application/xhtml+xml",
})


def clean(value: str) -> str:
    return " ".join((value or "").replace("\xa0", " ").split())


def provinces_in(text: str) -> list[str]:
    value = (text or "").casefold()
    return [key for key, aliases in TARGETS.items()
            if any(alias.casefold() in value for alias in aliases)]


def parse_iso_date(text: str) -> str | None:
    match = DATE_RE.search(text or "")
    if not match:
        return None
    try:
        return date.fromisoformat(match.group(1)).isoformat()
    except ValueError:
        return None


def safe_get(url: str) -> str:
    response = SESSION.get(url, timeout=25)
    response.raise_for_status()
    if "text/html" not in response.headers.get("Content-Type", ""):
        raise RuntimeError(f"Unexpected content type from {url}")
    return response.text


def listing_candidates(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    output = []
    seen = set()

    for anchor in soup.find_all("a", href=True):
        href = urljoin(BASE, anchor["href"].strip())
        parsed = urlparse(href)
        if parsed.netloc.lower() not in {"www.acbar.org", "acbar.org"}:
            continue
        if not re.search(r"/en/jobs/details/\d+/", parsed.path):
            continue

        title = clean(anchor.get_text(" ", strip=True))
        if not title or title.casefold() in {"details", "view details"}:
            continue

        card_text = ""
        node = anchor
        for _ in range(7):
            if node is None:
                break
            candidate = clean(node.get_text(" ", strip=True))
            if len(candidate) > len(title) and DATE_RE.search(candidate):
                card_text = candidate
                break
            node = node.parent

        deadline = parse_iso_date(card_text)
        canonical = href.split("#", 1)[0].rstrip("/")
        if not deadline or deadline < date.today().isoformat() or canonical in seen:
            continue
        seen.add(canonical)
        output.append({"url": canonical, "card_title": title, "deadline": deadline})
    return output


def parse_detail(candidate: dict) -> dict | None:
    html = safe_get(candidate["url"])
    soup = BeautifulSoup(html, "html.parser")
    lines = [clean(x) for x in soup.stripped_strings if clean(x)]
    full_text = clean(soup.get_text(" ", strip=True))
    lower_top = clean(" ".join(lines[:35])).casefold()

    # Require an explicitly open vacancy, not merely an accessible old page.
    if "open" not in lower_top or "closed" in lower_top:
        return None

    h1 = soup.find("h1")
    title = clean(h1.get_text(" ", strip=True)) if h1 else ""
    if not title:
        return None

    # ACBAR detail pages place the exact duty station immediately after Location.
    location_text = ""
    for index, line in enumerate(lines):
        if line.casefold().rstrip(":") == "location" and index + 1 < len(lines):
            location_text = lines[index + 1]
            break
    provinces = provinces_in(location_text)
    if not provinces:
        return None

    # Prefer the application email explicitly shown in the submission section.
    apply_email = ""
    section_start = -1
    for marker in ("submission guideline", "submission guidelines", "how to apply"):
        for i, line in enumerate(lines):
            if marker in line.casefold():
                section_start = i
                break
        if section_start >= 0:
            break

    application_text = " ".join(lines[section_start:]) if section_start >= 0 else ""
    email_match = EMAIL_RE.search(application_text)
    if email_match:
        candidate_email = email_match.group(0).lower()
        if not candidate_email.endswith("@acbar.org"):
            apply_email = candidate_email

    apply_url = ""
    for link in soup.find_all("a", href=True):
        label = clean(link.get_text(" ", strip=True)).casefold()
        href = urljoin(candidate["url"], link["href"].strip())
        parsed = urlparse(href)
        if ("apply" in label or "application form" in label or "submit application" in label):
            if parsed.scheme == "https" and parsed.netloc and parsed.netloc.lower() not in {
                "acbar.org", "www.acbar.org"
            }:
                apply_url = href
                break

    if not apply_email and not apply_url:
        return None

    # Organization is the first short non-navigation line after the heading.
    organization = ""
    try:
        h1_index = next(i for i, line in enumerate(lines) if line == title)
        for line in lines[h1_index + 1:h1_index + 6]:
            if line.casefold() not in {"new", "open", "new open"} and not line.startswith("##"):
                if len(line) <= 180:
                    organization = line
                    break
    except StopIteration:
        pass

    slug = urlparse(candidate["url"]).path.rstrip("/").split("/")[-1]
    job_number = re.search(r"/details/(\d+)/", urlparse(candidate["url"]).path)
    if not job_number:
        return None

    return {
        "id": "acbar-" + job_number.group(1),
        "title": title,
        "organization": organization or "د اصلي اعلان له مخې",
        "location": provinces,
        "dutyStation": ", ".join(p.title() for p in provinces),
        "employmentType": "د اصلي اعلان له مخې",
        "requirements": "د زده‌کړو، تجربې او نورو شرایطو لپاره د ACBAR اصلي اعلان وګورئ.",
        "expiryDate": candidate["deadline"],
        "applyUrl": apply_url or candidate["url"],
        "applyEmail": apply_email,
        "sourceName": "ACBAR",
        "sourceUrl": candidate["url"],
        "applicationMode": "both" if apply_email and apply_url else ("email" if apply_email else "online"),
        "verified": True,
        "verificationLevel": "detail_page_checked",
    }


def is_acbar_job(job: dict) -> bool:
    source = str(job.get("sourceUrl") or "").casefold()
    return source.startswith("https://acbar.org/") or source.startswith("https://www.acbar.org/") or str(job.get("id", "")).startswith("acbar-")


def main() -> None:
    if not FEED_PATH.exists():
        raise RuntimeError("jobs-feed.json was not found")

    feed = json.loads(FEED_PATH.read_text(encoding="utf-8"))
    if not isinstance(feed, dict) or not isinstance(feed.get("jobs"), list):
        raise RuntimeError("jobs-feed.json has an unexpected format")

    today = date.today().isoformat()
    # Rebuild ACBAR records from fresh detail pages; discard expired records
    # from every source. Preserve active non-ACBAR/manual records.
    retained = [
        job for job in feed["jobs"]
        if not is_acbar_job(job)
        and (not job.get("expiryDate") or str(job.get("expiryDate")) >= today)
    ]

    candidates = []
    errors = []
    for page in range(1, 17):
        try:
            candidates.extend(listing_candidates(safe_get(LIST_URL.format(page=page))))
        except Exception as exc:
            errors.append(f"listing page {page}: {exc}")

    if errors:
        raise RuntimeError("One or more ACBAR listing pages failed; feed was not changed: " + " | ".join(errors))
    if not candidates:
        raise RuntimeError("ACBAR returned no candidates; feed was not changed")

    verified = []
    detail_errors = []
    for candidate in candidates:
        try:
            job = parse_detail(candidate)
            if job:
                verified.append(job)
        except Exception as exc:
            detail_errors.append(f"{candidate['url']}: {exc}")

    # Do not replace the existing feed if every detail request failed.
    if not verified and detail_errors:
        raise RuntimeError("All ACBAR detail checks failed; feed was not changed: " + " | ".join(detail_errors[:8]))

    by_id = {str(job.get("id")): job for job in retained if job.get("id")}
    for job in verified:
        by_id[job["id"]] = job

    jobs = list(by_id.values())
    jobs.sort(key=lambda item: (item.get("expiryDate") or "9999-12-31", item.get("title", "")))
    feed["updatedAt"] = datetime.now(timezone.utc).date().isoformat()
    feed["collector"] = {
        "schedule": "every 6 hours",
        "sources": {
            "ACBAR": "active_detail_verified",
            "WazifaGroup": "discovery_only_not_yet_automated",
            "Wazifaha": "discovery_only_not_yet_automated",
            "Jobs.af": "discovery_only_not_yet_automated",
            "OfficialGovernment": "discovery_only_not_yet_automated",
            "UNandINGO": "discovery_only_not_yet_automated"
        },
        "rule": "Only publish active jobs whose detail page explicitly names a target province and provides an application method. Secondary sources require original employer verification."
    }
    feed["policy"] = (
        "Only active announcements are published after checking the source detail page, "
        "the exact target province, the closing date, and the application method. "
        "Applicants should confirm final requirements on the original source."
    )
    feed["jobs"] = jobs
    FEED_PATH.write_text(json.dumps(feed, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(json.dumps({
        "source": "ACBAR",
        "listing_candidates": len(candidates),
        "detail_verified": len(verified),
        "detail_rejected_or_unverified": len(candidates) - len(verified),
        "detail_errors": detail_errors[:10],
        "expired_jobs_removed": "yes",
        "active_jobs_in_feed": len(jobs)
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
