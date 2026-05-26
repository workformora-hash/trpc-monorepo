import React from 'react';

interface User {
  id: number;
  name: string;
}

const Header: React.FC<{ user: User }> = ({ user }) => {
  return (
    <header>
      <h1>{user.name}</h1>
    </header>
  );
};

export default Header;
