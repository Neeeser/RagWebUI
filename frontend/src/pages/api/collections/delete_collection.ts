import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const collectionData = {
        collection_id: req.body.collection_id,
      };

      const response = await fetch('http://localhost:8000/delete_collection/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(collectionData)
      });

      if (!response.ok) {
        // reply with the status code from the backend service if the request was not successful
        res.status(response.status).json({ message: 'Failed to delete collection.' });
        return;
      }

      // if the request was successful, parse the JSON response
      const data = await response.json();
      // reply with a 200 status code and the message from the backend service
      res.status(200).json({ message: data.message });
    } catch (error) {
      console.error('Error deleting collection:', error);
      res.status(500).json({ message: 'Error deleting collection.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
