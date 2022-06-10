const crypto = require('crypto');

export default async function handler(req, res) {
  const clientId = process.env.OAUTH_CLIENT_ID;
  const redirectUri = process.env.REDIRECT_URI;
  const state = crypto.randomBytes(8).toString('hex');
  const hashSeed = crypto.randomBytes(16).toString('hex');
  const codeChallenge = crypto.createHash('sha256').update(hashSeed).digest('hex');
  const query = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read_content write_content',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    response_type: 'code',
  });

  const oauthUrl = `https://app.storyblok.com/oauth/authorize?${query.toString()}`;
  
  res.redirect(oauthUrl);
}