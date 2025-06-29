import fs from 'fs';

const mockData = {
  external_urls: {
    spotify: "https://open.spotify.com/artist/1RyvyyTE3xzB2ZywiAwp0i"
  },
  followers: {
    href: null,
    total: 21777548
  },
  genres: ["rap"],
  images: [
    {
      height: 640,
      url: "https://i.scdn.co/image/ab6761610000f1787565b356bc9d9394eefa2ccb",
      width: 640
    },
    {
      height: 320,
      url: "https://i.scdn.co/image/ab6761610000f1787565b356bc9d9394eefa2ccb",
      width: 320
    },
    {
      height: 160,
      url: "https://i.scdn.co/image/ab6761610000f1787565b356bc9d9394eefa2ccb",
      width: 160
    }
  ],
  name: "Future",
};

fs.writeFileSync('mock-artist-profile.json', JSON.stringify(mockData, null, 2));
