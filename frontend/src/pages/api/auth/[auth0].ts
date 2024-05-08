// pages/api/auth/[...auth0].ts
import { handleAuth, handleCallback, HandlerError, Session } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';

const afterCallback = async (req: NextApiRequest, res: NextApiResponse, session: Session, state: any) => {
  try {
    const response = await fetch('http://localhost:8000/add_user/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: session.user.sub }),
    });

    if (response.ok) {
      console.log('User added to the database');
    } else {
      console.error('Failed to add user to the database');
    }
  } catch (error) {
    console.error('Error occurred while adding user to the database:', error);
  }

  return session;
};

export default handleAuth({
  async callback(req: NextApiRequest, res: NextApiResponse) {
    try {
      await handleCallback(req, res, { afterCallback });
    } catch (error: any) {
      if (error instanceof HandlerError) {
        res.status(error.status || 500).end(error.message);
      } else {
        res.status(500).end('Unknown error occurred');
      }
    }
  },
});