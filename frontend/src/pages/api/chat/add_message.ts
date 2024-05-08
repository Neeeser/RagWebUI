import { NextApiRequest, NextApiResponse } from 'next';

interface AddMessageRequest {
  conversation_id: string;
  text: string;
  is_user: boolean;
  is_complete: boolean;
}

interface AddMessageResponse {
    message_id: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<AddMessageResponse | { error: string }>) {
  if (req.method === 'POST') {
    const { conversation_id, text, is_user, is_complete } = req.body as AddMessageRequest;

    try {
      // console.log('add_message endpoint: Sending POST request', { conversation_id, text, is_user, is_complete });
      const response = await fetch('http://localhost:8000/add_message/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversation_id, text, is_user, is_complete }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('add_message endpoint: Message added successfully', { message_id: data.message_id, conversation_id });
        res.status(200).json({ message_id: data.message_id });
      } else {
        console.error('add_message endpoint: Failed to add message', { status: response.status });
        res.status(response.status).json({ error: 'Failed to add message' });
      }
    } catch (error) {
      // console.error('Error adding message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}