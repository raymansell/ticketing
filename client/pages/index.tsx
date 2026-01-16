import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import buildClient from '@/api/buildClient';
import Link from 'next/link';

type CurrentUser = { id: string; email: string } | null;
type Ticket = { id: string; title: string; price: number; userId: string };

export const getServerSideProps = (async (context) => {
  // Fetch data from external API
  const client = buildClient(context);
  const [currentUserResponse, ticketsResponse] = await Promise.all([
    client.get('/api/users/currentuser'),
    client.get('/api/tickets'),
  ]);

  const currentUser: CurrentUser = currentUserResponse.data.currentUser;
  const tickets: Ticket[] = ticketsResponse.data;
  // Pass data to the page via props
  return { props: { currentUser, tickets } };
}) satisfies GetServerSideProps<{
  currentUser: CurrentUser;
  tickets: Ticket[];
}>;

export default function LandingPage({
  // currentUser,
  tickets,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const ticketList = tickets.map((ticket) => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href={`/tickets/${encodeURIComponent(ticket.id)}`}>View</Link>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <h1>Tickets</h1>
      <table className='table'>
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
}
