import axios from "axios";
import Cookies from 'cookies';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const cookies = new Cookies(req, res, { secure: true });
  const { code, state, space_id } = req.query;
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: process.env.OAUTH_CLIENT_ID,
    client_secret: process.env.OAUTH_SECRET,
    redirect_uri: process.env.REDIRECT_URI,
  });

  try {
    const tokenResult = await axios.post('https://app.storyblok.com/oauth/token', params);
    const token = tokenResult.data;
    const jwtCookie = cookies.get('netlifyStatusSess');
    const session = jwtCookie ? jwt.decode(jwtCookie, process.env.JWT_SECRET) : {};
    if (!session.spaces) {
      session.spaces = {};
    }
    if (!session.spaces[space_id]) {
      session.spaces[space_id] = {}
    }

    session.spaces[space_id].application_code = code;
    session.spaces[space_id].access_token = token.access_token;
    session.spaces[space_id].refresh_token = token.refresh_token;
    const jwtSession = jwt.sign(session, process.env.JWT_SECRET);
    cookies.set('netlifyStatusSess', jwtSession, {
      sameSite: 'None',
      secure: true,
    });
    res.redirect(`/?space_id=${space_id}`);
  }
  catch(error) {
    console.log(error)
    res.status(400);
  }  
}