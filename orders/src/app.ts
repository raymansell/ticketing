import express from 'express';
import cookieSession from 'cookie-session';
import {
  errorHandler,
  NotFoundError,
  currentUser,
} from '@raymanselltickets/common';
import { indexOrderRouter } from './routes/index.js';
import { newOrderRouter } from './routes/new.js';
import { showOrderRouter } from './routes/show.js';
import { deleteOrderRouter } from './routes/delete.js';

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

app.use(indexOrderRouter);
app.use(newOrderRouter);
app.use(showOrderRouter);
app.use(deleteOrderRouter);

app.all('/{*splat}', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
