import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const response = await fetch(req.body.url);

      if (response.ok) {
        // if the request was successful, then the URL is valid
        const data = await response;
        res.status(200).json({ message: "valid" });
      } else {
        // generate an error message based on the response status code
        let errorMessage = `${req.body.url} encountered an error code of ${response.status}! Remove or try again in a few seconds.`;
        res.status(200).json({ message: errorMessage });
      }
    } catch (error) {
      let errorMessage = `${req.body.url} encountered an unknown error!`;
      if (error instanceof Error) {
        console.log('Error name:', error.toString());
        if (error.name === 'AbortError') {
            errorMessage = `${req.body.url} timed out after 5 seconds!`;
        } else if (error.name === 'TypeError') {
            errorMessage = `${req.body.url} is not an accessible site.`;
        } else {
            errorMessage = `${req.body.url} encountered an error: ${error.message}.`;
            // console.error('Error fetching URL:', error);
        }
      }
      res.status(200).json({ message: errorMessage });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
