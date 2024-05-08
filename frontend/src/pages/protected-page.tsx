// pages/protected-page.tsx
import React from 'react';
import { UserProvider, useUser } from '@auth0/nextjs-auth0/client';

import { withPageAuthRequired } from '@auth0/nextjs-auth0';
export const getServerSideProps = withPageAuthRequired();

const ProtectedPage = () => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view this page.</div>;
  }

  return <div> Welcome, {user.name}!</div >;
};

export default ProtectedPage;
