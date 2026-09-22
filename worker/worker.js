// Worker HelpDesk Pro : toutes les WORKER_INTERVAL_MS, passe les tickets "nouveau" à "traité".
// Illustre un service sans port publié, qui partage la base avec l'API.
const { Pool } = require('pg');

const url = process.env.DATABASE_URL;
const intervalle = Number(process.env.WORKER_INTERVAL_MS || 10000);

if (!url) {
  console.error('DATABASE_URL est requis pour le worker');
  process.exit(1);
}

const pool = new Pool({ connectionString: url });

async function traiter() {
  try {
    const { rowCount } = await pool.query("UPDATE tickets SET statut = 'traité' WHERE statut = 'nouveau'");
    if (rowCount > 0) console.log(`${new Date().toISOString()} - ${rowCount} ticket(s) traité(s)`);
  } catch (err) {
    // La table peut ne pas encore exister au premier démarrage : on réessaiera au prochain cycle.
    console.error('Traitement impossible :', err.message);
  }
}

console.log(`Worker démarré (intervalle ${intervalle} ms)`);
const minuteur = setInterval(traiter, intervalle);

const arreter = async () => {
  clearInterval(minuteur);
  await pool.end();
  process.exit(0);
};
process.on('SIGTERM', arreter);
process.on('SIGINT', arreter);
