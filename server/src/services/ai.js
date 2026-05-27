import { GoogleGenerativeAI } from '@google/generative-ai';

const KNOWN_COMPETENCES = [
  { key: 'react', name: 'Desarrollo frontend con React', area: 'software' },
  { key: 'node', name: 'APIs con Node.js', area: 'software' },
  { key: 'sql', name: 'Modelado de datos relacional', area: 'datos' },
  { key: 'ux', name: 'Diseno de experiencia de usuario', area: 'producto' },
  { key: 'investigacion', name: 'Investigacion aplicada', area: 'academia' },
  { key: 'liderazgo', name: 'Liderazgo colaborativo', area: 'gestion' },
  { key: 'analisis', name: 'Analisis de informacion', area: 'datos' },
  { key: 'automatizacion', name: 'Automatizacion de procesos', area: 'operaciones' }
];

const LEVELS = ['principiante', 'intermedio', 'avanzado'];

export async function suggestCompetences({ title, body }) {
  if (process.env.GEMINI_API_KEY) {
    try {
      return await suggestWithGemini({ title, body });
    } catch (error) {
      console.warn('Gemini unavailable, using fallback:', error.message);
    }
  }

  return suggestWithFallback({ title, body });
}

async function suggestWithGemini({ title, body }) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `
Analiza esta evidencia de competencias. Devuelve solo JSON valido con esta forma:
[
  {"name":"Competencia", "level":"principiante|intermedio|avanzado", "confidence":0.82, "rationale":"motivo breve"}
]

Titulo: ${title}
Evidencia: ${body}
`;

  const response = await model.generateContent(prompt);
  const text = response.response.text().replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(text);
  return normalizeSuggestions(parsed, 'gemini');
}

function suggestWithFallback({ title, body }) {
  const text = `${title} ${body}`.toLowerCase();
  const matches = KNOWN_COMPETENCES.filter((item) => text.includes(item.key));
  const selected = matches.length ? matches : inferGenericCompetences(text);

  return selected.slice(0, 4).map((item, index) => ({
    name: item.name,
    level: inferLevel(text, index),
    confidence: Math.max(0.58, 0.86 - index * 0.08),
    rationale: `Sugerencia basada en terminos y acciones descritas en la evidencia.`,
    source: 'fallback'
  }));
}

function inferGenericCompetences(text) {
  if (text.length > 700) {
    return [
      { name: 'Documentacion de proyectos', area: 'comunicacion' },
      { name: 'Analisis de informacion', area: 'datos' }
    ];
  }

  return [
    { name: 'Resolucion de problemas', area: 'transversal' },
    { name: 'Aprendizaje autonomo', area: 'transversal' }
  ];
}

function inferLevel(text, offset) {
  if (/(lider[eé]|arquitect|optimiz|mentoric|producci[oó]n|avanzad)/i.test(text)) return 'avanzado';
  if (/(implement|coord|diseñ|integr|analic|constru)/i.test(text)) return 'intermedio';
  return LEVELS[offset] ?? 'principiante';
}

function normalizeSuggestions(items, source) {
  return items.slice(0, 5).map((item) => ({
    name: String(item.name ?? 'Competencia no especificada').slice(0, 80),
    level: LEVELS.includes(item.level) ? item.level : 'intermedio',
    confidence: Math.min(1, Math.max(0, Number(item.confidence ?? 0.7))),
    rationale: String(item.rationale ?? 'Sugerida por analisis de IA.').slice(0, 240),
    source
  }));
}
