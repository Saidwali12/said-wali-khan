/* Saidwali site-wide language switcher.
   Uses Google's Website Translator widget; selected language is saved across pages. */
(function () {
  "use strict";
  var LANGS = [
    { code: "ps", label: "🇦🇫 پښتو" },
    { code: "fa", label: "دری" },
    { code: "en", label: "English" },
    { code: "ur", label: "اردو" },
    { code: "ar", label: "العربية" }
  ];
  var KEY = "saidwali-site-language";
  var selected = "ps";
  var initialized = false;
  try { selected = localStorage.getItem(KEY) || "ps"; } catch (e) {}
  if (!LANGS.some(function (x) { return x.code === selected; })) selected = "ps";

  function setDirection(lang) {
    var rtl = lang !== "en";
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", rtl ? "rtl" : "ltr");
    document.body && document.body.setAttribute("dir", rtl ? "rtl" : "ltr");
  }

  function setTranslateCookie(lang) {
    var value = "/ps/" + lang;
    document.cookie = "googtrans=" + value + ";path=/;max-age=31536000;SameSite=Lax";
    document.cookie = "googtrans=" + value + ";path=/said-wali-khan/;max-age=31536000;SameSite=Lax";
  }

  function selectGoogleLanguage(lang) {
    selected = lang;
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    setDirection(lang);
    setTranslateCookie(lang);
    var combo = document.querySelector(".goog-te-combo");
    if (combo) {
      combo.value = lang;
      combo.dispatchEvent(new Event("change"));
    } else if (lang === "ps") {
      location.reload();
    }
    document.querySelectorAll("[data-saidwali-lang]").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-saidwali-lang") === lang);
    });
  }

  // Keep compatibility with the language buttons already present on the pages.
  window.changeLanguage = function (lang, button) {
    if (!LANGS.some(function (x) { return x.code === lang; })) return;
    selectGoogleLanguage(lang);
    if (button && button.parentElement) {
      button.parentElement.querySelectorAll("button").forEach(function (b) {
        b.classList.toggle("active", b === button);
      });
    }
  };

  function addLanguageMenu() {
    if (document.getElementById("site-language-menu") ||
        document.querySelector('[onclick*="changeLanguage"]')) return;
    var menu = document.createElement("div");
    menu.id = "saidwali-quick-language";
    menu.innerHTML = '<button type="button" aria-label="Choose language">🌐 ژبه</button><div class="saidwali-lang-list"></div>';
    var list = menu.querySelector(".saidwali-lang-list");
    LANGS.forEach(function (lang) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = lang.label;
      b.setAttribute("data-saidwali-lang", lang.code);
      b.addEventListener("click", function () { selectGoogleLanguage(lang.code); menu.classList.remove("open"); });
      list.appendChild(b);
    });
    menu.querySelector("button").addEventListener("click", function () { menu.classList.toggle("open"); });
    var style = document.createElement("style");
    style.textContent = '#saidwali-quick-language{position:fixed;top:12px;left:12px;z-index:999999;font: bold 13px Tahoma,Arial,sans-serif;direction:rtl}#saidwali-quick-language>button{background:#102b50;color:#f4d58a;border:1px solid #d9ae52;border-radius:8px;padding:8px 12px;cursor:pointer}#saidwali-quick-language .saidwali-lang-list{display:none;position:absolute;top:42px;left:0;background:#fff;padding:6px;border-radius:9px;box-shadow:0 5px 20px #0004;min-width:120px}#saidwali-quick-language.open .saidwali-lang-list{display:grid;gap:4px}#saidwali-quick-language .saidwali-lang-list button{border:0;background:#f2f4f8;padding:8px;border-radius:6px;text-align:right;cursor:pointer;color:#102b50}#saidwali-quick-language button.active{background:#d9ae52;color:#071a35}#google_translate_element{position:fixed!important;left:-10000px!important;top:0!important;width:1px!important;height:1px!important;overflow:hidden!important}';
    document.head.appendChild(style);
    document.body.appendChild(menu);
  }

  function init() {
    if (initialized || !document.body) return;
    initialized = true;
    if (!document.getElementById("google_translate_element")) {
      var holder = document.createElement("div");
      holder.id = "google_translate_element";
      document.body.appendChild(holder);
    }
    addLanguageMenu();
    setDirection(selected);
    setTranslateCookie(selected);
    if (selected !== "ps") {
      var waitCount = 0;
      var timer = setInterval(function () {
        var combo = document.querySelector(".goog-te-combo");
        if (combo) {
          clearInterval(timer);
          combo.value = selected;
          combo.dispatchEvent(new Event("change"));
        } else if (++waitCount > 40) clearInterval(timer);
      }, 250);
    }
  }

  window.googleTranslateElementInit = function () {
    init();
    if (window.google && google.translate && google.translate.TranslateElement && !window.__saidwaliTranslateReady) {
      window.__saidwaliTranslateReady = true;
      new google.translate.TranslateElement({
        pageLanguage: "ps",
        includedLanguages: "ps,fa,en,ur,ar",
        autoDisplay: false
      }, "google_translate_element");
      if (selected !== "ps") {
        setTimeout(function () {
          var combo = document.querySelector(".goog-te-combo");
          if (combo) { combo.value = selected; combo.dispatchEvent(new Event("change")); }
        }, 700);
      }
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  var googleScript = document.createElement("script");
  googleScript.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  googleScript.async = true;
  document.head.appendChild(googleScript);
})();