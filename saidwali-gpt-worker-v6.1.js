const HTML = String.raw`<!DOCTYPE html>
<html lang="ps" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#071a35">
<title>Saidwali GPT | هوښیار مرستیال</title>
<style>
:root{--navy:#071a35;--navy2:#10294c;--gold:#d9ae52;--gold2:#f4d58a;--bg:#f4f6fa;--white:#fff;--text:#17243a;--muted:#718096;--line:#e5e9f0;--green:#13865b}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font-family:Arial,"Noto Sans Arabic",sans-serif}
button,textarea,select{font:inherit}
button{cursor:pointer}
.app{height:100dvh;display:flex;overflow:hidden}
.sidebar{width:275px;background:var(--navy);color:#fff;display:flex;flex-direction:column;padding:18px;gap:14px;flex-shrink:0}
.brand{display:flex;align-items:center;gap:11px;padding:8px 3px 17px;border-bottom:1px solid #ffffff20}
.logo{width:43px;height:43px;border-radius:14px;background:linear-gradient(145deg,var(--gold2),var(--gold));display:grid;place-items:center;color:var(--navy);font-size:23px;font-weight:bold}
.brand h2{font-size:17px;margin:0 0 5px}
.brand small{color:#c3cede}
.newchat{background:var(--gold);color:var(--navy);border:0;border-radius:12px;padding:13px;font-weight:bold}
.side-label{font-size:12px;color:#aebbd0;margin:8px 3px 0}
.chatlist{overflow:auto;flex:1;display:flex;flex-direction:column;gap:6px}
.chatitem{border:0;background:transparent;color:#e8edf6;text-align:right;padding:11px;border-radius:9px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.chatitem.active,.chatitem:hover{background:#ffffff18}
.sidebottom{border-top:1px solid #ffffff20;padding-top:12px;color:#c3cede;font-size:12px;line-height:1.8}
.main{min-width:0;flex:1;display:flex;flex-direction:column;height:100%}
.topbar{height:60px;flex-shrink:0;background:#fff;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:0 22px;gap:12px}
.top-title{font-weight:bold;color:var(--navy);font-size:17px}
.top-actions{display:flex;align-items:center;gap:8px}
select{border:1px solid var(--line);border-radius:9px;padding:9px;background:#fff;color:var(--text);max-width:155px}
.smallbtn{border:1px solid var(--line);background:#fff;border-radius:9px;padding:9px 12px;color:var(--text)}
.smallbtn:hover{background:#f1f4f8}
.chatarea{flex:1;min-height:0;overflow:auto;padding:22px 16px 15px}
.messages{width:100%;max-width:1050px;margin:auto;display:flex;flex-direction:column;gap:20px}
.welcome{text-align:center;margin:auto;padding:35px 15px;max-width:570px}
.welcome-logo{width:74px;height:74px;border-radius:24px;margin:auto auto 18px;background:linear-gradient(145deg,var(--gold2),var(--gold));display:grid;place-items:center;font-size:36px;color:var(--navy);font-weight:bold}
.welcome h1{color:var(--navy);font-size:27px;margin:0 0 10px}
.welcome p{color:var(--muted);line-height:1.9}
.suggestions{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:20px}
.suggestion{background:white;border:1px solid var(--line);border-radius:20px;padding:10px 14px;color:#43516a}
.msg{width:100%;display:flex;gap:12px;max-width:100%;align-items:flex-start;direction:ltr}
.msg.user{justify-content:flex-end;flex-direction:row}
.msg.assistant{justify-content:flex-start;flex-direction:row}
.avatar{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:#e8edf5;color:var(--navy);font-weight:bold;overflow:hidden}
.msg.assistant .avatar{border:2px solid var(--gold);background:#fff}
.avatar img{width:100%;height:100%;object-fit:cover;display:block}
.message-content{min-width:0;width:fit-content;max-width:92%;display:flex;flex-direction:column;align-items:flex-start}
.msg.user .message-content{max-width:75%;align-items:flex-end}
.assistant-label{direction:rtl;text-align:right;color:var(--navy);font-size:13px;font-weight:bold;margin:0 4px 7px}
.bubble{width:100%;padding:18px 21px;border-radius:16px;background:#fff;border:1px solid var(--line);line-height:1.95;font-size:16px;white-space:pre-wrap;overflow-wrap:anywhere;unicode-bidi:plaintext;text-align:start;box-shadow:0 3px 12px #10294c08}
.msg.user .bubble{background:#e8effb;border-color:#d5e0f2;font-size:15px;padding:12px 15px}
.msgtools{display:flex;gap:7px;margin-top:9px;flex-wrap:wrap}
.msgtools button{font-size:12px;border:1px solid var(--line);background:#fff;border-radius:7px;padding:5px 9px;color:#59677b}
.typing{color:var(--muted);font-size:13px;padding:10px}
.composer-wrap{background:#fff;border-top:1px solid var(--line);padding:8px 16px 7px;flex-shrink:0}
.composer{max-width:900px;margin:auto;border:1px solid #d9e0eb;border-radius:15px;padding:7px 9px;background:#fff;box-shadow:0 5px 22px #10294c0a}
#prompt{width:100%;resize:vertical;border:0;outline:0;min-height:38px;max-height:95px;padding:5px 8px;background:transparent;color:var(--text);line-height:1.6}
.tools{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.toolgroup{display:flex;gap:7px;align-items:center;flex-wrap:wrap}
.toolbtn{border:1px solid var(--line);background:#fff;border-radius:10px;padding:8px 10px;color:#47566d}
.toolbtn.active{background:#fff4d9;border-color:var(--gold);color:#775510}
.voice-mode{background:#e9f8f1!important;border-color:#13865b!important;color:#09613f!important;font-weight:bold}
.send{background:var(--navy);color:#fff;border:0;border-radius:11px;padding:9px 18px;font-weight:bold}
.send:disabled{opacity:.5;cursor:not-allowed}
#fileinfo{font-size:12px;color:var(--green);padding:3px 7px}
.footer-note{text-align:center;color:#98a2b2;font-size:10px;padding-top:5px}
.status{font-size:12px;color:var(--muted);min-height:16px;text-align:center}
.hidden{display:none!important}
#file{display:none}
@media(max-width:700px){
 .sidebar{width:58px;padding:10px 5px;align-items:center}
 .brand{border:0;padding:4px}
 .brand .logo{width:40px;height:40px}
 .brandtext,.side-label,.chatlist,.sidebottom{display:none}
 .newchat{font-size:0;width:43px;height:43px;padding:0}
 .newchat:after{content:"+";font-size:24px}
 .topbar{height:54px;padding:0 8px}
 .top-title{font-size:14px}
 .top-actions{gap:5px}
 select{max-width:100px;padding:6px;font-size:11px}
 .smallbtn{padding:6px 8px;font-size:11px}
 .chatarea{padding:14px 8px}
 .messages{gap:15px}
 .msg{gap:7px}
 .message-content{max-width:calc(100% - 42px)}
 .msg.user .message-content{max-width:82%}
 .bubble{padding:12px 13px;font-size:15px;line-height:1.85}
 .msg.user .bubble{font-size:13px;padding:10px 11px}
 .avatar{width:32px;height:32px}
 .assistant-label{font-size:12px;margin-bottom:5px}
 .composer-wrap{padding:7px}
 .composer{padding:6px 7px}
 #prompt{min-height:35px;max-height:75px;font-size:14px}
 .toolgroup{gap:4px}
 .toolbtn{padding:7px;font-size:11px}
 .send{padding:8px 13px;font-size:13px}
 .welcome h1{font-size:21px}
 .footer-note{font-size:9px}
}
</style>
</head>
<body>
<div class="app">
 <aside class="sidebar">
  <div class="brand">
   <div class="logo">S</div>
   <div class="brandtext"><h2>Saidwali GPT</h2><small>هوښیار مرستیال</small></div>
  </div>
  <button class="newchat" id="newChat">＋ نوې خبرې</button>
  <div class="side-label">د خبرو تاریخچه</div>
  <div class="chatlist" id="chatList"></div>
  <div class="sidebottom">Saidwali GPT<br>د زده‌کړې، لیکلو، ژباړې او معلوماتو مرستیال</div>
 </aside>
 <main class="main">
  <header class="topbar">
   <div class="top-title">Saidwali GPT</div>
   <div class="top-actions">
    <select id="language" aria-label="ژبه">
     <option value="ps">پښتو</option>
     <option value="fa">دري</option>
     <option value="en">English</option>
     <option value="ur">اردو</option>
     <option value="ar">العربية</option>
     <option value="auto" selected>اتومات ژبه</option>
    </select>
    <button class="smallbtn" id="notifyBtn" type="button">🔔 خبرتیا: بنده</button>
     <button class="smallbtn" id="clearChat">پاکول</button>
   </div>
  </header>
  <section class="chatarea" id="chatArea">
   <div class="messages" id="messages">
    <div class="welcome" id="welcome">
     <div class="welcome-logo">S</div>
     <h1>ښه راغلاست Saidwali GPT ته</h1>
     <p>زه ستاسو د پوښتنو، زده‌کړې، ژباړې، لیکلو، کوډ جوړولو او معلوماتو په برخه کې مرسته کوم. خپله پوښتنه ولیکئ.</p>
     <div class="suggestions">
      <button class="suggestion" data-prompt="د انګلیسي ژبې زده کړه راته پیل کړه">د انګلیسي زده کړه</button>
      <button class="suggestion" data-prompt="دا متن راته په رسمي پښتو وژباړه">ژباړه</button>
      <button class="suggestion" data-prompt="د یوې رسمي ادارې لپاره راپور جوړ کړه">رسمي راپور</button>
      <button class="suggestion" data-prompt="د HTML ویب‌سایټ کوډ راته جوړ کړه">کوډ جوړول</button>
     </div>
    </div>
   </div>
  </section>
  <div class="composer-wrap">
   <div class="composer">
    <textarea id="prompt" placeholder="خپله پوښتنه دلته ولیکئ..." rows="1"></textarea>
    <div id="fileinfo"></div><div id="imagePreview" style="display:none;margin:8px 0"></div>
    <div class="tools">
     <div class="toolgroup">
      <button class="toolbtn" id="attachBtn" title="فایل یا انځور">📎 فایل</button>
      <input id="file" type="file" accept="image/*,.txt,.md,.csv,.json,.pdf,.docx">
      <button class="toolbtn" id="micBtn" title="غږیز لیکل">🎙️ غږ</button>
      <button class="toolbtn" id="voiceChatBtn" title="پرله‌پسې غږیزې خبرې">🗣️ غږیزې خبرې پیل</button>
      <button class="toolbtn" id="searchBtn" title="د انټرنېټ لټون">🌐 لټون: بند</button>
     </div>
     <button class="send" id="sendBtn">لېږل ➤</button>
    </div>
   </div>
   <div class="footer-note">د AI ځوابونه کله ناکله تېروتنه لرلای شي؛ مهم معلومات له باوري سرچینو سره تایید کړئ.</div>
   <div class="status" id="status"></div>
  </div>
 </main>
</div>
<script>
(function(){
"use strict";
var $=function(id){return document.getElementById(id)};
var lang=$("language"),promptBox=$("prompt"),messagesBox=$("messages");
var chats=[],activeId=null,history=[],selectedImage=null,selectedText="",selectedName="";
var searching=false,busy=false,recognition=null;
var voiceMode=false,voiceRecognition=null,voiceRestartTimer=null,voiceSpeaking=false,voiceErrorCount=0;
 var notifyEnabled=false;
var AVATAR_URL="https://saidwali12.github.io/said-wali-khan/saidwali-gpt-avatar.png?v=3";
function clearImagePreview(){var p=$("imagePreview");if(p){p.innerHTML="";p.style.display="none"}}
function showImagePreview(dataUrl,name){var p=$("imagePreview");if(!p)return;p.innerHTML="";var wrap=document.createElement("div");wrap.style.cssText="display:flex;align-items:center;gap:10px;padding:8px;border:1px solid #d9ae52;border-radius:12px;background:#fff";var im=document.createElement("img");im.src=dataUrl;im.alt="د لېږل کېدونکي انځور مخکتنه";im.style.cssText="width:76px;height:76px;object-fit:cover;border-radius:9px";var info=document.createElement("div");info.style.cssText="font-size:13px;flex:1";info.textContent="انځور چمتو دی: "+name;var remove=document.createElement("button");remove.type="button";remove.textContent="لرې کول ✕";remove.style.cssText="border:0;background:#f3e6c8;padding:7px 10px;border-radius:8px;cursor:pointer";remove.onclick=function(){selectedImage=null;selectedName="";$("file").value="";$("fileinfo").textContent="";clearImagePreview()};wrap.appendChild(im);wrap.appendChild(info);wrap.appendChild(remove);p.appendChild(wrap);p.style.display="block"}
var labels={
 ps:{placeholder:"خپله پوښتنه دلته ولیکئ...",send:"لېږل ➤",newchat:"＋ نوې خبرې",clear:"پاکول",searchOn:"🌐 لټون: فعال",searchOff:"🌐 لټون: بند",welcome:"ښه راغلاست Saidwali GPT ته",error:"بښنه غواړم، تخنیکي ستونزه رامنځته شوه."},
 fa:{placeholder:"پرسش خود را اینجا بنویسید...",send:"ارسال ➤",newchat:"＋ گفتگوی جدید",clear:"پاک کردن",searchOn:"🌐 جستجو: روشن",searchOff:"🌐 جستجو: خاموش",welcome:"به Saidwali GPT خوش آمدید",error:"متأسفم، یک مشکل فنی رخ داد."},
 en:{placeholder:"Write your question here...",send:"Send ➤",newchat:"＋ New chat",clear:"Clear",searchOn:"🌐 Search: On",searchOff:"🌐 Search: Off",welcome:"Welcome to Saidwali GPT",error:"Sorry, a technical error occurred."},
 ur:{placeholder:"اپنا سوال یہاں لکھیں...",send:"بھیجیں ➤",newchat:"＋ نئی گفتگو",clear:"صاف کریں",searchOn:"🌐 تلاش: آن",searchOff:"🌐 تلاش: بند",welcome:"Saidwali GPT میں خوش آمدید",error:"معذرت، تکنیکی مسئلہ پیش آیا۔"},
 ar:{placeholder:"اكتب سؤالك هنا...",send:"إرسال ➤",newchat:"＋ محادثة جديدة",clear:"مسح",searchOn:"🌐 البحث: تشغيل",searchOff:"🌐 البحث: إيقاف",welcome:"مرحباً بك في Saidwali GPT",error:"عذراً، حدث خطأ تقني."}
};
function currentLang(){return lang.value==="auto"?"ps":lang.value}
function save(){try{localStorage.setItem("saidwali_gpt_chats_v5",JSON.stringify(chats));localStorage.setItem("saidwali_gpt_active_v5",activeId||"")}catch(e){}}
function makeId(){return String(Date.now())+String(Math.floor(Math.random()*9999))}
function newChat(){
 var c={id:makeId(),title:"نوې خبرې",messages:[]};chats.unshift(c);activeId=c.id;history=[];save();renderAll();
}
function activeChat(){return chats.find(function(c){return c.id===activeId})}
function loadChat(id){activeId=id;var c=activeChat();history=c?c.messages.slice():[];selectedImage=null;selectedText="";selectedName="";$("fileinfo").textContent="";renderAll();save()}
function renderList(){
 var box=$("chatList");box.innerHTML="";
 chats.forEach(function(c){
  var b=document.createElement("button");b.className="chatitem"+(c.id===activeId?" active":"");b.textContent=c.title||"نوې خبرې";b.onclick=function(){loadChat(c.id)};box.appendChild(b);
 });
}
function addBubble(role,text,image){
 var welcome=$("welcome");if(welcome)welcome.classList.add("hidden");
 var row=document.createElement("div");row.className="msg "+role;
 var av=document.createElement("div");av.className="avatar";
 if(role==="user"){
  av.textContent="تاسو";
 }else{
  var avatarImg=document.createElement("img");
  avatarImg.src=AVATAR_URL;
  avatarImg.alt="سیدولي GPT";
  avatarImg.onerror=function(){av.textContent="SG";};
  av.appendChild(avatarImg);
 }
 var content=document.createElement("div");content.className="message-content";
 if(role==="assistant"){
  var label=document.createElement("div");
  label.className="assistant-label";
  label.textContent="سیدولي GPT جواب";
  content.appendChild(label);
 }
 var body=document.createElement("div");body.className="bubble";
 if(image){var im=document.createElement("img");im.src=image;im.style.maxWidth="220px";im.style.display="block";im.style.borderRadius="10px";im.style.marginBottom="8px";body.appendChild(im)}
 var tx=document.createElement("div");tx.textContent=text;body.appendChild(tx);
 content.appendChild(body);
 if(role==="assistant"){
  var tools=document.createElement("div");tools.className="msgtools";
  var copy=document.createElement("button");copy.textContent="کاپي";copy.onclick=function(){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(tx.textContent).then(function(){copy.textContent="کاپي شو"}).catch(function(){})}};
  var speak=document.createElement("button");speak.textContent="🔊 واورئ";speak.onclick=function(){speakText(tx.textContent)};
  tools.appendChild(copy);tools.appendChild(speak);content.appendChild(tools);
 }
 row.appendChild(av);row.appendChild(content);
 messagesBox.appendChild(row);$("chatArea").scrollTop=$("chatArea").scrollHeight;
 return tx;
}
function renderAll(){
 messagesBox.innerHTML="";
 if(!history.length){var w=document.createElement("div");w.className="welcome";w.id="welcome";
  var lg=document.createElement("div");lg.className="welcome-logo";lg.textContent="S";
  var h=document.createElement("h1");h.textContent=labels[currentLang()].welcome;
  var p=document.createElement("p");p.textContent="پوښتنه وکړئ، زه به ستاسو د وس مطابق مرسته وکړم.";
  w.appendChild(lg);w.appendChild(h);w.appendChild(p);
  var sug=document.createElement("div");sug.className="suggestions";
  ["د انګلیسي ژبې زده کړه راته پیل کړه","دا متن راته وژباړه","رسمي راپور جوړ کړه","د HTML کوډ راته جوړ کړه"].forEach(function(t){var b=document.createElement("button");b.className="suggestion";b.textContent=t;b.onclick=function(){promptBox.value=t;promptBox.focus()};sug.appendChild(b)});
  w.appendChild(sug);messagesBox.appendChild(w);
 }else{history.forEach(function(m){addBubble(m.role,m.content,m.image||null)})}
 renderList();
}
function setStatus(t){$("status").textContent=t||""}
 function notifyReply(text){if(!notifyEnabled||!("Notification" in window)||Notification.permission!=="granted")return;try{new Notification("Saidwali GPT — ځواب چمتو شو",{body:String(text||"ستاسو ځواب چمتو دی.").slice(0,180),icon:"https://saidwali12.github.io/said-wali-khan/saidwali-gpt-avatar.png"})}catch(e){}}
 $("notifyBtn").onclick=async function(){if(!("Notification" in window)){setStatus("دا براوزر د خبرتیاوو ملاتړ نه کوي.");return}if(Notification.permission==="denied"){setStatus("خبرتیاوې د براوزر په تنظیماتو کې بندې دي.");return}if(Notification.permission!=="granted"){try{var p=await Notification.requestPermission();if(p!=="granted"){setStatus("د خبرتیا اجازه ورنه کړل شوه.");return}}catch(e){setStatus("خبرتیا فعاله نه شوه.");return}}notifyEnabled=!notifyEnabled;this.textContent=notifyEnabled?"🔔 خبرتیا: فعاله":"🔔 خبرتیا: بنده";setStatus(notifyEnabled?"خبرتیا فعاله شوه؛ د پاڼې د پرانیستې پر مهال به د ځواب خبر درکړي.":"خبرتیا بنده شوه.")};
function speakText(text,onDone){
 if(!("speechSynthesis" in window)||!("SpeechSynthesisUtterance" in window)){
  setStatus("ستاسو براوزر د غږ لوستلو ملاتړ نه کوي.");if(onDone)onDone();return;
 }
 window.speechSynthesis.cancel();
 var u=new SpeechSynthesisUtterance(text);
 var l=lang.value;u.lang=({ps:"ps-AF",fa:"fa-IR",en:"en-US",ur:"ur-PK",ar:"ar-SA",auto:"ps-AF"})[l]||"ps-AF";
 u.rate=1;u.pitch=1;
 u.onend=function(){if(onDone)onDone()};
 u.onerror=function(){if(onDone)onDone()};
 window.speechSynthesis.speak(u);
}
function loadScript(src){
 return new Promise(function(resolve,reject){
  var s=document.createElement("script");s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);
 });
}
async function readFile(file){
 selectedImage=null;selectedText="";selectedName=file.name;
 if(file.size>8*1024*1024)throw new Error("فایل باید له ۸ MB څخه کوچنی وي.");
 if(file.type.indexOf("image/")===0){
  selectedImage=await new Promise(function(resolve,reject){var r=new FileReader();r.onload=function(){resolve(r.result)};r.onerror=reject;r.readAsDataURL(file)});showImagePreview(selectedImage,file.name);
 }else if(file.name.toLowerCase().endsWith(".pdf")){
  if(!window.pdfjsLib){await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");}
  pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  var buf=await file.arrayBuffer();var pdf=await pdfjsLib.getDocument({data:buf}).promise;var all=[];
  for(var i=1;i<=Math.min(pdf.numPages,20);i++){var pg=await pdf.getPage(i);var content=await pg.getTextContent();all.push(content.items.map(function(x){return x.str}).join(" "))}
  selectedText=all.join("\n").slice(0,30000);
 }else if(file.name.toLowerCase().endsWith(".docx")){
  if(!window.mammoth){await loadScript("https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js")}
  var ab=await file.arrayBuffer();var result=await mammoth.extractRawText({arrayBuffer:ab});selectedText=result.value.slice(0,30000);
 }else{
  selectedText=(await file.text()).slice(0,30000);
 }
 $("fileinfo").textContent="ضمیمه شوی فایل: "+file.name;
}
$("attachBtn").onclick=function(){$("file").click()};
$("file").onchange=async function(){
 var f=this.files&&this.files[0];if(!f)return;
 try{setStatus("فایل لوستل کېږي...");await readFile(f);setStatus("فایل چمتو شو.");}
 catch(e){setStatus("فایل ونه لوستل شو: "+e.message);selectedImage=null;selectedText="";selectedName="";clearImagePreview()}
};
$("searchBtn").onclick=function(){searching=!searching;this.classList.toggle("active",searching);this.textContent=searching?labels[currentLang()].searchOn:labels[currentLang()].searchOff};
$("newChat").onclick=newChat;
$("clearChat").onclick=function(){
 if(!confirm("د دې خبرو ټول پیغامونه پاک شي؟"))return;
 history=[];var c=activeChat();if(c)c.messages=[];selectedImage=null;selectedText="";selectedName="";$("fileinfo").textContent="";clearImagePreview();save();renderAll();
};
document.querySelectorAll(".suggestion").forEach(function(b){b.onclick=function(){promptBox.value=b.getAttribute("data-prompt")||b.textContent;promptBox.focus()}});
async function doSearch(q){
 var r=await fetch("/api/search",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:q})});
 var d=await r.json();if(!r.ok)throw new Error(d.error||"Search failed");
 return d.results||[];
}
async function send(voiceText){
 if(busy)return;
 var text=(typeof voiceText==="string"?voiceText:promptBox.value).trim();
 if(!text&&!selectedImage&&!selectedText)return;
 busy=true;$("sendBtn").disabled=true;setStatus("ځواب چمتو کېږي...");
 var shown=text||"د ضمیمه شوي فایل په اړه معلومات راکړه.";
 if(selectedText)shown+="\n\n[ضمیمه شوی فایل: "+selectedName+"]\n"+selectedText;
 if(selectedImage)shown+="\n\n[انځور ضمیمه شوی]";
 var image=selectedImage;
 history.push({role:"user",content:shown,image:image||null});
 addBubble("user",text||("ضمیمه: "+(selectedName||"انځور")),image);
 promptBox.value="";selectedImage=null;selectedText="";selectedName="";$("fileinfo").textContent="";clearImagePreview();$("file").value="";
 var searchContext="";
 try{
  if(searching&&text){
   setStatus("د انټرنېټ لټون روان دی...");
   try{var results=await doSearch(text);searchContext=results.map(function(x,i){return (i+1)+". "+x.title+"\n"+x.snippet+"\n"+x.url}).join("\n\n")}
   catch(se){searchContext="د انټرنېټ لټون دا ځل بریالی نه شو. د لټون پایلې مه جوړوه او دا محدودیت روښانه کړه."}
  }
  var payload={messages:history.slice(-12).map(function(m){return {role:m.role,content:m.content}}),language:lang.value,image:image,searchContext:searchContext};
  var res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
  if(!res.ok){var errData=await res.json().catch(function(){return {}});throw new Error(errData.error||"Server error")}
  var answer="",streamed=false;
  if((res.headers.get("content-type")||"").indexOf("text/event-stream")!==-1){
   streamed=true;
   var answerNode=addBubble("assistant","");
   var reader=res.body.getReader(),decoder=new TextDecoder(),buffer="";
   while(true){
    var part=await reader.read();if(part.done)break;
    buffer+=decoder.decode(part.value,{stream:true});
    var lines=buffer.split(/\r?\n/);buffer=lines.pop()||"";
    for(var li=0;li<lines.length;li++){
     var line=lines[li].trim();if(!line.startsWith("data:"))continue;
     var raw=line.slice(5).trim();if(!raw||raw==="[DONE]")continue;
     try{var eventData=JSON.parse(raw);var piece=eventData.response||(eventData.choices&&eventData.choices[0]&&eventData.choices[0].delta&&eventData.choices[0].delta.content)||"";if(piece){answer+=piece;answerNode.textContent=answer;$("chatArea").scrollTop=$("chatArea").scrollHeight}}catch(parseError){}
    }
   }
   if(buffer.trim()){
    var finalLine=buffer.trim();
    if(finalLine.startsWith("data:")){
     var finalRaw=finalLine.slice(5).trim();
     if(finalRaw&&finalRaw!=="[DONE]"){
      try{var finalData=JSON.parse(finalRaw);var finalPiece=finalData.response||(finalData.choices&&finalData.choices[0]&&finalData.choices[0].delta&&finalData.choices[0].delta.content)||"";if(finalPiece){answer+=finalPiece;answerNode.textContent=answer}}catch(finalParseError){}
     }
    }
   }
   if(!answer.trim())throw new Error("AI تش ځواب راولېږه.");
  }else{
   var data=await res.json();answer=data.answer||"ځواب ترلاسه نه شو."; 
  }
  history.push({role:"assistant",content:answer});
  if(!streamed)addBubble("assistant",answer);notifyReply(answer);
  if(voiceMode){voiceSpeaking=true;speakText(answer,function(){voiceSpeaking=false;if(voiceMode){setStatus("ځواب پای ته ورسېد؛ اوس خبرې وکړئ...");startVoiceRecognition()}})}
  var c=activeChat();if(c){c.messages=history.slice();if(c.title==="نوې خبرې"&&text)c.title=text.slice(0,35)}
  save();renderList();setStatus("");
 }catch(e){
  var err="ستونزه: "+e.message;
  history.push({role:"assistant",content:err});addBubble("assistant",err);setStatus("مهرباني وکړئ بیا هڅه وکړئ.");
  if(voiceMode){voiceSpeaking=true;speakText(err,function(){voiceSpeaking=false;if(voiceMode)startVoiceRecognition()})}
 }finally{
  busy=false;$("sendBtn").disabled=false;if(!voiceMode)promptBox.focus();
 }
}
$("sendBtn").onclick=send;
promptBox.addEventListener("input",function(){
 this.style.height="auto";
 this.style.height=Math.min(this.scrollHeight,95)+"px";
});
promptBox.addEventListener("keydown",function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}});
lang.onchange=function(){
 var l=labels[currentLang()];promptBox.placeholder=l.placeholder;$("sendBtn").textContent=l.send;$("newChat").textContent=l.newchat;$("clearChat").textContent=l.clear;
 $("searchBtn").textContent=searching?l.searchOn:l.searchOff;
 document.documentElement.lang=currentLang();document.documentElement.dir=currentLang()==="en"?"ltr":"rtl";
 if(voiceMode&&voiceRecognition){try{voiceRecognition.stop()}catch(e){}}
};
function stopVoiceConversation(message){
 voiceMode=false;
 if(voiceRestartTimer){clearTimeout(voiceRestartTimer);voiceRestartTimer=null}
 if(voiceRecognition){
  var old=voiceRecognition;voiceRecognition=null;
  old.onend=null;old.onerror=null;old.onresult=null;
  try{old.stop()}catch(e){}
  try{old.abort()}catch(e){}
 }
 if("speechSynthesis" in window)window.speechSynthesis.cancel();
 voiceSpeaking=false;
 $("voiceChatBtn").classList.remove("active","voice-mode");
 $("voiceChatBtn").textContent="🗣️ غږیزې خبرې پیل";
 if(message)setStatus(message);
}
function startVoiceRecognition(){
 if(!voiceMode||busy||voiceSpeaking||voiceRecognition)return;
 var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){stopVoiceConversation("دا براوزر د پرله‌پسې غږیزو خبرو ملاتړ نه کوي.");return}
 var rec=new SR(),handled=false;
 voiceRecognition=rec;
 rec.lang=({ps:"ps-AF",fa:"fa-IR",en:"en-US",ur:"ur-PK",ar:"ar-SA",auto:"ps-AF"})[lang.value]||"ps-AF";
 rec.continuous=false;rec.interimResults=false;rec.maxAlternatives=1;
 rec.onresult=function(event){
  if(handled)return;
  var transcript="";
  for(var i=event.resultIndex;i<event.results.length;i++){
   if(event.results[i].isFinal)transcript+=event.results[i][0].transcript;
  }
  transcript=transcript.trim();if(!transcript)return;
  handled=true;voiceErrorCount=0;
  if(voiceRecognition===rec)voiceRecognition=null;
  try{rec.stop()}catch(e){}
  promptBox.value=transcript;
  setStatus("ستاسو خبرې واورېدل شوې؛ ځواب چمتو کېږي...");
  send(transcript);
 };
 rec.onerror=function(event){
  if(!voiceMode)return;
  var err=event&&event.error?event.error:"unknown";
  if(err==="not-allowed"||err==="service-not-allowed"){
   stopVoiceConversation("مایکروفون ته اجازه نه ده ورکړل شوې. د براوزر له تنظیماتو اجازه ورکړئ.");
  }else if(err==="audio-capture"){
   stopVoiceConversation("مایکروفون ونه موندل شو؛ مایکروفون وګورئ.");
  }else if(err==="language-not-supported"){
   stopVoiceConversation("دا براوزر د ټاکل شوې ژبې غږ نه پېژني. د ژبې ملاتړ د براوزر له خدمت سره تړلی دی.");
  }else if(err!=="no-speech"&&err!=="aborted"){
   voiceErrorCount++;
   if(voiceErrorCount>=3){
    stopVoiceConversation("غږ څو ځله ونه پېژندل شو. د مایکروفون، انټرنېټ او ټاکلې ژبې ملاتړ وګورئ.");
   }else{
    setStatus("د غږ پېژندنې ستونزه؛ بیا هڅه کېږي ("+voiceErrorCount+"/3).");
   }
  }
 };
 rec.onend=function(){
  if(voiceRecognition===rec)voiceRecognition=null;
  if(voiceMode&&!busy&&!voiceSpeaking){
   if(voiceRestartTimer)clearTimeout(voiceRestartTimer);
   voiceRestartTimer=setTimeout(function(){voiceRestartTimer=null;startVoiceRecognition()},900);
  }
 };
 try{
  rec.start();setStatus("🎙️ غوږ نیول فعال دي؛ خبرې وکړئ...");
 }catch(e){
  if(voiceRecognition===rec)voiceRecognition=null;
  if(voiceMode){
   setStatus("مایکروفون پیل نه شو؛ بیا هڅه کېږي.");
   voiceRestartTimer=setTimeout(function(){voiceRestartTimer=null;startVoiceRecognition()},1800);
  }
 }
}
$("voiceChatBtn").onclick=function(){
 if(voiceMode){stopVoiceConversation("غږیزې خبرې ودرول شوې.");return}
 var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR||!("speechSynthesis" in window)){
  setStatus("ستاسو براوزر د غږیزو خبرو اړین ملاتړ نه لري.");return;
 }
 voiceMode=true;this.classList.add("active","voice-mode");
 this.textContent="⏹️ غږیزې خبرې ودروه";
 setStatus("د مایکروفون اجازه ورکړئ؛ بیا خبرې پیل کړئ...");
 startVoiceRecognition();
};
$("micBtn").onclick=function(){
 var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){setStatus("ستاسو براوزر غږیز لیکل نه ملاتړ کوي. د Chrome نوې نسخه یا بل براوزر وکاروئ.");return}
 if(recognition){recognition.stop();recognition=null;this.classList.remove("active");return}
 recognition=new SR();recognition.lang=({ps:"ps-AF",fa:"fa-IR",en:"en-US",ur:"ur-PK",ar:"ar-SA",auto:"ps-AF"})[lang.value]||"ps-AF";
 recognition.interimResults=true;recognition.continuous=false;
 recognition.onresult=function(e){var s="";for(var i=e.resultIndex;i<e.results.length;i++)s+=e.results[i][0].transcript;promptBox.value=s};
 recognition.onerror=function(){setStatus("غږ ونه پېژندل شو؛ د مایکروفون اجازه وګورئ.")};
 recognition.onend=function(){recognition=null;$("micBtn").classList.remove("active")};
 recognition.start();this.classList.add("active");setStatus("خبرې وکړئ؛ غږ مو لیکل کېږي...");
};
try{chats=JSON.parse(localStorage.getItem("saidwali_gpt_chats_v5")||"[]")}catch(e){chats=[]}
activeId=localStorage.getItem("saidwali_gpt_active_v5");
if(!chats.length){newChat()}else{if(!chats.some(function(c){return c.id===activeId}))activeId=chats[0].id;loadChat(activeId)}
lang.onchange();
})();
</script>
</body>
</html>`;

const ALLOWED_ORIGINS = [
  "https://saidwali12.github.io",
  "https://saidwali-gpt.walizaad2.workers.dev"
];
const CHAT_MODEL = "@cf/zai-org/glm-4.7-flash";
const VISION_MODEL = "@cf/qwen/qwen3.8-27b";

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}
function json(data, status, request) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(request)
    }
  });
}
function cleanText(value, max) {
  return String(value || "").slice(0, max || 12000);
}
function extractAnswer(result) {
  if (typeof result === "string") return result;
  if (!result) return "";
  return result.response || result.result || result.text ||
    (result.choices && result.choices[0] && result.choices[0].message &&
     result.choices[0].message.content) || JSON.stringify(result);
}
function decodeHtml(s) {
  return String(s || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, function(_, n) { return String.fromCharCode(Number(n)); })
    .replace(/\s+/g, " ").trim();
}
async function searchWeb(query) {
  const url = "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(query);
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; SaidwaliGPT/5.0)",
      "Accept": "text/html"
    }
  });
  if (!response.ok) throw new Error("د لټون سرچینه اوس ځواب نه ورکوي.");
  const html = await response.text();
  const results = [];
  const blocks = html.split(/class="result results_links[^"]*"/i).slice(1);
  for (const block of blocks.slice(0, 6)) {
    const link = block.match(/class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    const snippet = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/(?:a|div)>/i);
    if (!link) continue;
    let target = link[1].replace(/&amp;/g, "&");
    const uddg = target.match(/[?&]uddg=([^&]+)/);
    if (uddg) {
      try { target = decodeURIComponent(uddg[1]); } catch (_) {}
    }
    if (!/^https?:\/\//i.test(target)) continue;
    results.push({
      title: decodeHtml(link[2]),
      url: target,
      snippet: decodeHtml(snippet ? snippet[1] : "")
    });
  }
  return results;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(request) });
    }
    if (request.method === "GET" && url.pathname === "/api/health") {
      return json({
        success: true,
        service: "Saidwali GPT",
        status: "online",
        version: "6.1"
      }, 200, request);
    }
    if (request.method === "POST" && url.pathname === "/api/search") {
      try {
        const body = await request.json();
        const query = cleanText(body.query, 300).trim();
        if (!query) return json({ error: "د لټون پوښتنه ولیکئ." }, 400, request);
        const results = await searchWeb(query);
        return json({ success: true, results }, 200, request);
      } catch (error) {
        return json({ error: "د انټرنېټ لټون اوس کار ونه کړ. " + error.message }, 502, request);
      }
    }
    if (request.method === "POST" && url.pathname === "/api/chat") {
      try {
        if (!env.AI) {
          return json({ error: "د Cloudflare AI binding (AI) نه دی وصل شوی." }, 500, request);
        }
        const body = await request.json();
        const language = cleanText(body.language || "ps", 10);
        const languageNames = {
          ps: "Pashto (پښتو)",
          fa: "Dari (دري)",
          en: "English",
          ur: "Urdu (اردو)",
          ar: "Arabic (العربية)",
          auto: "the same language used by the user"
        };
        const langName = languageNames[language] || languageNames.ps;
        const systemPrompt =
          "You are Saidwali GPT, a highly capable professional multilingual assistant. " +
          (language === "auto"
            ? "LANGUAGE MODE: AUTOMATIC. Detect the language of the LATEST user message (not the assistant messages, browser language, page language, or previous turns). Reply entirely and exclusively in that same language. Supported languages are Pashto, Dari, English, Urdu, and Arabic. "
            : "LANGUAGE MODE: USER SELECTED. Reply entirely and exclusively in " + langName + ". Do not switch languages even if earlier messages used another language. ") +
          "In automatic mode, distinguish Pashto from Dari and Urdu carefully: use the actual words and grammar, not merely the writing system. Pashto commonly includes ګ، ټ، ډ، ړ، ڼ، څ، ځ، ښ، ږ; Urdu commonly includes ٹ، ڈ، ڑ، ں، ھ، ے; Dari uses standard Persian/Dari vocabulary and grammar. If the message is mixed, use the dominant natural language of the user's own words. Ignore code, URLs, numbers, and quoted foreign-language material when identifying the user's language. " +
          "Never add a second-language translation, bilingual greeting, or explanation in another language unless the user explicitly asks for translation. Keep the entire answer in the identified or selected language, including headings, lists, and follow-up questions. " +
          "Support Pashto, Dari, English, Urdu and Arabic with natural, fluent language. When the language is Pashto, use natural Pashto only and never drift into Dari. " +
          "Understand the exact intent and context; answer the actual request, not a loosely related topic. " +
          "Be accurate, thoughtful, practical and professional. Use clear structure and useful steps for complex tasks. " +
          "For simple questions answer directly; for complex tasks give complete, actionable detail. " +
          "For code, preserve existing features and provide complete coherent code. " +
          "For attached images, inspect visible details carefully and answer specifically about the image; the image is supplied as base64 input; never claim you cannot see an image that was provided. " +
          "For clothing or appearance questions, give practical advice based on visible details; do not claim to edit an image unless an image-generation system actually did so. " +
          "Ask at most one concise clarification only when essential information is missing. " +
          "Never invent facts, live news, search results, citations, or actions. Use supplied search results carefully and state uncertainty. " +
          "Do not claim to deploy code, open files, or perform actions unless actually done. Prefer helpful answers over generic disclaimers."; 
        const inputMessages = Array.isArray(body.messages) ? body.messages : [];
        const safeMessages = inputMessages.slice(-12).map(function(m) {
          return {
            role: m.role === "assistant" ? "assistant" : "user",
            content: cleanText(m.content, 8000)
          };
        }).filter(function(m) { return m.content.trim(); });
        if (!safeMessages.length) {
          return json({ error: "لومړی خپله پوښتنه ولیکئ." }, 400, request);
        }
        const searchContext = cleanText(body.searchContext, 9000);
        if (searchContext) {
          safeMessages.push({
            role: "user",
            content: "د کاروونکي د پوښتنې لپاره د ویب لټون پایلې لاندې دي. یوازې د دې پایلو پر بنسټ اړوند معلومات وکاروه؛ که پایلې کمزورې یا نامربوطې وي، دا خبره روښانه کړه:\n" + searchContext
          });
        }
        const image = typeof body.image === "string" ? body.image : "";
        let result;
        if (image) {
          if (!/^data:image\/(png|jpeg|jpg|webp);base64,/i.test(image)) {
            return json({ error: "د انځور بڼه ناسمه ده. PNG، JPG یا WEBP وکاروئ." }, 400, request);
          }
          if (image.length > 6500000) {
            return json({ error: "انځور ډېر لوی دی؛ تر ۴.۵ MB کوچنی انځور وټاکئ." }, 413, request);
          }
          // Keep the actual user question and send the image through the vision model's image input.
          const visionMessages = [
            { role: "system", content: systemPrompt },
            ...safeMessages,
            { role: "user", content: "د کاروونکي ضمیمه شوی انځور په دقت وګوره او د هغه اصلي پوښتنې ته د انځور پر بنسټ مشخص ځواب ورکړه." }
          ];
          result = await env.AI.run(VISION_MODEL, {
            messages: visionMessages,
            image: image,
            max_completion_tokens: 900,
            reasoning_effort: "low",
            temperature: 0.4
          });
        } else {
          const stream = await env.AI.run(CHAT_MODEL, {
            messages: [
              { role: "system", content: systemPrompt },
              ...safeMessages
            ],
            max_completion_tokens: 1000,
            reasoning_effort: "low",
            temperature: 0.45,
            stream: true
          });
          return new Response(stream, {
            status: 200,
            headers: {
              "Content-Type": "text/event-stream; charset=utf-8",
              "Cache-Control": "no-cache, no-transform",
              "X-Accel-Buffering": "no",
              ...corsHeaders(request)
            }
          });
        }
        const answer = extractAnswer(result);
        if (!answer) throw new Error("AI تش ځواب راولېږه.");
        return json({ success: true, answer: answer }, 200, request);
      } catch (error) {
        return json({
          error: "د AI ځواب ترلاسه نه شو: " + (error && error.message ? error.message : "ناڅرګنده ستونزه")
        }, 500, request);
      }
    }
    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "")) {
      return new Response(HTML, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
          ...corsHeaders(request)
        }
      });
    }
    return json({ success: false, error: "Not found" }, 404, request);
  }
};