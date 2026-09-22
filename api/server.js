const { creerApp } = require('./app');
const { creerStockage } = require('./db');

const port = Number(process.env.API_PORT || process.env.PORT || 3000);

async function demarrer() {
  const stockage = creerStockage();
  if (stockage.init) await stockage.init();
  const app = creerApp(stockage);
  const serveur = app.listen(port, '0.0.0.0', () => {
    console.log(`HelpDesk Pro API à l'écoute sur le port ${port} (stockage : ${stockage.type})`);
  });

  // Arrêt propre : indispensable pour que "docker stop" soit rapide.
  const arreter = async () => {
    console.log('Arrêt en cours...');
    serveur.close(async () => { await stockage.fermer(); process.exit(0); });
  };
  process.on('SIGTERM', arreter);
  process.on('SIGINT', arreter);
}

demarrer().catch((err) => {
  console.error('Impossible de démarrer :', err);
  process.exit(1);
});
