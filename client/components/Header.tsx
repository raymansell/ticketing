import Link from 'next/link';

type CurrentUser = { id: string; email: string } | null;
type HeaderProps = {
  currentUser: CurrentUser;
};

const Header = ({ currentUser }: HeaderProps) => {
  const links = [
    !currentUser && { label: 'Sign Up', href: '/auth/signup' },
    !currentUser && { label: 'Sign In', href: '/auth/signin' },
    currentUser && { label: 'Sell Tickets', href: '/tickets/new' },
    currentUser && { label: 'My Orders', href: '/orders' },
    currentUser && { label: 'Sign Out', href: '/auth/signout' },
  ]
    .filter((linkConfig) => !!linkConfig)
    .map(({ label, href }) => {
      return (
        <li className='nav-item' key={href}>
          <Link href={href} className='nav-link'>
            {label}
          </Link>
        </li>
      );
    });

  return (
    <nav className='navbar navbar-light bg-light'>
      <Link href='/' className='navbar-brand'>
        Tix
      </Link>
      <div className='d-flex justify-contend-end'>
        <ul className='nav d-flex align-items-center'>{links}</ul>
      </div>
    </nav>
  );
};
export default Header;
