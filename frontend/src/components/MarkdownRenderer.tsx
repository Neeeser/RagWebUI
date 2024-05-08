// src/components/MarkdownRenderer.tsx

import React, { useEffect, useState, useMemo } from 'react';
import DOMPurify from 'dompurify'; // import dompurify for sanitizing html
import { marked } from 'marked';

interface MarkdownRendererProps {
  markdown: string; // the markdown content to render
  isUser: boolean; // flag to indicate if the message is from the user or the bot
  isComplete: boolean; // flag to indicate if the message is complete or still being streamed
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown, isUser, isComplete }) => {
  const [sanitizedMarkup, setSanitizedMarkup] = useState('');

  useEffect(() => {
    const parseMarkdown = async () => {
      // configure marked to use the global css classes for markdown styling
      marked.setOptions({
        pedantic: false,
        gfm: true,
        breaks: true,
      });

      const rawMarkup = await marked.parse(markdown);
      const sanitized = DOMPurify.sanitize(rawMarkup, { USE_PROFILES: { html: true } });
      setSanitizedMarkup(sanitized);
    };

    parseMarkdown();
  }, [markdown]);

  // determine the appropriate class based on the isUser flag
  const contentClass = `markdown-content ${isUser ? 'user-text' : 'bot-text'}`;

  return (
    <div
      className={contentClass} // dynamically set class for user or bot text color
      dangerouslySetInnerHTML={{ __html: sanitizedMarkup }}
    />
  );
};
export default MarkdownRenderer;
