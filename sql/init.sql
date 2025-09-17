CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value JSONB
);

INSERT INTO config (key, value) VALUES
  ('metro.defaults', '{"line":"M1","tz":"Europe/Paris"}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO config (key, value) VALUES
  ('metro.last', '{"Châtelet":"00:42","Nation":"00:55"}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO config(key, value) VALUES
('metro.defaults', '{"line":"M1","tz":"Europe/Paris"}'),
('metro.last', '{"Chatelet":"01:30","Bastille":"01:45"}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;