#!/usr/bin/env python3
"""Conservative ACBAR job collector for Saidwali Jobs.

Only publishes ACBAR listing cards when a target province, an official detail
URL, and a future closing date are all present. Other sources are deliberately
not guessed until their feed formats are verified.
"""
from __future__ import annotations

import json
import os
import re
import sys
from datetime import date, datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
FEED_PATH = ROOT / "jobs-feed.json"
BASE = "https://www.acbar.org"
LIST_URL = BASE + "/en/jobs?page={page}"
TARGETS = {
    "kunar": ("kunar", "کونړ", "کنړ"),
    "nuristan": ("nuristan", "نورستان"),
    "laghman": ("laghman", "لغمان"),
    "nangarhar": ("nangarhar", "ننګرهار", "ننگرهار"),
}
DATE_RE = re.compile(r"\b(20\d{2}-\d{2}-\d{2})\b")
SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": "SaidwaliJobsBot/1.0 (+https://saidwali12.github.io/said-wali-khan/)",
    "Accept": "text/html,application/xhtml+xml"
})


def provinces_in(text: str) -> list[str]:
    value = text.casefold()
    found = []
    for key, aliases in TARGETS.items():
        if any(alias.casefold() in value for alias in aliases):
            found.append(key)
    return found


def iso_date(text: str) -> str | None:
    match = DATE_RE.search(text)
    if not match:
        return None
    try:
        parsed = date.fromisoformat(match.group(1))
        return parsed.isoformat()
    except ValueError:
        return None


def safe_get(url: str) -> str:
    response = SESSION.get(url, timeout=25)
    response.raise_for_status()
    if "text/html" not in response.headers.get("Content-Type", ""):
        raise RuntimeError(f"Unexpected content type from {url}")
    return response.text


def extract_cards(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    output = []
    seen = set()

    for anchor in soup.find_all("a", href=True):
        href = urljoin(BASE, anchor["href"].strip())
        parsed = urlparse(href)
        if parsed.netloc not in {"www.acbar.org", "acbar.org"}:
            continue
        if not re.search(r"/en/jobs/details/\d+/", parsed.path):
            continue

        title = " ".join(anchor.get_text(" ", strip=True).split())
        if not title or title.casefold() in {"details", "view details"}:
            continue

        card_text = ""
        node = anchor
        for _ in range(6):
            if node is None:
                break
            text = " ".join(node.get_text(" ", strip=True).split())
            if len(text) >= len(title) and provinces_in(text) and DATE_RE.search(text):
                card_text = text
                break
            node = node.parent

        if not card_text:
            continue

        provinces = provinces_in(card_text)
        deadline = iso_date(card_text)
        if not provinces or not deadline or deadline < date.today().isoformat():
            continue

        key = href.split("#", 1)[0]
        if key in seen:
            continue
        seen.add(key)

        # Organization and employment type are shown beside the title on ACBAR.
        organization = ""
        title_pos = card_text.find(title)
        tail = card_text[title_pos + len(title):] if title_pos >= 0 else card_text
        bullet = re.search(r"([^•]{2,100})\s*•\s*(Full Time|Part Time|Contract|Internship|Temporary)", tail, re.I)
        employment_type = ""
        if bullet:
            organization = bullet.group(1).strip(" •-")
            employment_type = bullet.group(2).strip()

        slug = parsed.path.rstrip("/").split("/")[-1]
        job_id = "acbar-" + slug.lower()
        output.append({
            "id": job_id,
            "title": title.replace(" NEW", "").strip(),
            "organization": organization or "د اصلي اعلان له مخې",
            "location": provinces,
            "dutyStation": ", ".join(p.title() for p in provinces),
            "employmentType": employment_type or "د اصلي اعلان له مخې",
            "requirements": "د زده‌کړو، تجربې او نورو شرایطو لپاره د ACBAR اصلي اعلان وګورئ.",
            "expiryDate": deadline,
            "applyUrl": key,
            "sourceName": "ACBAR",
            "sourceUrl": key,
            "applicationMode": "online",
            "verified": True
        })

    return output


def main() -> None:
    if not FEED_PATH.exists():
        raise RuntimeError("jobs-feed.json was not found")

    feed = json.loads(FEED_PATH.read_text(encoding="utf-8"))
    if not isinstance(feed, dict) or not isinstance(feed.get("jobs"), list):
        raise RuntimeError("jobs-feed.json has an unexpected format")

    existing = feed["jobs"]
    today = date.today().isoformat()
    active_existing = [
        job for job in existing
        if not job.get("expiryDate") or str(job.get("expiryDate")) >= today
    ]
    by_id = {str(job.get("id")): job for job in active_existing if job.get("id")}

    collected = []
    errors = []
    # ACBAR currently exposes paginated public HTML listings.
    for page in range(1, 17):
        url = LIST_URL.format(page=page)
        try:
            collected.extend(extract_cards(safe_get(url)))
        except Exception as exc:
            errors.append(f"page {page}: {exc}")

    # A partial source outage must not wipe the existing feed.
    if errors and not collected:
        raise RuntimeError("ACBAR collection failed: " + " | ".join(errors))

    added = 0
    for job in collected:
        if job["id"] not in by_id:
            by_id[job["id"]] = job
            added += 1

    result_jobs = list(by_id.values())
    result_jobs.sort(key=lambda item: (item.get("expiryDate", "9999-12-31"), item.get("title", "")))
    feed["updatedAt"] = datetime.now(timezone.utc).date().isoformat()
    feed["policy"] = (
        "Only active announcements from trusted sources are listed when the "
        "source detail page, target province, and closing date are present. "
        "Always confirm final requirements and application instructions on the original source."
    )
    feed["jobs"] = result_jobs
    FEED_PATH.write_text(
        json.dumps(feed, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )

    print(json.dumps({
        "source": "ACBAR",
        "pages_checked": 16,
        "candidates_found": len(collected),
        "new_jobs_added": added,
        "active_jobs_in_feed": len(result_jobs),
        "source_errors": errors
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
