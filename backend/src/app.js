import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

import env from './config/env.js';
import logger from './config/logger.js';
import routes from './routes/index.js';
import notFoundMiddleware from './middlewares/notFound.middleware.js';
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan('dev'));
app.use(
  pinoHttp({
    logger,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;