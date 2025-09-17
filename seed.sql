INSERT INTO config(key, value) VALUES
('metro.defaults', '{"line":"M1","tz":"Europe/Paris"}'),
('metro.last', '{"Chatelet":"01:30","Bastille":"01:45"}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;