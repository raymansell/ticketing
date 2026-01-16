import axios from 'axios';
import { GetServerSidePropsContext } from 'next';

export default function buildClient({ req }: GetServerSidePropsContext) {
  return axios.create({
    baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
    // this will include the Cookie that is required by the auth microservice
    headers: { ...req.headers, Host: 'ticketing.dev' },
    // Why the Host header? Answer:
    // https://globant.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19122282 @4:00
    // https://stackoverflow.com/a/43156094
  });
}
