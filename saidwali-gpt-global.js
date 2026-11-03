(function () {
  if (window.__saidwaliGPTGlobalLoaded) return;
  window.__saidwaliGPTGlobalLoaded = true;
  var CHAT_URL = "https://saidwali-gpt.walizaad2.workers.dev/";
  var language = (document.documentElement.lang || "ps").toLowerCase();
  language = language.indexOf("ur") === 0 ? "ur" : language.indexOf("fa") === 0 ? "fa" : language.indexOf("en") === 0 ? "en" : "ps";
  var words = {
    ps:{hint:"ایا د AI مرستې ته اړتیا لرئ؟",head:"✦ Saidwali GPT — هوښیار مرستیال",bye:"✓ خدای پامان، زما مشکل حل شو"},
    fa:{hint:"آیا به کمک هوش مصنوعی نیاز دارید؟",head:"✦ Saidwali GPT — دستیار هوشمند",bye:"✓ خداحافظ، مشکلم حل شد"},
    en:{hint:"Need help from AI?",head:"✦ Saidwali GPT — Smart Assistant",bye:"✓ Goodbye, my problem is solved"},
    ur:{hint:"کیا آپ کو AI کی مدد درکار ہے؟",head:"✦ Saidwali GPT — ذہین معاون",bye:"✓ خدا حافظ، میرا مسئلہ حل ہو گیا"}
  };
  var t=words[language];
  var style = document.createElement("style");
  style.textContent = [
    "#swgpt-float{position:fixed;right:22px;bottom:24px;z-index:2147482000;width:58px;height:58px;border:2px solid #f4d58a;border-radius:50%;background:linear-gradient(145deg,#173b65,#071a35);color:#f4d58a;box-shadow:0 7px 24px rgba(0,0,0,.28);cursor:grab;display:grid;place-items:center;font:bold 23px Arial,sans-serif;touch-action:none;user-select:none}",
    "#swgpt-float:active{cursor:grabbing;transform:scale(.96)}",
    "#swgpt-float:after{content:'';position:absolute;right:2px;top:2px;width:10px;height:10px;border-radius:50%;background:#39c879;border:2px solid #071a35}",
    "#swgpt-hint{position:fixed;right:91px;bottom:30px;z-index:2147482001;max-width:min(290px,72vw);padding:11px 15px;border-radius:14px 14px 4px 14px;background:#071a35;color:#fff;border:1px solid #d9ae52;box-shadow:0 7px 25px rgba(0,0,0,.2);font:13px/1.8 Tahoma,Arial,sans-serif;direction:rtl;opacity:0;transform:translateY(8px);transition:opacity .25s,transform .25s;pointer-events:none}",
    "#swgpt-hint.swgpt-visible{opacity:1;transform:translateY(0)}",
    "#swgpt-hint b{color:#f4d58a}#swgpt-hint button{pointer-events:auto;border:0;background:transparent;color:#f4d58a;font-size:16px;cursor:pointer;margin-right:8px}",
    "#swgpt-chat-layer{position:fixed;inset:0;z-index:2147482500;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(3,12,27,.48);font-family:Tahoma,Arial,sans-serif;opacity:0;transition:opacity .2s}",
    "#swgpt-chat-layer.swgpt-open{opacity:1}",
    "#swgpt-chat-shell{width:min(760px,94vw);height:min(720px,82vh);background:#071a35;border:2px solid #d9ae52;border-radius:17px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 22px 70px rgba(0,0,0,.4);transform:translateY(12px);transition:transform .22s}",
    "#swgpt-chat-layer.swgpt-open #swgpt-chat-shell{transform:translateY(0)}",
    "#swgpt-chat-head{min-height:46px;padding:7px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px;color:#f4d58a;font:bold 14px Tahoma,Arial,sans-serif;background:#071a35}",
    "#swgpt-chat-close{border:1px solid #d9ae52;background:transparent;color:#f4d58a;border-radius:8px;padding:5px 11px;cursor:pointer;font-size:19px}",
    "#swgpt-frame{border:0;width:100%;flex:1;min-height:0;background:#f4f6fa}",
    "#swgpt-goodbye{border:0;border-top:2px solid #d9ae52;background:linear-gradient(90deg,#f4d58a,#d9ae52);color:#071a35;padding:11px 8px;font:bold 13px Tahoma,Arial,sans-serif;cursor:pointer}",
    "@media(max-width:600px){#swgpt-float{width:53px;height:53px;right:15px;bottom:17px}#swgpt-hint{right:77px;bottom:22px;font-size:12px}#swgpt-chat-layer{padding:8px}#swgpt-chat-shell{width:96vw;height:80vh;border-radius:13px}#swgpt-chat-head{min-height:42px;font-size:12px}#swgpt-goodbye{font-size:12px;padding:10px 5px}}",
    "@media(prefers-reduced-motion:reduce){#swgpt-hint,#swgpt-chat-layer,#swgpt-chat-shell{transition:none}}"
  ].join("");
  document.head.appendChild(style);

  function openChat() {
    if (document.getElementById("swgpt-chat-layer")) return;
    var layer = document.createElement("div");
    layer.id = "swgpt-chat-layer";
    layer.setAttribute("role", "dialog");
    layer.setAttribute("aria-modal", "true");
    layer.setAttribute("aria-label", "Saidwali GPT");
    layer.innerHTML =
      "<section id='swgpt-chat-shell'>" +
        "<header id='swgpt-chat-head'><span>" + t.head + "</span>" +
        "<button id='swgpt-chat-close' type='button' aria-label='Close'>×</button></header>" +
        "<iframe id='swgpt-frame' title='Saidwali GPT Chat' src='" + CHAT_URL + "' allow='clipboard-write; microphone' loading='eager'></iframe>" +
        "<button id='swgpt-goodbye' type='button'>" + t.bye + "</button>" +
      "</section>";
    document.body.appendChild(layer);
    requestAnimationFrame(function(){layer.classList.add("swgpt-open");});
    function close(){layer.classList.remove("swgpt-open");setTimeout(function(){layer.remove();},230);}
    layer.querySelector("#swgpt-goodbye").addEventListener("click",close);
    layer.querySelector("#swgpt-chat-close").addEventListener("click",close);
    layer.addEventListener("click",function(e){if(e.target===layer)close();});
    function esc(e){if(e.key==="Escape"&&document.getElementById("swgpt-chat-layer")){close();document.removeEventListener("keydown",esc);}}
    document.addEventListener("keydown",esc);
  }

  function showHint(){
    var hint=document.createElement("div");
    hint.id="swgpt-hint";
    hint.innerHTML="<b>Saidwali GPT</b> — "+t.hint+" <button type='button' aria-label='Close'>×</button>";
    document.body.appendChild(hint);
    requestAnimationFrame(function(){hint.classList.add("swgpt-visible");});
    hint.addEventListener("click",function(e){if(e.target.tagName==="BUTTON")hint.remove();else openChat();});
    setTimeout(function(){if(hint.isConnected)hint.remove();},9000);
  }

  function addFloatingButton(){
    if(document.getElementById("swgpt-float"))return;
    var btn=document.createElement("button");
    btn.id="swgpt-float";btn.type="button";btn.title="Saidwali GPT";btn.setAttribute("aria-label","Saidwali GPT");btn.textContent="S";
    document.body.appendChild(btn);
    var dragging=false,moved=false,startX=0,startY=0,origX=0,origY=0;
    function down(e){
      dragging=true;moved=false;startX=e.clientX;startY=e.clientY;
      var r=btn.getBoundingClientRect();origX=r.left;origY=r.top;
      btn.style.left=origX+"px";btn.style.top=origY+"px";btn.style.right="auto";btn.style.bottom="auto";
    }
    function move(e){
      if(!dragging)return;
      var dx=e.clientX-startX,dy=e.clientY-startY;
      if(Math.abs(dx)+Math.abs(dy)>7)moved=true;
      if(moved){
        var x=Math.max(4,Math.min(window.innerWidth-btn.offsetWidth-4,origX+dx));
        var y=Math.max(4,Math.min(window.innerHeight-btn.offsetHeight-4,origY+dy));
        btn.style.left=x+"px";btn.style.top=y+"px";
        if(e.cancelable)e.preventDefault();
      }
    }
    function up(){dragging=false;}
    btn.addEventListener("pointerdown",down);
    window.addEventListener("pointermove",move,{passive:false});
    window.addEventListener("pointerup",up);
    btn.addEventListener("click",function(e){if(moved){e.preventDefault();moved=false;return;}openChat();});
    window.addEventListener("resize",function(){
      if(!btn.style.left)return;
      var r=btn.getBoundingClientRect();
      btn.style.left=Math.max(4,Math.min(window.innerWidth-btn.offsetWidth-4,r.left))+"px";
      btn.style.top=Math.max(4,Math.min(window.innerHeight-btn.offsetHeight-4,r.top))+"px";
    });
  }

  function init(){addFloatingButton();setTimeout(showHint,8000);}
  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",init,{once:true});
  }else{init();}
})();