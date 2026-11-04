const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization"
};

function reply(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8" }
  });
}

async function readJson(request) {
  try { return await request.json(); } catch { return null; }
}

async function hashToken(token) {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function makeToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");
}

function makeRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return [...bytes].map(b => chars[b % chars.length]).join("");
}

async function currentPlayer(request, env) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  const tokenHash = await hashToken(token);
  return await env.DB.prepare(
    "SELECT id, display_name FROM game_players WHERE token_hash = ?"
  ).bind(tokenHash).first();
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

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "") || "/";

    try {
      if (path === "/" || path === "/health") {
        return reply({ ok: true, service: "Online Game Center API", version: "0.1.0", database: "D1 configured" });
      }

      if (path === "/api/register" && request.method === "POST") {
        const body = await readJson(request);
        const name = String(body?.name || "").trim().slice(0, 40);
        const phone = String(body?.phone || "").trim().slice(0, 25);
        if (name.length < 2 || phone.length < 7) {
          return reply({ ok: false, error: "نوم او سمه ټیلیفون شمېره ولیکئ." }, 400);
        }
        const token = makeToken();
        const tokenHash = await hashToken(token);
        const result = await env.DB.prepare(
          "INSERT INTO game_players (display_name, phone, token_hash) VALUES (?, ?, ?)"
        ).bind(name, phone, tokenHash).run();
        return reply({ ok: true, player_id: result.meta.last_row_id, name, token });
      }

      const player = await currentPlayer(request, env);
      if (!player) return reply({ ok: false, error: "لومړی نوم‌لیکنه وکړئ یا خپل معتبر سیشن وکاروئ." }, 401);

      if (path === "/api/rooms" && request.method === "POST") {
        const body = await readJson(request);
        const game = String(body?.game || "");
        const mode = String(body?.mode || "");
        const allowedGames = ["ludo", "cards_hokm", "cards_hearts", "alquerque"];
        const allowedModes = ["computer", "two_players", "four_teams"];
        if (!allowedGames.includes(game) || !allowedModes.includes(mode)) {
          return reply({ ok: false, error: "د لوبې یا لوبغاړو ډول ناسم دی." }, 400);
        }
        if (game === "alquerque" && mode !== "two_players") {
          return reply({ ok: false, error: "الکرک د دوو لوبغاړو لوبه ده." }, 400);
        }
        if (game.startsWith("cards_") && mode !== "four_teams") {
          return reply({ ok: false, error: "د دې کارت لوبې لپاره څلور لوبغاړي او دوه ټیمونه وټاکئ." }, 400);
        }
        let code = makeRoomCode();
        for (let attempt = 0; attempt < 5; attempt++) {
          const exists = await env.DB.prepare("SELECT id FROM game_rooms WHERE room_code = ?").bind(code).first();
          if (!exists) break;
          code = makeRoomCode();
        }
        const created = await env.DB.prepare(
          "INSERT INTO game_rooms (room_code, game_type, game_mode, host_player_id) VALUES (?, ?, ?, ?)"
        ).bind(code, game, mode, player.id).run();
        await env.DB.prepare(
          "INSERT INTO game_room_players (room_id, player_id, seat, team) VALUES (?, ?, 1, ?)"
        ).bind(created.meta.last_row_id, player.id, mode === "four_teams" ? 1 : null).run();
        return reply({ ok: true, room: await roomDetails(env, code) }, 201);
      }

      if (path === "/api/rooms/join" && request.method === "POST") {
        const body = await readJson(request);
        const code = String(body?.code || "").trim().toUpperCase();
        const room = await env.DB.prepare("SELECT * FROM game_rooms WHERE room_code = ?").bind(code).first();
        if (!room) return reply({ ok: false, error: "دا د لوبې خونه ونه موندل شوه." }, 404);
        if (room.status !== "waiting") return reply({ ok: false, error: "دا خونه نوره د ګډون لپاره خلاصه نه ده." }, 409);
        const maxPlayers = room.game_mode === "four_teams" ? 4 : 2;
        const count = await env.DB.prepare("SELECT COUNT(*) AS total FROM game_room_players WHERE room_id = ?").bind(room.id).first();
        if (count.total >= maxPlayers) return reply({ ok: false, error: "د لوبې خونه ډکه ده." }, 409);
        const already = await env.DB.prepare("SELECT seat FROM game_room_players WHERE room_id = ? AND player_id = ?").bind(room.id, player.id).first();
        if (already) return reply({ ok: true, room: await roomDetails(env, code) });
        const seat = count.total + 1;
        const team = room.game_mode === "four_teams" ? (seat <= 2 ? 1 : 2) : null;
        await env.DB.prepare(
          "INSERT INTO game_room_players (room_id, player_id, seat, team) VALUES (?, ?, ?, ?)"
        ).bind(room.id, player.id, seat, team).run();
        if (seat === maxPlayers) {
          await env.DB.prepare("UPDATE game_rooms SET status = 'playing', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(room.id).run();
        }
        return reply({ ok: true, room: await roomDetails(env, code) });
      }

      const roomMatch = path.match(/^\/api\/rooms\/([A-Z0-9]+)$/);
      if (roomMatch && request.method === "GET") {
        const code = roomMatch[1];
        const room = await roomDetails(env, code);
        if (!room) return reply({ ok: false, error: "خونه ونه موندل شوه." }, 404);
        const member = await env.DB.prepare(
          "SELECT 1 AS yes FROM game_room_players rp JOIN game_rooms r ON r.id = rp.room_id WHERE r.room_code = ? AND rp.player_id = ?"
        ).bind(code, player.id).first();
        if (!member) return reply({ ok: false, error: "تاسو د دې خونې غړی نه یاست." }, 403);
        return reply({ ok: true, room });
      }

      const messageMatch = path.match(/^\/api\/rooms\/([A-Z0-9]+)\/messages$/);
      if (messageMatch && request.method === "POST") {
        const code = messageMatch[1];
        const body = await readJson(request);
        const message = String(body?.message || "").trim().slice(0, 500);
        if (!message) return reply({ ok: false, error: "پیغام تش دی." }, 400);
        const room = await env.DB.prepare("SELECT id FROM game_rooms WHERE room_code = ?").bind(code).first();
        if (!room) return reply({ ok: false, error: "خونه ونه موندل شوه." }, 404);
        const member = await env.DB.prepare("SELECT 1 AS yes FROM game_room_players WHERE room_id = ? AND player_id = ?").bind(room.id, player.id).first();
        if (!member) return reply({ ok: false, error: "تاسو د دې خونې غړی نه یاست." }, 403);
        await env.DB.prepare("INSERT INTO game_messages (room_id, player_id, message) VALUES (?, ?, ?)").bind(room.id, player.id, message).run();
        return reply({ ok: true });
      }

      const messageGetMatch = path.match(/^\/api\/rooms\/([A-Z0-9]+)\/messages$/);
      if (messageGetMatch && request.method === "GET") {
        const code = messageGetMatch[1];
        const after = Math.max(0, Number(url.searchParams.get("after") || 0));
        const room = await env.DB.prepare("SELECT id FROM game_rooms WHERE room_code = ?").bind(code).first();
        if (!room) return reply({ ok: false, error: "خونه ونه موندل شوه." }, 404);
        const member = await env.DB.prepare("SELECT 1 AS yes FROM game_room_players WHERE room_id = ? AND player_id = ?").bind(room.id, player.id).first();
        if (!member) return reply({ ok: false, error: "تاسو د دې خونې غړی نه یاست." }, 403);
        const rows = await env.DB.prepare(
          "SELECT m.id, p.display_name, m.message, m.created_at FROM game_messages m JOIN game_players p ON p.id = m.player_id WHERE m.room_id = ? AND m.id > ? ORDER BY m.id LIMIT 100"
        ).bind(room.id, after).all();
        return reply({ ok: true, messages: rows.results || [] });
      }

      return reply({ ok: false, error: "دا API لاره نه ده پېژندل شوې." }, 404);
    } catch (error) {
      return reply({ ok: false, error: "د سرور داخلي ستونزه.", detail: String(error?.message || error) }, 500);
    }
  }
};