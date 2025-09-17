// integration.test.js
const request = require("supertest");
const express = require("express");
const { Pool } = require("pg");
const app = require("./server"); // ton app express exporté

// --- DB seed vérification ---
const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "postgres",
  database: process.env.PGDATABASE || "metrodb",
  port: 5432,
});

beforeAll(async () => {
  // vérifier que les données nécessaires sont présentes
  const defaults = await pool.query(`SELECT value FROM config WHERE key='metro.defaults'`);
  const last = await pool.query(`SELECT value FROM config WHERE key='metro.last'`);
  if (defaults.rowCount === 0 || last.rowCount === 0) {
    throw new Error("La DB doit contenir metro.defaults et metro.last avant les tests");
  }
});

afterAll(async () => {
  await pool.end();
});

describe("/last-metro", () => {
  test("200 avec station connue (insensible à la casse)", async () => {
    const response = await request(app)
      .get("/last-metro")
      .query({ station: "Chatelet" }); // utiliser une station connue de metro.last

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("station");
    expect(response.body).toHaveProperty("lastMetro");
    expect(response.body).toHaveProperty("line");
    expect(response.body).toHaveProperty("tz");
  });

  test("404 avec station inconnue", async () => {
    const response = await request(app)
      .get("/last-metro")
      .query({ station: "StationInexistante" });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
  });

  test("400 sans station", async () => {
    const response = await request(app)
      .get("/last-metro")
      .query({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });
});

describe("/next-metro", () => {
  test("200 avec station et nextArrival format HH:MM", async () => {
    const response = await request(app)
      .get("/next-metro")
      .query({ station: "Chatelet" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("station");
    expect(response.body).toHaveProperty("nextArrival");

    // vérifier format HH:MM
    expect(response.body.nextArrival).toMatch(/^\d{2}:\d{2}$/);
  });
});