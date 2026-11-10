const ALLOWED_ORIGIN = "https://saidwali12.github.io";
const ADMIN_EMAIL = "walizaad2@gmail.com";
const JOBS_URL = "https://saidwali12.github.io/said-wali-khan/jobs-feed.json";

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
    headers: {
      ...cors(origin),
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function base64(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function sendEmail(env, to, subject, body) {
  const response = await fetch(env.GOOGLE_APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: env.GOOGLE_APPS_SCRIPT_TOKEN,
      action: "sendEmail",
      to,
      subject,
      body
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
    throw new Error("Required file is missing");
  }

  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Each file must be 8 MB or smaller");
  }

  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  if (!allowed.includes(file.type)) {
    throw new Error("Unsupported file type: " + file.name);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  const response = await fetch(env.GOOGLE_APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: env.GOOGLE_APPS_SCRIPT_TOKEN,
      action: "upload",
      fileName: file.name,
      mimeType: file.type,
      base64: base64(bytes)
    })
  });

  const result = await response.json();

  if (!response.ok || !result.success || !result.fileId) {
    throw new Error(result.error || "File upload failed");
  }

  return result;
}

async function registerApplicant(request, env, origin) {
  const form = await request.formData();

  const fullName = String(form.get("full_name") || "").trim();
  const fatherName = String(form.get("father_name") || "").trim();
  const education = String(form.get("education") || "").trim();
  const phone = String(form.get("phone") || "").trim();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const province = String(form.get("province") || "").trim().toLowerCase();
  const consent = String(form.get("email_consent") || "").trim().toLowerCase();

  if (!fullName || !fatherName || !education || !phone || !email) {
    return json({ success: false, error: "ټول اړین معلومات ډک کړئ." }, 400, origin);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ success: false, error: "د ایمیل پته سمه نه ده." }, 400, origin);
  }

  if (!["kunar", "nuristan", "laghman", "nangarhar", "all", "both"].includes(province)) {
    return json({ success: false, error: "ولایت په سمه توګه انتخاب کړئ." }, 400, origin);
  }

  if (!["yes", "1", "true", "on"].includes(consent)) {
    return json({
      success: false,
      error: "د بستونو د ایمیل خبرتیا رضایت اړین دی."
    }, 400, origin);
  }

  const photo = form.get("photo");
  const cv = form.get("cv");

  if (!(photo instanceof File) || !(cv instanceof File)) {
    return json({ success: false, error: "عکس او CV دواړه پورته کړئ." }, 400, origin);
  }

  const id = crypto.randomUUID();
  const unsubscribeToken = crypto.randomUUID() + crypto.randomUUID();
  const consentAt = new Date().toISOString();

  try {
    const photoResult = await uploadToDrive(env, photo);
    const cvResult = await uploadToDrive(env, cv);

    await env.DB.prepare(`
      INSERT INTO applicants (
        id, full_name, father_name, education, phone, email,
        province, photo_key, cv_key, email_consent, consent_at,
        unsubscribe_token, photo_name, photo_type, cv_name, cv_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      fullName,
      fatherName,
      education,
      phone,
      email,
      province,
      photoResult.fileId,
      cvResult.fileId,
      consentAt,
      unsubscribeToken,
      photo.name,
      photo.type,
      cv.name,
      cv.type
    ).run();

    const unsubscribeUrl =
      "https://saidwali-jobs-api.walizaad2.workers.dev/unsubscribe?token=" +
      encodeURIComponent(unsubscribeToken);

    try {
      await sendEmail(
        env,
        ADMIN_EMAIL,
        "New Saidwali Jobs Applicant",
        "A new candidate registered.\n\n" +
        "Name: " + fullName + "\n" +
        "Father: " + fatherName + "\n" +
        "Education: " + education + "\n" +
        "Phone: " + phone + "\n" +
        "Email: " + email + "\n" +
        "Province: " + province + "\n" +
        "Photo file ID: " + photoResult.fileId + "\n" +
        "CV file ID: " + cvResult.fileId
      );

      await env.DB.prepare(`
        INSERT INTO email_logs (recipient, email_type, subject, status)
        VALUES (?, 'admin_registration', ?, 'sent')
      `).bind(ADMIN_EMAIL, "New Saidwali Jobs Applicant").run();

    } catch (mailError) {
      await env.DB.prepare(`
        INSERT INTO email_logs
        (recipient, email_type, subject, status, error_message)
        VALUES (?, 'admin_registration', ?, 'failed', ?)
      `).bind(
        ADMIN_EMAIL,
        "New Saidwali Jobs Applicant",
        String(mailError)
      ).run();
    }

    return json({
      success: true,
      message: "ستاسو نوم‌لیکنه په بریالیتوب ثبت شوه."
    }, 200, origin);

  } catch (error) {
    const message = String(error);

    if (message.includes("UNIQUE constraint failed: applicants.email")) {
      return json({
        success: false,
        error: "دا ایمیل مخکې ثبت شوی دی."
      }, 409, origin);
    }

    return json({
      success: false,
      error: "نوم‌لیکنه بشپړه نه شوه: " + message
    }, 500, origin);
  }
}

async function unsubscribe(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response("د لغوه کولو لینک سم نه دی.", { status: 400 });
  }

  const result = await env.DB.prepare(`
    UPDATE applicants
    SET email_consent = 0, updated_at = CURRENT_TIMESTAMP
    WHERE unsubscribe_token = ?
  `).bind(token).run();

  const changed = result.meta && result.meta.changes > 0;

  return new Response(
    changed
      ? "ستاسو د بستونو ایمیل خبرتیا بنده شوه."
      : "دا لینک ناسم دی یا خبرتیا مخکې لغوه شوې ده.",
    { headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
}

function jobProvinces(job) {
  const rawLocation = Array.isArray(job.location)
    ? job.location.join(" ")
    : String(job.location || "");
  const text = [job.dutyStation || "", rawLocation].join(" ").toLowerCase();
  const found = [];
  if (text.includes("kunar") || text.includes("کونړ") || text.includes("کنړ")) found.push("kunar");
  if (text.includes("nuristan") || text.includes("نورستان")) found.push("nuristan");
  if (text.includes("laghman") || text.includes("لغمان")) found.push("laghman");
  if (text.includes("nangarhar") || text.includes("ننګرهار") || text.includes("ننگرهار")) found.push("nangarhar");
  return [...new Set(found)];
}

const PROVINCE_LABELS = {
  kunar: "کونړ",
  nuristan: "نورستان",
  laghman: "لغمان",
  nangarhar: "ننګرهار"
};

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function processJobAlerts(env) {
  const feedResponse = await fetch(JOBS_URL, {
    headers: { "Accept": "application/json" }
  });

  if (!feedResponse.ok) {
    throw new Error("Could not load jobs-feed.json");
  }

  const feed = await feedResponse.json();
  const jobs = Array.isArray(feed.jobs) ? feed.jobs : [];

  const candidates = await env.DB.prepare(`
    SELECT id, full_name, email, province, unsubscribe_token
    FROM applicants
    WHERE active = 1 AND email_consent = 1
  `).all();

  for (const job of jobs) {
    if (job.verified !== true || job.applicationMode !== "email") continue;

    const provinces = jobProvinces(job);
    if (!provinces.length || !job.id || !job.title) continue;

    for (const candidate of candidates.results || []) {
      const selectedProvinces = candidate.province === "all"
        ? ["kunar", "nuristan", "laghman", "nangarhar"]
        : candidate.province === "both"
          ? ["kunar", "nuristan"]
          : [candidate.province];
      const matchedProvinces = provinces.filter(p => selectedProvinces.includes(p));
      if (!matchedProvinces.length) continue;

      const content = JSON.stringify({
        title: job.title,
        organization: job.organization || "",
        provinces: matchedProvinces,
        postedDate: job.postedDate || "",
        expiryDate: job.expiryDate || "",
        requirements: job.requirements || "",
        sourceUrl: job.sourceUrl || ""
      });

      const hash = await sha256(content);

      const previous = await env.DB.prepare(`
        SELECT content_hash
        FROM job_notifications
        WHERE applicant_id = ? AND job_id = ?
      `).bind(candidate.id, String(job.id)).first();

      if (previous && previous.content_hash === hash) continue;

      const unsubscribeUrl =
        "https://saidwali-jobs-api.walizaad2.workers.dev/unsubscribe?token=" +
        encodeURIComponent(candidate.unsubscribe_token || "");

      const subject = "نوی بست: " + job.title;

      const body =
        "سلام " + candidate.full_name + "!\n\n" +
        "ستاسو د انتخاب شوي ولایت لپاره نوی بست خپور شوی دی.\n\n" +
        "د بست نوم: " + job.title + "\n" +
        "اداره: " + (job.organization || "نه ده معلومه") + "\n" +
        "ولایت: " + matchedProvinces.map(p => PROVINCE_LABELS[p] || p).join("، ") + "\n" +
        "د اعلان نېټه: " + (job.postedDate || "نه ده معلومه") + "\n" +
        "وروستۍ نېټه: " + (job.expiryDate || "نه ده معلومه") + "\n" +
        "شرایط: " + (job.requirements || "د اصلي اعلان لینک وګورئ") + "\n" +
        "د اعلان لینک: " + (job.sourceUrl || "نه دی ورکړل شوی") + "\n" +
        "د سیدولي خان د دندو پاڼه: https://saidwali12.github.io/said-wali-khan/jobs.html#job-" + encodeURIComponent(String(job.id)) + "\n\n" +
        "د ایمیل خبرتیا د بندولو لپاره دا لینک خلاص کړئ:\n" +
        unsubscribeUrl;

      try {
        await sendEmail(env, candidate.email, subject, body);

        await env.DB.prepare(`
          INSERT INTO job_notifications
            (applicant_id, job_id, job_title, province, content_hash, status, sent_at)
          VALUES (?, ?, ?, ?, ?, 'sent', CURRENT_TIMESTAMP)
          ON CONFLICT(applicant_id, job_id) DO UPDATE SET
            job_title = excluded.job_title,
            province = excluded.province,
            content_hash = excluded.content_hash,
            status = 'sent',
            sent_at = CURRENT_TIMESTAMP
        `).bind(
          candidate.id,
          String(job.id),
          job.title,
          province,
          hash
        ).run();

        await env.DB.prepare(`
          INSERT INTO email_logs (recipient, email_type, subject, status)
          VALUES (?, 'job_alert', ?, 'sent')
        `).bind(candidate.email, subject).run();

      } catch (error) {
        await env.DB.prepare(`
          INSERT INTO email_logs
            (recipient, email_type, subject, status, error_message)
          VALUES (?, 'job_alert', ?, 'failed', ?)
        `).bind(candidate.email, subject, String(error)).run();
      }
    }
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(origin) });
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return json({
        success: true,
        service: "Saidwali Jobs API",
        database: Boolean(env.DB),
        googleStorageConfigured: Boolean(
          env.GOOGLE_APPS_SCRIPT_URL && env.GOOGLE_APPS_SCRIPT_TOKEN
        )
      }, 200, origin);
    }

    if (url.pathname === "/register" && request.method === "POST") {
      if (origin && origin !== ALLOWED_ORIGIN) {
        return json({ success: false, error: "Origin not allowed" }, 403, origin);
      }

      return registerApplicant(request, env, origin);
    }

    if (url.pathname === "/unsubscribe" && request.method === "GET") {
      return unsubscribe(request, env);
    }

    return json({ success: false, error: "Not found" }, 404, origin);
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(processJobAlerts(env));
  }
};