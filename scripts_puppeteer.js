import puppeteer from 'puppeteer';
import fs from 'fs';
// const puppeteer = require('puppeteer');
// const fs = require('fs');

const svelteAppUrl = 'http://127.0.0.1:4173/top-artists';
const reactAppUrl = 'http://127.0.0.1:4000/top-artists';

const chooseFramework = (framework) => {
  if (framework === 'svelte') {
    return svelteAppUrl;
  } else if (framework === 'react') {
    return reactAppUrl;
  } else {
    return '';
  }
};

async function testPerformanceTopArtistsRender(framework) {
  let frameworkUrl = chooseFramework(framework);

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
  let frameworkUrl = chooseFramework(framework);

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
    const metricsBefore = await page.metrics();
    console.info(metricsBefore);
    await page.click('.artist-delete-button');
    await page.waitForSelector('.first-artist', { visible: true, timeout: 0 });
    const metricsAfter = await page.metrics();
    console.info(metricsAfter);
    // fs.appendFile(`${framework}-delete-metrics-${mockArtists.total}-artists-${timestamp}.txt`, JSON.stringify(metrics) + '\n', 
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

const args = process.argv;
const framework = args[2];

//await testPerformanceTopArtistsRender(framework);
await testPerformanceTopArtistsDelete(framework);
