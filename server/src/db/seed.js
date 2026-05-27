import 'dotenv/config';
import { db } from './database.js';
import './migrate.js';
import { hashPassword } from '../services/authService.js';
import { voteWeightForKarma } from '../services/karmaService.js';
import { refreshBadgesForUser } from '../services/badgeService.js';

db.exec(`
  DELETE FROM user_badges;
  DELETE FROM community_members;
  DELETE FROM follows;
  DELETE FROM votes;
  DELETE FROM competence_suggestions;
  DELETE FROM evidences;
  DELETE FROM communities;
  DELETE FROM users;
`);

const password = await hashPassword('password123');
const createUser = db.prepare(
  'INSERT INTO users (name, email, password_hash, headline, bio, karma) VALUES (?, ?, ?, ?, ?, ?)'
);
const ana = createUser.run(
  'Ana Torres',
  'ana@example.com',
  password,
  'Frontend developer y mentora React',
  'Construyo interfaces de aprendizaje y evidencias tecnicas verificables.',
  28
).lastInsertRowid;
const luis = createUser.run(
  'Luis Mejia',
  'luis@example.com',
  password,
  'Arquitecto Node.js',
  'Diseno APIs, datos relacionales y automatizaciones para equipos pequenos.',
  42
).lastInsertRowid;
const sofia = createUser.run(
  'Sofia Rojas',
  'sofia@example.com',
  password,
  'Investigadora UX',
  'Me enfoco en comunidades de practica, evaluacion y producto.',
  18
).lastInsertRowid;

const createCommunity = db.prepare(
  'INSERT INTO communities (name, slug, area, description, owner_id) VALUES (?, ?, ?, ?, ?)'
);
const web = createCommunity.run(
  'Desarrollo Web',
  'desarrollo-web',
  'Software',
  'React, APIs, bases de datos y despliegue de productos web.',
  ana
).lastInsertRowid;
const prompt = createCommunity.run(
  'Prompt Engineering',
  'prompt-engineering',
  'IA aplicada',
  'Practicas para disenar, evaluar y automatizar flujos con modelos generativos.',
  sofia
).lastInsertRowid;
const welding = createCommunity.run(
  'Soldadura',
  'soldadura',
  'Oficios tecnicos',
  'Evidencias verificables para procesos MIG, TIG, SMAW y seguridad.',
  luis
).lastInsertRowid;

const join = db.prepare('INSERT OR IGNORE INTO community_members (community_id, user_id) VALUES (?, ?)');
[
  [web, ana],
  [web, luis],
  [web, sofia],
  [prompt, ana],
  [prompt, sofia],
  [welding, luis]
].forEach((item) => join.run(...item));

db.prepare('INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)').run(ana, luis);
db.prepare('INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)').run(ana, sofia);
db.prepare('INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)').run(luis, ana);

const createEvidence = db.prepare('INSERT INTO evidences (title, body, author_id, community_id) VALUES (?, ?, ?, ?)');
const createSuggestion = db.prepare(`
  INSERT INTO competence_suggestions (evidence_id, name, level, confidence, rationale, source)
  VALUES (?, ?, ?, ?, ?, ?)
`);
const createVote = db.prepare(`
  INSERT INTO votes (evidence_id, user_id, value, weight, weighted_value, comment)
  VALUES (?, ?, ?, ?, ?, ?)
`);

function evidence({ title, body, authorId, communityId, suggestions, votes }) {
  const evidenceId = createEvidence.run(title, body, authorId, communityId).lastInsertRowid;
  suggestions.forEach((suggestion) => createSuggestion.run(evidenceId, ...suggestion));
  votes.forEach(([userId, value, comment]) => {
    const karma = db.prepare('SELECT karma FROM users WHERE id = ?').get(userId).karma;
    const weight = voteWeightForKarma(karma);
    createVote.run(evidenceId, userId, value, weight, value * weight, comment);
  });
  return evidenceId;
}

evidence({
  title: 'Dashboard React para seguimiento academico',
  body: 'Implemente una aplicacion React con filtros, componentes reutilizables y visualizacion de datos para analizar progreso academico. Tambien modele tablas SQL para evidencias y usuarios.',
  authorId: ana,
  communityId: web,
  suggestions: [
    ['Desarrollo frontend con React', 'intermedio', 0.84, 'La evidencia describe implementacion de componentes y visualizacion.', 'seed'],
    ['Modelado de datos relacional', 'intermedio', 0.74, 'Incluye diseno de tablas SQL para el dominio.', 'seed']
  ],
  votes: [
    [luis, 1, 'La evidencia es concreta.'],
    [sofia, 1, 'Buen alcance tecnico.']
  ]
});

evidence({
  title: 'API Node para validaciones ponderadas',
  body: 'Disene una API Express con JWT, rutas protegidas, SQLite y calculo de peso por karma para que las validaciones de pares tengan reputacion acumulada.',
  authorId: luis,
  communityId: web,
  suggestions: [
    ['APIs con Node.js', 'avanzado', 0.9, 'Incluye arquitectura, autenticacion y reglas de reputacion.', 'seed'],
    ['Modelado de datos relacional', 'intermedio', 0.8, 'Usa SQLite con relaciones sociales y evidencias.', 'seed']
  ],
  votes: [
    [ana, 1, 'El diseno es util para escalar.'],
    [sofia, 1, 'La ponderacion mejora la calidad de validacion.']
  ]
});

evidence({
  title: 'Framework de evaluacion para prompts',
  body: 'Coordine una matriz de pruebas para comparar prompts, medir consistencia de respuestas y documentar criterios de aceptacion en tareas educativas.',
  authorId: sofia,
  communityId: prompt,
  suggestions: [
    ['Prompt Engineering', 'intermedio', 0.88, 'Describe evaluacion sistematica de prompts.', 'seed'],
    ['Investigacion aplicada', 'intermedio', 0.76, 'Incluye criterios y medicion de resultados.', 'seed']
  ],
  votes: [
    [ana, 1, 'Buen metodo de evaluacion.'],
    [luis, 1, 'Sirve como evidencia objetiva.']
  ]
});

[ana, luis, sofia].forEach((userId) => refreshBadgesForUser(userId));

console.log('Demo data inserted.');
