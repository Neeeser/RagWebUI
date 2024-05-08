import React from 'react';
import { Box, Paper } from '@mui/material';
import MarkdownRenderer from '../MarkdownRenderer';
import DocumentDropdown from './DocumentDropdown';
import { v4 as uuidv4 } from 'uuid';

interface ChatMessageProps {
  message_id: string; // the unique identifier for the message
  text: string; // the message content to display
  isUser: boolean; // flag to indicate if the message is from the user or the bot
  isComplete: boolean; // flag to indicate if the message is complete or still being streamed
}

const ChatMessage: React.FC<ChatMessageProps> = ({ text, isUser, isComplete }) => {
  // console.log(`Rendering ChatMessage. User: ${isUser}, Complete: ${isComplete}`); // debug print
  // setting the text color based on the user or bot
  const textColor = isUser ? 'var(--user-message-text)' : 'var(--bot-message-text)';
  const messageStyle = {
    bgcolor: isUser ? 'rgb(var(--user-message-bg))' : 'rgb(var(--bot-message-bg))',
    color: textColor, // applying text color
    padding: '10px',
    margin: '5px 0',
    borderRadius: '15px',
    maxWidth: '70%',
    wordWrap: 'break-word',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column', // changed to column to ensure documents are at the bottom
    alignItems: 'center',
    justifyContent: 'flex-start',
  };

  const extractUserQuery = (content: string): string => {
    const startMarker = "<$$ THIS SIGNIFIES THE BEGINNING OF RELEVANT CONTEXTUAL DOCUMENTS $$>\n\n";
    const endMarker = "<$$ THIS SIGNIFIES THE END OF ATTACHED DATA AND MARKS THE BEGINNING OF USER QUERY $$>\n\n";

    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker);

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      return content.slice(endIndex + endMarker.length).trim();
    }

    return content;
  };

  const parseDocuments = (documentsContent: string): { id: string; title: string; content: string }[] => {
    // Use a regular expression to match the document pattern
    const documentPattern = /{citeTitStart}(.*?){citeTitEnd}{citeConStart}(.*?){citeConEnd}/gs;
    const matches = documentsContent.matchAll(documentPattern);

    return Array.from(matches, match => {
      const title = match[1].trim();
      const content = match[2].trim();
      return { id: uuidv4(), title, content };
    });
  };

  const renderMessageContent = () => {
    if (isComplete && !isUser) {
      const documentCitationsIndex = text.indexOf("\n\n---\n\n### Document Citations:\n\n");
      let messageContent = text;
      let documents: { id: string; title: string; content: string }[] | undefined = undefined;

      if (documentCitationsIndex !== -1) {
        const documentsContent = text.substring(documentCitationsIndex + "\n\n---\n\n### Document Citations:\n\n".length);
        messageContent = text.substring(0, documentCitationsIndex);
        documents = parseDocuments(documentsContent);
      }

      const cleanedMessage = extractUserQuery(messageContent);
      return (
        <>
          <MarkdownRenderer markdown={cleanedMessage} isUser={isUser} isComplete={isComplete} />
          {renderDocumentDropdown(documents)}
        </>
      );
    } else {
      return <div className={`markdown-content ${isUser ? 'user-text' : 'bot-text'}`} style={{ whiteSpace: 'pre-wrap', color: textColor }}>{text}</div>;
    }
  };

  const renderDocumentDropdown = (documents?: { id: string; title: string; content: string }[]) => {
    if (!isUser && documents) {
      // console.log(`renderDocumentDropdown: Rendering dropdown for ${documents.length} documents.`); // debug log
      return <DocumentDropdown documents={documents} />;
    }
    // console.log("renderDocumentDropdown: No documents to render in dropdown."); // debug log
    return null;
  };

  return (
    <Box display="flex" justifyContent={isUser ? 'flex-end' : 'flex-start'}>
      <Paper elevation={3} sx={messageStyle}>
        <div style={{ width: '100%' }}>
          {renderMessageContent()}
        </div>
        <div style={{ width: '100%' }}>
          {renderDocumentDropdown()}
        </div>
      </Paper>
    </Box>
  );
};

export default ChatMessage;