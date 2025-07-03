import fs from 'fs';
import { randomUUID } from 'crypto';

const songTemplate = {
  album: {
    href: "https://api.spotify.com/v1/albums/3jJKDKdlwRS584zUlHV2Ly",
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
    name: "EVOL",
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

const N = 50;

const items = Array.from({ length: N }, (_, i) => ({
  ...songTemplate,
  id: randomUUID(),
  album : {
    ...songTemplate.album,
    name: `${songTemplate.album.name} ${i + 1}`,
    id: randomUUID()
  },
  name: `${songTemplate.name} ${i + 1}`
}));

const mockDataSong = {
  items,
  total: N,
  limit: 50,
  offset: 0,
  href: "https://api.spotify.com/v1/me/top/artists?offset=0&limit=50&time_range=long_term&locale=pl-PL,pl;q%3D0.9,en-PL;q%3D0.8,en;q%3D0.7,en-US;q%3D0.6",
  next: null,
  previous: null
};

const mockDataAlbum = {
    artists: [{
        external_urls: {
            spotify: "https://open.spotify.com/artist/0Due109sq8Ld9G5xkWRubf"
        },
        href: null,
        name: "Future",
        type: "artist",
        uri: "spotify:artist:0Due109sq8Ld9G5xkWRubf"
    }],
    name: "EVOL",
    release_date: "2016-04-13",
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
  external_urls: {
    spotify: "https://open.spotify.com/album/3jJKDKdlwRS584zUlHV2Ly"
  },
  href: "https://api.spotify.com/v1/albums/3jJKDKdlwRS584zUlHV2Ly?locale=pl-PL%2Cpl%3Bq%3D0.9%2Cen-PL%3Bq%3D0.8%2Cen%3Bq%3D0.7%2Cen-US%3Bq%3D0.6",
  tracks: mockDataSong
};



fs.writeFileSync('mock-songinfo.json', JSON.stringify(mockData, null, 2));
