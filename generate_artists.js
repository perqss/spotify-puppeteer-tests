import fs from 'fs';
import { randomUUID } from 'crypto';

const artistTemplate = {
  external_urls: {
    spotify: "https://open.spotify.com/artist/1RyvyyTE3xzB2ZywiAwp0i"
  },
  followers: {
    href: null,
    total: 20825070
  },
  genres: ["rap"],
  href: "https://api.spotify.com/v1/artists/1RyvyyTE3xzB2ZywiAwp0i",
  images: [
    {
      height: 640,
      url: "https://i.scdn.co/image/ab6761610000e5eb7565b356bc9d9394eefa2ccb",
      width: 640
    },
    {
      height: 320,
      url: "https://i.scdn.co/image/ab676161000051747565b356bc9d9394eefa2ccb",
      width: 320
    },
    {
      height: 160,
      url: "https://i.scdn.co/image/ab6761610000f1787565b356bc9d9394eefa2ccb",
      width: 160
    }
  ],
  name: "Future",
  popularity: 92,
  type: "artist",
  uri: "spotify:artist:1RyvyyTE3xzB2ZywiAwp0i"
};

const N = 10000;

const items = Array.from({ length: N }, (_, i) => ({
  ...artistTemplate,
  id: randomUUID(),
  name: `${artistTemplate.name} ${i + 1}`
}));

const mockData = {
  items,
  total: N,
  limit: 50,
  offset: 0,
  href: "https://api.spotify.com/v1/me/top/artists?offset=0&limit=50&time_range=long_term&locale=pl-PL,pl;q%3D0.9,en-PL;q%3D0.8,en;q%3D0.7,en-US;q%3D0.6",
  next: null,
  previous: null
};

fs.writeFileSync('mock-top-artists.json', JSON.stringify(mockData, null, 2));
