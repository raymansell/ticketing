import { PropsWithChildren } from 'react';
import Header from './Header';

type CurrentUser = { id: string; email: string } | null;
type BaseLayoutProps = {
  currentUser: CurrentUser;
};

export default function BaseLayout({
  children,
  currentUser,
}: PropsWithChildren<BaseLayoutProps>) {
  return (
    <div className='container'>
      <Header currentUser={currentUser}></Header>
      {children}
    </div>
  );
}
