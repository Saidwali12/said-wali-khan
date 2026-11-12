const ALLOWED_ORIGIN = "https://saidwali12.github.io";
const ADMIN_EMAIL = "walizaad2@gmail.com";
const JOBS_URL = "https://saidwali12.github.io/said-wali-khan/jobs-feed.json";
const API_BASE = "https://saidwali-jobs-api.walizaad2.workers.dev";
const PROVINCES = ["kunar", "nuristan", "laghman", "nangarhar"];
const PROVINCE_LABELS = {
  kunar: "کونړ",
  nuristan: "نورستان",
  laghman: "لغمان",
  nangarhar: "ننګرهار"
};

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}
function json(data, status = 200, origin = ALLOWED_ORIGIN) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json; charset=utf-8" }
  });
}
function base64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}
function clean(value, max = 180) {
  return String(value || "").trim().slice(0, max);
}
function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}
async function sendEmail(env, to, subject, body) {
  if (!env.GOOGLE_APPS_SCRIPT_URL || !env.GOOGLE_APPS_SCRIPT_TOKEN) {
    throw new Error("د ایمیل لېږلو Google Apps Script تنظیمات نشته.");
  }
  const response = await fetch(env.GOOGLE_APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: env.GOOGLE_APPS_SCRIPT_TOKEN,
      action: "sendEmail",
      to, subject, body
    })
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || "Email could not be sent");
  }
  return result;
}
async function uploadToDrive(env, file) {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("عکس او CV دواړه پورته کړئ.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error(file.name + " فایل باید تر ۸ MB کم وي.");
  }
  const allowed = [
    "image/jpeg", "image/png", "image/webp",
    "application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];
  if (!allowed.includes(file.type)) {
    throw new Error("د فایل ډول د منلو وړ نه دی: " + file.name);
  }
  const response = await fetch(env.GOOGLE_APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: env.GOOGLE_APPS_SCRIPT_TOKEN,
      action: "upload",
      fileName: file.name,
      mimeType: file.type,
      base64: base64(new Uint8Array(await file.arrayBuffer()))
    })
  });
  const result = await response.json();
  if (!response.ok || !result.success || !result.fileId) {
    throw new Error(result.error || "فایل Google Drive ته پورته نه شو.");
  }
  return result;
}
function selectedProvinceList(value) {
  const province = clean(value, 20).toLowerCase();
  if (province === "all") return [...PROVINCES];
  return PROVINCES.includes(province) ? [province] : [];
}
function legacyProvinceValue(list) {
  return list.length === 1 && (list[0] === "kunar" || list[0] === "nuristan")
    ? list[0] : "both";
}
async function registerApplicant(request, env, origin) {
  if (!env.DB) return json({ success: false, error: "ډیټابېس نه دی تړل شوی." }, 503, origin);
  if (!env.GOOGLE_APPS_SCRIPT_URL || !env.GOOGLE_APPS_SCRIPT_TOKEN) {
    return json({ success: false, error: "د فایلونو او ایمیل خدمت لا سم نه دی تنظیم شوی." }, 503, origin);
  }
  const form = await request.formData();
  const fullName = clean(form.get("full_name"), 100);
  const fatherName = clean(form.get("father_name"), 100);
  const education = clean(form.get("education"), 80);
  const phone = clean(form.get("phone"), 40);
  const email = clean(form.get("email"), 160).toLowerCase();
  const selected = selectedProvinceList(form.get("province"));
  const consentValue = clean(form.get("email_consent"), 10).toLowerCase();
  const consent = ["yes", "1", "true", "on"].includes(consentValue) ? 1 : 0;

  if (!fullName || !fatherName || !education || !phone || !validEmail(email) || !selected.length) {
    return json({ success: false, error: "نوم، د پلار نوم، تحصیل، ټیلیفون، سم ایمیل او ولایت په بشپړ ډول ولیکئ." }, 400, origin);
  }
  const photo = form.get("photo");
  const cv = form.get("cv");
  if (!(photo instanceof File) || !(cv instanceof File) || !photo.size || !cv.size) {
    return json({ success: false, error: "عکس او CV دواړه پورته کړئ." }, 400, origin);
  }

  const duplicateEmail = await env.DB.prepare(
    "SELECT id FROM applicants WHERE lower(email) = lower(?) AND active = 1 LIMIT 1"
  ).bind(email).first();
  if (duplicateEmail) {
    return json({ success: false, error: "تاسو په دې ایمیل مخکې ثبت‌نام کړی دی." }, 409, origin);
  }
  const duplicatePhone = await env.DB.prepare(
    "SELECT id FROM applicants WHERE phone = ? AND active = 1 LIMIT 1"
  ).bind(phone).first();
  if (duplicatePhone) {
    return json({ success: false, error: "تاسو په دې ټیلیفون شمېره مخکې ثبت‌نام کړی دی." }, 409, origin);
  }

  const id = crypto.randomUUID();
  const unsubscribeToken = crypto.randomUUID() + crypto.randomUUID();
  const createdAt = new Date().toISOString();
  let photoResult, cvResult;
  try {
    photoResult = await uploadToDrive(env, photo);
    cvResult = await uploadToDrive(env, cv);
    await env.DB.prepare(`
      INSERT INTO applicants (
        id, full_name, father_name, education, phone, email, province, consent,
        unsubscribe_token, photo_key, photo_name, photo_type,
        cv_key, cv_name, cv_type, created_at, active, selected_provinces
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).bind(
      id, fullName, fatherName, education, phone, email,
      legacyProvinceValue(selected), consent, unsubscribeToken,
      photoResult.fileId, photo.name, photo.type,
      cvResult.fileId, cv.name, cv.type, createdAt, JSON.stringify(selected)
    ).run();
  } catch (error) {
    const message = String(error);
    if (message.includes("UNIQUE constraint failed: applicants.email")) {
      return json({ success: false, error: "تاسو په دې ایمیل مخکې ثبت‌نام کړی دی." }, 409, origin);
    }
    if (message.includes("UNIQUE constraint failed: applicants.phone")) {
      return json({ success: false, error: "تاسو په دې ټیلیفون شمېره مخکې ثبت‌نام کړی دی." }, 409, origin);
    }
    console.error("Applicant registration failed", error);
    return json({ success: false, error: "ثبت‌نام بشپړ نه شو: " + message.slice(0, 220) }, 500, origin);
  }

  let adminNotice = "sent";
  try {
    await sendEmail(
      env, env.ADMIN_EMAIL || ADMIN_EMAIL,
      "نوی نوماند ثبت شو - " + fullName,
      [
        "نوی کار غوښتونکی ثبت شو.",
        "نوم: " + fullName,
        "د پلار نوم: " + fatherName,
        "تحصیل: " + education,
        "ټیلیفون: " + phone,
        "ایمیل: " + email,
        "ټاکل شوي ولایتونه: " + selected.map(p => PROVINCE_LABELS[p]).join("، "),
        "د ایمیل خبرتیا اجازه: " + (consent ? "هو" : "نه"),
        "د ثبت نېټه: " + createdAt,
        "عکس او CV د Google Drive فایل پېژندپاڼې: " + photoResult.fileId + " | " + cvResult.fileId
      ].join("\n")
    );
  } catch (error) {
    adminNotice = "failed";
    console.error("Admin registration email failed", error);
  }
  return json({
    success: true,
    message: consent
      ? "ثبت‌نام بریالی شو. د ټاکلو ولایتونو د نویو بستونو ایمیل خبرتیاوې مو فعاله دي."
      : "ثبت‌نام بریالی شو. د ایمیل خبرتیاوې مو نه دي فعالې کړې؛ ثبت‌نام مو بیا هم بشپړ شو.",
    adminNotice
  }, 200, origin);
}
async function unsubscribe(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  if (token.length < 30) return new Response("د خبرتیا د بندولو لینک ناسم دی.", { status: 400 });
  const result = await env.DB.prepare(
    "UPDATE applicants SET consent = 0 WHERE unsubscribe_token = ? AND active = 1"
  ).bind(token).run();
  const changed = result.meta && result.meta.changes > 0;
  return new Response(
    changed ? "ستاسو د دندو ایمیل خبرتیاوې بندې شوې." : "دا لینک ناسم دی یا خبرتیا مخکې بنده شوې ده.",
    { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } }
  );
}
function jobProvinces(job) {
  const raw = Array.isArray(job.location) ? job.location.join(" ") : String(job.location || "");
  const value = [job.dutyStation || "", raw].join(" ").toLowerCase();
  const found = [];
  if (value.includes("kunar") || value.includes("کونړ") || value.includes("کنړ")) found.push("kunar");
  if (value.includes("nuristan") || value.includes("نورستان")) found.push("nuristan");
  if (value.includes("laghman") || value.includes("لغمان")) found.push("laghman");
  if (value.includes("nangarhar") || value.includes("ننګرهار") || value.includes("ننگرهار")) found.push("nangarhar");
  return [...new Set(found)];
}
function applicantProvinces(person) {
  try {
    const parsed = JSON.parse(person.selected_provinces || "[]");
    if (Array.isArray(parsed)) {
      const valid = parsed.filter(p => PROVINCES.includes(p));
      if (valid.length) return [...new Set(valid)];
    }
  } catch (_) {}
  if (person.province === "both") return ["kunar", "nuristan"];
  return PROVINCES.includes(person.province) ? [person.province] : [];
}
function kabulToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kabul", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(new Date());
  const get = type => parts.find(p => p.type === type)?.value || "";
  return get("year") + "-" + get("month") + "-" + get("day");
}
function hasValidApplicationMethod(job) {
  const email = clean(job.applyEmail || job.email || job.applicationEmail || job.contactEmail, 180);
  const url = clean(job.applyUrl || job.applicationUrl || job.onlineApplicationUrl, 1000);
  const source = clean(job.sourceUrl, 1000).replace(/\/+$/, "");
  const validOnline = /^https:\/\//i.test(url) && url.replace(/\/+$/, "") !== source;
  return validEmail(email) || validOnline;
}
async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}
async function processJobAlerts(env) {
  if (!env.DB) throw new Error("D1 database binding DB is missing");
  const feedResponse = await fetch(JOBS_URL, { headers: { "Accept": "application/json" }, cf: { cacheTtl: 0 } });
  if (!feedResponse.ok) throw new Error("Could not load jobs-feed.json: " + feedResponse.status);
  const feed = await feedResponse.json();
  const jobs = Array.isArray(feed.jobs) ? feed.jobs : [];
  const peopleResult = await env.DB.prepare(
    "SELECT id, full_name, email, province, selected_provinces, unsubscribe_token FROM applicants WHERE active = 1 AND consent = 1"
  ).all();
  const people = peopleResult.results || [];
  const today = kabulToday();
  let sent = 0, skipped = 0, failed = 0;

  for (const job of jobs) {
    const expiry = String(job.expiryDate || "");
    if (job.verified !== true || !job.id || !job.title ||
        !/^\d{4}-\d{2}-\d{2}$/.test(expiry) || expiry < today ||
        !hasValidApplicationMethod(job)) continue;
    const jobPlaces = jobProvinces(job);
    if (!jobPlaces.length) continue;

    for (const person of people) {
      const selected = applicantProvinces(person);
      const matches = jobPlaces.filter(p => selected.includes(p));
      if (!matches.length) continue;

      // د هر غوښتونکي او هر ځانګړي بست لپاره یوازې یو ځل؛ د بست د معلوماتو بدلون بیا ایمیل نه استوي.
      const prior = await env.DB.prepare(
        "SELECT job_id FROM sent_notifications WHERE applicant_id = ? AND job_id = ?"
      ).bind(person.id, String(job.id)).first();
      if (prior) { skipped++; continue; }

      const body = [
        "سلام " + person.full_name + "!",
        "",
        "ستاسو د ټاکل شوو ولایتونو له ډلې په دې ولایت کې نوی بست اعلان شوی دی: " +
          matches.map(p => PROVINCE_LABELS[p]).join("، "),
        "",
        "د بست نوم: " + job.title,
        "اداره: " + (job.organization || "نه ده معلومه"),
        "ولایت: " + matches.map(p => PROVINCE_LABELS[p]).join("، "),
        "د بست شمېره: " + (job.vacancyNumber || job.vacancyNo || job.vacancyRef || "—"),
        "د اعلان نېټه: " + (job.postedDate || "—"),
        "وروستۍ نېټه: " + expiry,
        "شرایط: " + (job.requirements || "د اصلي اعلان لینک وګورئ"),
        "د اصلي اعلان لینک: " + (job.sourceUrl || "—"),
        "د سیدولي خان د دندو پاڼه: https://saidwali12.github.io/said-wali-khan/jobs.html#job-" + encodeURIComponent(String(job.id)),
        "",
        "د ایمیل خبرتیا د بندولو لپاره دا لینک خلاص کړئ:",
        API_BASE + "/unsubscribe?token=" + encodeURIComponent(person.unsubscribe_token)
      ].join("\n");
      const subject = "ستاسو د ولایت نوی بست: " + job.title;
      try {
        await sendEmail(env, person.email, subject, body);
        const hash = await sha256(JSON.stringify({
          id: String(job.id), title: job.title, organization: job.organization || "",
          provinces: matches, expiryDate: expiry, sourceUrl: job.sourceUrl || ""
        }));
        await env.DB.prepare(
          "INSERT INTO sent_notifications (applicant_id, job_id, content_hash, sent_at) VALUES (?, ?, ?, ?) ON CONFLICT(applicant_id, job_id) DO NOTHING"
        ).bind(person.id, String(job.id), hash, new Date().toISOString()).run();
        sent++;
      } catch (error) {
        failed++;
        console.error("Job alert email failed for applicant", person.id, "job", job.id, error);
      }
    }
  }
  console.log("Job alert run:", JSON.stringify({ jobs: jobs.length, applicants: people.length, sent, skipped, failed }));
  return { jobs: jobs.length, applicants: people.length, sent, skipped, failed };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
    if (url.pathname === "/health" && request.method === "GET") {
      return json({
        success: true,
        service: "Saidwali Jobs API",
        version: "2.0.0-four-provinces",
        database: Boolean(env.DB),
        googleStorageConfigured: Boolean(env.GOOGLE_APPS_SCRIPT_URL && env.GOOGLE_APPS_SCRIPT_TOKEN),
        emailConfigured: Boolean(env.GOOGLE_APPS_SCRIPT_URL && env.GOOGLE_APPS_SCRIPT_TOKEN)
      }, 200, origin);
    }
    try {
      if (url.pathname === "/register" && request.method === "POST") {
        if (origin && origin !== ALLOWED_ORIGIN) return json({ success: false, error: "Origin not allowed" }, 403, origin);
        return await registerApplicant(request, env, origin);
      }
      if (url.pathname === "/unsubscribe" && request.method === "GET") return await unsubscribe(request, env);
      return json({ success: false, error: "Not found" }, 404, origin);
    } catch (error) {
      console.error(error);
      return json({ success: false, error: "سیستم کې تخنیکي ستونزه رامنځته شوه." }, 500, origin);
    }
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(processJobAlerts(env).catch(error => console.error("Scheduled job alerts failed", error)));
  }
};
