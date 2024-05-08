import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const conversationData = {
        conversation_id: req.body.conversation_id,
      };

      const response = await fetch('http://localhost:8000/delete_conversation/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conversationData)
      });

      if (!response.ok) {
        // reply with the status code from the backend service if the request was not successful
        res.status(response.status).json({ message: 'Failed to delete conversation.' });
        return;
      }

      // if the request was successful, parse the JSON response
      const data = await response.json();
      // reply with a 200 status code and the message from the backend service
      res.status(200).json({ message: data.message });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      res.status(500).json({ message: 'Error deleting conversation.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
