export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'SkillCert API',
    version: '0.2.0',
    description: 'API REST para red social competencial con evidencias, validaciones, comunidades, badges y credenciales.'
  },
  servers: [{ url: 'http://localhost:4000/api' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    }
  },
  paths: {
    '/auth/register': { post: { summary: 'Registrar usuario' } },
    '/auth/login': { post: { summary: 'Iniciar sesion' } },
    '/auth/me': { get: { summary: 'Usuario autenticado', security: [{ bearerAuth: [] }] } },
    '/users': { get: { summary: 'Buscar usuarios por nombre o habilidad' } },
    '/users/{userId}/profile': { get: { summary: 'Perfil publico con evidencias y badges' } },
    '/users/{userId}/follow': {
      post: { summary: 'Seguir usuario', security: [{ bearerAuth: [] }] },
      delete: { summary: 'Dejar de seguir usuario', security: [{ bearerAuth: [] }] }
    },
    '/users/{userId}/export': { get: { summary: 'Exportar perfil JSON', security: [{ bearerAuth: [] }] } },
    '/users/{userId}/competence-map': { get: { summary: 'Mapa de competencias filtrable' } },
    '/users/{userId}/progress': { get: { summary: 'Linea temporal de una habilidad' } },
    '/evidences': {
      get: { summary: 'Listar evidencias' },
      post: { summary: 'Crear evidencia', security: [{ bearerAuth: [] }] }
    },
    '/evidences/{id}/votes': { post: { summary: 'Validar evidencia con voto ponderado', security: [{ bearerAuth: [] }] } },
    '/feed': { get: { summary: 'Feed de seguidos y comunidades', security: [{ bearerAuth: [] }] } },
    '/communities': {
      get: { summary: 'Listar comunidades' },
      post: { summary: 'Crear comunidad', security: [{ bearerAuth: [] }] }
    },
    '/communities/{id}': { get: { summary: 'Detalle de comunidad' } },
    '/communities/{id}/join': {
      post: { summary: 'Unirse a comunidad', security: [{ bearerAuth: [] }] },
      delete: { summary: 'Salir de comunidad', security: [{ bearerAuth: [] }] }
    },
    '/trends': { get: { summary: 'Habilidades mas validadas en los ultimos 7 dias' } },
    '/badges/{badgeId}/credential': { get: { summary: 'Acuñar badge como VC JSON simulada', security: [{ bearerAuth: [] }] } }
  }
};
