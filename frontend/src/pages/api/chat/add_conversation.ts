import { NextApiRequest, NextApiResponse } from 'next';

interface AddConversationRequest {
  collection_id: string;
  user_id: string;
  conversation_id: string;
}

interface AddConversationResponse {
  conversation_id: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<AddConversationResponse | { error: string }>) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { collection_id, user_id, conversation_id } = req.body as AddConversationRequest;

  try {
    const response = await fetch('http://localhost:8000/add_conversation/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collection_id, user_id, conversation_id }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add conversation with status: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json({ conversation_id: data.conversation_id });
  } catch (error) {
    console.error('Error adding conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
