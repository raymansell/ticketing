import Router from 'next/router';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import buildClient from '@/api/buildClient';
import { useRequest } from '@/hooks/useRequest';

type CurrentUser = { id: string; email: string } | null;
type Ticket = { id: string; title: string; price: number; userId: string };
type Order = { id: string /* id is all we care about here */ };

export const getServerSideProps = (async (context) => {
  // Fetch data from external API
  const client = buildClient(context);
  const { ticketId } = context.query;
  const [currentUserResponse, ticketsResponse] = await Promise.all([
    client.get('/api/users/currentuser'),
    client.get(`/api/tickets/${ticketId}`),
  ]);
  const currentUser: CurrentUser = currentUserResponse.data.currentUser;
  const ticket: Ticket = ticketsResponse.data;
  // Pass data to the page via props
  return { props: { currentUser, ticket } };
}) satisfies GetServerSideProps<{ currentUser: CurrentUser; ticket: Ticket }>;

const TicketShow = ({
  // currentUser,
  ticket,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { doRequest, errors } = useRequest<Order>({
    url: '/api/orders',
    method: 'post',
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (order) => Router.push(`/orders/${order.id}`),
  });

  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>
      {errors}
      <button onClick={() => doRequest()} className='btn btn-primary'>
        Purchase
      </button>
    </div>
  );
};

export default TicketShow;
