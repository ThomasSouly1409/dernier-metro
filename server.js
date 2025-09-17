"use strict";
const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// --- Connexion PostgreSQL ---
const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "postgres",
  database: process.env.PGDATABASE || "metrodb",
  port: 5432,
});

// --- Configuration Swagger ---
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Dernier Métro API",
      version: "1.0.0",
      description: "API pour connaître les horaires du dernier métro parisien",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Serveur de développement",
      },
    ],
  },
  apis: ["./server.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// --- Swagger ---
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Logger ---
app.use((req, res, next) => {
  const t0 = Date.now();
  res.on("finish", () => {
    const dt = Date.now() - t0;
    console.log(`${req.method} ${req.path} -> ${res.statusCode} ${dt}ms`);
  });
  next();
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Vérification de l'état de l'API
 *     tags: [Santé]
 */
app.get("/health", (_req, res) =>
  res.status(200).json({ status: "ok", service: "dernier-metro-api" })
);

// --- Utilitaire pour simuler HH:MM ---
function nextTimeFromNow(headwayMin = 3) {
  const now = new Date();
  const next = new Date(now.getTime() + headwayMin * 60 * 1000);
  const hh = String(next.getHours()).padStart(2, "0");
  const mm = String(next.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * @swagger
 * /next-metro:
 *   get:
 *     summary: Horaire du prochain métro (simulation)
 *     tags: [Métro]
 */
app.get("/next-metro", (req, res) => {
  const station = (req.query.station || "").toString().trim();
  if (!station) return res.status(400).json({ error: "missing station" });
  return res.status(200).json({
    station,
    line: "M1",
    headwayMin: 3,
    nextArrival: nextTimeFromNow(3),
  });
});

/**
 * @swagger
 * /last-metro:
 *   get:
 *     summary: Horaire du dernier métro par station
 *     tags: [Métro]
 */
app.get("/last-metro", async (req, res) => {
  const station = (req.query.station || "").toString().trim();
  if (!station) return res.status(400).json({ error: "missing station" });

  try {
    // Lire config globale (metro.defaults)
    const defaultsRes = await pool.query(
      `SELECT value FROM config WHERE key = 'metro.defaults'`
    );
    if (defaultsRes.rowCount === 0) {
      return res.status(500).json({ error: "missing defaults in config" });
    }
    const defaults = defaultsRes.rows[0].value;

    // Lire config last metros (metro.last)
    const lastRes = await pool.query(
      `SELECT value FROM config WHERE key = 'metro.last'`
    );
    if (lastRes.rowCount === 0) {
      return res.status(500).json({ error: "missing last metros in config" });
    }
    const lastMap = lastRes.rows[0].value;

    // Chercher station (insensible à la casse)
    const stationKey = Object.keys(lastMap).find(
      (s) => s.toLowerCase() === station.toLowerCase()
    );
    if (!stationKey) {
      return res.status(404).json({ error: "station not found" });
    }

    return res.status(200).json({
      station: stationKey,
      lastMetro: lastMap[stationKey],
      line: defaults.line,
      tz: defaults.tz,
    });
  } catch (err) {
    console.error("Erreur DB /last-metro :", err);
    return res.status(500).json({ error: "internal server error" });
  }
});

/**
 * @swagger
 * /db-test:
 *   get:
 *     summary: Vérifier la connexion PostgreSQL
 *     tags: [Base de données]
 */
app.get("/db-test", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as now");
    res.json({ db_time: result.rows[0].now });
  } catch (err) {
    console.error("DB error", err);
    res.status(500).json({ error: "db connection failed" });
  }
});

/**
 * @swagger
 * /db-check:
 *   get:
 *     summary: Vérification complète DB
 *     tags: [Base de données]
 */
app.get("/db-check", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as now");
    res.json({ status: "ok", db_time: result.rows[0].now });
  } catch (err) {
    console.error("Erreur DB :", err.message);
    res.status(500).json({ status: "error", error: err.message });
  }
});

// --- 404 JSON ---
app.use((_req, res) => res.status(404).json({ error: "not found" }));

// --- Start server ---
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API ready on http://localhost:${PORT}`);
  console.log(
    `📚 Documentation Swagger disponible sur : http://localhost:${PORT}/api-docs`
  );
});

module.exports = app;