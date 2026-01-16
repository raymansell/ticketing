import express from 'express';
import { currentUserRouter } from './routes/current-user.js';
import { signinRouter } from './routes/signin.js';
import { signoutRouter } from './routes/signout.js';
import { signupRouter } from './routes/signup.js';
import { errorHandler, NotFoundError } from '@raymanselltickets/common';
import cookieSession from 'cookie-session';

const app = express();
app.set('trust proxy', true); // trust traffic from ingress-ngnix
app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all('/{*splat}', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
