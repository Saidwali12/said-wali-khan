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
    "✖ د مرستې بکس بندول": {fa:"✖ بستن پنجره کمک",en:"✖ Close Help Panel",ur:"✖ مدد کا پینل بند کریں",ar:"✖ إغلاق لوحة المساعدة"},

    "⬅ شاتګ": {fa:"⬅ بازگشت",en:"⬅ Back",ur:"⬅ واپس",ar:"⬅ رجوع"},
    "⬅ شاته": {fa:"⬅ بازگشت",en:"⬅ Back",ur:"⬅ واپس",ar:"⬅ رجوع"},
    "⬅️ شاته تګ": {fa:"⬅️ بازگشت",en:"⬅️ Back",ur:"⬅️ واپس",ar:"⬅️ رجوع"},
    "➡ مخکې تګ": {fa:"➡ رفتن به جلو",en:"➡ Forward",ur:"➡ آگے",ar:"➡ إلى الأمام"},
    "ټولې سیمې": {fa:"همه مناطق",en:"All Regions",ur:"تمام علاقے",ar:"جميع المناطق"},
    "کنړ": {fa:"کنر",en:"Kunar",ur:"کنڑ",ar:"كونر"},
    "نورستان": {fa:"نورستان",en:"Nuristan",ur:"نورستان",ar:"نورستان"},
    "نوی": {fa:"جدید",en:"New",ur:"نیا",ar:"جديد"},
    "ثبت نام": {fa:"ثبت‌نام",en:"Apply",ur:"درخواست دیں",ar:"تقديم"},
    "مهم لینکونه": {fa:"پیوندهای مهم",en:"Important Links",ur:"اہم روابط",ar:"روابط مهمة"},
    "📰 تازه خبرونه": {fa:"📰 تازه‌ترین اخبار",en:"📰 Latest News",ur:"📰 تازہ خبریں",ar:"📰 آخر الأخبار"},
    "د افغانستان او نړۍ روانی چاری حقیقی خبرونه": {fa:"رویدادهای جاری افغانستان و جهان و اخبار واقعی",en:"Current affairs and real news from Afghanistan and the world",ur:"افغانستان اور دنیا کے حالات اور حقیقی خبریں",ar:"الأحداث الجارية والأخبار الحقيقية من أفغانستان والعالم"},
    "د خبرونو سرچینې کتل کېږي، مهرباني وکړئ انتظار وکړئ...": {fa:"منابع خبری در حال بررسی است، لطفاً منتظر بمانید...",en:"Checking news sources, please wait...",ur:"خبروں کے ذرائع دیکھے جا رہے ہیں، انتظار کریں...",ar:"جارٍ التحقق من مصادر الأخبار، يرجى الانتظار..."},
    "AI مرکز PRO": {fa:"مرکز هوش مصنوعی PRO",en:"AI Center PRO",ur:"اے آئی مرکز PRO",ar:"مركز الذكاء الاصطناعي PRO"},
    "🤖 AI مرکز PRO": {fa:"🤖 مرکز هوش مصنوعی PRO",en:"🤖 AI Center PRO",ur:"🤖 اے آئی مرکز PRO",ar:"🤖 مركز الذكاء الاصطناعي PRO"},
    "ټول مشهور AI وسایل په یوه ځای کې": {fa:"همه ابزارهای مشهور هوش مصنوعی در یک‌جا",en:"All popular AI tools in one place",ur:"تمام مشہور اے آئی ٹولز ایک جگہ",ar:"جميع أدوات الذكاء الاصطناعي الشهيرة في مكان واحد"},
    "🌐 مهم ویب سایټونه": {fa:"🌐 وب‌سایت‌های مهم",en:"🌐 Important Websites",ur:"🌐 اہم ویب سائٹس",ar:"🌐 مواقع مهمة"},
    "ټول مهم ټولنیز شبکې": {fa:"همه شبکه‌های اجتماعی مهم",en:"All major social networks",ur:"تمام اہم سوشل نیٹ ورکس",ar:"جميع شبكات التواصل المهمة"},
    "د اړیکو پاڼه": {fa:"صفحه تماس",en:"Contact Page",ur:"رابطے کا صفحہ",ar:"صفحة الاتصال"},
    "د اړیکو او تماس پاڼه": {fa:"صفحه ارتباط و تماس",en:"Contact & Communication Page",ur:"رابطہ اور مواصلات کا صفحہ",ar:"صفحة التواصل والاتصال"},
    "📞 د تلیفون شمیرې": {fa:"📞 شماره‌های تلفن",en:"📞 Phone Numbers",ur:"📞 فون نمبر",ar:"📞 أرقام الهاتف"},
    "🌐 ټولنیزې اړیکې": {fa:"🌐 ارتباطات اجتماعی",en:"🌐 Social Contacts",ur:"🌐 سوشل رابطے",ar:"🌐 التواصل الاجتماعي"},
    "📧 ایمیلونه": {fa:"📧 ایمیل‌ها",en:"📧 Email Addresses",ur:"📧 ای میل پتے",ar:"📧 عناوين البريد الإلكتروني"},
    "د QR Code سکین کولو یا د WhatsApp تڼۍ په وهلو سره اړیکه ونیسئ.": {fa:"با اسکن کد QR یا زدن دکمه WhatsApp تماس بگیرید.",en:"Contact us by scanning the QR code or pressing the WhatsApp button.",ur:"QR کوڈ اسکین کرکے یا WhatsApp بٹن دبا کر رابطہ کریں۔",ar:"تواصل معنا بمسح رمز QR أو بالضغط على زر WhatsApp."},
    "د سافټویرونو او کتابونو مرکز": {fa:"مرکز نرم‌افزارها و کتاب‌ها",en:"Software & Books Center",ur:"سافٹ ویئر اور کتابوں کا مرکز",ar:"مركز البرامج والكتب"},
    "💻 سافټویر سایټونه": {fa:"💻 وب‌سایت‌های نرم‌افزار",en:"💻 Software Websites",ur:"💻 سافٹ ویئر ویب سائٹس",ar:"💻 مواقع البرامج"},
    "📚 اسلامي، پښتو، اردو او عربي کتابونه": {fa:"📚 کتاب‌های اسلامی، پشتو، اردو و عربی",en:"📚 Islamic, Pashto, Urdu & Arabic Books",ur:"📚 اسلامی، پشتو، اردو اور عربی کتابیں",ar:"📚 كتب إسلامية وبشتوية وأردية وعربية"},
    "🏏 نړیوال Live Cricket Center": {fa:"🏏 مرکز زنده کریکت جهان",en:"🏏 Global Live Cricket Center",ur:"🏏 عالمی لائیو کرکٹ مرکز",ar:"🏏 مركز الكريكيت المباشر العالمي"},
    "د نړۍ د کرکټ ژوندۍ پایلې او تازه معلومات": {fa:"نتایج زنده و تازه‌ترین اطلاعات کریکت جهان",en:"Live cricket scores and latest world updates",ur:"دنیا کے لائیو کرکٹ اسکور اور تازہ معلومات",ar:"نتائج الكريكيت المباشرة وآخر التحديثات العالمية"},
    "🔴 LIVE — معلومات هر 30 ثانیې تازه کېږي": {fa:"🔴 زنده — اطلاعات هر ۳۰ ثانیه تازه می‌شود",en:"🔴 LIVE — Updates every 30 seconds",ur:"🔴 لائیو — معلومات ہر 30 سیکنڈ میں اپ ڈیٹ",ar:"🔴 مباشر — يتم تحديث المعلومات كل 30 ثانية"},
    "🌍 ټولې": {fa:"🌍 همه",en:"🌍 All",ur:"🌍 تمام",ar:"🌍 الكل"},
    "🇦🇫 افغانستان": {fa:"🇦🇫 افغانستان",en:"🇦🇫 Afghanistan",ur:"🇦🇫 افغانستان",ar:"🇦🇫 أفغانستان"},
    "🇮🇳 هند": {fa:"🇮🇳 هند",en:"🇮🇳 India",ur:"🇮🇳 بھارت",ar:"🇮🇳 الهند"},
    "🇵🇰 پاکستان": {fa:"🇵🇰 پاکستان",en:"🇵🇰 Pakistan",ur:"🇵🇰 پاکستان",ar:"🇵🇰 باكستان"},
    "🇦🇺 استرالیا": {fa:"🇦🇺 استرالیا",en:"🇦🇺 Australia",ur:"🇦🇺 آسٹریلیا",ar:"🇦🇺 أستراليا"},
    "🔄 تازه کول": {fa:"🔄 تازه‌سازی",en:"🔄 Refresh",ur:"🔄 تازہ کریں",ar:"🔄 تحديث"},
    "⏳ Live لوبې راټولېږي...": {fa:"⏳ بازی‌های زنده در حال جمع‌آوری است...",en:"⏳ Loading live matches...",ur:"⏳ لائیو میچز جمع ہو رہے ہیں...",ar:"⏳ جارٍ تحميل المباريات المباشرة..."}

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
      if (parent.closest("#bbc-news,#sw-language-bar,.user-post,.post-content,.comment,.comments,[contenteditable='true']")) continue;
      if (!Object.prototype.hasOwnProperty.call(node, "__swOriginal")) node.__swOriginal = node.nodeValue;
      const original = node.__swOriginal;
      const trimmed = original.trim();
      if (!trimmed) continue;
      const item = dict[trimmed];
      if (item) node.nodeValue = original.replace(trimmed, lang === "ps" ? trimmed : (item[lang] || trimmed));
    }
    document.querySelectorAll("input[placeholder],textarea[placeholder]").forEach(el => {
      if (!el.dataset.psPlaceholder) el.dataset.psPlaceholder = el.placeholder;
    });
    document.querySelectorAll(".languages button, #sw-language-bar button").forEach(btn => {
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