import { netlifySiteMapping } from '../../util/netlify_sites';
import Cookies from 'cookies';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const cookies = Cookies(req, res);
  const token = cookies.get('netlifyStatusSess');
  const session = jwt.decode(token, process.env.JWT_SECRET);
  const { space_id } = req.query;
  const site = netlifySiteMapping[space_id] || null;
  let deploys = null;
  // If user does not have active JWT token, return unauthorized.
  if (!token || !session || !session.spaces || !session.spaces[space_id]) {
    res.status(401).send('Unauthorized');
  }
  
  if (site) {
    const allDeploys = await fetch(`https://api.netlify.com/api/v1/sites/${site.netlifyId}/deploys`, {
      headers: {
        authorization: `Bearer ${process.env.NETLIFY_TOKEN}`
      }
    }).then((res) => res.json());
    deploys = allDeploys.filter((item) => item.branch === site.branch);

    res.status(200).json(deploys);
  }
}