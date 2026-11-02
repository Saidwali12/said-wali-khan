/* Shared language selector for Saidwali Group website.
   Safe text-only translation: user posts, comments and form input are not translated. */
(function () {
  "use strict";
  const dict = {
    "سیدولی خان کوهستانی ګروپ ویب سایټ": {
      fa:"وب‌سایت گروه سیدولی خان کوهستانی", en:"Said Wali Khan Kohistani Group Website",
      ur:"سید ولی خان کوہستانی گروپ ویب سائٹ", ar:"موقع مجموعة سيد ولي خان كوهيستاني"
    },
    "سیدولی خان کوهستانی ګروپ | رسمي ویب پاڼه": {
      fa:"گروه سیدولی خان کوهستانی | وب‌سایت رسمی", en:"Said Wali Khan Kohistani Group | Official Website",
      ur:"سید ولی خان کوہستانی گروپ | سرکاری ویب سائٹ", ar:"مجموعة سيد ولي خان كوهيستاني | الموقع الرسمي"
    },
    "ښه راغلاست": {fa:"خوش آمدید",en:"Welcome",ur:"خوش آمدید",ar:"أهلاً وسهلاً"},
    "نور معلومات": {fa:"معلومات بیشتر",en:"More Information",ur:"مزید معلومات",ar:"معلومات إضافية"},
    "چټک خدمات": {fa:"خدمات سریع",en:"Quick Services",ur:"فوری خدمات",ar:"خدمات سريعة"},
    "📰 معلومات او خبرونه ▼": {fa:"📰 معلومات و اخبار ▼",en:"📰 Information & News ▼",ur:"📰 معلومات اور خبریں ▼",ar:"📰 المعلومات والأخبار ▼"},
    "💼 خدمات او فرصتونه ▼": {fa:"💼 خدمات و فرصت‌ها ▼",en:"💼 Services & Opportunities ▼",ur:"💼 خدمات اور مواقع ▼",ar:"💼 الخدمات والفرص ▼"},
    "🌐 ټولنیزې پاڼې ▼": {fa:"🌐 صفحات اجتماعی ▼",en:"🌐 Social Pages ▼",ur:"🌐 سوشل صفحات ▼",ar:"🌐 الصفحات الاجتماعية ▼"},
    "📞 اړیکې او تماس ▼": {fa:"📞 ارتباط و تماس ▼",en:"📞 Contact ▼",ur:"📞 رابطہ ▼",ar:"📞 الاتصال ▼"},
    "کورپاڼه": {fa:"صفحه اصلی",en:"Home",ur:"صفحۂ اول",ar:"الرئيسية"},
    "نشریات، اعلانات": {fa:"نشرات و اعلانات",en:"Publications & Ads",ur:"اشاعتیں اور اشتہارات",ar:"المنشورات والإعلانات"},
    "معلومات مجازی": {fa:"معلومات عمومی",en:"General Information",ur:"عمومی معلومات",ar:"معلومات عامة"},
    "داخلي ولسوالیو خبرونه": {fa:"اخبار ولسوالی‌های داخلی",en:"District News",ur:"ضلعی خبریں",ar:"أخبار المديريات"},
    "تازه خبرونه اپډېټ": {fa:"به‌روزرسانی تازه‌ترین اخبار",en:"Latest News Updates",ur:"تازہ خبروں کی تازہ کاری",ar:"تحديثات الأخبار"},
    "وظیفې": {fa:"وظایف",en:"Jobs",ur:"ملازمتیں",ar:"الوظائف"},
    "AI مرکز": {fa:"مرکز هوش مصنوعی",en:"AI Center",ur:"اے آئی مرکز",ar:"مركز الذكاء الاصطناعي"},
    "لینکونه": {fa:"پیوندها",en:"Links",ur:"روابط",ar:"الروابط"},
    "📚 کتابونه او سافټویرونه": {fa:"📚 کتاب‌ها و نرم‌افزارها",en:"📚 Books & Software",ur:"📚 کتابیں اور سافٹ ویئر",ar:"📚 الكتب والبرامج"},
    "کرکټ": {fa:"کریکت",en:"Cricket",ur:"کرکٹ",ar:"الكريكيت"},
    "نوی فېسبوک": {fa:"فیسبوک جدید",en:"New Facebook",ur:"نیا فیس بک",ar:"فيسبوك الجديد"},
    "زموږ سره اړیکه": {fa:"تماس با ما",en:"Contact Us",ur:"ہم سے رابطہ کریں",ar:"اتصل بنا"},
    "د اړیکو معلومات": {fa:"معلومات تماس",en:"Contact Information",ur:"رابطے کی معلومات",ar:"معلومات الاتصال"},
    "📢 وظیفې": {fa:"📢 فرصت‌های شغلی",en:"📢 Jobs",ur:"📢 ملازمتیں",ar:"📢 الوظائف"},
    "د دولتي، خصوصي او نړیوالو ادارو وروستي اعلانونه.": {fa:"آخرین اعلان‌های نهادهای دولتی، خصوصی و بین‌المللی.",en:"Latest vacancies from government, private and international organizations.",ur:"سرکاری، نجی اور بین الاقوامی اداروں کی تازہ آسامیاں۔",ar:"أحدث إعلانات الوظائف من المؤسسات الحكومية والخاصة والدولية."},
    "🤖 AI مرکز": {fa:"🤖 مرکز هوش مصنوعی",en:"🤖 AI Center",ur:"🤖 اے آئی مرکز",ar:"🤖 مركز الذكاء الاصطناعي"},
    "ChatGPT, Gemini, Claude او نور AI وسایل.": {fa:"ChatGPT، Gemini، Claude و سایر ابزارهای هوش مصنوعی.",en:"ChatGPT, Gemini, Claude and other AI tools.",ur:"ChatGPT، Gemini، Claude اور دیگر اے آئی ٹولز۔",ar:"ChatGPT وGemini وClaude وأدوات ذكاء اصطناعي أخرى."},
    "🌐 مهم لینکونه": {fa:"🌐 پیوندهای مهم",en:"🌐 Important Links",ur:"🌐 اہم روابط",ar:"🌐 روابط مهمة"},
    "Facebook, WhatsApp, Google, YouTube او نور.": {fa:"Facebook، WhatsApp، Google، YouTube و غیره.",en:"Facebook, WhatsApp, Google, YouTube and more.",ur:"Facebook، WhatsApp، Google، YouTube اور دیگر۔",ar:"Facebook وWhatsApp وGoogle وYouTube والمزيد."},
    "وروستي اعلانونه": {fa:"آخرین اعلان‌ها",en:"Latest Announcements",ur:"تازہ ترین اعلانات",ar:"أحدث الإعلانات"},
    "ځای: کابل": {fa:"مکان: کابل",en:"Location: Kabul",ur:"مقام: کابل",ar:"الموقع: كابل"},
    "معاش: 25000 افغانۍ": {fa:"معاش: ۲۵۰۰۰ افغانی",en:"Salary: AFN 25,000",ur:"تنخواہ: 25,000 افغانی",ar:"الراتب: ٢٥٬٠٠٠ أفغاني"},
    "ځای: مزار شریف": {fa:"مکان: مزار شریف",en:"Location: Mazar-i-Sharif",ur:"مقام: مزار شریف",ar:"الموقع: مزار شريف"},
    "معاش: 40000 افغانۍ": {fa:"معاش: ۴۰۰۰۰ افغانی",en:"Salary: AFN 40,000",ur:"تنخواہ: 40,000 افغانی",ar:"الراتب: ٤٠٬٠٠٠ أفغاني"},
    "📰 BBC World News": {fa:"📰 اخبار جهانی BBC",en:"📰 BBC World News",ur:"📰 بی بی سی عالمی خبریں",ar:"📰 أخبار بي بي سي العالمية"},
    "خبرونه لوډیږي...": {fa:"اخبار در حال بارگذاری است...",en:"Loading news...",ur:"خبریں لوڈ ہو رہی ہیں...",ar:"جارٍ تحميل الأخبار..."},
    "📞 اړیکه / Contact Us": {fa:"📞 تماس با ما",en:"📞 Contact Us",ur:"📞 رابطہ کریں",ar:"📞 اتصل بنا"},
    "📧 ایمیل": {fa:"📧 ایمیل",en:"📧 Email",ur:"📧 ای میل",ar:"📧 البريد الإلكتروني"},
    "📱 ټیلیفون": {fa:"📱 تلفن",en:"📱 Phone",ur:"📱 فون",ar:"📱 الهاتف"},
    "© 2026 سیدولی خان کوهستاني ګروپ": {fa:"© ۲۰۲۶ گروه سیدولی خان کوهستانی",en:"© 2026 Said Wali Khan Kohistani Group",ur:"© 2026 سید ولی خان کوہستانی گروپ",ar:"© ٢٠٢٦ مجموعة سيد ولي خان كوهيستاني"},
    "Jobs | AI | News | Downloads | Gallery": {fa:"وظایف | هوش مصنوعی | اخبار | دانلودها | گالری",en:"Jobs | AI | News | Downloads | Gallery",ur:"ملازمتیں | اے آئی | خبریں | ڈاؤن لوڈز | گیلری",ar:"الوظائف | الذكاء الاصطناعي | الأخبار | التنزيلات | المعرض"},
    "اوس مهال خبرونه شتون نه لري.": {fa:"در حال حاضر خبری موجود نیست.",en:"No news is currently available.",ur:"فی الحال کوئی خبر دستیاب نہیں۔",ar:"لا توجد أخبار متاحة حاليًا."},
    "☎ د مرستې لپاره دلته کلیک وکړئ": {fa:"☎ برای دریافت کمک اینجا کلیک کنید",en:"☎ Click here for help",ur:"☎ مدد کے لیے یہاں کلک کریں",ar:"☎ اضغط هنا للمساعدة"},
    "☎ مرسته": {fa:"☎ کمک",en:"☎ Help",ur:"☎ مدد",ar:"☎ مساعدة"},
    "☎ د اړیکې او مرستې مرکز": {fa:"☎ مرکز تماس و کمک",en:"☎ Contact & Help Center",ur:"☎ رابطہ اور مدد مرکز",ar:"☎ مركز الاتصال والمساعدة"},
    "🌐 د اړیکې پاڼه پرانیزئ": {fa:"🌐 باز کردن صفحه تماس",en:"🌐 Open Contact Page",ur:"🌐 رابطہ صفحہ کھولیں",ar:"🌐 افتح صفحة الاتصال"},
    "✖ د مرستې بکس بندول": {fa:"✖ بستن پنجره کمک",en:"✖ Close Help Panel",ur:"✖ مدد کا پینل بند کریں",ar:"✖ إغلاق لوحة المساعدة"}
  };
  const langNames = {ps:"پښتو",fa:"دری",en:"English",ur:"اردو",ar:"العربية"};
  function apply(lang) {
    if (!["ps","fa","en","ur","ar"].includes(lang)) lang = "ps";
    const rtl = lang !== "en";
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? "rtl" : "ltr";
    document.body.dir = rtl ? "rtl" : "ltr";
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || /^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION)$/i.test(parent.tagName)) continue;
      const original = node.nodeValue;
      const trimmed = original.trim();
      if (!trimmed) continue;
      const item = dict[trimmed];
      if (item) node.nodeValue = original.replace(trimmed, lang === "ps" ? trimmed : (item[lang] || trimmed));
    }
    document.querySelectorAll("input[placeholder],textarea[placeholder]").forEach(el => {
      if (!el.dataset.psPlaceholder) el.dataset.psPlaceholder = el.placeholder;
    });
    document.querySelectorAll(".languages button").forEach(btn => {
      const active = btn.getAttribute("onclick") || "";
      btn.classList.toggle("active", active.includes("'" + lang + "'"));
    });
    try { localStorage.setItem("sw_site_language", lang); } catch(e) {}
  }
  window.changeLanguage = function(lang) { apply(lang); };
  document.addEventListener("DOMContentLoaded", function() {
    let saved = "ps";
    try { saved = localStorage.getItem("sw_site_language") || "ps"; } catch(e) {}
    apply(saved);
  });
})();