const ALLOWED_ORIGINS = new Set(["https://saidwali12.github.io"]);
const VERSION = "0.6.0";

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
async function details(env,r){const p=await env.DB.prepare("SELECT rp.player_id,rp.seat,rp.team,p.display_name FROM game_room_players rp JOIN game_players p ON p.id=rp.player_id WHERE rp.room_id=? ORDER BY rp.seat").bind(r.id).all();return {...r,state:JSON.parse(r.state_json||"{}"),players:p.results||[]}}
function seats(game,mode){if(mode==="computer")return game==="alquerque"?2:4;if(game==="alquerque"&&mode==="two_players")return 2;if(game==="cards_hokm"&&["two_players","four_teams"].includes(mode))return mode==="two_players"?2:4;if(game==="cards_hearts"&&mode==="four_teams")return 4;if(game==="ludo"&&["two_players","four_teams"].includes(mode))return mode==="two_players"?2:4;return 0}
function deck(){const suits=["S","H","D","C"],ranks=["2","3","4","5","6","7","8","9","10","J","Q","K","A"];return shuffle(suits.flatMap(s=>ranks.map(r=>({suit:s,rank:r}))))}
function initialState(game,n){
 if(game==="cards_hokm"||game==="cards_hearts"){const d=deck(),count=game==="cards_hokm"&&n===2?2:4,hands=Array.from({length:count},(_,i)=>d.slice(i*13,(i+1)*13));return {started:true,playerCount:count,phase:game==="cards_hokm"?"trump":"playing",hands,stock:game==="cards_hokm"&&count===2?d.slice(26):[],trick:[],tricks:Array(count).fill(0),trump:null,leader:0,turn:0,round:1,scores:Array(count).fill(0),played:[],heartsBroken:false,heartsRound:1,winner:null,message:game==="cards_hokm"?"د حکم رنګ د لومړي لوبغاړي له خوا ټاکل کېږي":"د زړه لوبه پیل شوه"}}
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
 if(game==="cards_hearts"){
  const pointsCard=x=>x.suit==="H"||(x.suit==="S"&&x.rank==="Q");
  if(st.trick.length===0&&!st.heartsBroken&&card.suit==="H"&&hand.some(x=>x.suit!=="H"))return "تر څو زړه مات شوی نه وي، د بل رنګ کارت ولوبوئ.";
  if((st.heartsRound||1)===1&&pointsCard(card)&&hand.some(x=>!pointsCard(x)))return "په لومړي لاس کې د زړه او د سپینو بي بي کارت مه اچوئ، مګر که نور کارتونه نه لرئ.";
 }
 hand.splice(idx,1);st.trick.push({seat,card});st.played.push({seat,card});if(game==="cards_hearts"&&card.suit==="H")st.heartsBroken=true;
 const playerCount=st.playerCount||4;if(st.trick.length===playerCount){const lead=st.trick[0].card.suit;let best=st.trick[0];for(const x of st.trick.slice(1)){const a=x.card.suit===st.trump&&game==="cards_hokm"?2:x.card.suit===lead?1:0,b=best.card.suit===st.trump&&game==="cards_hokm"?2:best.card.suit===lead?1:0;if(a>b||(a===b&&cardValue(x.card.rank)>cardValue(best.card.rank)))best=x}
 const winner=best.seat;if(game==="cards_hokm"&&playerCount===2)st.tricks[winner]++;else if(game==="cards_hokm")st.tricks[winner%2]++;if(game==="cards_hearts")st.scores[winner]+=st.trick.reduce((sum,x)=>sum+(x.card.suit==="H"?1:(x.card.suit==="S"&&x.card.rank==="Q"?13:0)),0);st.leader=winner;st.turn=winner;st.trick=[];if(game==="cards_hokm"&&playerCount===2&&st.stock?.length){for(let i=0;i<2&&st.stock.length;i++)st.hands[i].push(st.stock.shift())}if(st.hands.every(h=>h.length===0)){if(game==="cards_hokm"&&playerCount===2){st.scores=st.tricks.slice()}else if(game==="cards_hokm"){st.scores[0]+=st.tricks[0];st.scores[1]+=st.tricks[1]}else if(game==="cards_hearts"){st.phase="finished";st.winner=st.scores.every(x=>x===st.scores[0])?"draw":st.scores.indexOf(Math.min(...st.scores))}st.phase="finished";if(game==="cards_hokm")st.winner=st.scores.every(x=>x===st.scores[0])?"draw":st.scores.indexOf(Math.max(...st.scores))}else st.message="د لاس ګټونکی: لوبغاړی "+(winner+1);
 }else st.turn=nextSeat(seat,playerCount);
 return null;
}
function ludoAction(st,seat,action,n){
 const p=st.players[seat];if(!p)return "لوبغاړی ناسم دی.";
 if(action.type==="roll"){if(st.turn!==seat||st.rolled)return "اوس د تاس نوبت نه دی.";st.dice=1+(crypto.getRandomValues(new Uint32Array(1))[0]%6);st.rolled=true;return null}
 const legal=p.tokens.map((pos,k)=>({pos,k})).filter(x=>x.pos<56&&(x.pos!==-1||st.dice===6));
 if(action.type==="pass"){if(st.turn!==seat||!st.rolled)return "لومړی تاس واچوئ.";if(legal.length)return "تاسو د حرکت وړ مهره لرئ؛ یوه مهره حرکت کړئ.";const six=st.dice===6;st.rolled=false;st.dice=null;st.turn=six?seat:nextSeat(seat,n);st.turns=(st.turns||0)+1;return null}
 if(action.type==="move"){if(st.turn!==seat||!st.rolled)return "لومړی خپل نوبت کې تاس واچوئ.";const k=Number(action.token);if(!Number.isInteger(k)||k<0||k>3)return "مهره ناسم انتخاب ده.";const pos=p.tokens[k];if(pos===-1&&st.dice!==6)return "د مهرې د وتلو لپاره شپږ ته اړتیا ده.";if(pos>=56)return "دا مهره کور ته رسېدلې ده.";p.tokens[k]=pos===-1?0:Math.min(56,pos+st.dice);if(p.tokens[k]===56)p.finished++;st.rolled=false;const six=st.dice===6;st.turn=six?seat:nextSeat(seat,n);st.turns=(st.turns||0)+1;if(p.finished===4){st.winner=seat;st.finished=true}st.dice=null;return null}
 return "د لډو حرکت ناسم دی.";
}
function alquerqueAdj(i){const r=Math.floor(i/5),c=i%5,a=[];for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]){const rr=r+dr,cc=c+dc;if(rr>=0&&rr<5&&cc>=0&&cc<5){if(Math.abs(dr)+Math.abs(dc)===2&&((r+c)%2!==0))continue;a.push(rr*5+cc)}}return a}
function alquerqueAction(st,seat,a){
 const color=seat===0?"B":"W";if(st.turn!==seat)return "اوس ستاسو نوبت نه دی.";
 if(a.type==="select"){const i=Number(a.from);if(!Number.isInteger(i)||i<0||i>24||st.board[i]!==color)return "خپل کاڼی انتخاب کړئ.";st.selected=i;return null}
 if(a.type==="move"){const from=Number(a.from),to=Number(a.to);if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||from>24||to<0||to>24||st.board[from]!==color||st.board[to]!==null)return "حرکت ناسم دی.";if(!alquerqueAdj(from).includes(to))return "دا ځای د کاڼي ګاونډی نه دی.";st.board[from]=null;st.board[to]=color;st.selected=null;st.turn=1-seat;return null}
 if(a.type==="capture"){const from=Number(a.from),over=Number(a.over),to=Number(a.to);if(![from,over,to].every(Number.isInteger)||[from,over,to].some(x=>x<0||x>24)||st.board[from]!==color||st.board[over]===null||st.board[over]===color||st.board[to]!==null)return "د نیولو حرکت ناسم دی.";const fr=Math.floor(from/5),fc=from%5,orr=Math.floor(over/5),oc=over%5,tr=Math.floor(to/5),tc=to%5;if(!alquerqueAdj(from).includes(over)||!alquerqueAdj(over).includes(to)||tr-fr!==2*(orr-fr)||tc-fc!==2*(oc-fc))return "د نیولو حرکت ناسم دی.";const captured=st.board[over];st.board[from]=null;st.board[over]=null;st.board[to]=color;st.remaining[captured]--;st.selected=null;st.turn=1-seat;const enemy=color==="B"?"W":"B";if(st.remaining[enemy]<=0)st.winner=seat;return null}
 return "د الکرک حرکت ناسم دی.";
}

function computerTurn(st,game,n){
 let guard=0;
 while(st.turn!==0 && guard++<24 && st.phase!=="finished" && st.winner==null && !st.finished){
  const seat=st.turn;
  if(game==="alquerque"){
   const color=seat===0?"B":"W",enemy=color==="B"?"W":"B";let chosen=null;
   for(let from=0;from<25&&!chosen;from++)if(st.board[from]===color){
    const fr=Math.floor(from/5),fc=from%5;
    for(const [dr,dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]){
     const mr=fr+dr,mc=fc+dc,tr=fr+2*dr,tc=fc+2*dc;
     if(tr<0||tr>4||tc<0||tc>4||mr<0||mr>4||mc<0||mc>4)continue;
     const over=mr*5+mc,to=tr*5+tc;
     if(alquerqueAdj(from).includes(over)&&alquerqueAdj(over).includes(to)&&st.board[over]===enemy&&st.board[to]===null){chosen={type:"capture",from,over,to};break}
    }
   }
   if(!chosen)for(let from=0;from<25&&!chosen;from++)if(st.board[from]===color){const to=alquerqueAdj(from).find(x=>st.board[x]===null);if(to!==undefined)chosen={type:"move",from,to}}
   if(!chosen){st.winner=1-seat;break}
   if(alquerqueAction(st,seat,chosen))break;
  }else if(game==="ludo"){
   if(ludoAction(st,seat,{type:"roll"},n))break;
   const p=st.players[seat],opts=[];
   for(let k=0;k<4;k++){const pos=p.tokens[k];if((pos===-1&&st.dice===6)||(pos>=0&&pos<56))opts.push(k)}
   if(!opts.length){const six=st.dice===6;st.rolled=false;st.turn=six?seat:nextSeat(seat,n);st.dice=null;continue}
   const k=opts.find(x=>p.tokens[x]>=0)??opts[0];
   if(ludoAction(st,seat,{type:"move",token:k},n))break;
  }else{
   const hand=st.hands?.[seat]||[];let card=null;
   if(game==="cards_hokm"&&st.phase==="trump")card={suit:"S",rank:"2"};
   else{
    let legal=hand.slice();
    if(st.trick.length){const lead=st.trick[0].card.suit;if(legal.some(c=>c.suit===lead))legal=legal.filter(c=>c.suit===lead)}
    if(game==="cards_hearts"){
     const points=c=>c.suit==="H"||(c.suit==="S"&&c.rank==="Q");
     if(st.trick.length===0&&!st.heartsBroken&&legal.some(c=>c.suit!=="H"))legal=legal.filter(c=>c.suit!=="H");
     if((st.heartsRound||1)===1&&legal.some(c=>!points(c)))legal=legal.filter(c=>!points(c));
    }
    legal.sort((a,b)=>cardValue(a.rank)-cardValue(b.rank));card=legal[0]||hand[0];
   }
   if(!card||playCard(st,seat,card,game))break;
  }
 }
 return st;
}
async function event(env,r,p,type,data){await env.DB.prepare("INSERT INTO game_events(room_id,player_id,event_type,event_json) VALUES(?,?,?,?)").bind(r.id,p.id,type,JSON.stringify(data||{})).run()}
export default {async fetch(request,env){
 const url=new URL(request.url),path=url.pathname.replace(/\/+$/,"")||"/",origin=request.headers.get("Origin")||"";
 if(origin&&!ALLOWED_ORIGINS.has(origin))return new Response("Origin not allowed",{status:403});
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers:corsHeaders(request)});
 try{
 if(path==="/"||path==="/health")return reply(request,{ok:true,service:"Online Game Center API",version:VERSION,database:"D1 configured",engines:["alquerque","cards_hokm","cards_hearts","ludo-basic"],realtime:"polling",voice:"WebRTC signaling; STUN only"});
 if(path==="/api/register"&&request.method==="POST"){const b=await readJson(request),name=String(b?.name||"").trim().replace(/\s+/g," ").slice(0,40),phone=String(b?.phone||"").trim().replace(/[^\d+]/g,"").slice(0,20);if(name.length<2||phone.replace(/\D/g,"").length<7)return fail(request,"مهرباني وکړئ سم نوم او د ټیلیفون شمېره ولیکئ.");const t=token(),r=await env.DB.prepare("INSERT INTO game_players(display_name,phone,token_hash) VALUES(?,?,?)").bind(name,phone,await hashToken(t)).run();return reply(request,{ok:true,player:{id:r.meta.last_row_id,name},token:t},201)}
 const p=await currentPlayer(request,env);if(!p)return fail(request,"لومړی نوم‌لیکنه وکړئ یا معتبر سیشن وکاروئ.",401);
 if(path==="/api/me"&&request.method==="GET")return reply(request,{ok:true,player:{id:p.id,name:p.display_name}});
 if(path==="/api/rooms"&&request.method==="POST"){const b=await readJson(request),g=String(b?.game||""),m=String(b?.mode||""),n=seats(g,m);if(!n)return fail(request,"د لوبې یا حالت انتخاب ناسم دی.");const code=roomCode(),computer=m==="computer",initial=computer?JSON.stringify(initialState(g,n)):"{}",cr=await env.DB.prepare("INSERT INTO game_rooms(room_code,game_type,game_mode,host_player_id,status,state_json,current_turn_seat) VALUES(?,?,?,?,?,?,1)").bind(code,g,m,p.id,computer?"playing":"waiting",initial).run();await env.DB.prepare("INSERT INTO game_room_players(room_id,player_id,seat,team) VALUES(?,?,1,?)").bind(cr.meta.last_row_id,p.id,m==="four_teams"?1:null).run();return reply(request,{ok:true,room:await details(env,await room(env,code)),required_players:computer?1:n,opponents:computer?n-1:0},201)}
 if(path==="/api/rooms/join"&&request.method==="POST"){const b=await readJson(request),code=String(b?.code||"").trim().toUpperCase(),r=await room(env,code);if(!r)return fail(request,"خونه ونه موندل شوه.",404);if(r.game_mode==="computer")return fail(request,"دا خونه د کمپیوټر پر وړاندې ده؛ بل انسان پکې نه شي داخلېدای.",409);if(r.status!=="waiting")return fail(request,"خونه د ګډون لپاره خلاصه نه ده.",409);const n=seats(r.game_type,r.game_mode),old=await membership(env,r.id,p.id);if(old)return reply(request,{ok:true,room:await details(env,r)});const c=await env.DB.prepare("SELECT COUNT(*) total FROM game_room_players WHERE room_id=?").bind(r.id).first();if(c.total>=n)return fail(request,"خونه ډکه ده.",409);const seat=c.total+1;try{await env.DB.prepare("INSERT INTO game_room_players(room_id,player_id,seat,team) VALUES(?,?,?,?)").bind(r.id,p.id,seat,r.game_mode==="four_teams"?(seat===1||seat===3?1:2):null).run()}catch{return fail(request,"دا څوکۍ نیول شوې؛ خونه تازه کړئ.",409)}return reply(request,{ok:true,room:await details(env,await room(env,code))})}
 const m=path.match(/^\/api\/rooms\/([A-HJ-NP-Z2-9]{8})(?:\/(start|confirm-start|action|state|events|messages|voice-ready|voice-signal|voice-signals))?$/);if(m){const code=m[1],route=m[2]||"",r=await room(env,code);if(!r)return fail(request,"خونه ونه موندل شوه.",404);const member=await membership(env,r.id,p.id);if(!member)return fail(request,"تاسو د دې خونې غړی نه یاست.",403);
 if(route==="state"&&request.method==="GET")return reply(request,{ok:true,room:await details(env,r)});
 if(route==="start"&&request.method==="POST"){if(p.id!==r.host_player_id)return fail(request,"یوازې د خونې جوړوونکی لوبه پیلولی شي.",403);if(r.status!=="waiting")return fail(request,"خونه د پیل په حالت کې نه ده.",409);const n=seats(r.game_type,r.game_mode),rows=await env.DB.prepare("SELECT COUNT(*) total FROM game_room_players WHERE room_id=?").bind(r.id).first();if(rows.total!==n)return fail(request,"د پیل لپاره ټول لوبغاړي باید خونې ته داخل شي.",409);const vr=await env.DB.prepare("SELECT COUNT(*) total,SUM(mic_ready) ready FROM game_voice_presence WHERE room_id=?").bind(r.id).first();if(!vr||Number(vr.total)!==n||Number(vr.ready)!==n)return fail(request,"د لوبې له پیل مخکې باید د ټولو لوبغاړو مایکروفون فعال او غږیز چمتووالی تایید شي.",409);const s=initialState(r.game_type,n);const u=await env.DB.prepare("UPDATE game_rooms SET state_json=?,status='playing',current_turn_seat=1,updated_at=CURRENT_TIMESTAMP WHERE id=? AND state_json=? AND status='waiting'").bind(JSON.stringify(s),r.id,r.state_json).run();if(!u.meta.changes)return fail(request,"خونه هممهاله بدله شوې؛ تازه یې کړئ.",409);await event(env,r,p,"game_started",{game:r.game_type,hostStarted:true});return reply(request,{ok:true,started:true,room:await details(env,await room(env,code))})}
 if(route==="confirm-start"&&request.method==="POST")return fail(request,"نور د هر لوبغاړي جلا تایید ته اړتیا نشته؛ کوربه دې لوبه پیل کړي.",410);
 if(route==="voice-ready"&&(request.method==="GET"||request.method==="POST")){if(request.method==="POST"){const b=await readJson(request),ready=b?.ready===true;await env.DB.prepare("INSERT INTO game_voice_presence(room_id,player_id,mic_ready,peer_ready_json,updated_at) VALUES(?,?,?,'{}',CURRENT_TIMESTAMP) ON CONFLICT(room_id,player_id) DO UPDATE SET mic_ready=excluded.mic_ready,updated_at=CURRENT_TIMESTAMP").bind(r.id,p.id,ready?1:0).run()}const rows=await env.DB.prepare("SELECT v.player_id,v.mic_ready,v.updated_at,g.display_name FROM game_voice_presence v JOIN game_players g ON g.id=v.player_id WHERE v.room_id=?").bind(r.id).all();return reply(request,{ok:true,presence:rows.results||[]})}
 if(route==="voice-signal"&&request.method==="POST"){const b=await readJson(request),to=Number(b?.toPlayerId),type=String(b?.type||""),payload=b?.payload;if(!Number.isSafeInteger(to)||to<=0||!["offer","answer","candidate","hangup"].includes(type)||payload===undefined)return fail(request,"د غږیزې اړیکې سیګنال ناسم دی.");const target=await membership(env,r.id,to);if(!target)return fail(request,"د اړیکې هدف د دې خونې غړی نه دی.",403);const encoded=JSON.stringify(payload);if(encoded.length>12000)return fail(request,"د غږیز سیګنال اندازه ډېره ده.");await env.DB.prepare("INSERT INTO game_voice_signals(room_id,from_player_id,to_player_id,signal_type,payload_json) VALUES(?,?,?,?,?)").bind(r.id,p.id,to,type,encoded).run();return reply(request,{ok:true})}
 if(route==="voice-signals"&&request.method==="GET"){const after=Math.max(0,Number(url.searchParams.get("after")||0));const rows=await env.DB.prepare("SELECT id,from_player_id,signal_type,payload_json,created_at FROM game_voice_signals WHERE room_id=? AND to_player_id=? AND id>? ORDER BY id LIMIT 100").bind(r.id,p.id,Number.isSafeInteger(after)?after:0).all();return reply(request,{ok:true,signals:(rows.results||[]).map(x=>({...x,payload:JSON.parse(x.payload_json||"{}")}))})}
 if(route==="action"&&request.method==="POST"){if(r.status!=="playing")return fail(request,"لوبه فعاله نه ده.",409);const b=await readJson(request),s=JSON.parse(r.state_json||"{}"),n=seats(r.game_type,r.game_mode);let error=null;if(r.game_type==="alquerque")error=alquerqueAction(s,member.seat-1,b||{});else if(r.game_type==="cards_hokm"||r.game_type==="cards_hearts")error=playCard(s,member.seat-1,b?.card,r.game_type);else if(r.game_type==="ludo")error=ludoAction(s,member.seat-1,b||{},n);else error="دا لوبه نه پېژندل کېږي.";if(error)return fail(request,error,400);if(r.game_mode==="computer"&&member.seat===1&&!((s.winner!==undefined&&s.winner!==null)||s.finished||s.phase==="finished"))computerTurn(s,r.game_type,seats(r.game_type,r.game_mode));const finished=!!(s.winner!==undefined&&s.winner!==null||s.finished||s.phase==="finished");const u=await env.DB.prepare("UPDATE game_rooms SET state_json=?,current_turn_seat=?,status=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND state_json=?").bind(JSON.stringify(s),(s.turn??0)+1,finished?"finished":"playing",r.id,r.state_json).run();if(!u.meta.changes)return fail(request,"بل لوبغاړي هممهاله حرکت کړی؛ حالت تازه کړئ.",409);await event(env,r,p,"action",b);return reply(request,{ok:true,room:await details(env,await room(env,code))})}
 if(route==="events"&&request.method==="GET"){const after=Math.max(0,Number(url.searchParams.get("after")||0));const rows=await env.DB.prepare("SELECT id,event_type,event_json,created_at FROM game_events WHERE room_id=? AND id>? ORDER BY id LIMIT 100").bind(r.id,Number.isSafeInteger(after)?after:0).all();return reply(request,{ok:true,events:(rows.results||[]).map(x=>({...x,data:JSON.parse(x.event_json||"{}")}))})}
 if(route==="messages"&&(request.method==="GET"||request.method==="POST")){if(request.method==="POST"){const b=await readJson(request),msg=String(b?.message||"").trim().slice(0,500);if(!msg)return fail(request,"پیغام تش دی.");await env.DB.prepare("INSERT INTO game_messages(room_id,player_id,message) VALUES(?,?,?)").bind(r.id,p.id,msg).run();return reply(request,{ok:true})}const after=Math.max(0,Number(url.searchParams.get("after")||0)),rows=await env.DB.prepare("SELECT m.id,p.display_name,m.message,m.created_at FROM game_messages m JOIN game_players p ON p.id=m.player_id WHERE m.room_id=? AND m.id>? ORDER BY m.id LIMIT 100").bind(r.id,Number.isSafeInteger(after)?after:0).all();return reply(request,{ok:true,messages:rows.results||[]})}
 }
 return fail(request,"دا API لاره نه ده پېژندل شوې.",404);
 }catch(e){return reply(request,{ok:false,error:"د سرور داخلي ستونزه رامنځته شوه."},500)}
}};
