import React, { useEffect } from 'react';

interface PopupBubbleProps {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
  removeMessage: (id: number) => void;
}

const PopupBubble: React.FC<PopupBubbleProps> = ({ id, message, type, removeMessage }) => {
  useEffect(() => {
    const timer = setTimeout(() => removeMessage(id), 15000);
    return () => clearTimeout(timer);
  }, [id, removeMessage]);

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTitle = (type: string) => {
    switch (type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      default:
        return 'Notification';
    }
  };

  return (
    <div
      className={`p-4 mb-2 rounded-lg shadow-lg ${getBackgroundColor(type)} text-white`}
      style={{ opacity: 1, transition: 'opacity 0.5s ease-out', wordWrap: 'break-word' }}
    >
      <div className={`font-bold text-lg text-white}`}>
        {getTitle(type)}
      </div>
      {message}
    </div>
  );
};

export default PopupBubble;
