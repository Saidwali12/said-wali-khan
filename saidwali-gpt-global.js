(function () {
  if (window.__saidwaliGPTGlobalLoaded) return;
  window.__saidwaliGPTGlobalLoaded = true;

  var CHAT_URL = "https://saidwali-gpt.walizaad2.workers.dev/";
  /* انځور به د GitHub په اصلي فولډر کې د همدې نوم په وسیله واچول شي */
  var AVATAR_URL = "https://saidwali12.github.io/said-wali-khan/saidwali-gpt-avatar.png?v=20261103";

  var rawLang = (document.documentElement.lang || "ps").toLowerCase();
  var language = rawLang.indexOf("ur") === 0 ? "ur" :
    rawLang.indexOf("fa") === 0 ? "fa" :
    rawLang.indexOf("en") === 0 ? "en" :
    rawLang.indexOf("ar") === 0 ? "ar" : "ps";

  var words = {
    ps: {
      hint: "ایا د AI مرستې ته اړتیا لرئ؟",
      head: "Saidwali GPT — هوښیار مرستیال",
      bye: "↩ خدای پامان — بېرته پاڼې ته",
      open: "د GPT مرستیال پرانیستل",
      close: "بندول"
    },
    fa: {
      hint: "آیا به کمک هوش مصنوعی نیاز دارید؟",
      head: "Saidwali GPT — دستیار هوشمند",
      bye: "↩ خداحافظ — بازگشت به صفحه",
      open: "باز کردن دستیار GPT",
      close: "بستن"
    },
    en: {
      hint: "Need help from AI?",
      head: "Saidwali GPT — Smart Assistant",
      bye: "↩ Goodbye — return to page",
      open: "Open GPT assistant",
      close: "Close"
    },
    ur: {
      hint: "کیا آپ کو AI کی مدد درکار ہے؟",
      head: "Saidwali GPT — ذہین معاون",
      bye: "↩ خدا حافظ — صفحے پر واپس جائیں",
      open: "GPT معاون کھولیں",
      close: "بند کریں"
    },
    ar: {
      hint: "هل تحتاج إلى مساعدة الذكاء الاصطناعي؟",
      head: "Saidwali GPT — المساعد الذكي",
      bye: "↩ مع السلامة — العودة إلى الصفحة",
      open: "افتح مساعد GPT",
      close: "إغلاق"
    }
  };
  var t = words[language];

  var style = document.createElement("style");
  style.id = "swgpt-global-style";
  style.textContent = [
    "/* د پخوانۍ مرستې کړکۍ پټول؛ نوی GPT یې ځای نیسي */",
    "#sw-help-prompt,#sw-help-panel,#sw-help-tab{display:none!important;visibility:hidden!important;pointer-events:none!important}",
    "#swgpt-float{position:fixed;right:20px;bottom:22px;z-index:2147482000;width:62px;height:62px;padding:0;border:2px solid #f4d58a;border-radius:50%;background:#071a35;box-shadow:0 7px 24px rgba(0,0,0,.30);cursor:grab;display:grid;place-items:center;touch-action:none;user-select:none;overflow:visible}",
    "#swgpt-float:active{cursor:grabbing;transform:scale(.97)}",
    "#swgpt-float img{width:100%;height:100%;object-fit:cover;border-radius:50%;display:block}",
    "#swgpt-float:after{content:'';position:absolute;right:1px;top:1px;width:11px;height:11px;border-radius:50%;background:#39c879;border:2px solid #071a35}",
    "#swgpt-hint{position:fixed;right:94px;bottom:30px;z-index:2147482001;max-width:min(290px,72vw);padding:10px 14px;border-radius:14px 14px 4px 14px;background:#071a35;color:#fff;border:1px solid #d9ae52;box-shadow:0 7px 25px rgba(0,0,0,.22);font:13px/1.8 Tahoma,Arial,sans-serif;direction:rtl;opacity:0;transform:translateY(9px);transition:opacity .25s,transform .25s;cursor:pointer}",
    "#swgpt-hint.swgpt-visible{opacity:1;transform:translateY(0)}",
    "#swgpt-hint b{color:#f4d58a}#swgpt-hint button{border:0;background:transparent;color:#f4d58a;font-size:17px;cursor:pointer;margin-inline-start:8px}",
    "#swgpt-panel{position:fixed;right:18px;bottom:18px;z-index:2147482500;width:min(390px,44vw,calc(100vw - 28px));height:min(650px,78vh);min-height:360px;background:#f4f6fa;border:2px solid #d9ae52;border-radius:17px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 16px 48px rgba(0,0,0,.32);opacity:0;visibility:hidden;transform:translateY(16px) scale(.985);transform-origin:bottom right;transition:opacity .2s,transform .2s,visibility .2s;font-family:Tahoma,Arial,sans-serif}",
    "#swgpt-panel.swgpt-open{opacity:1;visibility:visible;transform:translateY(0) scale(1)}",
    "#swgpt-chat-head{flex:0 0 58px;min-height:58px;padding:7px 10px;display:flex;align-items:center;gap:9px;color:#f4d58a;background:linear-gradient(120deg,#071a35,#173e6c);border-bottom:2px solid #d9ae52;cursor:move;touch-action:none;user-select:none}",
    "#swgpt-avatar{width:42px;height:42px;flex:0 0 42px;object-fit:cover;border-radius:50%;border:2px solid #f4d58a;background:#173e6c}",
    "#swgpt-head-title{font:bold 13px/1.5 Tahoma,Arial,sans-serif;flex:1;min-width:0}",
    "#swgpt-chat-close{flex:0 0 auto;border:1px solid #d9ae52;background:transparent;color:#f4d58a;border-radius:8px;width:34px;height:34px;cursor:pointer;font-size:22px;line-height:1}",
    "#swgpt-frame{display:block;border:0;width:100%;height:100%;flex:1;min-height:0;background:#f4f6fa}",
    "#swgpt-goodbye{align-self:center;flex:0 0 auto;width:calc(100% - 24px);margin:7px 12px 9px;border:1px solid #b68a32;border-radius:22px;background:linear-gradient(100deg,#f4d58a,#d9ae52);color:#071a35;padding:10px 8px;font:bold 12px Tahoma,Arial,sans-serif;cursor:pointer;box-shadow:0 3px 10px rgba(7,26,53,.15);transition:background .2s,color .2s,transform .2s,box-shadow .2s;animation:swgptByePulse 2.8s ease-in-out infinite}",
    "#swgpt-goodbye:hover,#swgpt-goodbye:focus-visible{background:#071a35;color:#f4d58a;transform:translateY(-2px);box-shadow:0 6px 15px rgba(7,26,53,.25);outline:2px solid #d9ae52;outline-offset:2px}",
    "@keyframes swgptByePulse{0%,100%{box-shadow:0 3px 10px rgba(7,26,53,.14)}50%{box-shadow:0 4px 15px rgba(217,174,82,.55)}}"
    "@media(max-width:600px){#swgpt-float{width:55px;height:55px;right:12px;bottom:14px}#swgpt-hint{right:76px;bottom:20px;max-width:calc(100vw - 100px);font-size:12px;padding:8px 10px}#swgpt-panel{right:8px;bottom:8px;width:calc(100vw - 16px);height: min(82vh,720px);min-height:300px;border-radius:13px}#swgpt-chat-head{flex-basis:52px;min-height:52px}#swgpt-avatar{width:38px;height:38px;flex-basis:38px}#swgpt-head-title{font-size:12px}#swgpt-goodbye{padding:9px 5px;font-size:12px}}",
    "@media(max-height:430px) and (max-width:900px){#swgpt-panel{height:calc(100vh - 16px);min-height:0}}",
    "@media(prefers-reduced-motion:reduce){#swgpt-hint,#swgpt-panel{transition:none}}"
  ].join("\n");
  document.head.appendChild(style);

  function closeChat() {
    var panel = document.getElementById("swgpt-panel");
    if (!panel) return;
    panel.classList.remove("swgpt-open");
    panel.setAttribute("aria-hidden", "true");
    window.setTimeout(function () {
      if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
    }, 220);
  }

  function openChat() {
    var old = document.getElementById("swgpt-panel");
    if (old) {
      old.classList.add("swgpt-open");
      old.setAttribute("aria-hidden", "false");
      return;
    }

    var panel = document.createElement("section");
    panel.id = "swgpt-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "false");
    panel.setAttribute("aria-label", "Saidwali GPT");
    panel.setAttribute("aria-hidden", "false");
    panel.innerHTML =
      "<header id='swgpt-chat-head'>" +
        "<img id='swgpt-avatar' src='" + AVATAR_URL + "' alt='Saidwali GPT'>" +
        "<span id='swgpt-head-title'>" + t.head + "</span>" +
        "<button id='swgpt-chat-close' type='button' aria-label='" + t.close + "' title='" + t.close + "'>×</button>" +
      "</header>" +
      "<iframe id='swgpt-frame' title='Saidwali GPT Chat' src='" + CHAT_URL + "' allow='clipboard-write; microphone' loading='eager'></iframe>" +
      "<button id='swgpt-goodbye' type='button'>" + t.bye + "</button>";

    document.body.appendChild(panel);
    window.requestAnimationFrame(function () { panel.classList.add("swgpt-open"); });

    panel.querySelector("#swgpt-goodbye").addEventListener("click", closeChat);
    panel.querySelector("#swgpt-chat-close").addEventListener("click", closeChat);

    var head = panel.querySelector("#swgpt-chat-head");
    var dragging = false, startX = 0, startY = 0, originX = 0, originY = 0;
    head.addEventListener("pointerdown", function (e) {
      if (e.target.closest("button")) return;
      dragging = true;
      var rect = panel.getBoundingClientRect();
      originX = rect.left;
      originY = rect.top;
      startX = e.clientX;
      startY = e.clientY;
      panel.style.left = originX + "px";
      panel.style.top = originY + "px";
      panel.style.right = "auto";
      panel.style.bottom = "auto";
      if (head.setPointerCapture) head.setPointerCapture(e.pointerId);
    });
    head.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var x = Math.max(4, Math.min(window.innerWidth - panel.offsetWidth - 4, originX + e.clientX - startX));
      var y = Math.max(4, Math.min(window.innerHeight - panel.offsetHeight - 4, originY + e.clientY - startY));
      panel.style.left = x + "px";
      panel.style.top = y + "px";
    });
    function stopDrag() { dragging = false; }
    head.addEventListener("pointerup", stopDrag);
    head.addEventListener("pointercancel", stopDrag);

    function onEscape(e) {
      if (e.key === "Escape") {
        closeChat();
        document.removeEventListener("keydown", onEscape);
      }
    }
    document.addEventListener("keydown", onEscape);
  }

  function showHint() {
    if (document.getElementById("swgpt-panel")) return;
    var existing = document.getElementById("swgpt-hint");
    if (existing) existing.remove();

    var hint = document.createElement("div");
    hint.id = "swgpt-hint";
    hint.setAttribute("role", "button");
    hint.setAttribute("tabindex", "0");
    hint.innerHTML = "<b>Saidwali GPT</b> — " + t.hint +
      " <button type='button' aria-label='" + t.close + "' title='" + t.close + "'>×</button>";
    document.body.appendChild(hint);
    window.requestAnimationFrame(function () { hint.classList.add("swgpt-visible"); });

    hint.addEventListener("click", function (e) {
      if (e.target.tagName === "BUTTON") {
        hint.remove();
        return;
      }
      hint.remove();
      openChat();
    });
    hint.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        hint.remove();
        openChat();
      }
    });
    window.setTimeout(function () {
      if (hint.isConnected) {
        hint.classList.remove("swgpt-visible");
        window.setTimeout(function () { if (hint.isConnected) hint.remove(); }, 260);
      }
    }, 3000);
  }

  function addFloatingButton() {
    if (document.getElementById("swgpt-float")) return;
    var btn = document.createElement("button");
    btn.id = "swgpt-float";
    btn.type = "button";
    btn.title = t.open;
    btn.setAttribute("aria-label", t.open);
    btn.innerHTML = "<img src='" + AVATAR_URL + "' alt=''>";
    document.body.appendChild(btn);

    var dragging = false, moved = false, startX = 0, startY = 0, origX = 0, origY = 0;
    btn.addEventListener("pointerdown", function (e) {
      dragging = true;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      var rect = btn.getBoundingClientRect();
      origX = rect.left;
      origY = rect.top;
      btn.style.left = origX + "px";
      btn.style.top = origY + "px";
      btn.style.right = "auto";
      btn.style.bottom = "auto";
      if (btn.setPointerCapture) btn.setPointerCapture(e.pointerId);
    });
    btn.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) > 7) moved = true;
      if (!moved) return;
      var x = Math.max(4, Math.min(window.innerWidth - btn.offsetWidth - 4, origX + dx));
      var y = Math.max(4, Math.min(window.innerHeight - btn.offsetHeight - 4, origY + dy));
      btn.style.left = x + "px";
      btn.style.top = y + "px";
      if (e.cancelable) e.preventDefault();
    });
    function stopButtonDrag() { dragging = false; }
    btn.addEventListener("pointerup", stopButtonDrag);
    btn.addEventListener("pointercancel", stopButtonDrag);
    btn.addEventListener("click", function (e) {
      if (moved) {
        e.preventDefault();
        moved = false;
        return;
      }
      var hint = document.getElementById("swgpt-hint");
      if (hint) hint.remove();
      openChat();
    });

    window.addEventListener("resize", function () {
      if (!btn.style.left) return;
      var rect = btn.getBoundingClientRect();
      btn.style.left = Math.max(4, Math.min(window.innerWidth - btn.offsetWidth - 4, rect.left)) + "px";
      btn.style.top = Math.max(4, Math.min(window.innerHeight - btn.offsetHeight - 4, rect.top)) + "px";
    });
  }

  function init() {
    addFloatingButton();
    /* لومړی مرستندوی پیغام د پاڼې له پرانیستلو ۸ ثانیې وروسته */
    window.setTimeout(showHint, 8000);
    /* وروسته د مرستې یادونه هر ۳۰ ثانیې؛ هر پیغام ۳ ثانیې ښکاري */
    window.setInterval(showHint, 30000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();