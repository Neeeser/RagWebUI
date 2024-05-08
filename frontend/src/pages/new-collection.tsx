import { withPageAuthRequired } from '@auth0/nextjs-auth0';
export const getServerSideProps = withPageAuthRequired();

import React from 'react';
import { NewCollection } from '@/components/Collections/NewCollection';

const NewCollectionPage: React.FC = () => {
  return (
    <NewCollection />
  );
};

export default NewCollectionPage;