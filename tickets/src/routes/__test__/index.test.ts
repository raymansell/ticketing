import request from 'supertest';
import { app } from '../../app.js';

const createTicket = (title: string, price: number) => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price,
    })
    .expect(201);
};

it('can fetch a list of tickets', async () => {
  await createTicket('concert', 50);
  await createTicket('museum', 30);
  await createTicket('show', 100);

  const response = await request(app).get(`/api/tickets`).send().expect(200);

  expect(response.body.length).toEqual(3);
});
