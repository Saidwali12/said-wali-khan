-- Additive voice-signaling migration for Online Game Center.
-- Run once in the existing saidwali-games-db D1 database.
-- This does not modify or recreate existing game tables.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS game_voice_presence (
  room_id INTEGER NOT NULL,
  player_id INTEGER NOT NULL,
  mic_ready INTEGER NOT NULL DEFAULT 0 CHECK (mic_ready IN (0,1)),
  peer_ready_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (room_id, player_id),
  FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES game_players(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS game_voice_signals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  from_player_id INTEGER NOT NULL,
  to_player_id INTEGER NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('offer','answer','candidate','hangup')),
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (from_player_id) REFERENCES game_players(id) ON DELETE CASCADE,
  FOREIGN KEY (to_player_id) REFERENCES game_players(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_game_voice_signals_recipient
  ON game_voice_signals(room_id, to_player_id, id);

CREATE INDEX IF NOT EXISTS idx_game_voice_presence_room
  ON game_voice_presence(room_id, updated_at);
