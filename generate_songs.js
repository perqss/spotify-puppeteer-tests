import fs from 'fs';
import { randomUUID } from 'crypto';

const songTemplate = {
  album: {
    album_type: "album",
    artists: [{
        external_urls: {
            spotify: "https://open.spotify.com/artist/0Due109sq8Ld9G5xkWRubf"
        },
        href: null,
        id: randomUUID(),
        name: "Future",
        type: "artist",
        uri: "spotify:artist:0Due109sq8Ld9G5xkWRubf"
    }],
    images: [
      {
        height: 640,
        url: "https://i.scdn.co/image/ab67616d0000b273626745b3aa04899001a924ad",
        width: 640
      },
      {
        height: 300,
        url: "https://i.scdn.co/image/ab67616d0000b273626745b3aa04899001a924ad",
        width: 300
      },
      {
        height: 64,
        url: "https://i.scdn.co/image/ab67616d0000b273626745b3aa04899001a924ad",
        width: 64
      }
    ],
    name: "EVOL"
  },
  artists: [
    {
      external_urls: {
        spotify: "https://open.spotify.com/artist/0Due109sq8Ld9G5xkWRubf"
      },
      href: null,
      id: randomUUID(),
      name: "Future",
      type: "artist",
      uri: "spotify:artist:0Due109sq8Ld9G5xkWRubf"
    }
  ],
  href: "https://api.spotify.com/v1/tracks/0Due109sq8Ld9G5xkWRubf",
  duration_ms: 220026,
  name: "Maybach",
};

const N = 100;

const items = Array.from({ length: N }, (_, i) => ({
  ...songTemplate,
  id: randomUUID(),
  name: `${songTemplate.name} ${i + 1}`
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

fs.writeFileSync('mock-top-songs.json', JSON.stringify(mockData, null, 2));
