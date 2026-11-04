const ALLOWED_ORIGINS = new Set(["https://saidwali12.github.io"]);

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const headers = {
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    "Cache-Control": "no-store"
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function reply(request, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(request), "Content-Type": "application/json; charset=utf-8" }
  });
}

function fail(request, message, status = 400) {
  return reply(request, { ok: false, error: message }, status);
}

async function readJson(request) {
  try {
    const value = await request.json();
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch { return null; }
}

async function hashToken(token) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function makeToken() {
  return [...crypto.getRandomValues(new Uint8Array(32))]
    .map(b => b.toString(16).padStart(2, "0")).join("");
}

function makeRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return [...crypto.getRandomValues(new Uint8Array(8))]
    .map(b => chars[b % chars.length]).join("");
}

async function currentPlayer(request, env) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!/^[a-f0-9]{64}$/i.test(token)) return null;
  return env.DB.prepare(
    "SELECT id, display_name FROM game_players WHERE token_hash = ?"
  ).bind(await hashToken(token)).first();
}

async function roomDetails(env, code) {
  const room = await env.DB.prepare(
    "SELECT id, room_code, game_type, game_mode, status, current_turn_seat, created_at, updated_at FROM game_rooms WHERE room_code = ?"
  ).bind(code).first();
  if (!room) return null;
  const players = await env.DB.prepare(
    "SELECT rp.seat, rp.team, p.display_name FROM game_room_players rp JOIN game_players p ON p.id = rp.player_id WHERE rp.room_id = ? ORDER BY rp.seat"
  ).bind(room.id).all();
  return { ...room, players: players.results || [] };
}

async function isRoomMember(env, roomId, playerId) {
  return env.DB.prepare(
    "SELECT 1 AS yes FROM game_room_players WHERE room_id = ? AND player_id = ?"
  ).bind(roomId, playerId).first();
}

function expectedPlayers(game, mode) {
  if (game === "alquerque") return mode === "two_players" ? 2 : 0;
  if (game === "cards_hokm" || game === "cards_hearts") return mode === "four_teams" ? 4 : 0;
  if (game === "ludo") {
    if (mode === "two_players") return 2;
    if (mode === "four_teams") return 4;
    return 0; // Computer mode waits for the tested AI engine.
  }
  return 0;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const origin = request.headers.get("Origin") || "";

    if (origin && !ALLOWED_ORIGINS.has(origin)) return new Response("Origin not allowed", { status: 403 });
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    try {
      if (path === "/" || path === "/health") {
        return reply(request, {
          ok: true,
          service: "Online Game Center API",
          version: "0.2.0",
          database: "D1 configured",
          game_engines: "not yet enabled"
        });
      }

      if (path === "/api/register" && request.method === "POST") {
        const body = await readJson(request);
        const name = String(body?.name || "").trim().replace(/\s+/g, " ").slice(0, 40);
        const phone = String(body?.phone || "").trim().replace(/[^\d+]/g, "").slice(0, 20);
        if (name.length < 2 || phone.replace(/\D/g, "").length < 7) {
          return fail(request, "مهرباني وکړئ سم نوم او د ټیلیفون شمېره ولیکئ.", 400);
        }
        const token = makeToken();
        const result = await env.DB.prepare(
          "INSERT INTO game_players (display_name, phone, token_hash) VALUES (?, ?, ?)"
        ).bind(name, phone, await hashToken(token)).run();
        return reply(request, {
          ok: true,
          player: { id: result.meta.last_row_id, name },
          token,
          warning: "دا سیشن ټوکن شخصي وساتئ؛ له بل چا سره یې مه شریکوئ."
        }, 201);
      }

      const player = await currentPlayer(request, env);
      if (!player) return fail(request, "لومړی نوم‌لیکنه وکړئ یا خپل معتبر سیشن وکاروئ.", 401);

      if (path === "/api/me" && request.method === "GET") {
        return reply(request, { ok: true, player: { id: player.id, name: player.display_name } });
      }

      if (path === "/api/rooms" && request.method === "POST") {
        const body = await readJson(request);
        const game = String(body?.game || "");
        const mode = String(body?.mode || "");
        const games = ["ludo", "cards_hokm", "cards_hearts", "alquerque"];
        const modes = ["computer", "two_players", "four_teams"];
        if (!games.includes(game) || !modes.includes(mode)) {
          return fail(request, "د لوبې یا لوبغاړو ډول ناسم دی.", 400);
        }
        const maxPlayers = expectedPlayers(game, mode);
        if (!maxPlayers) {
          return fail(request, "دا حالت لا نه دی فعال شوی؛ د لوبې بشپړ انجن باید لومړی چمتو شي.", 501);
        }

        const code = makeRoomCode();
        const created = await env.DB.prepare(
          "INSERT INTO game_rooms (room_code, game_type, game_mode, host_player_id, status) VALUES (?, ?, ?, ?, 'waiting')"
        ).bind(code, game, mode, player.id).run();
        const team = mode === "four_teams" ? 1 : null;
        await env.DB.prepare(
          "INSERT INTO game_room_players (room_id, player_id, seat, team) VALUES (?, ?, 1, ?)"
        ).bind(created.meta.last_row_id, player.id, team).run();
        return reply(request, {
          ok: true,
          room: await roomDetails(env, code),
          required_players: maxPlayers
        }, 201);
      }

      if (path === "/api/rooms/join" && request.method === "POST") {
        const body = await readJson(request);
        const code = String(body?.code || "").trim().toUpperCase();
        if (!/^[A-HJ-NP-Z2-9]{8}$/.test(code)) return fail(request, "د خونې کوډ ناسم دی.", 400);

        const room = await env.DB.prepare(
          "SELECT * FROM game_rooms WHERE room_code = ?"
        ).bind(code).first();
        if (!room) return fail(request, "دا د لوبې خونه ونه موندل شوه.", 404);
        if (room.status !== "waiting") return fail(request, "دا خونه نوره د ګډون لپاره خلاصه نه ده.", 409);

        const maxPlayers = expectedPlayers(room.game_type, room.game_mode);
        if (!maxPlayers) return fail(request, "د دې لوبې حالت فعال نه دی.", 501);
        if (await isRoomMember(env, room.id, player.id)) {
          return reply(request, { ok: true, room: await roomDetails(env, code) });
        }

        const count = await env.DB.prepare(
          "SELECT COUNT(*) AS total FROM game_room_players WHERE room_id = ?"
        ).bind(room.id).first();
        if (count.total >= maxPlayers) return fail(request, "د لوبې خونه ډکه ده.", 409);

        const seat = count.total + 1;
        const team = room.game_mode === "four_teams" ? (seat <= 2 ? 1 : 2) : null;
        try {
          await env.DB.prepare(
            "INSERT INTO game_room_players (room_id, player_id, seat, team) VALUES (?, ?, ?, ?)"
          ).bind(room.id, player.id, seat, team).run();
        } catch {
          return fail(request, "د ګډون پر مهال ستونزه رامنځته شوه؛ خونه تازه کړئ.", 409);
        }

        if (seat === maxPlayers) {
          await env.DB.prepare(
            "UPDATE game_rooms SET status = 'playing', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'waiting'"
          ).bind(room.id).run();
        }
        return reply(request, { ok: true, room: await roomDetails(env, code) });
      }

      const roomMatch = path.match(/^\/api\/rooms\/([A-HJ-NP-Z2-9]{8})$/);
      if (roomMatch && request.method === "GET") {
        const room = await roomDetails(env, roomMatch[1]);
        if (!room) return fail(request, "خونه ونه موندل شوه.", 404);
        if (!await isRoomMember(env, room.id, player.id)) return fail(request, "تاسو د دې خونې غړی نه یاست.", 403);
        return reply(request, { ok: true, room });
      }

      const messagesMatch = path.match(/^\/api\/rooms\/([A-HJ-NP-Z2-9]{8})\/messages$/);
      if (messagesMatch && (request.method === "GET" || request.method === "POST")) {
        const code = messagesMatch[1];
        const room = await env.DB.prepare(
          "SELECT id FROM game_rooms WHERE room_code = ?"
        ).bind(code).first();
        if (!room) return fail(request, "خونه ونه موندل شوه.", 404);
        if (!await isRoomMember(env, room.id, player.id)) return fail(request, "تاسو د دې خونې غړی نه یاست.", 403);

        if (request.method === "POST") {
          const body = await readJson(request);
          const message = String(body?.message || "").trim().slice(0, 500);
          if (!message) return fail(request, "پیغام تش دی.", 400);
          await env.DB.prepare(
            "INSERT INTO game_messages (room_id, player_id, message) VALUES (?, ?, ?)"
          ).bind(room.id, player.id, message).run();
          return reply(request, { ok: true });
        }

        const n = Number(url.searchParams.get("after") || 0);
        const after = Number.isSafeInteger(n) && n > 0 ? n : 0;
        const rows = await env.DB.prepare(
          "SELECT m.id, p.display_name, m.message, m.created_at FROM game_messages m JOIN game_players p ON p.id = m.player_id WHERE m.room_id = ? AND m.id > ? ORDER BY m.id LIMIT 100"
        ).bind(room.id, after).all();
        return reply(request, { ok: true, messages: rows.results || [] });
      }

      return fail(request, "دا API لاره نه ده پېژندل شوې.", 404);
    } catch {
      return reply(request, { ok: false, error: "د سرور داخلي ستونزه رامنځته شوه." }, 500);
    }
  }
};