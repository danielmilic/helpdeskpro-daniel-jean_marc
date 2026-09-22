// Couche d'accès aux données.
// - Si DATABASE_URL est défini : PostgreSQL (via pg).
// - Sinon : stockage en mémoire (tests, découverte), sans persistance.

const { Pool } = require('pg');

const PRIORITES = ['basse', 'normale', 'haute'];
const STATUTS = ['nouveau', 'traité'];

function creerStockageMemoire() {
  const tickets = [];
  let prochainId = 1;
  return {
    type: 'memoire',
    async ping() { return true; },
    async lister() { return tickets; },
    async trouver(id) { return tickets.find((t) => t.id === id) || null; },
    async creer({ titre, priorite }) {
      const ticket = { id: prochainId++, titre, priorite, statut: 'nouveau', cree_le: new Date().toISOString() };
      tickets.push(ticket);
      return ticket;
    },
    async traiterNouveaux() {
      const nouveaux = tickets.filter((t) => t.statut === 'nouveau');
      nouveaux.forEach((t) => { t.statut = 'traité'; });
      return nouveaux.length;
    },
    async fermer() {},
  };
}

function creerStockagePostgres(url) {
  const pool = new Pool({ connectionString: url });
  return {
    type: 'postgres',
    async init() {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS tickets (
          id SERIAL PRIMARY KEY,
          titre TEXT NOT NULL,
          priorite TEXT NOT NULL DEFAULT 'normale',
          statut TEXT NOT NULL DEFAULT 'nouveau',
          cree_le TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`);
    },
    async ping() { await pool.query('SELECT 1'); return true; },
    async lister() {
      const { rows } = await pool.query('SELECT * FROM tickets ORDER BY id');
      return rows;
    },
    async trouver(id) {
      const { rows } = await pool.query('SELECT * FROM tickets WHERE id = $1', [id]);
      return rows[0] || null;
    },
    async creer({ titre, priorite }) {
      const { rows } = await pool.query(
        'INSERT INTO tickets (titre, priorite) VALUES ($1, $2) RETURNING *',
        [titre, priorite],
      );
      return rows[0];
    },
    async traiterNouveaux() {
      const { rowCount } = await pool.query("UPDATE tickets SET statut = 'traité' WHERE statut = 'nouveau'");
      return rowCount;
    },
    async fermer() { await pool.end(); },
  };
}

function creerStockage(url = process.env.DATABASE_URL) {
  return url ? creerStockagePostgres(url) : creerStockageMemoire();
}

module.exports = { creerStockage, PRIORITES, STATUTS };
