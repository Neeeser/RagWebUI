import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { collection_id } = req.query;

    try {
      // initiating fetch request for conversations by user
      // console.log('get_conversations_by_user endpoint: Initiating fetch request', { user_id });
      const response = await fetch(`http://localhost:8000/get_conversations_by_collection/?collection_id=${collection_id}`);
      // fetch request completed, processing response
      // console.log('get_conversations_by_collection endpoint: Fetch response status:', response.status);
      const data = await response.json();
      // data received, sending back to client
      // console.log('get_conversations_by_collection endpoint: Data received:', data);

      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}