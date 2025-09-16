import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware log
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// GET /health
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// GET /next-metro
app.get("/next-metro", (req, res) => {
  const { station } = req.query;
  if (!station) {
    return res.status(400).json({ error: "missing station" });
  }

  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Service fictif 05:30 -> 01:15
  const inService =
    (hours > 5 || (hours === 5 && minutes >= 30)) ||
    (hours === 0 || (hours === 1 && minutes <= 15));

  if (!inService) {
    return res.status(200).json({ service: "closed" });
  }

  // Headway fixe 3 min
  const headwayMin = 3;
  const nextArrival = new Date(now.getTime() + headwayMin * 60000);

  const hh = String(nextArrival.getHours()).padStart(2, "0");
  const mm = String(nextArrival.getMinutes()).padStart(2, "0");

  const isLast =
    (hours === 0 && minutes >= 45) ||
    (hours === 1 && minutes <= 15);

  res.status(200).json({
    station,
    line: "M1",
    headwayMin,
    nextArrival: `${hh}:${mm}`,
    isLast,
    tz: "Europe/Paris",
  });
});

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ error: "not found" });
});

app.listen(PORT, () => {
  console.log(`🚇 Dernier Metro API running on port ${PORT}`);
});