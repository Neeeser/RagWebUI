import { withPageAuthRequired } from '@auth0/nextjs-auth0';
export const getServerSideProps = withPageAuthRequired();

import React from 'react';
import ProfileSettings from "../components/User/UserSettings";


const ChatPage: React.FC = () => {
  return (
    <ProfileSettings />
  );
};

export default ChatPage;