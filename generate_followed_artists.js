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

const N = 50000;

const items = Array.from({ length: N }, (_, i) => ({
  ...artistTemplate,
  id: randomUUID(),
  name: `${artistTemplate.name} ${i + 1}`
}));

const mockData = {
  artists: {
    items,
    total: N,
    limit: 50,
    href: null,
    next: null,
    previous: null
  }
};

fs.writeFileSync('mock-followed-artists.json', JSON.stringify(mockData, null, 2));
