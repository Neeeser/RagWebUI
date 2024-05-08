// src/components/ChatBot/ChatHistory.tsx

import React from 'react';
import ChatMessage from './ChatMessage';
import styles from '../../styles/Home.module.css';

interface ChatHistoryProps {
  messages: { message_id: string; text: string; isUser: boolean; isComplete: boolean;}[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  return (
    <div className={styles.chatHistory}>
      {messages.map((message) => (
        <ChatMessage
          key={message.message_id}
          message_id={message.message_id}
          text={message.text}
          isUser={message.isUser}
          isComplete={message.isComplete}
        />
      ))}
    </div>
  );
};

export default ChatHistory;