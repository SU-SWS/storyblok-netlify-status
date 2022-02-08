import NextAuth from "next-auth";
import axios from 'axios';
import qs from 'qs';

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    {
      id: 'storyblok',
      name: 'Storyblok',
      type: 'oauth',
      token: {
        url: 'https://app.storyblok.com/oauth/token',
        async request(context) {
          const params = qs.stringify({
            grant_type: 'authorization_code',
            code: context.params.code,
            client_id: process.env.OAUTH_CLIENT_ID,
            client_secret: process.env.OAUTH_SECRET,
            redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/storyblok`,
          });
        
          const tokenResult = await axios({
            url: `https://app.storyblok.com/oauth/token`,
            method: 'post',
            headers: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: params,
          })
          .then(result => result.data)
          .catch(err => {
            console.log(err);
          });

          return {tokens: tokenResult};
        }
      },
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_SECRET,
      checks: ['pkce', 'state'],
      authorization: {
        url: 'https://app.storyblok.com/oauth/authorize',
        params: {
          scope: 'read_content write_content',
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/storyblok`,
        },
      },
      userinfo: 'https://api.storyblok.com/oauth/user_info',
      profile(profile) {
        return {
          id: profile.space.id,
          name: profile.space.name,
          user: profile.user,
          roles: profile.roles
        }
      }
    }
  ]
})
