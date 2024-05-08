import { withPageAuthRequired } from '@auth0/nextjs-auth0';
export const getServerSideProps = withPageAuthRequired();

import React from 'react';
import { MainChat } from '@/components/ChatBot/MainChat';

const ChatPage: React.FC = () => {
  return (
    <MainChat />
  );
};

export default ChatPage;