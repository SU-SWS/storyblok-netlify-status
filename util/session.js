import nextSession from 'next-session';
import { MemoryStore } from 'next-session';

export const getSession = nextSession({
  store: MemoryStore,
  cookie: {
    sameSite: 'None',
    secure: true,
  },
});
