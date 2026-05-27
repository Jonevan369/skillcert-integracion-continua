import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { ZodError } from 'zod';
import { router } from './routes.js';
import { openApiSpec } from './openapi.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.use('/api', router);

app.use((error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: 'Datos invalidos', issues: error.issues });
  }
  if (error.status) {
    return res.status(error.status).json({ message: error.message });
  }
  console.error(error);
  return res.status(500).json({ message: error.message ?? 'Error interno' });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}/api`);
});
