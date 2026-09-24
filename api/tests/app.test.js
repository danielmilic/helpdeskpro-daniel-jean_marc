const request = require('supertest');
const { creerApp } = require('../app');
const { creerStockage } = require('../db');

// Les tests utilisent le stockage en mémoire : aucune base nécessaire dans le pipeline.
let app;
beforeEach(() => { app = creerApp(creerStockage(null)); });

describe('GET /health', () => {
  test('répond 200 et status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Tickets', () => {
  test('la liste est vide au départ', async () => {
    const res = await request(app).get('/tickets');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('création puis lecture d\'un ticket', async () => {
    const creation = await request(app)
      .post('/tickets')
      .send({ titre: 'Imprimante du 2e étage en panne', priorite: 'haute' });
    expect(creation.statusCode).toBe(201);
    expect(creation.body.id).toBe(1);
    expect(creation.body.statut).toBe('nouveau');

    const lecture = await request(app).get('/tickets/1');
    expect(lecture.statusCode).toBe(200);
    expect(lecture.body.titre).toBe('Imprimante du 2e étage en panne');
  });

  test('refuse un titre trop court', async () => {
    const res = await request(app).post('/tickets').send({ titre: 'ok' });
    expect(res.statusCode).toBe(400);
  });

  test('refuse une priorité inconnue', async () => {
    const res = await request(app).post('/tickets').send({ titre: 'Écran noir', priorite: 'urgentissime' });
    expect(res.statusCode).toBe(400);
  });

  test('404 pour un ticket inexistant', async () => {
    const res = await request(app).get('/tickets/42');
    expect(res.statusCode).toBe(404);
  });
});
