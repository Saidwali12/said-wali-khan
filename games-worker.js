const ALLOWED_ORIGINS = new Set(["https://saidwali12.github.io"]);
const VERSION = "0.3.0";

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const h = {"Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"Content-Type,Authorization","Access-Control-Max-Age":"86400","Vary":"Origin","Cache-Control":"no-store"};
  if (origin && ALLOWED_ORIGINS.has(origin)) h["Access-Control-Allow-Origin"] = origin;
  return h;
}
function reply(req,data,status=200){return new Response(JSON.stringify(data),{status,headers:{...corsHeaders(req),"Content-Type":"application/json; charset=utf-8"}})}
function fail(req,error,status=400){return reply(req,{ok:false,error},status)}
async function readJson(req){try{const x=await req.json();return x&&typeof x==="object"&&!Array.isArray(x)?x:null}catch{return null}}
async function hashToken(t){const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t));return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,"0")).join("")}
function token(){return [...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,"0")).join("")}
function roomCode(){const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";return [...crypto.getRandomValues(new Uint8Array(8))].map(x=>c[x%c.length]).join("")}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=crypto.getRandomValues(new Uint32Array(1))[0]%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
async function currentPlayer(req,env){const a=req.headers.get("Authorization")||"",t=a.startsWith("Bearer ")?a.slice(7).trim():"";if(!/^[a-f0-9]{64}$/i.test(t))return null;return env.DB.prepare("SELECT id,display_name FROM game_players WHERE token_hash=?").bind(await hashToken(t)).first()}
async function membership(env,roomId,playerId){return env.DB.prepare("SELECT seat,team FROM game_room_players WHERE room_id=? AND player_id=?").bind(roomId,playerId).first()}
async function room(env,code){return env.DB.prepare("SELECT * FROM game_rooms WHERE room_code=?").bind(code).first()}
async function details(env,r){const p=await env.DB.prepare("SELECT rp.seat,rp.team,p.display_name FROM game_room_players rp JOIN game_players p ON p.id=rp.player_id WHERE rp.room_id=? ORDER BY rp.seat").bind(r.id).all();return {...r,state:JSON.parse(r.state_json||"{}"),players:p.results||[]}}
function seats(game,mode){if(game==="alquerque"&&mode==="two_players")return 2;if(["cards_hokm","cards_hearts"].includes(game)&&mode==="four_teams")return 4;if(game==="ludo"&&["two_players","four_teams"].includes(mode))return mode==="two_players"?2:4;return 0}
function deck(){const suits=["S","H","D","C"],ranks=["2","3","4","5","6","7","8","9","10","J","Q","K","A"];return shuffle(suits.flatMap(s=>ranks.map(r=>({suit:s,rank:r}))))}
function initialState(game,n){
 if(game==="cards_hokm"||game==="cards_hearts"){const d=deck(),hands=[0,1,2,3].map(i=>d.slice(i*13,(i+1)*13));return {started:true,phase:game==="cards_hokm"?"trump":"playing",hands,trick:[],tricks:[0,0],trump:null,leader:0,turn:0,round:1,scores:[0,0],played:[],message:game==="cards_hokm"?"د حکم رنګ د لومړي لوبغاړي له خوا ټاکل کېږي":"د زړه لوبه پیل شوه"}}
 if(game==="alquerque"){const b=Array(25).fill(null);for(let i=0;i<12;i++)b[i]="B";for(let i=13;i<25;i++)b[i]="W";return {started:true,board:b,turn:0,remaining:{B:12,W:12},selected:null,history:[],winner:null}}
 if(game==="ludo"){return {started:true,turn:0,dice:null,rolled:false,players:Array.from({length:n},(_,i)=>({seat:i+1,tokens:[-1,-1,-1,-1],finished:0})),winner:null,turns:0}}
 return {};
}
function nextSeat(s,n){return (s+1)%n}
function cardValue(r){return r==="A"?14:r==="K"?13:r==="Q"?12:r==="J"?11:Number(r)}
function playCard(st,seat,card,game){
 if(st.turn!==seat)return "اوس ستاسو نوبت نه دی.";
 if(game==="cards_hokm"&&st.phase==="trump"){if(seat!==0)return "د حکم رنګ د لومړي لوبغاړي ټاکي.";if(!["S","H","D","C"].includes(card?.suit))return "د حکم رنګ ناسم دی.";st.trump=card.suit;st.phase="playing";st.message="حکم وټاکل شو";return null}
 if(st.phase!=="playing")return "د کارت لوبه لا نه ده پیل شوې.";
 const hand=st.hands[seat],idx=hand.findIndex(c=>c.suit===card?.suit&&c.rank===card?.rank);if(idx<0)return "دا کارت ستاسو په لاس کې نشته.";
 if(st.trick.length){const lead=st.trick[0].card.suit;if(hand.some(c=>c.suit===lead)&&card.suit!==lead)return "که د پیل شوي رنګ کارت لرئ، باید هماغه رنګ واچوئ."}
 hand.splice(idx,1);st.trick.push({seat,card});st.played.push({seat,card});
 if(st.trick.length===4){const lead=st.trick[0].card.suit;let best=st.trick[0];for(const x of st.trick.slice(1)){const a=x.card.suit===st.trump&&game==="cards_hokm"?2:x.card.suit===lead?1:0,b=best.card.suit===st.trump&&game==="cards_hokm"?2:best.card.suit===lead?1:0;if(a>b||(a===b&&cardValue(x.card.rank)>cardValue(best.card.rank)))best=x}
 const winner=best.seat;st.tricks[winner%2]++;st.leader=winner;st.turn=winner;st.trick=[];if(st.hands.every(h=>h.length===0)){if(game==="cards_hokm"){st.scores[0]+=st.tricks[0];st.scores[1]+=st.tricks[1]}else{st.scores[0]+=st.played.filter(x=>x.card.suit==="H"&&x.seat%2===1).length;st.scores[1]+=st.played.filter(x=>x.card.suit==="H"&&x.seat%2===0).length}st.phase="finished";st.winner=st.scores[0]===st.scores[1]?"draw":st.scores[0]>st.scores[1]?0:1}else st.message="د لاس ګټونکی: لوبغاړی "+(winner+1);
 }else st.turn=nextSeat(seat,4);
 return null;
}
function ludoAction(st,seat,action,n){
 const p=st.players[seat];if(!p)return "لوبغاړی ناسم دی.";
 if(action.type==="roll"){if(st.turn!==seat||st.rolled)return "اوس د تاس نوبت نه دی.";st.dice=1+(crypto.getRandomValues(new Uint32Array(1))[0]%6);st.rolled=true;return null}
 if(action.type==="move"){if(st.turn!==seat||!st.rolled)return "لومړی خپل نوبت کې تاس واچوئ.";const k=Number(action.token);if(!Number.isInteger(k)||k<0||k>3)return "مهره ناسم انتخاب ده.";const pos=p.tokens[k];if(pos===-1&&st.dice!==6)return "د مهرې د وتلو لپاره شپږ ته اړتیا ده.";if(pos>=51)return "دا مهره کور ته رسېدلې ده.";p.tokens[k]=pos===-1?0:Math.min(56,pos+st.dice);if(p.tokens[k]===56)p.finished++;st.rolled=false;const six=st.dice===6;st.turn=six?seat:nextSeat(seat,n);st.turns++;if(p.finished===4){st.winner=seat;st.finished=true}st.dice=null;return null}
 return "د لډو حرکت ناسم دی.";
}
function alquerqueAdj(i){const r=Math.floor(i/5),c=i%5,a=[];for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]){const rr=r+dr,cc=c+dc;if(rr>=0&&rr<5&&cc>=0&&cc<5){if(Math.abs(dr)+Math.abs(dc)===2&&((r+c)%2!==0))continue;a.push(rr*5+cc)}}return a}
function alquerqueAction(st,seat,a){
 const color=seat===0?"B":"W";if(st.turn!==seat)return "اوس ستاسو نوبت نه دی.";
 if(a.type==="select"){const i=Number(a.from);if(!Number.isInteger(i)||i<0||i>24||st.board[i]!==color)return "خپل کاڼی انتخاب کړئ.";st.selected=i;return null}
 if(a.type==="move"){const from=Number(a.from),to=Number(a.to);if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||from>24||to<0||to>24||st.board[from]!==color||st.board[to]!==null)return "حرکت ناسم دی.";if(!alquerqueAdj(from).includes(to))return "دا ځای د کاڼي ګاونډی نه دی.";st.board[from]=null;st.board[to]=color;st.selected=null;st.turn=1-seat;return null}
 if(a.type==="capture"){const from=Number(a.from),over=Number(a.over),to=Number(a.to);if(![from,over,to].every(Number.isInteger)||[from,over,to].some(x=>x<0||x>24)||st.board[from]!==color||st.board[over]===null||st.board[over]===color||st.board[to]!==null)return "د نیولو حرکت ناسم دی.";if(!alquerqueAdj(from).includes(over)||!alquerqueAdj(over).includes(to)||Math.abs(Math.floor(from/5)-Math.floor(to/5))!==2&&Math.abs(from%5-to%5)!==2&&Math.abs(from%5-to%5)!==2)return "د نیولو واټن ناسم دی.";st.board[from]=null;st.board[over]=null;st.board[to]=color;st.remaining[st.board[over]==="B"?"B":"W"]--;st.selected=null;st.turn=1-seat;const enemy=color==="B"?"W":"B";if(st.remaining[enemy]<=0)st.winner=seat;return null}
 return "د الکرک حرکت ناسم دی.";
}
async function event(env,r,p,type,data){await env.DB.prepare("INSERT INTO game_events(room_id,player_id,event_type,event_json) VALUES(?,?,?,?)").bind(r.id,p.id,type,JSON.stringify(data||{})).run()}
export default {async fetch(request,env){
 const url=new URL(request.url),path=url.pathname.replace(/\/+$/,"")||"/",origin=request.headers.get("Origin")||"";
 if(origin&&!ALLOWED_ORIGINS.has(origin))return new Response("Origin not allowed",{status:403});
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers:corsHeaders(request)});
 try{
 if(path==="/"||path==="/health")return reply(request,{ok:true,service:"Online Game Center API",version:VERSION,database:"D1 configured",engines:["alquerque","cards_hokm","cards_hearts","ludo-basic"],realtime:"polling",voice:"not configured"});
 if(path==="/api/register"&&request.method==="POST"){const b=await readJson(request),name=String(b?.name||"").trim().replace(/\s+/g," ").slice(0,40),phone=String(b?.phone||"").trim().replace(/[^\d+]/g,"").slice(0,20);if(name.length<2||phone.replace(/\D/g,"").length<7)return fail(request,"مهرباني وکړئ سم نوم او د ټیلیفون شمېره ولیکئ.");const t=token(),r=await env.DB.prepare("INSERT INTO game_players(display_name,phone,token_hash) VALUES(?,?,?)").bind(name,phone,await hashToken(t)).run();return reply(request,{ok:true,player:{id:r.meta.last_row_id,name},token:t},201)}
 const p=await currentPlayer(request,env);if(!p)return fail(request,"لومړی نوم‌لیکنه وکړئ یا معتبر سیشن وکاروئ.",401);
 if(path==="/api/me"&&request.method==="GET")return reply(request,{ok:true,player:{id:p.id,name:p.display_name}});
 if(path==="/api/rooms"&&request.method==="POST"){const b=await readJson(request),g=String(b?.game||""),m=String(b?.mode||""),n=seats(g,m);if(!n)return fail(request,"د لوبې یا حالت انتخاب ناسم دی.");const code=roomCode(),cr=await env.DB.prepare("INSERT INTO game_rooms(room_code,game_type,game_mode,host_player_id,status) VALUES(?,?,?,?, 'waiting')").bind(code,g,m,p.id).run();await env.DB.prepare("INSERT INTO game_room_players(room_id,player_id,seat,team) VALUES(?,?,1,?)").bind(cr.meta.last_row_id,p.id,m==="four_teams"?1:null).run();return reply(request,{ok:true,room:await details(env,await room(env,code)),required_players:n},201)}
 if(path==="/api/rooms/join"&&request.method==="POST"){const b=await readJson(request),code=String(b?.code||"").trim().toUpperCase(),r=await room(env,code);if(!r)return fail(request,"خونه ونه موندل شوه.",404);if(r.status!=="waiting")return fail(request,"خونه د ګډون لپاره خلاصه نه ده.",409);const n=seats(r.game_type,r.game_mode),old=await membership(env,r.id,p.id);if(old)return reply(request,{ok:true,room:await details(env,r)});const c=await env.DB.prepare("SELECT COUNT(*) total FROM game_room_players WHERE room_id=?").bind(r.id).first();if(c.total>=n)return fail(request,"خونه ډکه ده.",409);const seat=c.total+1;try{await env.DB.prepare("INSERT INTO game_room_players(room_id,player_id,seat,team) VALUES(?,?,?,?)").bind(r.id,p.id,seat,r.game_mode==="four_teams"?(seat===1||seat===2?1:2):null).run()}catch{return fail(request,"دا څوکۍ نیول شوې؛ خونه تازه کړئ.",409)}return reply(request,{ok:true,room:await details(env,await room(env,code))})}
 const m=path.match(/^\/api\/rooms\/([A-HJ-NP-Z2-9]{8})(?:\/(start|action|state|events|messages))?$/);if(m){const code=m[1],route=m[2]||"",r=await room(env,code);if(!r)return fail(request,"خونه ونه موندل شوه.",404);const member=await membership(env,r.id,p.id);if(!member)return fail(request,"تاسو د دې خونې غړی نه یاست.",403);
 if(route==="state"&&request.method==="GET")return reply(request,{ok:true,room:await details(env,r)});
 if(route==="start"&&request.method==="POST"){if(p.id!==r.host_player_id)return fail(request,"یوازې د خونې جوړوونکی لوبه پیلولی شي.",403);const n=seats(r.game_type,r.game_mode),c=await env.DB.prepare("SELECT COUNT(*) total FROM game_room_players WHERE room_id=?").bind(r.id).first();if(c.total!==n)return fail(request,"د لوبې د پیل لپاره ټول لوبغاړي باید ګډون وکړي.",409);const s=initialState(r.game_type,n);const u=await env.DB.prepare("UPDATE game_rooms SET state_json=?,status='playing',current_turn_seat=1,updated_at=CURRENT_TIMESTAMP WHERE id=? AND state_json=?").bind(JSON.stringify(s),r.id,r.state_json).run();if(!u.meta.changes)return fail(request,"لوبه هممهاله بدله شوې؛ بیا هڅه وکړئ.",409);await event(env,r,p,"game_started",{game:r.game_type});return reply(request,{ok:true,room:await details(env,await room(env,code))})}
 if(route==="action"&&request.method==="POST"){if(r.status!=="playing")return fail(request,"لوبه فعاله نه ده.",409);const b=await readJson(request),s=JSON.parse(r.state_json||"{}"),n=seats(r.game_type,r.game_mode);let error=null;if(r.game_type==="alquerque")error=alquerqueAction(s,member.seat-1,b||{});else if(r.game_type==="cards_hokm"||r.game_type==="cards_hearts")error=playCard(s,member.seat-1,b?.card,r.game_type);else if(r.game_type==="ludo")error=ludoAction(s,member.seat-1,b||{},n);else error="دا لوبه نه پېژندل کېږي.";if(error)return fail(request,error,400);const finished=!!(s.winner!==undefined&&s.winner!==null||s.finished||s.phase==="finished");const u=await env.DB.prepare("UPDATE game_rooms SET state_json=?,current_turn_seat=?,status=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND state_json=?").bind(JSON.stringify(s),(s.turn??0)+1,finished?"finished":"playing",r.id,r.state_json).run();if(!u.meta.changes)return fail(request,"بل لوبغاړي هممهاله حرکت کړی؛ حالت تازه کړئ.",409);await event(env,r,p,"action",b);return reply(request,{ok:true,room:await details(env,await room(env,code))})}
 if(route==="events"&&request.method==="GET"){const after=Math.max(0,Number(url.searchParams.get("after")||0));const rows=await env.DB.prepare("SELECT id,event_type,event_json,created_at FROM game_events WHERE room_id=? AND id>? ORDER BY id LIMIT 100").bind(r.id,Number.isSafeInteger(after)?after:0).all();return reply(request,{ok:true,events:(rows.results||[]).map(x=>({...x,data:JSON.parse(x.event_json||"{}")}))})}
 if(route==="messages"&&(request.method==="GET"||request.method==="POST")){if(request.method==="POST"){const b=await readJson(request),msg=String(b?.message||"").trim().slice(0,500);if(!msg)return fail(request,"پیغام تش دی.");await env.DB.prepare("INSERT INTO game_messages(room_id,player_id,message) VALUES(?,?,?)").bind(r.id,p.id,msg).run();return reply(request,{ok:true})}const after=Math.max(0,Number(url.searchParams.get("after")||0)),rows=await env.DB.prepare("SELECT m.id,p.display_name,m.message,m.created_at FROM game_messages m JOIN game_players p ON p.id=m.player_id WHERE m.room_id=? AND m.id>? ORDER BY m.id LIMIT 100").bind(r.id,Number.isSafeInteger(after)?after:0).all();return reply(request,{ok:true,messages:rows.results||[]})}
 }
 return fail(request,"دا API لاره نه ده پېژندل شوې.",404);
 }catch(e){return reply(request,{ok:false,error:"د سرور داخلي ستونزه رامنځته شوه."},500)}
}};
