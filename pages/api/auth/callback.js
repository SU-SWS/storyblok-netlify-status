import axios from "axios";
import { getSession } from "../../../util/session";

export default async function handler(req, res) {
  const session = await getSession(req, res);
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
    if (!session.spaces) {
      session.spaces = {};
    }
    if (!session.spaces[space_id]) {
      session.spaces[space_id] = {}
    }

    session.spaces[space_id].application_code = code;
    session.spaces[space_id].access_token = token.access_token;
    session.spaces[space_id].refresh_token = token.refresh_token;
    await session.commit();
    res.redirect(`/?space_id=${space_id}`);
  }
  catch(error) {
    res.status(400);
  }  
}