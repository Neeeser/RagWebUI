import React, { createContext, useContext, useState, ReactNode } from 'react';
import PopupBubble from '../ui/popup-bubble';

interface PopupMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
}

interface PopupContextType {
  showMessage: (message: string, type: 'success' | 'error' | 'warning') => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

let messageId = 0;

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};

export const PopupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<PopupMessage[]>([]);

  const showMessage = (newMessage: string, newType: 'success' | 'error' | 'warning') => {
    const id = ++messageId;
    setMessages(prevMessages => [...prevMessages, { id, message: newMessage, type: newType }]);
  };

  const removeMessage = (id: number) => {
    setMessages(prevMessages => prevMessages.filter(message => message.id !== id));
  };

  return (
    <PopupContext.Provider value={{ showMessage }}>
      {children}
      <div className="popup-stack fixed bottom-0 right-0 p-4 z-50" style={{ maxWidth: '17%', width: 'auto', height: 'auto' }}>
        {messages.map(({ id, message, type }) => (
          <PopupBubble key={id} id={id} message={message} type={type} removeMessage={removeMessage} />
        ))}
      </div>
    </PopupContext.Provider>
  );
};
