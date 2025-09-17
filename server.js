"use strict";
const express = require("express");
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dernier Métro API',
      version: '1.0.0',
      description: 'API pour connaître les horaires du dernier métro parisien',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Serveur de développement',
      },
    ],
  },
  apis: ['./server.js'], // Chemin vers les fichiers contenant les annotations
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Route pour servir la documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Logger minimal: méthode, chemin, status, durée
app.use((req, res, next) => {
  const t0 = Date.now();
  res.on('finish', () => {
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
 *     description: Endpoint de santé pour vérifier que l'API fonctionne
 *     tags:
 *       - Santé
 *     responses:
 *       200:
 *         description: API fonctionnelle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 service:
 *                   type: string
 *                   example: dernier-metro-api
 */
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok', service: 'dernier-metro-api' }));

// Utilitaire pour simuler un horaire HH:MM
function nextTimeFromNow(headwayMin = 3) {
  const now = new Date();
  const next = new Date(now.getTime() + headwayMin * 60 * 1000);
  const hh = String(next.getHours()).padStart(2, '0');
  const mm = String(next.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * @swagger
 * /next-metro:
 *   get:
 *     summary: Obtenir l'horaire du prochain métro
 *     description: Retourne l'horaire du prochain métro pour une station donnée
 *     tags:
 *       - Métro
 *     parameters:
 *       - in: query
 *         name: station
 *         required: true
 *         description: Nom de la station de métro
 *         schema:
 *           type: string
 *           example: Chatelet
 *     responses:
 *       200:
 *         description: Horaire du prochain métro
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 station:
 *                   type: string
 *                   description: Nom de la station
 *                   example: Chatelet
 *                 line:
 *                   type: string
 *                   description: Ligne de métro
 *                   example: M1
 *                 headwayMin:
 *                   type: integer
 *                   description: Fréquence en minutes
 *                   example: 3
 *                 nextArrival:
 *                   type: string
 *                   description: Horaire du prochain métro (HH:MM)
 *                   example: "14:35"
 *       400:
 *         description: Paramètre station manquant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: missing station
 */
app.get('/next-metro', (req, res) => {
  const station = (req.query.station || '').toString().trim();
  if (!station) return res.status(400).json({ error: "missing station" });
  return res.status(200).json({ station, line: 'M1', headwayMin: 3, nextArrival: nextTimeFromNow(3) });
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Message d'erreur
 */

// 404 JSON
app.use((_req, res) => res.status(404).json({ error: 'not found' }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API ready on http://localhost:${PORT}`);
  console.log(`📚 Documentation Swagger disponible sur : http://localhost:${PORT}/api-docs`);
});
