import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { collection_id, user_id } = req.query;

    try {
      const response = await fetch(`http://localhost:8000/get_collection_exists/?collection_id=${collection_id}&user_id=${user_id}`);
      // console.log('get_collection_exists endpoint: Fetch response status:', response.status); // debugging
      const data = await response.json();
      // console.log('get_collection_exists endpoint: Data received:', data); // debugging

      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching collection existence:', error);
      res.status(500).json({ error: 'Failed to fetch collection existence' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}