import { useState } from 'react';
import Router from 'next/router';
import type { GetServerSideProps } from 'next';
import buildClient from '@/api/buildClient';
import { useRequest } from '@/hooks/useRequest';

type CurrentUser = { id: string; email: string } | null;

export const getServerSideProps = (async (context) => {
  // Fetch data from external API
  const client = buildClient(context);
  const response = await client.get('/api/users/currentuser');
  const currentUser: CurrentUser = response.data.currentUser;
  // Pass data to the page via props
  return { props: { currentUser } };
}) satisfies GetServerSideProps<{ currentUser: CurrentUser }>;

const NewTicket = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: {
      title,
      price,
    },
    onSuccess: () => Router.push('/'),
  });

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await doRequest();
  };

  const onBlur = () => {
    const value = parseFloat(price);
    if (isNaN(value)) {
      return;
    }

    setPrice(value.toFixed(2));
  };

  return (
    <div>
      <h1>Create a ticket</h1>
      <form onSubmit={onSubmit}>
        <div className='form-group'>
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className='form-control'
          />
        </div>
        <div className='form-group'>
          <label>Price</label>
          <input
            value={price}
            onBlur={onBlur}
            onChange={(e) => setPrice(e.target.value)}
            className='form-control'
          />
        </div>
        {errors}
        <button className='btn btn-primary'>Submit</button>
      </form>
    </div>
  );
};

export default NewTicket;
