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
    response = SESSION.get(url, timeout=18)
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
            detail_links = node.find_all("a", href=lambda value: value and "/en/jobs/details/" in value)
            if len(detail_links) == 1 and len(candidate) > len(title) and DATE_RE.search(candidate):
                card_text = candidate
                break
            node = node.parent

        deadline = parse_iso_date(card_text)
        if not provinces_in(card_text):
            continue
        canonical = href.split("#", 1)[0].rstrip("/")
        if not deadline or deadline < date.today().isoformat() or canonical in seen:
            continue
        seen.add(canonical)
        output.append({"url": canonical, "card_title": title, "deadline": deadline})
    return output


def parse_detail(
    candidate: dict,
    rejection_counts: dict | None = None,
    status_debug_samples: list | None = None,
) -> dict | None:
    def reject(reason: str) -> None:
        if rejection_counts is not None:
            rejection_counts[reason] = rejection_counts.get(reason, 0) + 1
    html = safe_get(candidate["url"])
    soup = BeautifulSoup(html, "html.parser")
    lines = [clean(x) for x in soup.stripped_strings if clean(x)]
    full_text = clean(soup.get_text(" ", strip=True))
    h1 = soup.find("h1")
    title = clean(h1.get_text(" ", strip=True)) if h1 else ""
    if not title:
        reject("detail_title_missing")
        return None

    # ACBAR places the vacancy status (for example, "NEW Open") just below
    # the H1 title. Check this local status area, not the page header/menu.
    title_index = next((i for i, line in enumerate(lines) if line == title), -1)
    status_lines = lines[title_index + 1:title_index + 6] if title_index >= 0 else []
    status_context = clean(" ".join(status_lines)).casefold()
    has_open = bool(re.search(r"(?<![a-z])open(?![a-z])", status_context))
    has_closed = bool(re.search(r"(?<![a-z])closed(?![a-z])", status_context))
    if not has_open or has_closed:
        if not has_open:
            reject("detail_status_open_not_found_near_title")
        if has_closed:
            reject("detail_status_closed_near_title")
        if status_debug_samples is not None and len(status_debug_samples) < 3:
            status_debug_samples.append({
                "url": candidate["url"],
                "title": title,
                "status_context": " | ".join(status_lines)[:1200],
            })
        return None

    # ACBAR detail pages place the exact duty station immediately after Location.
    location_text = ""
    for index, line in enumerate(lines):
        if line.casefold().rstrip(":") == "location" and index + 1 < len(lines):
            location_text = lines[index + 1]
            break
    provinces = provinces_in(location_text)
    if not provinces:
        reject("target_province_not_found_in_location_field")
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
        reject("application_email_or_external_apply_link_missing")
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

    job_number = re.search(r"/details/(\d+)/", urlparse(candidate["url"]).path)
    if not job_number:
        reject("vacancy_id_missing_from_url")
        return None
    vacancy_match = re.search(r"\b(?:VAC-\d+|[A-Z]{1,5}-\d+)\b", full_text, re.I)
    vacancy_ref = vacancy_match.group(0).upper() if vacancy_match else ""

    return {
        "id": "acbar-" + job_number.group(1),
        "vacancyRef": vacancy_ref or None,
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



WAZIFAHA_BASE = "https://wazifaha.com"
WAZIFAHA_JOBS = WAZIFAHA_BASE + "/jobs?page={page}"
ORG_EMAIL_DOMAINS = {
    "danish refugee council": ("drc.ngo",),
    "drc": ("drc.ngo",),
    "unicef": ("unicef.org",),
    "unops": ("unops.org",),
    "international organization for migration": ("iom.int",),
    "iom": ("iom.int",),
    "world food programme": ("wfp.org",),
    "wfp": ("wfp.org",),
    "who": ("who.int",),
}


def parse_flexible_date(text: str) -> str | None:
    value = clean(text)
    iso = parse_iso_date(value)
    if iso:
        return iso
    for pattern in ("%d %B %Y", "%d %b %Y", "%B %d, %Y", "%b %d, %Y"):
        match = re.search(r"\b\d{1,2}\s+[A-Za-z]+\s+20\d{2}\b|\b[A-Za-z]+\s+\d{1,2},?\s+20\d{2}\b", value)
        if match:
            try:
                return datetime.strptime(match.group(0).replace(",", ""), pattern.replace(",", "")).date().isoformat()
            except ValueError:
                continue
    return None


def wazifaha_listing_candidates(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    found = []
    seen = set()
    for anchor in soup.find_all("a", href=True):
        href = urljoin(WAZIFAHA_BASE, anchor["href"].strip())
        parsed = urlparse(href)
        if parsed.netloc.lower() not in {"wazifaha.com", "www.wazifaha.com"}:
            continue
        if not re.match(r"^/jobs/[^/]+/?$", parsed.path):
            continue
        title = clean(anchor.get_text(" ", strip=True))
        if not title:
            continue
        node = anchor
        card_text = ""
        for _ in range(6):
            if node is None:
                break
            candidate_text = clean(node.get_text(" ", strip=True))
            job_links = node.find_all("a", href=lambda value: value and re.match(r"^/jobs/[^/]+/?$", urlparse(value).path))
            if len(job_links) == 1 and len(candidate_text) > len(title) and provinces_in(candidate_text):
                card_text = candidate_text
                break
            node = node.parent
        if not card_text:
            continue
        canonical = href.split("#", 1)[0].rstrip("/")
        if canonical in seen:
            continue
        seen.add(canonical)
        found.append({"url": canonical, "card_title": title})
    return found


def employer_page_confirms(url: str, title: str, reference: str) -> bool:
    try:
        response = SESSION.get(url, timeout=18, allow_redirects=True)
        if response.status_code < 200 or response.status_code >= 400:
            return False
        if "text/html" not in response.headers.get("Content-Type", ""):
            return False
        haystack = (response.url + " " + response.text[:500000]).casefold()
        if reference and reference.casefold() in haystack:
            return True
        words = [w.casefold() for w in re.findall(r"[A-Za-z]{4,}", title)[:6]]
        matches = sum(1 for word in set(words) if word in haystack)
        return matches >= 2
    except Exception:
        return False


def parse_wazifaha_detail(candidate: dict) -> dict | None:
    html = safe_get(candidate["url"])
    soup = BeautifulSoup(html, "html.parser")
    lines = [clean(x) for x in soup.stripped_strings if clean(x)]
    h1 = soup.find("h1")
    title = clean(h1.get_text(" ", strip=True)) if h1 else ""
    if not title:
        return None

    province_parts = []
    stop_labels = {
        "functional area", "education", "experience level", "years of experience",
        "employment type", "contract type", "probation period", "gender",
        "languages", "salary", "closing date", "country", "city"
    }
    for i, line in enumerate(lines):
        if line.casefold().rstrip(":") == "province":
            for part in lines[i + 1:i + 12]:
                if part.casefold().rstrip(":") in stop_labels:
                    break
                province_parts.append(part)
            break
    provinces = provinces_in(" ".join(province_parts))
    if not provinces:
        return None

    deadline = None
    for i, line in enumerate(lines):
        if "closing date" in line.casefold():
            deadline = parse_flexible_date(line)
            if not deadline and i + 1 < len(lines):
                deadline = parse_flexible_date(lines[i + 1])
            if deadline:
                break
    if not deadline or deadline < date.today().isoformat():
        return None

    reference_match = re.search(r"\bVAC-\d+\b", " ".join(lines), re.I)
    reference = reference_match.group(0).upper() if reference_match else ""

    apply_url = ""
    for link in soup.find_all("a", href=True):
        label = clean(link.get_text(" ", strip=True)).casefold()
        href = urljoin(candidate["url"], link["href"].strip())
        parsed = urlparse(href)
        if "apply" in label and parsed.scheme == "https" and parsed.netloc and not parsed.netloc.lower().endswith("wazifaha.com"):
            apply_url = href
            break

    # The first text lines after the title can be employment labels such as
    # "Full time". Read the organization from the company link attached after
    # the actual H1 instead of guessing from nearby plain text.
    organization = ""
    generic_labels = {
        "full time", "part time", "contract", "temporary", "internship",
        "private company", "government", "ngo", "new", "open", "closed"
    }
    if h1:
        for company_link in h1.find_all_next("a", href=True, limit=10):
            label = clean(company_link.get_text(" ", strip=True))
            if label and label.casefold() not in generic_labels:
                organization = label
                break
    if not organization:
        try:
            h1_index = next(i for i, line in enumerate(lines) if line == title)
            for line in lines[h1_index + 1:h1_index + 8]:
                if (line and line.casefold() not in generic_labels
                        and "views" not in line.casefold() and len(line) <= 180):
                    organization = line
                    break
        except StopIteration:
            pass

    apply_email = ""
    submission_start = -1
    for i, line in enumerate(lines):
        if any(marker in line.casefold() for marker in ("submission guideline", "submission email", "how to apply")):
            submission_start = i
            break
    submission_text = " ".join(lines[submission_start:]) if submission_start >= 0 else ""
    email_match = EMAIL_RE.search(submission_text)
    if email_match:
        possible_email = email_match.group(0).lower()
        org_key = organization.casefold()
        allowed_domains = next((domains for name, domains in ORG_EMAIL_DOMAINS.items() if name in org_key), ())
        if any(possible_email.endswith("@" + domain) for domain in allowed_domains):
            apply_email = possible_email

    if apply_url:
        if not employer_page_confirms(apply_url, title, reference):
            return None
    elif not apply_email:
        return None

    slug = urlparse(candidate["url"]).path.rstrip("/").split("/")[-1]
    stable_id = ("wazifaha-" + reference.lower()) if reference else ("wazifaha-" + slug.lower())
    employment_type = "د اصلي اعلان له مخې"
    for i, line in enumerate(lines):
        if line.casefold().rstrip(":") == "employment type" and i + 1 < len(lines):
            employment_type = lines[i + 1]
            break

    return {
        "id": stable_id,
        "vacancyRef": reference or None,
        "title": title,
        "organization": organization or "د اصلي اعلان له مخې",
        "location": provinces,
        "dutyStation": ", ".join(p.title() for p in provinces),
        "employmentType": employment_type,
        "requirements": "د زده‌کړو، تجربې او نورو شرایطو لپاره د اصلي اعلان او د کار ورکوونکي پاڼه وګورئ.",
        "expiryDate": deadline,
        "applyUrl": apply_url or candidate["url"],
        "applyEmail": apply_email,
        "sourceName": "Wazifaha (employer contact checked)",
        "sourceUrl": candidate["url"],
        "applicationMode": "both" if apply_url and apply_email else ("email" if apply_email else "online"),
        "verified": True,
        "verificationLevel": "aggregator_detail_and_employer_contact_checked",
    }


def is_wazifaha_job(job: dict) -> bool:
    source = str(job.get("sourceUrl") or "").casefold()
    return "wazifaha.com/jobs/" in source or "wazifaha.org/jobs/" in source or str(job.get("id", "")).startswith("wazifaha-")


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
        if not is_acbar_job(job) and not is_wazifaha_job(job)
        and re.fullmatch(r"20\d{2}-\d{2}-\d{2}", str(job.get("expiryDate") or ""))
        and str(job.get("expiryDate")) >= today
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
    detail_rejections = {}
    status_debug_samples = []
    for candidate in candidates:
        try:
            job = parse_detail(candidate, detail_rejections, status_debug_samples)
            if job:
                verified.append(job)
        except Exception as exc:
            detail_errors.append(f"{candidate['url']}: {exc}")

    # Do not replace the existing feed if every ACBAR detail request failed.
    if not verified and detail_errors:
        raise RuntimeError("All ACBAR detail checks failed; feed was not changed: " + " | ".join(detail_errors[:8]))

    # Wazifaha is a secondary discovery source. A record is accepted only if
    # its detail page names a target province and future deadline, and its
    # external employer application page is reachable and matches the vacancy.
    wazifaha_verified = []
    wazifaha_errors = []
    wazifaha_candidates = []
    for page in range(1, 13):
        url = WAZIFAHA_JOBS.format(page=page)
        try:
            page_candidates = wazifaha_listing_candidates(safe_get(url))
            if not page_candidates:
                continue
            wazifaha_candidates.extend(page_candidates)
        except Exception as exc:
            wazifaha_errors.append(f"page {page}: {exc}")
            break

    for candidate in wazifaha_candidates:
        try:
            job = parse_wazifaha_detail(candidate)
            if job:
                wazifaha_verified.append(job)
        except Exception as exc:
            wazifaha_errors.append(f"{candidate['url']}: {exc}")

    # Keep the feed usable if Wazifaha is temporarily unavailable; ACBAR
    # remains the primary source and is never blocked by a secondary outage.
    by_id = {str(job.get("id")): job for job in retained if job.get("id")}

    def source_key(value: str) -> str:
        value = str(value or "").strip().split("#", 1)[0].rstrip("/")
        value = re.sub(r"^https://www\\.", "https://", value, flags=re.I)
        return value.casefold()

    # Keep old IDs for already-published source URLs so the existing
    # applicant+job notification deduplication remains effective.
    old_ids_by_source = {
        source_key(job.get("sourceUrl")): str(job.get("id"))
        for job in feed["jobs"] if job.get("sourceUrl") and job.get("id")
    }

    known_apply_urls = {
        str(job.get("applyUrl", "")).rstrip("/").casefold()
        for job in list(by_id.values()) if job.get("applyUrl")
    }
    known_refs = {
        str(job.get("vacancyRef", "")).casefold()
        for job in list(by_id.values()) if job.get("vacancyRef")
    }
    for job in verified + wazifaha_verified:
        old_id = old_ids_by_source.get(source_key(job.get("sourceUrl")))
        if old_id:
            job["id"] = old_id
        apply_key = str(job.get("applyUrl", "")).rstrip("/").casefold()
        ref_key = str(job.get("vacancyRef") or "").casefold()
        if (apply_key and apply_key in known_apply_urls) or (ref_key and ref_key in known_refs):
            continue
        by_id[job["id"]] = job
        if apply_key:
            known_apply_urls.add(apply_key)
        if ref_key:
            known_refs.add(ref_key)

    jobs = list(by_id.values())
    jobs.sort(key=lambda item: (item.get("expiryDate") or "9999-12-31", item.get("title", "")))
    feed["updatedAt"] = datetime.now(timezone.utc).date().isoformat()
    feed["collector"] = {
        "schedule": "every 6 hours",
        "sources": {
            "ACBAR": "active_detail_verified",
            "WazifaGroup": "discovery_only_not_yet_automated",
            "Wazifaha": ("active_employer_contact_checked" if wazifaha_verified else ("temporarily_unavailable" if wazifaha_errors else "no_matching_verified_jobs")),
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
        "sources": ["ACBAR", "Wazifaha"],
        "acbar_listing_candidates": len(candidates),
        "acbar_detail_verified": len(verified),
        "acbar_detail_rejected_or_unverified": len(candidates) - len(verified),
        "acbar_detail_errors": detail_errors[:10],
        "acbar_detail_rejection_reasons": detail_rejections,
        "acbar_status_debug_samples": status_debug_samples,
        "wazifaha_listing_candidates": len(wazifaha_candidates),
        "wazifaha_detail_verified": len(wazifaha_verified),
        "wazifaha_errors": wazifaha_errors[:10],
        "expired_jobs_removed": "yes",
        "active_jobs_in_feed": len(jobs)
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
