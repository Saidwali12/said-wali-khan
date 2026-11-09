const CORS = {
  "Access-Control-Allow-Origin": "https://saidwali12.github.io",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400"
};
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" }
});
const text = (s, status = 200) => new Response(s, { status, headers: CORS });
const enc = new TextEncoder();
const b64 = (bytes) => {
  let binary = "";
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i += 0x8000) binary += String.fromCharCode(...arr.subarray(i, i + 0x8000));
  return btoa(binary);
};
const b64url = (bytes) => b64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
const sha = async (value) => b64url(await crypto.subtle.digest("SHA-256", enc.encode(value)));
const clean = (v, n = 180) => String(v || "").trim().slice(0, n);
const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const allowedOrigins = ["https://saidwali12.github.io"];
function headersFor(request) {
  const origin = request.headers.get("Origin") || "";
  return { ...CORS, "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : allowedOrigins[0] };
}
async function gmailToken(env) {
  const body = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    refresh_token: env.GOOGLE_REFRESH_TOKEN,
    grant_type: "refresh_token"
  });
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", body });
  const d = await r.json();
  if (!r.ok || !d.access_token) throw new Error("Gmail OAuth token failed: " + (d.error_description || d.error || r.status));
  return d.access_token;
}
function mimeHeader(value) {
  return "=?UTF-8?B?" + btoa(unescape(encodeURIComponent(value))) + "?=";
}
async function sendGmail(env, to, subject, body, attachments = []) {
  const boundary = "swjobs_" + crypto.randomUUID().replace(/-/g, "");
  const from = env.GMAIL_FROM || "walizaad2@gmail.com";
  const lines = [
    "From: Saidwali Job Portal <" + from + ">",
    "To: " + to,
    "Subject: " + mimeHeader(subject),
    "MIME-Version: 1.0",
    "Content-Type: multipart/mixed; boundary=\"" + boundary + "\"",
    "",
    "--" + boundary,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    b64(enc.encode(body))
  ];
  for (const file of attachments) {
    lines.push(
      "--" + boundary,
      "Content-Type: " + (file.contentType || "application/octet-stream") + '; name="' + file.name.replace(/["\r\n]/g, "") + '"',
      "Content-Disposition: attachment; filename=\"" + file.name.replace(/["\r\n]/g, "") + "\"",
      "Content-Transfer-Encoding: base64",
      "",
      b64(file.bytes)
    );
  }
  lines.push("--" + boundary + "--", "");
  const raw = b64url(enc.encode(lines.join("\r\n")));
  const token = await gmailToken(env);
  const r = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify({ raw })
  });
  if (!r.ok) throw new Error("Gmail send failed: " + r.status + " " + (await r.text()).slice(0, 300));
  return true;
}
function isAdmin(request, env) {
  const supplied = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  return !!env.ADMIN_TOKEN && supplied.length > 20 && supplied === env.ADMIN_TOKEN;
}
async function saveUpload(bucket, file, prefix, maxBytes, allowed) {
  if (!file || !file.size) return null;
  if (file.size > maxBytes) throw new Error(file.name + " فایل له ټاکلي حد څخه لوی دی.");
  const type = file.type || "application/octet-stream";
  if (!allowed.includes(type)) throw new Error(file.name + " د فایل ډول د منلو وړ نه دی.");
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
  const key = prefix + "/" + crypto.randomUUID() + "." + ext;
  await bucket.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: type } });
  return { key, name: clean(file.name, 120), contentType: type, size: file.size };
}
async function notifyAdmin(env, applicant, uploads) {
  const files = [];
  for (const u of uploads.filter(Boolean)) {
    const obj = await env.FILES.get(u.key);
    if (obj) files.push({ name: u.name, contentType: u.contentType, bytes: new Uint8Array(await obj.arrayBuffer()) });
  }
  const body = [
    "نوی کار غوښتونکی ثبت شو.",
    "",
    "نوم: " + applicant.full_name,
    "د پلار نوم: " + applicant.father_name,
    "تحصیل: " + applicant.education,
    "ټیلیفون: " + applicant.phone,
    "ایمیل: " + applicant.email,
    "ولایت: " + applicant.province,
    "د ایمیل خبرتیا اجازه: هو",
    "د ثبت نېټه: " + applicant.created_at,
    "",
    "عکس او CV که پورته شوي وي، له دې ایمیل سره ضمیمه دي."
  ].join("\n");
  await sendGmail(env, env.ADMIN_EMAIL || "walizaad2@gmail.com", "نوی نوماند ثبت شو - " + applicant.full_name, body, files);
}
async function register(request, env) {
  if (!env.DB || !env.FILES) return json({ ok: false, error: "د ډیټابېس یا فایلونو ذخیره لا نه ده تړل شوې." }, 503);
  const form = await request.formData();
  const full_name = clean(form.get("full_name"), 100);
  const father_name = clean(form.get("father_name"), 100);
  const education = clean(form.get("education"), 80);
  const phone = clean(form.get("phone"), 40);
  const email = clean(form.get("email"), 160).toLowerCase();
  const province = clean(form.get("province"), 20);
  const consent = form.get("consent") === "yes";
  if (!full_name || !father_name || !education || !phone || !validEmail(email) || !["kunar", "nuristan", "both"].includes(province) || !consent) {
    return json({ ok: false, error: "ټول اړین معلومات ډک کړئ او د ایمیل خبرتیا اجازه تایید کړئ." }, 400);
  }
  const existing = await env.DB.prepare("SELECT id FROM applicants WHERE email = ? AND active = 1").bind(email).first();
  if (existing) return json({ ok: false, error: "دا ایمیل مخکې ثبت شوی دی. که معلومات بدلول غواړئ، له مدیر سره اړیکه ونیسئ." }, 409);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  let photo = null, cv = null;
  try {
    photo = await saveUpload(env.FILES, form.get("photo"), "applicants/" + id, 5 * 1024 * 1024, ["image/jpeg", "image/png", "image/webp"]);
    cv = await saveUpload(env.FILES, form.get("cv"), "applicants/" + id, 10 * 1024 * 1024, ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);
    await env.DB.prepare(`INSERT INTO applicants
      (id, full_name, father_name, education, phone, email, province, consent, photo_key, photo_name, photo_type, cv_key, cv_name, cv_type, created_at, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, 1)`)
      .bind(id, full_name, father_name, education, phone, email, province,
        photo?.key || null, photo?.name || null, photo?.contentType || null,
        cv?.key || null, cv?.name || null, cv?.contentType || null, now).run();
  } catch (e) {
    if (photo?.key) await env.FILES.delete(photo.key);
    if (cv?.key) await env.FILES.delete(cv.key);
    throw e;
  }
  const applicant = { id, full_name, father_name, education, phone, email, province, created_at: now };
  let emailSent = true;
  try { await notifyAdmin(env, applicant, [photo, cv]); }
  catch (e) { emailSent = false; console.error("Admin notification error", e); }
  return json({ ok: true, message: emailSent
    ? "ثبت‌نام بریالی شو. ستا معلومات خوندي شول."
    : "ثبت‌نام خوندي شو، خو مدیر ته د ایمیل خبرتیا ونه لېږل شوه؛ تخنیکي تنظیم ته اړتیا ده." }, 201);
}
async function adminApplicants(request, env) {
  if (!isAdmin(request, env)) return json({ ok: false, error: "اجازه نشته." }, 401);
  const { results } = await env.DB.prepare("SELECT id, full_name, father_name, education, phone, email, province, photo_name, cv_name, created_at FROM applicants WHERE active = 1 ORDER BY created_at DESC LIMIT 500").all();
  return json({ ok: true, applicants: results || [] });
}
async function adminFile(request, env, url) {
  if (!isAdmin(request, env)) return json({ ok: false, error: "اجازه نشته." }, 401);
  const key = url.searchParams.get("key") || "";
  if (!key.startsWith("applicants/")) return json({ ok: false, error: "ناسم فایل." }, 400);
  const obj = await env.FILES.get(key);
  if (!obj) return json({ ok: false, error: "فایل ونه موندل شو." }, 404);
  const h = new Headers(CORS);
  obj.writeHttpMetadata(h);
  h.set("Cache-Control", "private, no-store");
  h.set("Content-Disposition", 'attachment; filename="' + (key.split("/").pop() || "file") + '"');
  return new Response(obj.body, { headers: h });
}
async function sendJobAlerts(env) {
  const r = await fetch("https://raw.githubusercontent.com/Saidwali12/said-wali-khan/main/jobs-feed.json", { cf: { cacheTtl: 0 } });
  if (!r.ok) throw new Error("jobs-feed.json could not be loaded");
  const feed = await r.json();
  const jobs = Array.isArray(feed.jobs) ? feed.jobs : [];
  const { results: people } = await env.DB.prepare("SELECT * FROM applicants WHERE active = 1 AND consent = 1").all();
  const now = new Date();
  let sent = 0;
  for (const job of jobs) {
    if (job.verified !== true || job.applicationMode !== "email" || !job.id || !job.title || !job.expiryDate) continue;
    const expiry = new Date(job.expiryDate + "T23:59:59Z");
    if (expiry < now) continue;
    const places = Array.isArray(job.location) ? job.location : [];
    const target = places.some(x => x === "کنړ" || x === "کونړ") ? "kunar" : places.includes("نورستان") ? "nuristan" : null;
    if (!target) continue;
    const hash = await sha(JSON.stringify({
      title: job.title, organization: job.organization, location: job.location,
      postedDate: job.postedDate, expiryDate: job.expiryDate,
      requirements: job.requirements, sourceUrl: job.sourceUrl, email: job.email
    }));
    for (const person of people || []) {
      if (person.province !== "both" && person.province !== target) continue;
      const prior = await env.DB.prepare("SELECT content_hash FROM sent_notifications WHERE applicant_id = ? AND job_id = ?").bind(person.id, job.id).first();
      if (prior?.content_hash === hash) continue;
      const body = [
        "سلام " + person.full_name + "!",
        "",
        "د ستاسو د ټاکلي ولایت لپاره نوی یا تازه شوی بست اعلان شوی دی.",
        "د بست عنوان: " + job.title,
        "اداره: " + (job.organization || "—"),
        "ولایت: " + (places.join("، ") || "—"),
        "د اعلان نېټه: " + (job.postedDate || "—"),
        "د پای نېټه: " + job.expiryDate,
        "شرایط: " + (job.requirements || "په اصلي اعلان کې وګورئ"),
        "اصلي اعلان: " + (job.sourceUrl || "https://saidwali12.github.io/said-wali-khan/jobs.html"),
        "",
        "که علاقه لرئ، د بست شرایط وګورئ او د اعلان له مخې خپل اسناد واستوئ.",
        "",
        "د دندو پاڼه: https://saidwali12.github.io/said-wali-khan/jobs.html",
        "",
        "تاسو دا خبرتیا د خپل ثبت‌نام او ورکړل شوې اجازې له مخې ترلاسه کوئ. د خبرتیاوو د بندولو لپاره له پاڼې د مدیر سره اړیکه ونیسئ."
      ].join("\n");
      try {
        await sendGmail(env, person.email, "د نوې دندې خبرتیا: " + job.title + " - " + target, body);
        await env.DB.prepare("INSERT INTO sent_notifications (applicant_id, job_id, content_hash, sent_at) VALUES (?, ?, ?, ?) ON CONFLICT(applicant_id, job_id) DO UPDATE SET content_hash = excluded.content_hash, sent_at = excluded.sent_at")
          .bind(person.id, job.id, hash, new Date().toISOString()).run();
        sent++;
      } catch (e) { console.error("Applicant email failed", person.email, e); }
    }
  }
  return sent;
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: headersFor(request) });
    if (url.pathname === "/health") return json({ ok: true, service: "Saidwali Jobs API", version: "1.0.0", database: !!env.DB, fileStorage: !!env.FILES, gmailConfigured: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN) });
    try {
      if (url.pathname === "/api/register" && request.method === "POST") return await register(request, env);
      if (url.pathname === "/api/admin/applicants" && request.method === "GET") return await adminApplicants(request, env);
      if (url.pathname === "/api/admin/file" && request.method === "GET") return await adminFile(request, env, url);
      return json({ ok: false, error: "دا لاره ونه موندل شوه." }, 404);
    } catch (e) {
      console.error(e);
      return json({ ok: false, error: "سیستم کې تخنیکي ستونزه رامنځته شوه. لږ وروسته بیا هڅه وکړئ." }, 500);
    }
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(sendJobAlerts(env).catch(e => console.error("Scheduled job alert error", e)));
  }
};