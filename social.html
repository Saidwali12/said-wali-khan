<!DOCTYPE html>
<html lang="ps" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>سیدولي خان کوهستاني بوک</title>
<style>
*{ box-sizing:border-box; margin:0; padding:0; }
body{ font-family:Arial,sans-serif; background:#f0f2f5; color:#1c1e21; min-height:100vh; }
button{ cursor:pointer; }
#auth-view{ min-height:100vh; display:flex; justify-content:center; align-items:center; padding:15px; }
.auth-container{ width:100%; max-width:1000px; display:flex; gap:50px; align-items:center; justify-content:center; }
.auth-left{ flex:1; max-width:500px; }
.auth-left h1{ color:#1877f2; font-size:60px; font-weight:900; margin-bottom:15px; }
.auth-left p{ font-size:24px; font-weight:bold; }
.auth-card{ width:100%; max-width:400px; background:white; padding:20px; border-radius:10px; box-shadow:0 4px 15px rgba(0,0,0,.12); }
.input{ width:100%; padding:14px; margin-bottom:12px; border:1px solid #dddfe2; border-radius:7px; font-size:16px; outline:none; }
.btn-login{ width:100%; border:0; padding:13px; border-radius:7px; background:#1877f2; color:white; font-size:19px; font-weight:bold; }
.btn-register{ border:0; padding:12px 20px; border-radius:7px; background:#42b72a; color:white; font-size:17px; font-weight:bold; }
.divider{ height:1px; background:#dadde1; margin:20px 0; }
.modal{ display:none; position:fixed; inset:0; background:rgba(255, 255, 255, 0.9); z-index:1000; justify-content:center; align-items:center; padding:15px; }
.modal-box{ width:100%; max-width:430px; background:white; border-radius:10px; padding:22px; position:relative; box-shadow:0 10px 40px rgba(0,0,0,0.15); border: 1px solid #ccd0d5; }
.close{ position:absolute; left:15px; top:10px; font-size:28px; cursor:pointer; }
#main-view{ display:none; }
.navbar{ background:white; border-bottom:1px solid #dddfe2; padding:10px 20px; display:flex; justify-content:space-between; align-items:center; position:sticky; top:0; z-index:100; }
.nav-logo h2{ color:#1877f2; font-size:24px; font-weight: bold; }
.container{ width:100%; max-width:1100px; margin:20px auto; padding:0 15px; }
.grid{ display:grid; grid-template-columns:2fr 1fr; gap:20px; }
.card{ background:white; border:1px solid #dddfe2; border-radius:10px; padding:15px; margin-bottom:15px; }
.chat-box{ height:300px; background:#f0f2f5; border-radius:8px; padding:10px; overflow-y:auto; display:flex; flex-direction:column; gap:7px; }
.message{ max-width:80%; padding:8px 12px; border-radius:17px; font-size: 15px; }
.message.mine{ background:#1877f2; color:white; align-self:flex-start; }
.message.theirs{ background:#e4e6eb; color:#111; align-self:flex-end; }
</style>
</head>
<body>

<div id="auth-view">
    <div class="auth-container">
        <div class="auth-left">
            <h1>افغان بوک</h1>
            <p>د سیدولي خان کوهستاني پرمختللی بوک؛ احمد او محمود دلته ستاسو له حقیقتي ډېټابېس سره وصلېږي.</p>
        </div>
        <div class="auth-card">
            <input type="text" id="login-username" class="input" placeholder="کارن نوم (Username)">
            <input type="password" id="login-password" class="input" placeholder="پټ نوم (Password)">
            <button class="btn-login" onclick="handleLogin()">داخلېدل (Sign In)</button>
            <div class="divider"></div>
            <div style="text-align: center;">
                <button class="btn-register" onclick="toggleModal(true)">نوی حساب جوړول</button>
            </div>
        </div>
    </div>
</div>

<div class="modal" id="register-modal">
    <div class="modal-box">
        <span class="close" onclick="toggleModal(false)">&times;</span>
        <h2>حساب جوړول</h2>
        <input type="text" id="reg-username" class="input" placeholder="کارن نوم">
        <input type="email" id="reg-email" class="input" placeholder="ایمیل ادرس">
        <input type="password" id="reg-password" class="input" placeholder="پټ نوم">
        <button class="btn-register" style="width: 100%;" onclick="handleRegister()">ثبت نام (Sign Up)</button>
    </div>
</div>

<div id="main-view">
    <div class="navbar">
        <div class="nav-logo"><h2>افغان بوک سسټم</h2></div>
        <div><span id="current-user-display" style="font-weight:bold;">کارن</span> | <button onclick="handleLogout()">وتل</button></div>
    </div>
    <div class="container">
        <div class="grid">
            <div>
                <div class="card">
                    <textarea id="post-text" style="width:100%; height:70px; padding:10px; margin-bottom:10px;" placeholder="څه په فکر کې لرئ؟"></textarea>
                    <button class="btn-login" style="width:auto; padding:8px 20px;" onclick="createPost()">خپرول (Post)</button>
                </div>
                <div id="posts-container"></div>
            </div>
            <div>
                <div class="card">
                    <h3>خبرې اترې (احمد او محمود)</h3>
                    <div class="chat-box" id="chat-messages"></div>
                    <div style="display:flex; gap:5px; margin-top:10px;">
                        <input type="text" id="chat-input" class="input" style="margin:0;" placeholder="پیغام ولیکئ...">
                        <button class="btn-login" style="width:auto; padding:0 15px;" onclick="sendMessage()">لېږل</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
const API_BASE = "https://workers.dev"; 
let token = localStorage.getItem("token") || "";
let user = JSON.parse(localStorage.getItem("user")) || null;

window.onload = function() { if (token && user) { showMainApp(); } };
function toggleModal(show) { document.getElementById("register-modal").style.display = show ? "flex" : "none"; }

async function handleRegister() {
    const u = document.getElementById("reg-username").value.trim();
    const e = document.getElementById("reg-email").value.trim();
    const p = document.getElementById("reg-password").value.trim();
    if(!u || !p) return alert("فیلډونه ډک کړئ.");

    const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, email: e, password: p })
    });
    const data = await res.json();
    if(data.userId) { alert("حساب جوړ شو! اوس لاګین شئ."); toggleModal(false); } else { alert(data.message); }
}

async function handleLogin() {
    const u = document.getElementById("login-username").value.trim();
    const p = document.getElementById("login-password").value.trim();
    
    const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p })
    });
    const data = await res.json();
    if(data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        token = data.token; user = data.user;
        showMainApp();
    } else { alert(data.message); }
}

function showMainApp() {
    document.getElementById("auth-view").style.display = "none";
    document.getElementById("main-view").style.display = "block";
    document.getElementById("current-user-display").innerText = user.username;
    loadPosts();
    setInterval(loadChatMessages, 3000);
}

function handleLogout() { localStorage.clear(); location.reload(); }

async function createPost() {
    const txt = document.getElementById("post-text").value.trim();
    if(!txt) return;
    await fetch(`${API_BASE}/api/data/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ content: txt, user_id: user.id, privacy: "public", status: "published" })
    });
    document.getElementById("post-text").value = "";
    loadPosts();
}

async function loadPosts() {
    const r = await fetch(`${API_BASE}/api/data/posts`);
    const d = await r.json();
    const c = document.getElementById("posts-container");
    if(d.data) {
        c.innerHTML = "";
        d.data.forEach(p => { c.innerHTML += `<div class="card"><b>کارن آی ډي ${p.user_id}:</b><p>${p.content}</p></div>`; });
    }
}

async function sendMessage() {
    const msg = document.getElementById("chat-input").value.trim();
    if(!msg) return;
    await fetch(`${API_BASE}/api/data/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ conversation_id: 1, sender_id: user.id, content: msg, message_type: "text" })
    });
    document.getElementById("chat-input").value = "";
    loadChatMessages();
}

async function loadChatMessages() {
    if (!token) return;
    const r = await fetch(`${API_BASE}/api/data/messages`);
    const d = await r.json();
    const box = document.getElementById("chat-messages");
    if(d.data) {
        box.innerHTML = "";
        d.data.reverse().forEach(m => {
            const mine = m.sender_id == user.id ? "mine" : "theirs";
            box.innerHTML += `<div class="message ${mine}">${m.content}</div>`;
        });
        box.scrollTop = box.scrollHeight;
    }
}
</script>
</body>
</html>
