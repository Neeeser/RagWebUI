import React, { useState } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Document } from '@/lib/types';

interface DocumentDropdownProps {
  documents: Document[];
}

const DocumentDropdown: React.FC<DocumentDropdownProps> = ({ documents }) => {
  const [expandedDocument, setExpandedDocument] = useState<string | null>(null);

  const handleDocumentClick = (documentId: string) => {
    // debug print
    console.log(`Document clicked: ${documentId}`);
    setExpandedDocument(prevDocumentId => (prevDocumentId === documentId ? null : documentId));
  };

  // debug print
  console.log(`Rendering DocumentDropdown with ${documents.length} documents`);

  return (
    <Box>
      {documents.map((document, index) => (
        <Accordion
          key={document.id} // using unique id instead of title
          expanded={expandedDocument === document.id}
          onChange={() => handleDocumentClick(document.id)}
          sx={{
            backgroundColor: 'rgba(63, 63, 70, 0.8)', // soft grey background
            color: 'white', // white text
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>
              <span style={{ color: 'pink' }}>{`${index + 1}.`}</span>{` ${document.title}`}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              {document.content}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default DocumentDropdown;