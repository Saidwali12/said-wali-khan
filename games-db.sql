-- Online Game Center: independent Cloudflare D1 database
-- Run this SQL in a NEW D1 database only.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS game_players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  display_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_code TEXT NOT NULL UNIQUE,
  game_type TEXT NOT NULL CHECK (game_type IN ('ludo','cards_hokm','cards_hearts','alquerque')),
  game_mode TEXT NOT NULL CHECK (game_mode IN ('computer','two_players','four_teams')),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','playing','paused','finished')),
  host_player_id INTEGER NOT NULL,
  current_turn_seat INTEGER NOT NULL DEFAULT 1,
  state_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (host_player_id) REFERENCES game_players(id)
);

CREATE TABLE IF NOT EXISTS game_room_players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  player_id INTEGER NOT NULL,
  seat INTEGER NOT NULL,
  team INTEGER,
  joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(room_id, player_id),
  UNIQUE(room_id, seat),
  FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES game_players(id)
);

CREATE TABLE IF NOT EXISTS game_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  player_id INTEGER,
  event_type TEXT NOT NULL,
  event_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES game_players(id)
);

CREATE TABLE IF NOT EXISTS game_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  player_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES game_players(id)
);

CREATE INDEX IF NOT EXISTS idx_game_rooms_status ON game_rooms(status);
CREATE INDEX IF NOT EXISTS idx_game_room_players_room ON game_room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_game_events_room_id ON game_events(room_id, id);
CREATE INDEX IF NOT EXISTS idx_game_messages_room_id ON game_messages(room_id, id);
