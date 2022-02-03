import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { siteId } = req.query;
  if (!siteId) {
    res.status(400).send('Missing required parameter siteId');
  }
  const deploys = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
    headers: {
      authorization: `Bearer ${process.env.NETLIFY_TOKEN}`
    }
  }).then((res) => res.json())

  res.json(deploys);
}