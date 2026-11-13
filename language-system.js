/* Saidwali site-wide language coordinator.
   Uses the shared automatic translation engine; no visible translator toolbar. */
(function () {
  "use strict";
  var LANGS = [
    { code: "ps", label: "🇦🇫 پښتو" },
    { code: "fa", label: "دری" },
    { code: "en", label: "English" },
    { code: "ur", label: "اردو" },
    { code: "ar", label: "العربية" }
  ];
  var KEY = "sw_site_language";
  var LEGACY_KEY = "saidwali-site-language";
  var selected = "ps";
  try {
    selected = localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY) || "ps";
    if (LANGS.some(function (x) { return x.code === selected; })) {
      localStorage.setItem(KEY, selected);
    } else selected = "ps";
  } catch (e) { selected = "ps"; }

  function setDirection(lang) {
    // د براوزر/Google Translate له خوا د ټولې پاڼې د بیا ژباړلو مخنیوی؛ ژباړه زموږ خپل سیستم کوي.
    document.documentElement.setAttribute("translate", "no");
    if (document.body) document.body.setAttribute("translate", "no");
    if (!document.querySelector('meta[name="google"][content="notranslate"]')) {
      var noTranslateMeta = document.createElement("meta");
      noTranslateMeta.name = "google";
      noTranslateMeta.content = "notranslate";
      document.head.appendChild(noTranslateMeta);
    }
    var rtl = lang !== "en";
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", rtl ? "rtl" : "ltr");
    if (document.body) document.body.setAttribute("dir", rtl ? "rtl" : "ltr");
  }

  function markActive(lang) {
    document.querySelectorAll('[data-lang],[data-saidwali-lang]').forEach(function (b) {
      var code = b.getAttribute("data-lang") || b.getAttribute("data-saidwali-lang");
      b.classList.toggle("active", code === lang);
    });
    document.querySelectorAll("#sw-language-bar button,.language-options button").forEach(function (b) {
      var click = b.getAttribute("onclick") || "";
      b.classList.toggle("active", click.indexOf("'" + lang + "'") !== -1);
    });
  }

  function showLanguageLoading(lang) {
    var overlay = document.getElementById("sw-language-loading");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "sw-language-loading";
      overlay.setAttribute("role", "status");
      overlay.setAttribute("aria-live", "polite");
      overlay.innerHTML = '<div class="sw-language-loading-card"><span class="sw-language-spinner"></span><strong class="sw-language-loading-text"></strong></div>';
      var style = document.createElement("style");
      style.textContent = '#sw-language-loading{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;background:rgba(5,18,38,.94);color:#f4d58a;font-family:Tahoma,Arial,sans-serif}#sw-language-loading.sw-visible{display:flex}.sw-language-loading-card{display:flex;flex-direction:column;align-items:center;gap:18px;padding:30px 38px;border:1px solid #d9ae52;border-radius:16px;background:#071a35;box-shadow:0 15px 50px #0006;font-size:18px}.sw-language-spinner{width:38px;height:38px;border:4px solid #ffffff35;border-top-color:#f4d58a;border-radius:50%;animation:swLangSpin .8s linear infinite}@keyframes swLangSpin{to{transform:rotate(360deg)}}';
      document.head.appendChild(style);
      document.body.appendChild(overlay);
    }
    var messages = {ps:"ژبه بدلېږي، مهرباني وکړئ لږ شېبه انتظار وکړئ…",fa:"در حال تغییر زبان است؛ لطفاً لحظه‌ای منتظر بمانید…",en:"Changing language, please wait…",ur:"زبان تبدیل ہو رہی ہے، براہِ کرم انتظار کریں…",ar:"جارٍ تغيير اللغة، يرجى الانتظار قليلاً…"};
    overlay.querySelector(".sw-language-loading-text").textContent = messages[lang] || messages.ps;
    overlay.classList.add("sw-visible");
  }
  function hideLanguageLoading() {
    var overlay = document.getElementById("sw-language-loading");
    if (overlay) overlay.classList.remove("sw-visible");
  }

  function applySelectedLanguage(lang, showLoader) {
    if (!LANGS.some(function (x) { return x.code === lang; })) return;
    if (showLoader) showLanguageLoading(lang);
    selected = lang;
    try {
      localStorage.setItem(KEY, lang);
      localStorage.setItem(LEGACY_KEY, lang);
    } catch (e) {}
    setDirection(lang);
    markActive(lang);
    if (typeof window.__swApplyLanguage === "function") {
      window.__swApplyLanguage(lang);
    }
    if (showLoader) window.setTimeout(hideLanguageLoading, 550);
  }

  function attachLanguageEngine() {
    if (typeof window.__swApplyLanguage === "function") {
      window.changeLanguage = function (lang, button) {
        applySelectedLanguage(lang);
        if (button && button.parentElement) {
          button.parentElement.querySelectorAll("button").forEach(function (b) {
            b.classList.toggle("active", b === button);
          });
        }
      };
      applySelectedLanguage(selected, false);
      return;
    }

    // Some service pages only load this coordinator. Load the same shared
    // translation engine there too, so every page behaves consistently.
    if (window.__swLanguageEngineLoading) return;
    window.__swLanguageEngineLoading = true;
    var script = document.createElement("script");
    script.src = "/said-wali-khan/language.js?v=20261114-1";
    script.onload = function () {
      window.__swLanguageEngineLoading = false;
      attachLanguageEngine();
    };
    script.onerror = function () {
      window.__swLanguageEngineLoading = false;
    };
    document.head.appendChild(script);
  }

  function addLanguageMenuIfMissing() {
    if (document.getElementById("site-language-menu") ||
        document.getElementById("saidwali-quick-language") ||
        document.querySelector('[onclick*="changeLanguage"]')) return;

    var menu = document.createElement("div");
    menu.id = "saidwali-quick-language";
    menu.innerHTML = '<button type="button" aria-label="Choose language">🌐 ژبه</button><div class="saidwali-lang-list"></div>';
    var list = menu.querySelector(".saidwali-lang-list");
    LANGS.forEach(function (item) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = item.label;
      b.setAttribute("data-saidwali-lang", item.code);
      b.addEventListener("click", function () {
        applySelectedLanguage(item.code, true);
        menu.classList.remove("open");
      });
      list.appendChild(b);
    });
    menu.querySelector("button").addEventListener("click", function () {
      menu.classList.toggle("open");
    });
    var style = document.createElement("style");
    style.textContent = '#saidwali-quick-language{position:fixed;top:12px;left:12px;z-index:999999;font:bold 13px Tahoma,Arial,sans-serif;direction:rtl}#saidwali-quick-language>button{background:#102b50;color:#f4d58a;border:1px solid #d9ae52;border-radius:8px;padding:8px 12px;cursor:pointer}#saidwali-quick-language .saidwali-lang-list{display:none;position:absolute;top:42px;left:0;background:#fff;padding:6px;border-radius:9px;box-shadow:0 5px 20px #0004;min-width:120px}#saidwali-quick-language.open .saidwali-lang-list{display:grid;gap:4px}#saidwali-quick-language .saidwali-lang-list button{border:0;background:#f2f4f8;padding:8px;border-radius:6px;text-align:right;cursor:pointer;color:#102b50}#saidwali-quick-language button.active{background:#d9ae52;color:#071a35}';
    document.head.appendChild(style);
    document.body.appendChild(menu);
  }

  function init() {
    addLanguageMenuIfMissing();
    setDirection(selected);
    attachLanguageEngine();
    markActive(selected);
  }

  window.changeLanguage = function (lang, button) {
    applySelectedLanguage(lang, true);
    if (button && button.parentElement) {
      button.parentElement.querySelectorAll("button").forEach(function (b) {
        b.classList.toggle("active", b === button);
      });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else init();
})();