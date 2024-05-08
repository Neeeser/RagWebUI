import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { conversation_id } = req.query;
    console.log('conversation_id:', conversation_id); // debugging

    try {
      const response = await fetch(`http://localhost:8000/get_conversation_messages/?conversation_id=${conversation_id}`);
      // console.log('get_conversation_messages endpoint: Fetch response status:', response.status); // debugging
      const data = await response.json();
      // console.log('get_conversation_messages endpoint: Data received:', data); // debugging

      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      res.status(500).json({ error: 'Failed to fetch conversation messages' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}