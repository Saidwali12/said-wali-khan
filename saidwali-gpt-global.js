(function () {
  if (window.__saidwaliGPTGlobalLoaded) return;
  window.__saidwaliGPTGlobalLoaded = true;
  const CHAT_URL = "https://saidwali-gpt.walizaad2.workers.dev/";
  const style = document.createElement("style");
  style.textContent =
    "#swgpt-welcome-layer,#swgpt-chat-layer{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(3,12,27,.62);font-family:Tahoma,Arial,sans-serif;direction:rtl;opacity:1;transition:opacity .3s ease}" +
    "#swgpt-welcome-card{width:min(440px,94vw);padding:28px 24px 22px;color:#fff;text-align:center;border-radius:23px;border:2px solid #d9ae52;background:radial-gradient(circle at 15% 10%,rgba(217,174,82,.2),transparent 34%),linear-gradient(145deg,#071a35,#15375f);box-shadow:0 24px 80px rgba(0,0,0,.38);transform:translateY(0) scale(1);transition:transform .55s cubic-bezier(.2,.8,.2,1),opacity .45s}" +
    "#swgpt-welcome-card.swgpt-away{transform:translateX(130vw) rotate(8deg);opacity:0}" +
    "#swgpt-mark{width:66px;height:66px;margin:0 auto 14px;border-radius:20px;display:grid;place-items:center;font-size:32px;font-weight:bold;color:#071a35;background:linear-gradient(135deg,#f4d58a,#bd8b36);box-shadow:0 7px 22px rgba(217,174,82,.25)}" +
    "#swgpt-welcome-card h2{margin:8px 0 10px;color:#f4d58a;font-size:25px}" +
    "#swgpt-welcome-card p{margin:0 auto 20px;max-width:360px;color:#e7edf6;font-size:15px;line-height:2}" +
    ".swgpt-action{width:100%;display:block;padding:13px 15px;margin-top:10px;border-radius:12px;font:bold 15px Tahoma,Arial,sans-serif;cursor:pointer;transition:transform .2s,filter .2s}" +
    ".swgpt-action:hover{transform:translateY(-2px);filter:brightness(1.06)}" +
    "#swgpt-yes{border:0;color:#071a35;background:linear-gradient(135deg,#f4d58a,#c49339)}" +
    "#swgpt-no{border:1px solid #d9ae52;color:#f4d58a;background:rgba(255,255,255,.06)}" +
    "#swgpt-chat-layer{padding:clamp(5px,2vw,22px)}" +
    "#swgpt-chat-shell{width:min(1120px,100%);height:min(94vh,900px);background:#071a35;border:2px solid #d9ae52;border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 80px rgba(0,0,0,.45)}" +
    "#swgpt-chat-head{min-height:48px;padding:7px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px;color:#f4d58a;font:bold 14px Tahoma,Arial,sans-serif;background:#071a35}" +
    "#swgpt-chat-close{border:1px solid #d9ae52;background:transparent;color:#f4d58a;border-radius:8px;padding:7px 12px;cursor:pointer;font-size:18px}" +
    "#swgpt-frame{border:0;width:100%;flex:1;min-height:0;background:#f4f6fa}" +
    "#swgpt-goodbye{border:0;border-top:2px solid #d9ae52;background:linear-gradient(90deg,#f4d58a,#d9ae52);color:#071a35;padding:13px 10px;font:bold 14px Tahoma,Arial,sans-serif;cursor:pointer}" +
    "#swgpt-goodbye:hover{filter:brightness(1.04)}" +
    "@media(max-width:600px){#swgpt-welcome-card{padding:23px 18px 18px}#swgpt-welcome-card h2{font-size:21px}#swgpt-chat-shell{height:98vh;border-radius:12px}#swgpt-chat-head{min-height:42px}#swgpt-goodbye{padding:12px 6px;font-size:12px}}" +
    "@media(prefers-reduced-motion:reduce){#swgpt-welcome-card,#swgpt-welcome-layer{transition:none}}";
  document.head.appendChild(style);

  function closeLayer(layer) {
    if (!layer) return;
    layer.style.opacity = "0";
    setTimeout(function () { layer.remove(); }, 320);
  }

  function openChat() {
    var old = document.getElementById("swgpt-welcome-layer");
    if (old) old.remove();
    var layer = document.createElement("div");
    layer.id = "swgpt-chat-layer";
    layer.setAttribute("role", "dialog");
    layer.setAttribute("aria-modal", "true");
    layer.setAttribute("aria-label", "Saidwali GPT");
    layer.innerHTML =
      '<section id="swgpt-chat-shell">' +
        '<header id="swgpt-chat-head"><span>✦ Saidwali GPT — هوښیار مرستیال</span>' +
        '<button id="swgpt-chat-close" type="button" aria-label="بندول">×</button></header>' +
        '<iframe id="swgpt-frame" title="Saidwali GPT Chat" src="' + CHAT_URL + '" allow="clipboard-write" loading="eager"></iframe>' +
        '<button id="swgpt-goodbye" type="button">✓ خدای پامان، زما مشکل حل شو</button>' +
      '</section>';
    document.body.appendChild(layer);
    layer.querySelector("#swgpt-goodbye").addEventListener("click", function () { closeLayer(layer); });
    layer.querySelector("#swgpt-chat-close").addEventListener("click", function () { closeLayer(layer); });
    layer.addEventListener("click", function (e) { if (e.target === layer) closeLayer(layer); });
    document.addEventListener("keydown", function esc(e) {
      if (e.key === "Escape" && document.getElementById("swgpt-chat-layer")) {
        closeLayer(document.getElementById("swgpt-chat-layer"));
        document.removeEventListener("keydown", esc);
      }
    });
  }

  function showWelcome() {
    if (document.getElementById("swgpt-welcome-layer")) return;
    var layer = document.createElement("div");
    layer.id = "swgpt-welcome-layer";
    layer.setAttribute("role", "dialog");
    layer.setAttribute("aria-modal", "true");
    layer.setAttribute("aria-label", "د Saidwali GPT هرکلی");
    layer.innerHTML =
      '<section id="swgpt-welcome-card">' +
        '<div id="swgpt-mark">S</div><h2>Saidwali GPT</h2>' +
        '<p>ایا د AI مرستې ته اړتیا لرئ؟<br>خپله پوښتنه وکړئ او د خپل کار د حل لپاره له هوښیار مرستیال څخه مرسته ترلاسه کړئ.</p>' +
        '<button class="swgpt-action" id="swgpt-yes" type="button">هو، مرستې ته اړتیا لرم</button>' +
        '<button class="swgpt-action" id="swgpt-no" type="button">نه، مننه</button>' +
      '</section>';
    document.body.appendChild(layer);
    var card = layer.querySelector("#swgpt-welcome-card");
    function dismiss() {
      card.classList.add("swgpt-away");
      layer.style.background = "transparent";
      setTimeout(function () { layer.remove(); }, 520);
    }
    layer.querySelector("#swgpt-yes").addEventListener("click", openChat);
    layer.querySelector("#swgpt-no").addEventListener("click", dismiss);
    var startX = null;
    card.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, {passive:true});
    card.addEventListener("touchend", function (e) {
      if (startX !== null && startX - e.changedTouches[0].clientX > 85) dismiss();
      startX = null;
    }, {passive:true});
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(showWelcome, 450); }, {once:true});
  } else {
    setTimeout(showWelcome, 450);
  }
})();