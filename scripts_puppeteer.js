import puppeteer from 'puppeteer';
import fs from 'fs';
// const puppeteer = require('puppeteer');
// const fs = require('fs');

const svelteAppUrlTopArtists = 'http://127.0.0.1:4173/top-artists';
const reactAppUrlTopArtists = 'http://127.0.0.1:4000/top-artists';
const solidAppUrlTopArtists = 'http://127.0.0.1:3002/top-artists';

const svelteAppUrlFollowedArtists = 'http://127.0.0.1:4173/followed-artists';
const reactAppUrlFollowedArtists = 'http://127.0.0.1:4000/followed-artists';
const solidAppUrlFollowedArtists = 'http://127.0.0.1:3002/followed-artists';

const svelteAppUrlTopSongs = 'http://127.0.0.1:4173/top-songs';
const reactAppUrlTopSongs = 'http://127.0.01:4000/top-songs';
const solidAppUrlTopSongs = 'http://127.0.0.1:3002/top-songs';

const svelteAppUrlRecentlyPlayed = 'http://127.0.0.1:4173/recently-played';
const reactAppUrlRecentlyPlayed = 'http://127.0.0.1:4000/recently-played';
const solidAppUrlRecentlyPlayed = 'http://127.0.0.1:3002/recently-played';

const chooseTopArtistsUrl = (framework) => {
  if (framework === 'svelte') {
    return svelteAppUrlTopArtists;
  } else if (framework === 'react') {
    return reactAppUrlTopArtists;
  } else if (framework === 'solid') {
    return solidAppUrlTopArtists;
  } else {
    return '';
  }
};

const chooseFollowedArtistsUrl = (framework) => {
  if (framework === 'svelte') {
    return svelteAppUrlFollowedArtists;
  } else if (framework === 'react') {
    return reactAppUrlFollowedArtists;
  } else if (framework === 'solid') {
    return solidAppUrlFollowedArtists;
  } else {
    return '';
  }
};

const chooseTopSongsUrl = (framework) => {
  if (framework === 'svelte') {
    return svelteAppUrlTopSongs;
  } else if (framework === 'react') {
    return reactAppUrlTopSongs;
  } else if (framework === 'solid') {
    return solidAppUrlTopSongs;
  } else {
    return '';
  }
};

const chooseRecentlyPlayedUrl = (framework) => {
  if (framework === 'svelte') {
    return svelteAppUrlRecentlyPlayed;
  } else if (framework === 'react') {
    return reactAppUrlRecentlyPlayed;
  } else if (framework === 'solid') {
    return solidAppUrlRecentlyPlayed;
  } else {
    return '';
  }
};

const diffMetrics = (metricsBefore, metricsAfter) => {
  const diff = {};
  for (const key in metricsBefore) {
      if (key !== 'JSHeapUsedSize' && key !== 'JSHeapTotalSize') {
        diff[key] = metricsAfter[key] - metricsBefore[key];
      } else {
        diff[key] = metricsAfter[key];
      }
  }
  return diff;
};

const checkIfEveryComponentVisible = async (page, selector, amount) => {
    await page.waitForFunction(
    (selector, expected) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length !== expected) return false; 

      return Array.from(elements).every(el => {
        const style = window.getComputedStyle(el);
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          el.offsetWidth  > 0 &&
          el.offsetHeight > 0
        );
      });
    },
    { timeout: 0 },
    selector,       
    amount  
  );
};

const checkIfIframeVisible = async (page) => {
  const iframe = await page.waitForSelector('iframe[src*="open.spotify.com/embed"]', { visible: true, timeout: 0 });
  await page.waitForFunction(el => el.contentDocument?.readyState === 'complete', {}, iframe);
  await page.waitForFunction(
    el => {
      const r = el.getBoundingClientRect();
      return (
        r.width > 0 &&
        r.height > 0 &&
        r.bottom > 0 &&
        r.top < window.innerHeight
      );
    },
    { timeout: 0 },
    iframe                   
  );
};

async function testPerformanceTopArtistsRender(framework) {
  let frameworkUrl = chooseTopArtistsUrl(framework);

  if (!frameworkUrl) {
    console.error('You need to provide "svelte", "react" or "solid" as an argument for the script');
    return;
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--disable-web-security',
    ],
    defaultViewport: null,
  });

  const mockArtists = JSON.parse(fs.readFileSync('mock-top-artists.json', 'utf8'));
  const mockProfile = JSON.parse(fs.readFileSync('mock-user-profile.json', 'utf8'));
  const mockBoolArray = Array(mockArtists.total).fill(true);
  const timestamp = new Date().toISOString().replace(/:/g, '-');

  for (let i = 0; i < 100; ++i) {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const url = request.url();
      const method = request.method();
      if (url.includes('/v1/me/following/contains')) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          headers: {"Access-Control-Allow-Origin": "*"},
          body: JSON.stringify(mockBoolArray)
      })
      } else if (url.includes('/v1/me/top/artists')) {
          request.respond({
              status: 200,
              contentType: 'application/json',
              headers: {"Access-Control-Allow-Origin": "*"},
              body: JSON.stringify(mockArtists)
          })
        } else if (url.includes('v1/me/following')) {
          if (method === "DELETE") {
            request.respond({
              status: 204,
              headers: { "Access-Control-Allow-Origin": "*" }
            });
          } else if (method === "PUT") {
            request.respond({
              status: 204,
              headers: { "Access-Control-Allow-Origin": "*" }
            });
          }
        } else if (url.includes('v1/me')) {
          request.respond({
            status: 200,
            contentType: 'application/json',
            headers: {"Access-Control-Allow-Origin": "*"},
            body: JSON.stringify(mockProfile)
          })
        } else if (url.includes('/api/token')) {
          request.respond({
            status: 200,
            contentType: 'application/json',
            headers: {"Access-Control-Allow-Origin": "*"},
            body: JSON.stringify({})
          })
        }
        else {
          request.continue();
        }
      })

    await page.goto(frameworkUrl);
    let start = performance.now();
    await page.waitForSelector('.last-artist', { visible: true, timeout: 0 });
    await checkIfEveryComponentVisible(page, '.artist-card', mockArtists.total);
    let end = performance.now();
    const metrics = await page.metrics();
    metrics.performance = (end - start) / 1000;
    fs.appendFile(`${framework}-runes-extra-check-metrics-${mockArtists.total}-artists-${timestamp}.txt`, JSON.stringify(metrics) + '\n', 
      (err) => {
        if (err) {
          console.log(err)
        }
      }
    );
    await page.close();
  }
  await browser.close();
}

async function testPerformanceTopArtistsDelete(framework) {
  let frameworkUrl = chooseTopArtistsUrl(framework);

  if (!frameworkUrl) {
    console.error('You need to provide "svelte", "react" or "solid" as an argument for the script');
    return;
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      // '--user-data-dir=C:/Users/HP/AppData/Local/Google/Chrome/User Data',
      // '--profile-directory=Default',
      // '--disable-web-security',
      // '--disable-features=IsolateOrigins',
      // '--disable-site-isolation-trials',
      // '--disable-extensions'
    ],
    defaultViewport: null,
  });

  const mockArtists = JSON.parse(fs.readFileSync('mock-top-artists.json', 'utf8'));
  const mockProfile = JSON.parse(fs.readFileSync('mock-user-profile.json', 'utf8'));
  const timestamp = new Date().toISOString().replace(/:/g, '-');

  for (let i = 0; i < 1; ++i) {
    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/v1/me/top/artists')) {
          request.respond({
              status: 200,
              contentType: 'application/json',
              headers: {"Access-Control-Allow-Origin": "*"},
              body: JSON.stringify(mockArtists)
          })
      } else if (url.includes('v1/me')) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          headers: {"Access-Control-Allow-Origin": "*"},
          body: JSON.stringify(mockProfile)
        })
      }
      else {
          request.continue();
      }
    })

    await page.goto(frameworkUrl);
    await page.waitForSelector('.last-artist', { visible: true, timeout: 0 });
    const previousFirstArtist = await page.$eval('.first-artist', el => el.textContent);
    const metricsBefore = await page.metrics();
    //console.info(metricsBefore);
    await page.click('.artist-delete-button');

    await page.waitForFunction((prev) => {
      const el = document.querySelector('.first-artist');
      return el && el.textContent !== prev;
    }, { timeout: 0 }, previousFirstArtist);

    await page.waitForSelector('.first-artist', { visible: true, timeout: 0 });
    const metricsAfter = await page.metrics();
    //console.info(metricsAfter);
    const metricsDiff = diffMetrics(metricsBefore, metricsAfter);
    fs.appendFile(`${framework}-delete-metrics-${mockArtists.total}-artists-${timestamp}.txt`, JSON.stringify(metricsDiff) + '\n', 
      (err) => {
        if (err) {
          console.log(err)
        }
      }
    );
    await page.close();
  }
  await browser.close();
}

async function testPerformanceFollowedArtistsDelete(framework) {
  let frameworkUrl = chooseFollowedArtistsUrl(framework);

  if (!frameworkUrl) {
    console.error('You need to provide "svelte", "react" or "solid" as an argument for the script');
    return;
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--disable-web-security',
      '--js-flags=--expose-gc',
    ],
    defaultViewport: null,
  });

  const mockArtists = JSON.parse(fs.readFileSync('mock-followed-artists.json', 'utf8'));
  const mockProfile = JSON.parse(fs.readFileSync('mock-user-profile.json', 'utf8'));
  const mockBoolArray = Array(mockArtists.artists.total).fill(true);
  const timestamp = new Date().toISOString().replace(/:/g, '-');

  for (let i = 0; i < 10; ++i) {
    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', (request) => {
      const url = request.url();
      const method = request.method();
      if (url.includes('/v1/me/following/contains')) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          headers: {"Access-Control-Allow-Origin": "*"},
          body: JSON.stringify(mockBoolArray)
      })
      } else if (url.includes('/v1/me/following')) {
        if (method === "GET") {
          request.respond({
              status: 200,
              contentType: 'application/json',
              headers: {"Access-Control-Allow-Origin": "*"},
              body: JSON.stringify(mockArtists)
          })
        } else if (method === "DELETE") {
          request.respond({
            status: 204,
            headers: { "Access-Control-Allow-Origin": "*" }
          });
        } else if (method === "PUT") {
          request.respond({
            status: 204,
            headers: { "Access-Control-Allow-Origin": "*" }
          });
        }
      } else if (url.includes('v1/me')) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          headers: {"Access-Control-Allow-Origin": "*"},
          body: JSON.stringify(mockProfile)
        })
      } else if (url.includes('/api/token')) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          headers: {"Access-Control-Allow-Origin": "*"},
          body: JSON.stringify({})
        })
      }
      else {
          request.continue();
      }
    })

    await page.goto(frameworkUrl);
    let total = mockArtists.artists.total;
    let metricsBefore = null;
    let start, end;

    while (total-- > 0) {
      await checkIfEveryComponentVisible(page, '.artist-card', total + 1);
      if (total === mockArtists.artists.total - 1) {
        start = performance.now();
        metricsBefore = await page.metrics();
      }
      await page.click('.follow-button');
    }

    await checkIfEveryComponentVisible(page, '.artist-card', 0);
    await page.evaluate(() => gc && gc());
    end = performance.now();
    const metricsAfter = await page.metrics();
    const metricsDiff = diffMetrics(metricsBefore, metricsAfter);
    metricsDiff.performance = (end - start) / 1000;
    fs.appendFile(`${framework}-unfollow-solid-for-performance-ALL-metrics-${mockArtists.artists.total}-artists-${timestamp}.txt`, JSON.stringify(metricsDiff) + '\n', 
      (err) => {
        if (err) {
          console.log(err)
        }
      }
    );
   await page.close();
  }
 await browser.close();
}

async function testPerformanceTopArtistsModify(framework) {
  let frameworkUrl = chooseTopArtistsUrl(framework);

  if (!frameworkUrl) {
    console.error('You need to provide "svelte", "react" or "solid" as an argument for the script');
    return;
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--disable-web-security',
    ],
    defaultViewport: null,
  });

  const mockArtists = JSON.parse(fs.readFileSync('mock-top-artists.json', 'utf8'));
  const mockProfile = JSON.parse(fs.readFileSync('mock-user-profile.json', 'utf8'));
  const mockBoolArray = Array(mockArtists.total).fill(false);
  const timestamp = new Date().toISOString().replace(/:/g, '-');

  for (let i = 0; i < 10; ++i) {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const url = request.url();
      const method = request.method();
      if (url.includes('/v1/me/following/contains')) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          headers: {"Access-Control-Allow-Origin": "*"},
          body: JSON.stringify(mockBoolArray)
      })
      } else if (url.includes('/v1/me/top/artists')) {
          request.respond({
              status: 200,
              contentType: 'application/json',
              headers: {"Access-Control-Allow-Origin": "*"},
              body: JSON.stringify(mockArtists)
          })
        } else if (url.includes('v1/me/following')) {
          if (method === "DELETE") {
            request.respond({
              status: 204,
              headers: { "Access-Control-Allow-Origin": "*" }
            });
          } else if (method === "PUT") {
            request.respond({
              status: 204,
              headers: { "Access-Control-Allow-Origin": "*" }
            });
          }
        } else if (url.includes('v1/me')) {
          request.respond({
            status: 200,
            contentType: 'application/json',
            headers: {"Access-Control-Allow-Origin": "*"},
            body: JSON.stringify(mockProfile)
          })
        } else if (url.includes('/api/token')) {
          request.respond({
            status: 200,
            contentType: 'application/json',
            headers: {"Access-Control-Allow-Origin": "*"},
            body: JSON.stringify({})
          })
        }
        else {
          request.continue();
        }
      })

    await page.goto(frameworkUrl);

    let metricsBefore = null;
    let start, end;

    await checkIfEveryComponentVisible(page, '.artist-card', mockArtists.total);
    start = performance.now();
    metricsBefore = await page.metrics();
    let counter = 0;

    while (counter++ < mockArtists.total) {
      await page.click('.follow-button.not-followed');
      await checkIfEveryComponentVisible(page, '.followed', counter);
    }

    end = performance.now();
    const metricsAfter = await page.metrics();
    const metricsDiff = diffMetrics(metricsBefore, metricsAfter);
    metricsDiff.performance = (end - start) / 1000;
    fs.appendFile(`${framework}-signals-for-equals-false-modify-metrics-${mockArtists.total}-artists-${timestamp}.txt`, JSON.stringify(metricsDiff) + '\n', 
      (err) => {
        if (err) {
          console.log(err)
        }
      }
    );
    await page.close();
  }
  await browser.close();
}

async function testWholeApplication(framework) {
  let frameworkUrl = chooseTopArtistsUrl(framework);

  if (!frameworkUrl) {
    console.error('You need to provide "svelte", "react" or "solid" as an argument for the script');
    return;
  }

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--disable-web-security',
    ],
    defaultViewport: null,
  });

  const mockArtists = JSON.parse(fs.readFileSync('mock-top-artists.json', 'utf8'));
  const mockProfile = JSON.parse(fs.readFileSync('mock-user-profile.json', 'utf8'));
  const mockArtistProfile = JSON.parse(fs.readFileSync('mock-artist-profile.json', 'utf8'));
  const mockBoolArray = Array(mockArtists.total).fill(false);
  const mockSongInfo = JSON.parse(fs.readFileSync('mock-songinfo.json', 'utf8'));
  const mockSongs = JSON.parse(fs.readFileSync('mock-top-songs.json', 'utf8'));
  const timestamp = new Date().toISOString().replace(/:/g, '-');

  for (let i = 0; i < 1; ++i) {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const url = request.url();
      const method = request.method();
      if (url.includes('/v1/me/following/contains')) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          headers: {"Access-Control-Allow-Origin": "*"},
          body: JSON.stringify(mockBoolArray)
      })
      } else if (url.includes('/v1/me/top/artists')) {
          request.respond({
              status: 200,
              contentType: 'application/json',
              headers: {"Access-Control-Allow-Origin": "*"},
              body: JSON.stringify(mockArtists)
          })
        } else if (url.includes('v1/me/following')) {
          if (method === "DELETE") {
            request.respond({
              status: 204,
              headers: { "Access-Control-Allow-Origin": "*" }
            });
          } else if (method === "PUT") {
            request.respond({
              status: 204,
              headers: { "Access-Control-Allow-Origin": "*" }
            });
          }
        } else if (url.includes('/api/token')) {
          request.respond({
            status: 200,
            contentType: 'application/json',
            headers: {"Access-Control-Allow-Origin": "*"},
            body: JSON.stringify({})
          })
        } else if (url.includes('/artists/')) {
          request.respond({
            status: 200,
            contentType: 'application/json',
            headers: {"Access-Control-Allow-Origin": "*"},
            body: JSON.stringify(mockArtistProfile)
          })
        } else if (url.includes('/v1/me/tracks/contains')) {
          request.respond({
            status: 200,
            contentType: 'application/json',
            headers: {"Access-Control-Allow-Origin": "*"},
            body: JSON.stringify(mockBoolArray)
        })
        } else if (url.includes('/v1/me/top/tracks')) {
          request.respond({
              status: 200,
              contentType: 'application/json',
              headers: {"Access-Control-Allow-Origin": "*"},
              body: JSON.stringify(mockSongs)
          })
        } else if (url.includes('/v1/me/tracks')) {
          if (method === "DELETE") {
            request.respond({
              status: 204,
              headers: { "Access-Control-Allow-Origin": "*" }
            });
          } else if (method === "PUT") {
            request.respond({
              status: 204,
              headers: { "Access-Control-Allow-Origin": "*" }
            });
          }
        } else if (url.includes('/v1/tracks/')) {
          request.respond({
            status: 200,
            contentType: 'application/json',
            headers: {"Access-Control-Allow-Origin": "*"},
            body: JSON.stringify(mockSongInfo)
          })
        } else if (url.includes('/v1/me')) {
          request.respond({
            status: 200,
            contentType: 'application/json',
            headers: {"Access-Control-Allow-Origin": "*"},
            body: JSON.stringify(mockProfile)
          })
        }
        else {
          request.continue();
        }
      })

    // top artist section
    await page.goto(frameworkUrl);
    await checkIfEveryComponentVisible(page, '.artist-card', mockArtists.total);
    await page.click('.artist-album-card');
    await page.waitForSelector('.artist-profile', { visible: true, timeout: 0 });
    await page.click('.back-button');
    await checkIfEveryComponentVisible(page, '.artist-card', mockArtists.total);
    await page.click('.last-6-months');
    await checkIfEveryComponentVisible(page, '.artist-card', mockArtists.total);
    await page.click('.last-4-weeks');
    await checkIfEveryComponentVisible(page, '.artist-card', mockArtists.total);
    await page.click('.play-button');
    await checkIfIframeVisible(page);
    await page.click('.close-iframe');
    await page.waitForSelector('iframe[src*="open.spotify.com/embed"]', { hidden: true, timeout: 0 });
    //await page.goto(chooseTopSongsUrl(framework));
    // top songs section
    await page.click('.top-songs');
    await checkIfEveryComponentVisible(page, '.song-card', mockSongs.total);
    await page.click('.song-item');
    await page.waitForSelector('.song-display', { visible: true, timeout: 0 });
    await page.click('.back-button');
    await checkIfEveryComponentVisible(page, '.song-card', mockSongs.total);
    await page.click('.last-6-months');
    await checkIfEveryComponentVisible(page, '.song-card', mockSongs.total);
    await page.click('.all-time');
    await checkIfEveryComponentVisible(page, '.song-card', mockSongs.total);
    await page.click('.play-button');
    await checkIfIframeVisible(page);
    await page.click('.close-iframe');
    await page.waitForSelector('iframe[src*="open.spotify.com/embed"]', { hidden: true, timeout: 0 });
    // start = performance.now();
    // metricsBefore = await page.metrics();
    // let counter = 0;

    // while (counter++ < mockArtists.total) {
    //   await page.click('.follow-button.not-followed');
    //   await checkIfEveryComponentVisible(page, '.followed', counter);
    // }

    // end = performance.now();
    // const metricsAfter = await page.metrics();
    // const metricsDiff = diffMetrics(metricsBefore, metricsAfter);
    // metricsDiff.performance = (end - start) / 1000;
    // fs.appendFile(`${framework}-signals-for-equals-false-modify-metrics-${mockArtists.total}-artists-${timestamp}.txt`, JSON.stringify(metricsDiff) + '\n', 
    //   (err) => {
    //     if (err) {
    //       console.log(err)
    //     }
    //   }
    // );
    //await page.close();
  }
  //await browser.close();
}

async function testPerformanceTopSongsRender(framework) {
  let frameworkUrl = chooseTopSongsUrl(framework);

  if (!frameworkUrl) {
    console.error('You need to provide "svelte", "react" or "solid" as an argument for the script');
    return;
  }

  const browser = await puppeteer.launch({
    protocolTimeout: 0,
    headless: false,
    args: [
      '--disable-web-security',
    ],
    defaultViewport: null,
  });

  const mockSongs = JSON.parse(fs.readFileSync('mock-top-songs.json', 'utf8'));
  const mockProfile = JSON.parse(fs.readFileSync('mock-user-profile.json', 'utf8'));
  const mockBoolArray = Array(mockSongs.total).fill(false);
  const timestamp = new Date().toISOString().replace(/:/g, '-');

  for (let i = 0; i < 2; ++i) {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const url = request.url();
      const method = request.method();
      if (url.includes('/v1/me/tracks/contains')) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          headers: {"Access-Control-Allow-Origin": "*"},
          body: JSON.stringify(mockBoolArray)
      })
      } else if (url.includes('/v1/me/top/tracks')) {
          request.respond({
              status: 200,
              contentType: 'application/json',
              headers: {"Access-Control-Allow-Origin": "*"},
              body: JSON.stringify(mockSongs)
          })
        } else if (url.includes('v1/me/tracks')) {
          if (method === "DELETE") {
            request.respond({
              status: 204,
              headers: { "Access-Control-Allow-Origin": "*" }
            });
          } else if (method === "PUT") {
            request.respond({
              status: 204,
              headers: { "Access-Control-Allow-Origin": "*" }
            });
          }
        } else if (url.includes('v1/me')) {
          request.respond({
            status: 200,
            contentType: 'application/json',
            headers: {"Access-Control-Allow-Origin": "*"},
            body: JSON.stringify(mockProfile)
          })
        } else if (url.includes('/api/token')) {
          request.respond({
            status: 200,
            contentType: 'application/json',
            headers: {"Access-Control-Allow-Origin": "*"},
            body: JSON.stringify({})
          })
        }
        else {
          request.continue();
        }
      })

    let start = performance.now();
    await page.goto(frameworkUrl, { timeout: 0 });

    //let metricsBefore = null;
    
    //await page.waitForSelector('.last-song', { visible: true, timeout: 0 });
    await checkIfEveryComponentVisible(page, '.song-card', mockSongs.total);
    let end = performance.now();
    console.log((end - start) / 1000);

    // end = performance.now();
    // const metricsAfter = await page.metrics();
    // const metricsDiff = diffMetrics(metricsBefore, metricsAfter);
    // metricsDiff.performance = (end - start) / 1000;
    // fs.appendFile(`${framework}-signals-for-equals-false-modify-metrics-${mockArtists.total}-artists-${timestamp}.txt`, JSON.stringify(metricsDiff) + '\n', 
    //   (err) => {
    //     if (err) {
    //       console.log(err)
    //     }
    //   }
    // );
    await page.close();
  }
  await browser.close();
}

const args = process.argv;
const framework = args[2];

//await testPerformanceTopArtistsRender(framework);
//await testPerformanceTopArtistsDelete(framework);
//await testPerformanceFollowedArtistsDelete(framework);
//await testPerformanceTopArtistsModify(framework);
await testWholeApplication(framework);
//await testPerformanceTopSongsRender(framework);