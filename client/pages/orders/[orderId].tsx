import Router from 'next/router';
import StripeCheckout from 'react-stripe-checkout';
import { useEffect, useState } from 'react';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import buildClient from '@/api/buildClient';
import { useRequest } from '@/hooks/useRequest';

type CurrentUser = { id: string; email: string } | null;
type Order = { id: string; ticket: { price: number }; expiresAt: string };
type Payment = { id: string /* id is all we care about here */ };

export const getServerSideProps = (async (context) => {
  // Fetch data from external API
  const client = buildClient(context);
  const { orderId } = context.query;
  const [currentUserResponse, orderResponse] = await Promise.all([
    client.get('/api/users/currentuser'),
    client.get(`/api/orders/${orderId}`),
  ]);
  const currentUser: CurrentUser = currentUserResponse.data.currentUser;
  const order: Order = orderResponse.data;
  // Pass data to the page via props
  return { props: { currentUser, order } };
}) satisfies GetServerSideProps<{ currentUser: CurrentUser; order: Order }>;

const OrderShow = ({
  currentUser,
  order,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [timeLeft, setTimeLeft] = useState(0);

  const { doRequest, errors } = useRequest<Payment>({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push('/orders'),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const millisecondsLeft =
        new Date(order.expiresAt).getTime() - new Date().getTime();
      setTimeLeft(Math.round(millisecondsLeft / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }

  return (
    <div>
      Time left to pay: {timeLeft} seconds
      <StripeCheckout
        token={(token) => doRequest({ token: token.id })}
        stripeKey='pk_test_51SpgJUKqUkh4QJFwTbuYuvZSPFfxMiBr9mITCoB8ahrY7aOQKPzvru2UoIvTcetKD9cwX7U11a6pn462kSBcMTF500lrufsaOX'
        amount={order.ticket.price * 100}
        email={currentUser?.email}
      />
      {errors}
    </div>
  );
};

export default OrderShow;
