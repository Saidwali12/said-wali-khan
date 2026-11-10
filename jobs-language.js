/* Dedicated multilingual UI for the Saidwali Jobs Portal.
   Translates portal controls and verified vacancy text in Pashto, Dari, English, Urdu and Arabic.
   Keeps the original job feed, application links, registration API and email workflow unchanged. */
(function () {
  "use strict";
  const T = {
    "سیدولي خان جاب پورټل": {fa:"پورتال کاریابی سیدولی خان",en:"Said Wali Khan Jobs Portal",ur:"سید ولی خان جاب پورٹل",ar:"بوابة وظائف سيد ولي خان"},
    "⬅ شاتګ": {fa:"⬅ بازگشت",en:"⬅ Back",ur:"⬅ واپس",ar:"⬅ رجوع"},
    "د کونړ، نورستان، لغمان او ننګرهار تازه کاري فرصتونه | د ایمیل له لارې مستقیم غوښتنلیک | د پای نېټه حتمي وګورئ": {fa:"فرصت‌های کاری تازه در کنر، نورستان، لغمان و ننگرهار | درخواست مستقیم از طریق ایمیل | حتماً تاریخ ختم را بررسی کنید",en:"Latest job opportunities in Kunar, Nuristan, Laghman and Nangarhar | Apply directly by email | Check the deadline",ur:"کنڑ، نورستان، لغمان اور ننگرہار میں تازہ ملازمتیں | ای میل کے ذریعے براہِ راست درخواست | آخری تاریخ ضرور دیکھیں",ar:"أحدث فرص العمل في كونر ونورستان ولغمان وننكرهار | التقديم مباشرة عبر البريد الإلكتروني | تحقق من الموعد النهائي"},
    "د کونړ، نورستان، لغمان او ننګرهار د کار اعلانونه": {fa:"اعلان‌های کاری کنر، نورستان، لغمان و ننگرهار",en:"Job vacancies in Kunar, Nuristan, Laghman and Nangarhar",ur:"کنڑ، نورستان، لغمان اور ننگرہار میں ملازمتوں کے اشتہارات",ar:"إعلانات الوظائف في كونر ونورستان ولغمان وننكرهار"},
    "یوازې هغه بستونه چې د ادارې اصلي ایمیل او د غوښتنلیک موضوع یې تایید شوې وي.": {fa:"فقط بست‌هایی که ایمیل رسمی اداره و موضوع درخواست آن تأیید شده باشد.",en:"Only vacancies with verified employer contact details or official application links are listed.",ur:"صرف وہ آسامیاں درج ہیں جن کے ادارے کے رابطے یا سرکاری درخواست کے لنکس کی تصدیق ہوئی ہے۔",ar:"تُدرج فقط الوظائف التي تم التحقق من بيانات اتصال الجهة أو روابط التقديم الرسمية لها."},
    "د هر بست د غوښتنلیک تڼۍ به د ادارې ایمیل، د بست موضوع او اړوند معلومات چمتو کړي. خپل CV او اسناد ورسره ضمیمه کړئ او ایمیل خپله واستوئ. د خبرتیا په ایمیل کې به د همدې بست د سیدولي خان پاڼې لینک او د اصلي اعلان لینک هم وي.": {fa:"دکمه درخواست هر بست، ایمیل اداره، موضوع بست و معلومات مربوط را آماده می‌کند. CV و اسناد خود را ضمیمه کرده و ایمیل را ارسال کنید. ایمیل اطلاع‌رسانی شامل لینک همین بست در وب‌سایت سیدولی خان و لینک اعلان اصلی نیز خواهد بود.",en:"The email-application button prepares the employer's email, vacancy subject and details. Attach your CV and documents, then send the email yourself. Job-alert emails also include the link to this vacancy on the Saidwali portal and the original announcement.",ur:"ہر آسامی کا درخواست بٹن ادارے کا ای میل، آسامی کا موضوع اور متعلقہ معلومات تیار کرے گا۔ اپنا CV اور دستاویزات منسلک کرکے ای میل خود بھیجیں۔ ملازمت کی اطلاع میں سیدولی خان پورٹل پر اسی آسامی اور اصل اشتہار کا لنک بھی ہوگا۔",ar:"يجهّز زر التقديم عبر البريد الإلكتروني عنوان الرسالة وبريد الجهة وتفاصيل الوظيفة. أرفق سيرتك الذاتية ومستنداتك ثم أرسل الرسالة بنفسك. تتضمن رسائل التنبيه رابط الوظيفة في بوابة سيد ولي خان ورابط الإعلان الأصلي."},
    "📝 د ثبت‌نام سیستم د فعالېدو په تمه": {fa:"📝 در انتظار فعال‌شدن سیستم ثبت‌نام",en:"📝 Registration system is being activated",ur:"📝 رجسٹریشن سسٹم فعال ہونے کے انتظار میں",ar:"📝 بانتظار تفعيل نظام التسجيل"},
    "د نوماندانو ثبت‌نام به د خوندي ډیټابېس، فایل‌ذخیرې او ایمیل تنظیماتو تر بشپړېدو وروسته فعال شي.": {fa:"ثبت‌نام متقاضیان پس از تکمیل تنظیمات پایگاه داده امن، ذخیره فایل و ایمیل فعال می‌شود.",en:"Applicant registration will be enabled after the secure database, file storage and email settings are ready.",ur:"محفوظ ڈیٹا بیس، فائل اسٹوریج اور ای میل سیٹنگز مکمل ہونے کے بعد امیدواروں کی رجسٹریشن فعال ہوگی۔",ar:"سيُفعّل تسجيل المتقدمين بعد اكتمال إعدادات قاعدة البيانات الآمنة وتخزين الملفات والبريد الإلكتروني."},
    "📝 د کار غوښتونکو ثبت‌نام": {fa:"📝 ثبت‌نام جویندگان کار",en:"📝 Job Seeker Registration",ur:"📝 ملازمت کے متلاشیوں کی رجسٹریشن",ar:"📝 تسجيل الباحثين عن عمل"},
    "خپل معلومات ثبت کړئ او د خپل ټاکلي ولایت د نویو دندو خبرتیاوې په ایمیل ترلاسه کړئ.": {fa:"اطلاعات خود را ثبت کنید و اعلان‌های وظایف جدید ولایت انتخابی خود را از طریق ایمیل دریافت کنید.",en:"Register your details to receive email alerts for new jobs in your selected province.",ur:"اپنی معلومات درج کریں اور منتخب صوبے کی نئی ملازمتوں کی اطلاعات ای میل پر حاصل کریں۔",ar:"سجّل معلوماتك لتلقي تنبيهات الوظائف الجديدة في الولاية التي تختارها عبر البريد الإلكتروني."},
    "✕ تړل": {fa:"✕ بستن",en:"✕ Close",ur:"✕ بند کریں",ar:"✕ إغلاق"},
    "د کار غوښتونکو ثبت‌نام": {fa:"ثبت‌نام جویندگان کار",en:"Job Seeker Registration",ur:"ملازمت کے متلاشیوں کی رجسٹریشن",ar:"تسجيل الباحثين عن عمل"},
    "ټول اړین معلومات په سمه توګه ولیکئ. عکس او CV دواړه اړین دي؛ فایلونه تر ۸ MB پورې پورته کړئ.": {fa:"تمام اطلاعات ضروری را درست وارد کنید. عکس و CV هر دو الزامی‌اند؛ فایل‌ها حداکثر تا ۸ مگابایت باشند.",en:"Complete all required fields accurately. A photo and CV are required; each file must be no larger than 8 MB.",ur:"تمام ضروری معلومات درست درج کریں۔ تصویر اور CV دونوں لازمی ہیں؛ ہر فائل زیادہ سے زیادہ 8 MB ہو۔",ar:"أدخل جميع المعلومات المطلوبة بدقة. الصورة والسيرة الذاتية إلزاميتان؛ يجب ألا يتجاوز حجم كل ملف 8 ميغابايت."},
    "نوم *": {fa:"نام *",en:"Full name *",ur:"نام *",ar:"الاسم *"},
    "د پلار نوم *": {fa:"نام پدر *",en:"Father's name *",ur:"والد کا نام *",ar:"اسم الأب *"},
    "د تحصیل درجه *": {fa:"سطح تحصیل *",en:"Education level *",ur:"تعلیم کی سطح *",ar:"المستوى التعليمي *"},
    "تحصیلي درجه وټاکئ": {fa:"سطح تحصیل را انتخاب کنید",en:"Select education level",ur:"تعلیم کی سطح منتخب کریں",ar:"اختر المستوى التعليمي"},
    "ابتدائیه": {fa:"ابتدایی",en:"Primary",ur:"ابتدائی",ar:"ابتدائي"},
    "ثانویه": {fa:"متوسطه",en:"Secondary",ur:"ثانوی",ar:"ثانوي"},
    "بکلوریا": {fa:"بکلوریا",en:"High school diploma",ur:"بکلوریٹ",ar:"الثانوية العامة"},
    "دیپلوم": {fa:"دیپلوم",en:"Diploma",ur:"ڈپلومہ",ar:"دبلوم"},
    "لیسانس": {fa:"لیسانس",en:"Bachelor's degree",ur:"بیچلر",ar:"بكالوريوس"},
    "ماسټري": {fa:"ماستری",en:"Master's degree",ur:"ماسٹرز",ar:"ماجستير"},
    "دوکتورا": {fa:"دکتورا",en:"Doctorate",ur:"ڈاکٹریٹ",ar:"دكتوراه"},
    "نور": {fa:"سایر",en:"Other",ur:"دیگر",ar:"أخرى"},
    "د ټیلیفون شمېره *": {fa:"شماره تلفن *",en:"Phone number *",ur:"فون نمبر *",ar:"رقم الهاتف *"},
    "ایمیل ادرس *": {fa:"آدرس ایمیل *",en:"Email address *",ur:"ای میل ایڈریس *",ar:"عنوان البريد الإلكتروني *"},
    "د کوم ولایت/ولایتونو لپاره دنده غواړئ؟ *": {fa:"برای کدام ولایت/ولایت‌ها کار می‌خواهید؟ *",en:"Which province(s) are you seeking work in? *",ur:"آپ کس صوبے/صوبوں میں ملازمت چاہتے ہیں؟ *",ar:"في أي ولاية/ولايات تبحث عن عمل؟ *"},
    "ولایت وټاکئ": {fa:"ولایت را انتخاب کنید",en:"Select province",ur:"صوبہ منتخب کریں",ar:"اختر الولاية"},
    "کونړ": {fa:"کنر",en:"Kunar",ur:"کنڑ",ar:"كونر"},
    "نورستان": {fa:"نورستان",en:"Nuristan",ur:"نورستان",ar:"نورستان"},
    "لغمان": {fa:"لغمان",en:"Laghman",ur:"لغمان",ar:"لغمان"},
    "ننګرهار": {fa:"ننگرهار",en:"Nangarhar",ur:"ننگرہار",ar:"ننكرهار"},
    "ټول څلور ولایتونه": {fa:"هر چهار ولایت",en:"All four provinces",ur:"چاروں صوبے",ar:"الولايات الأربع"},
    "عکس (JPG/PNG/WebP، تر ۸ MB) *": {fa:"عکس (JPG/PNG/WebP، حداکثر ۸ مگابایت) *",en:"Photo (JPG/PNG/WebP, up to 8 MB) *",ur:"تصویر (JPG/PNG/WebP، 8 MB تک) *",ar:"الصورة (JPG/PNG/WebP، حتى 8 ميغابايت) *"},
    "CV / خلص سوانح (PDF/DOC/DOCX، تر ۸ MB) *": {fa:"CV / خلص سوانح (PDF/DOC/DOCX، حداکثر ۸ مگابایت) *",en:"CV / Resume (PDF/DOC/DOCX, up to 8 MB) *",ur:"CV / ریزیومے (PDF/DOC/DOCX، 8 MB تک) *",ar:"السيرة الذاتية (PDF/DOC/DOCX، حتى 8 ميغابايت) *"},
    "زه اجازه ورکوم چې زما نوم، د اړیکې معلومات او ټاکل شوی ولایت د کارموندنې لپاره خوندي شي، او د خپل ټاکلي ولایت د نویو یا تازه شوو دندو خبرتیاوې زما ایمیل ته راولېږل شي. زه هر وخت د خبرتیاوو د بندولو غوښتنه کولای شم. *": {fa:"اجازه می‌دهم نام، اطلاعات تماس و ولایت انتخابی من برای کاریابی ذخیره شود و اعلان‌های وظایف جدید یا به‌روزشده همان ولایت به ایمیلم فرستاده شود. هر زمان می‌توانم درخواست توقف اعلان‌ها را بدهم. *",en:"I consent to storing my name, contact details and selected province for recruitment purposes, and receiving email alerts about new or updated jobs in that province. I may request to stop alerts at any time. *",ur:"میں اپنے نام، رابطے کی معلومات اور منتخب صوبے کو ملازمت کے مقصد کے لیے محفوظ کرنے اور اسی صوبے کی نئی یا اپ ڈیٹ شدہ ملازمتوں کی ای میل اطلاعات وصول کرنے کی اجازت دیتا/دیتی ہوں۔ میں کسی بھی وقت اطلاعات بند کرنے کی درخواست کر سکتا/سکتی ہوں۔ *",ar:"أوافق على حفظ اسمي وبيانات الاتصال والولاية المحددة لأغراض التوظيف، وإرسال تنبيهات الوظائف الجديدة أو المحدّثة في تلك الولاية إلى بريدي الإلكتروني. يمكنني طلب إيقاف التنبيهات في أي وقت. *"},
    "ثبت‌نام بشپړ کړئ": {fa:"تکمیل ثبت‌نام",en:"Complete Registration",ur:"رجسٹریشن مکمل کریں",ar:"إكمال التسجيل"},
    "ټولې سیمې": {fa:"همه مناطق",en:"All regions",ur:"تمام علاقے",ar:"جميع المناطق"},
    "د بستونو شمېر...": {fa:"تعداد بست‌ها...",en:"Loading vacancy count...",ur:"آسامیوں کی تعداد...",ar:"عدد الوظائف..."},
    "ښودل شوي بستونه: ": {fa:"بست‌های نمایش‌داده‌شده: ",en:"Vacancies shown: ",ur:"دکھائی گئی آسامیاں: ",ar:"الوظائف المعروضة: "},
    "د بستونو معلومات لوستل کېږي...": {fa:"اطلاعات بست‌ها در حال بارگذاری است...",en:"Loading vacancy information...",ur:"آسامیوں کی معلومات لوڈ ہو رہی ہیں...",ar:"جارٍ تحميل معلومات الوظائف..."},
    "اوس مهال په دې سیمه کې تایید شوی فعال بست نشته.": {fa:"در حال حاضر بست فعال و تأییدشده‌ای در این منطقه وجود ندارد.",en:"There are currently no verified active vacancies in this region.",ur:"اس علاقے میں فی الحال کوئی تصدیق شدہ فعال آسامی موجود نہیں۔",ar:"لا توجد حاليًا وظائف نشطة وموثقة في هذه المنطقة."},
    "شرایط: ": {fa:"شرایط: ",en:"Requirements: ",ur:"شرائط: ",ar:"المتطلبات: "},
    "د اعلان نېټه: ": {fa:"تاریخ نشر: ",en:"Posted: ",ur:"اشاعت کی تاریخ: ",ar:"تاريخ النشر: "},
    "د پای نېټه: ": {fa:"تاریخ ختم: ",en:"Closing date: ",ur:"آخری تاریخ: ",ar:"تاريخ الإغلاق: "},
    "د اعلان له مخې": {fa:"طبق اعلان",en:"As stated in the notice",ur:"اشتہار کے مطابق",ar:"حسب الإعلان"},
    "د ادارې ایمیل: ": {fa:"ایمیل اداره: ",en:"Employer email: ",ur:"ادارے کا ای میل: ",ar:"بريد جهة التوظيف: "},
    "غوښتنلیک: د ادارې رسمي آنلاین فورم": {fa:"درخواست: فورم آنلاین رسمی اداره",en:"Application: Employer's official online form",ur:"درخواست: ادارے کا سرکاری آن لائن فارم",ar:"التقديم: النموذج الإلكتروني الرسمي للجهة"},
    "↗ رسمي آنلاین غوښتنلیک": {fa:"↗ درخواست آنلاین رسمی",en:"↗ Official online application",ur:"↗ سرکاری آن لائن درخواست",ar:"↗ التقديم الإلكتروني الرسمي"},
    "✉ د ایمیل له لارې غوښتنلیک": {fa:"✉ درخواست از طریق ایمیل",en:"✉ Apply by email",ur:"✉ ای میل کے ذریعے درخواست",ar:"✉ التقديم عبر البريد الإلكتروني"},
    "بل ایمیل اپلېکېشن": {fa:"ایمیل درخواست دیگر",en:"Alternative email link",ur:"متبادل ای میل لنک",ar:"رابط بريد إلكتروني بديل"},
    "د غوښتنلیک وخت ختم شوی یا لینک تایید نه دی": {fa:"مهلت درخواست پایان یافته یا لینک تأیید نشده است",en:"Application period has ended or the link is unverified",ur:"درخواست کی مدت ختم ہو چکی ہے یا لنک کی تصدیق نہیں ہوئی",ar:"انتهت فترة التقديم أو لم يتم التحقق من الرابط"},
    "د بست د ثبت نام وخت ختم شوی دی.": {fa:"مهلت ثبت‌نام این بست پایان یافته است.",en:"The application period for this vacancy has ended.",ur:"اس آسامی کے لیے درخواست کی مدت ختم ہو چکی ہے۔",ar:"انتهت فترة التقديم لهذه الوظيفة."},
    "د ثبت نام لپاره ": {fa:"برای ثبت‌نام ",en:"",ur:"درخواست کے لیے ",ar:"يتبقى "},
    " ورځې پاتې دي.": {fa:" روز باقی مانده است.",en:" days left to apply.",ur:" دن باقی ہیں۔",ar:" يومًا للتقديم."},
    "اصلي اعلان: ": {fa:"اعلان اصلی: ",en:"Original announcement: ",ur:"اصل اشتہار: ",ar:"الإعلان الأصلي: "},
    "مهم لینکونه": {fa:"پیوندهای مهم",en:"Useful links",ur:"اہم روابط",ar:"روابط مهمة"},
    "د بستونو معلومات اوس نه لوډېږي. لږ وروسته بیا هڅه وکړئ.": {fa:"اطلاعات بست‌ها اکنون بارگذاری نمی‌شود. کمی بعد دوباره تلاش کنید.",en:"Vacancy information could not be loaded. Please try again shortly.",ur:"آسامیوں کی معلومات ابھی لوڈ نہیں ہو رہیں۔ کچھ دیر بعد دوبارہ کوشش کریں۔",ar:"تعذر تحميل معلومات الوظائف الآن. يرجى المحاولة مرة أخرى بعد قليل."},
    "د معلوماتو ستونزه": {fa:"مشکل در دریافت اطلاعات",en:"Information error",ur:"معلومات کا مسئلہ",ar:"خطأ في المعلومات"},
    "عکس پورته کړئ؛ اندازه یې باید تر ۸ MB کمه وي.": {fa:"لطفاً عکس را بارگذاری کنید؛ اندازه آن باید کمتر از ۸ مگابایت باشد.",en:"Please upload a photo smaller than 8 MB.",ur:"براہ کرم 8 MB سے کم تصویر اپ لوڈ کریں۔",ar:"يرجى رفع صورة يقل حجمها عن 8 ميغابايت."},
    "CV پورته کړئ؛ اندازه یې باید تر ۸ MB کمه وي.": {fa:"لطفاً CV را بارگذاری کنید؛ اندازه آن باید کمتر از ۸ مگابایت باشد.",en:"Please upload a CV smaller than 8 MB.",ur:"براہ کرم 8 MB سے کم CV اپ لوڈ کریں۔",ar:"يرجى رفع سيرة ذاتية يقل حجمها عن 8 ميغابايت."},
    "ثبت‌نام روان دی...": {fa:"ثبت‌نام در حال انجام است...",en:"Registering...",ur:"رجسٹریشن جاری ہے...",ar:"جارٍ التسجيل..."},
    "✓ ثبت‌نام په بریالیتوب بشپړ شو! اوس به د دندو پاڼې ته بېرته ولاړ شئ.": {fa:"✓ ثبت‌نام با موفقیت تکمیل شد! اکنون به صفحه وظایف بازمی‌گردید.",en:"✓ Registration successful! You will now return to the jobs page.",ur:"✓ رجسٹریشن کامیابی سے مکمل ہوگئی! اب آپ ملازمتوں کے صفحے پر واپس جائیں گے۔",ar:"✓ اكتمل التسجيل بنجاح! ستعود الآن إلى صفحة الوظائف."},
    "له سرور سره اړیکه ټینګه نه شوه. وروسته بیا هڅه وکړئ.": {fa:"ارتباط با سرور برقرار نشد. بعداً دوباره تلاش کنید.",en:"Could not connect to the server. Please try again later.",ur:"سرور سے رابطہ نہیں ہو سکا۔ بعد میں دوبارہ کوشش کریں۔",ar:"تعذر الاتصال بالخادم. يرجى المحاولة لاحقًا."},
    "نوی اعلان": {fa:"اعلان جدید",en:"New vacancy",ur:"نیا اشتہار",ar:"إعلان جديد"},
    "Enumerator (Economic Resilience)": {fa:"آمارگیر (تاب‌آوری اقتصادی)",en:"Enumerator (Economic Resilience)",ur:"شمار کنندہ (اقتصادی استحکام)",ar:"باحث تعداد (القدرة على الصمود الاقتصادي)"},
    "General Support (Enumerator)": {fa:"حمایت عمومی (آمارگیر)",en:"General Support (Enumerator)",ur:"عمومی معاونت (شمار کنندہ)",ar:"الدعم العام (باحث تعداد)"},
    "لږ تر لږه د لېسې یا ډیپلوم زده کړې او د اړوندې برخې یو کال تجربه؛ پښتو او دري ژبې ته بلدتیا اړینه ده. د بشپړو شرایطو لپاره اصلي اعلان وګورئ.": {fa:"حداقل تحصیلات لیسه یا دیپلوم و یک سال تجربه مرتبط؛ آشنایی با زبان‌های پشتو و دری ضروری است. برای شرایط کامل، اعلان اصلی را ببینید.",en:"At least high-school or diploma education and one year of relevant experience; knowledge of Pashto and Dari is required. See the original notice for full requirements.",ur:"کم از کم ہائی اسکول یا ڈپلومہ تعلیم اور متعلقہ شعبے میں ایک سال کا تجربہ؛ پشتو اور دری زبانوں سے واقفیت ضروری ہے۔ مکمل شرائط کے لیے اصل اشتہار دیکھیں۔",ar:"يشترط الحصول على تعليم ثانوي أو دبلوم على الأقل وسنة واحدة من الخبرة ذات الصلة؛ وإتقان البشتوية والدارية. راجع الإعلان الأصلي للاطلاع على الشروط كاملة."},
    "د دندې بشپړ شرایط د اصلي اعلان په لینک کې وګورئ.": {fa:"شرایط کامل وظیفه را در پیوند اعلان اصلی ببینید.",en:"See the original announcement for the full job requirements.",ur:"ملازمت کی مکمل شرائط اصل اشتہار کے لنک پر دیکھیں۔",ar:"راجع رابط الإعلان الأصلي للاطلاع على متطلبات الوظيفة كاملة."},
    "Full Time": {fa:"تمام‌وقت",en:"Full Time",ur:"کل وقتی",ar:"دوام كامل"},
    "© 2026 Said Wali Khan Job Portal": {fa:"© ۲۰۲۶ پورتال کاریابی سیدولی خان",en:"© 2026 Said Wali Khan Job Portal",ur:"© 2026 سید ولی خان جاب پورٹل",ar:"© ٢٠٢٦ بوابة وظائف سيد ولي خان"}
  };
  const langs = ["ps","fa","en","ur","ar"];
  const langBar = document.getElementById("sw-language-bar");
  function translateText(lang) {
    if (!langs.includes(lang)) lang = "ps";
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "en" ? "ltr" : "rtl";
    document.body.dir = lang === "en" ? "ltr" : "rtl";
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || /^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION)$/i.test(parent.tagName) || parent.closest("#sw-language-bar,[contenteditable='true']")) continue;
      const original = node.__swOriginal !== undefined ? node.__swOriginal : (node.__jobsOriginal !== undefined ? node.__jobsOriginal : node.nodeValue);
      if (node.__jobsOriginal === undefined) node.__jobsOriginal = original;
      const trimmed = original.trim();
      if (!trimmed) continue;
      let translated = T[trimmed] && T[trimmed][lang] !== undefined ? T[trimmed][lang] : (lang === "ps" ? trimmed : null);
      if (translated === null) {
        const prefixes = ["ښودل شوي بستونه: ","شرایط: ","د اعلان نېټه: ","د پای نېټه: ","د ادارې ایمیل: ","اصلي اعلان: "];
        const prefix = prefixes.find(p => trimmed.startsWith(p));
        if (prefix) {
          const suffix = trimmed.slice(prefix.length);
          const p = T[prefix] && T[prefix][lang] !== undefined ? T[prefix][lang] : prefix;
          const detail = T[suffix] && T[suffix][lang] ? T[suffix][lang] : suffix;
          translated = p + detail;
        } else if (trimmed.startsWith("د ثبت نام لپاره ") && trimmed.endsWith(" ورځې پاتې دي.")) {
          const n = trimmed.slice("د ثبت نام لپاره ".length, -" ورځې پاتې دي.".length);
          translated = (T["د ثبت نام لپاره "][lang] !== undefined ? T["د ثبت نام لپاره "][lang] : "د ثبت نام لپاره ") + n + (T[" ورځې پاتې دي."][lang] !== undefined ? T[" ورځې پاتې دي."][lang] : " ورځې پاتې دي.");
        } else if (trimmed.includes("،")) {
          translated = trimmed.split("،").map(part => {
            const word = part.trim();
            return (T[word] && T[word][lang]) || word;
          }).join(lang === "en" ? ", " : "، ");
        }
      }
      if (translated !== null && translated !== undefined) {
        const replacement = original.replace(trimmed, translated);
        if (node.nodeValue !== replacement) node.nodeValue = replacement;
      }
    }
    document.querySelectorAll("option").forEach(el => {
      if (el.dataset.jobsOriginal === undefined) el.dataset.jobsOriginal = el.textContent;
      const original = el.dataset.jobsOriginal.trim();
      if (T[original]) el.textContent = T[original][lang] || original;
    });
    document.querySelectorAll("input[placeholder],textarea[placeholder]").forEach(el => {
      if (el.dataset.jobsPlaceholder === undefined) el.dataset.jobsPlaceholder = el.placeholder;
      const original = el.dataset.jobsPlaceholder;
      if (T[original]) el.placeholder = T[original][lang] || original;
    });
    document.querySelectorAll("[title],[aria-label]").forEach(el => {
      ["title","aria-label"].forEach(attr => {
        const original = el.getAttribute(attr);
        if (!original) return;
        const key = "jobs" + attr;
        if (el.dataset[key] === undefined) el.dataset[key] = original;
        const source = el.dataset[key];
        if (T[source]) el.setAttribute(attr, T[source][lang] || source);
      });
    });
    document.querySelectorAll(".reg-panel").forEach(el => { el.style.direction = lang === "en" ? "ltr" : "rtl"; });
    document.querySelectorAll(".search-box").forEach(el => { el.style.textAlign = lang === "en" ? "left" : "right"; });
    document.querySelectorAll(".job-card").forEach(el => { el.style.borderRightWidth = lang === "en" ? "0" : "5px"; el.style.borderLeftWidth = lang === "en" ? "5px" : "0"; });
    if (langBar) langBar.querySelectorAll("button").forEach(b => {
      const oc = b.getAttribute("onclick") || "";
      b.style.outline = oc.includes("'" + lang + "'") ? "2px solid #d9ae52" : "none";
    });
  }
  const oldChange = window.changeLanguage;
  window.changeLanguage = function(lang) {
    if (typeof oldChange === "function") oldChange(lang);
    translateText(lang);
  };
  function start() {
    let lang = "ps";
    try { lang = localStorage.getItem("sw_site_language") || "ps"; } catch(e) {}
    if (typeof oldChange === "function") oldChange(lang);
    translateText(lang);
    const observer = new MutationObserver(() => translateText(window.__swActiveLanguage || lang));
    observer.observe(document.body, {childList:true,subtree:true,characterData:true});
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, {once:true});
  else start();
})();