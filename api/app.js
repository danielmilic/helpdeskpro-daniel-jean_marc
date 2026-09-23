const express = require('express');
const { creerStockage, PRIORITES } = require('./db');
// AJOUT : lit la version déclarée dans api/package.json modifiééééééééééé!!!!
const { version } = require('./package.json');

// Construit l'application Express. Le stockage est injectable (tests).
function creerApp(stockage = creerStockage()) {
  const app = express();
  app.use(express.json());
  app.locals.stockage = stockage;

  // Vérification de vie : utilisée par les healthchecks Docker et le smoke test du pipeline.
  app.get('/health', async (_req, res) => {
    try {
      await stockage.ping();
      res.status(200).json({ status: 'ok', stockage: stockage.type });
    } catch (err) {
      res.status(503).json({ status: 'ko', erreur: err.message });
    }
  });

  // AJOUT : version déployée, utilisée par le pipeline pour vérifier ce qui tourne.
  // APP_VERSION (variable d'environnement) prend le dessus si elle est définie.
  app.get('/version', (_req, res) => {
    res.json({ version: process.env.APP_VERSION || version });
  });

  app.get('/tickets', async (_req, res, next) => {
    try {
      res.json(await stockage.lister());
    } catch (err) { next(err); }
  });

  app.get('/tickets/:id', async (req, res, next) => {
    try {
      const ticket = await stockage.trouver(Number(req.params.id));
      if (!ticket) return res.status(404).json({ erreur: 'Ticket introuvable' });
      res.json(ticket);
    } catch (err) { next(err); }
  });

  app.post('/tickets', async (req, res, next) => {
    try {
      const { titre, priorite = 'normale' } = req.body || {};
      if (!titre || typeof titre !== 'string' || titre.trim().length < 3) {
        return res.status(400).json({ erreur: 'Le titre doit contenir au moins 3 caractères' });
      }
      if (!PRIORITES.includes(priorite)) {
        return res.status(400).json({ erreur: `Priorité invalide (${PRIORITES.join(', ')})` });
      }
      const ticket = await stockage.creer({ titre: titre.trim(), priorite });
      res.status(201).json(ticket);
    } catch (err) { next(err); }
  });

  // Gestion d'erreur centralisée : jamais de stack trace renvoyée au client.
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur interne' });
  });

  return app;
}

module.exports = { creerApp };
