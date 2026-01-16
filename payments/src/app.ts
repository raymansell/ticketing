import express from 'express';
import cookieSession from 'cookie-session';
import {
  errorHandler,
  NotFoundError,
  currentUser,
} from '@raymanselltickets/common';
import { createChargeRouter } from './routes/new.js';

const app = express();
app.set('trust proxy', true); // trust traffic from ingress-ngnix
app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);
app.use(currentUser);

app.use(createChargeRouter);

app.all('/{*splat}', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
