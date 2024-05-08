import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      console.log('chat endpoint: Initiating fetch request', req.body);
      const response = await fetch('http://localhost:8000/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });

      if (!response.ok) {
        res.status(response.status).json({ message: 'Backend service error.' });
        return;
      }

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        const processText = async ({ done, value }: ReadableStreamReadResult<Uint8Array>): Promise<void> => {
          if (done) {
            res.status(200).end();
            return;
          }
          const chunk = decoder.decode(value, { stream: true });
          // console.log('Sending chunk:', chunk); // added printout for debugging
          res.write(chunk);
          const next = await reader.read();
          return processText(next);
        };

        reader.read().then(processText);
      } else {
        res.status(500).json({ message: 'Backend service error.' });
      }
    } catch (error) {
      console.error('Error forwarding request to FastAPI:', error);
      res.status(500).json({ message: 'Error processing chat request.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}