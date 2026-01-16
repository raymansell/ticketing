import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import buildClient from '@/api/buildClient';

type CurrentUser = { id: string; email: string } | null;
type Order = {
  id: string;
  ticket: { price: number; title: string };
  status: string;
  expiresAt: string;
};

export const getServerSideProps = (async (context) => {
  // Fetch data from external API
  const client = buildClient(context);
  const [currentUserResponse, ordersResponse] = await Promise.all([
    client.get('/api/users/currentuser'),
    client.get('/api/orders'),
  ]);

  const currentUser: CurrentUser = currentUserResponse.data.currentUser;
  const orders: Order[] = ordersResponse.data;
  // Pass data to the page via props
  return { props: { currentUser, orders } };
}) satisfies GetServerSideProps<{ currentUser: CurrentUser; orders: Order[] }>;

const OrderIndex = ({
  // currentUser,
  orders,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <ul>
      {orders.map((order) => {
        return (
          <li key={order.id}>
            {order.ticket.title} - {order.status}
          </li>
        );
      })}
    </ul>
  );
};

export default OrderIndex;
