import puppeteer from 'puppeteer';
import fs from 'fs';
// const puppeteer = require('puppeteer');
// const fs = require('fs');

const svelteAppUrlTopArtists = 'http://127.0.0.1:4173/top-artists';
const reactAppUrlTopArtists = 'http://127.0.0.1:4000/top-artists';

const svelteAppUrlFollowedArtists = 'http://127.0.0.1:4173/followed-artists';
const reactAppUrlFollowedArtists = 'http://127.0.0.1:4000/followed-artists';

const chooseTopArtistsUrl = (framework) => {
  if (framework === 'svelte') {
    return svelteAppUrlTopArtists;
  } else if (framework === 'react') {
    return reactAppUrlTopArtists;
  } else {
    return '';
  }
};

const chooseFollowedArtistsUrl = (framework) => {
  if (framework === 'svelte') {
    return svelteAppUrlFollowedArtists;
  } else if (framework === 'react') {
    return reactAppUrlFollowedArtists;
  } else {
    return '';
  }
};

const diffMetrics = (metricsBefore, metricsAfter) => {
  const diff = {};
  for (const key in metricsBefore) {
      diff[key] = metricsAfter[key] - metricsBefore[key];
  }
  return diff;
};

async function testPerformanceTopArtistsRender(framework) {
  let frameworkUrl = chooseTopArtistsUrl(framework);

  if (!frameworkUrl) {
    console.error('You need to provide "svelte", "react" or "solid" as an argument for the script');
    return;
  }

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--user-data-dir=C:/Users/HP/AppData/Local/Google/Chrome/User Data',
      '--profile-directory=Default',
      '--disable-web-security',
      '--disable-features=IsolateOrigins',
      '--disable-site-isolation-trials',
      '--disable-extensions'
    ],
    defaultViewport: null,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  });

  const mockArtists = JSON.parse(fs.readFileSync('mock-top-artists.json', 'utf8'));
  const mockProfile = JSON.parse(fs.readFileSync('mock-user-profile.json', 'utf8'));
  const timestamp = new Date().toISOString().replace(/:/g, '-');

  for (let i = 0; i < 100; ++i) {
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
    const metrics = await page.metrics();
    fs.appendFile(`${framework}-metrics-${mockArtists.total}-artists-${timestamp}.txt`, JSON.stringify(metrics) + '\n', 
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
      '--user-data-dir=C:/Users/HP/AppData/Local/Google/Chrome/User Data',
      '--profile-directory=Default',
      '--disable-web-security',
      '--disable-features=IsolateOrigins',
      '--disable-site-isolation-trials',
      '--disable-extensions'
    ],
    defaultViewport: null,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  });

  const mockArtists = JSON.parse(fs.readFileSync('mock-top-artists.json', 'utf8'));
  const mockProfile = JSON.parse(fs.readFileSync('mock-user-profile.json', 'utf8'));
  const timestamp = new Date().toISOString().replace(/:/g, '-');

  for (let i = 0; i < 100; ++i) {
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
    fs.appendFile(`${framework}-no-memo-delete-metrics-${mockArtists.total}-artists-${timestamp}.txt`, JSON.stringify(metricsDiff) + '\n', 
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
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--user-data-dir=C:/Users/HP/AppData/Local/Google/Chrome/User Data',
      '--profile-directory=Default',
      '--disable-web-security',
      '--disable-features=IsolateOrigins',
      '--disable-site-isolation-trials',
      '--disable-extensions'
    ],
    defaultViewport: null,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  });

  const mockArtists = JSON.parse(fs.readFileSync('mock-followed-artists.json', 'utf8'));
  const mockProfile = JSON.parse(fs.readFileSync('mock-user-profile.json', 'utf8'));
  const mockBoolArray = Array(mockArtists.artists.total).fill(true);
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
      }
      else {
          request.continue();
      }
    })

    await page.goto(frameworkUrl);
    await page.waitForSelector('.last-artist', { visible: true, timeout: 0 });
    const previousFirstArtist = await page.$eval('.first-artist', el => el.textContent);
    const metricsBefore = await page.metrics();
    //await page.tracing.start({ path: 'trace.json', screenshots: true });
    //console.info(metricsBefore);
    await page.click('.follow-button');

    await page.waitForFunction((prev) => {
      const el = document.querySelector('.first-artist');
      return el && el.textContent !== prev;
    }, { timeout: 0 }, previousFirstArtist);

    await page.waitForSelector('.first-artist', { visible: true, timeout: 0 });
    const metricsAfter = await page.metrics();
    //await page.tracing.stop();
    //console.info(metricsAfter);
    const metricsDiff = diffMetrics(metricsBefore, metricsAfter);
    fs.appendFile(`${framework}-unfollow-metrics-${mockArtists.artists.total}-artists-${timestamp}.txt`, JSON.stringify(metricsDiff) + '\n', 
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

const args = process.argv;
const framework = args[2];

//await testPerformanceTopArtistsRender(framework);
//await testPerformanceTopArtistsDelete(framework);
await testPerformanceFollowedArtistsDelete(framework);
