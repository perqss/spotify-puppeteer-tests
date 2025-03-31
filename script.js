const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const appUrl = 'http://127.0.0.1:5173/';

const getLoggedInChromeDriver = async () => {
    let options = new chrome.Options();
    
    options.addArguments('user-data-dir=C:/Users/HP/AppData/Local/Google/Chrome/User Data');
    options.addArguments('profile-directory=Default');
    options.addArguments('--disable-blink-features=AutomationControlled'); 

    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    return driver;
};

async function test() {
    let driver = await getLoggedInChromeDriver();

    await driver.get(appUrl);

    console.log('Page loaded successfully!');
    
    let loginButton = await driver.findElement(By.className('login-button'));

    await loginButton.click();

    let acceptButton = await driver.wait(
        until.elementLocated(By.css('[data-testid="auth-accept"]')),
        10000
    );

    await driver.wait(until.elementIsVisible(acceptButton), 5000);
    await driver.wait(until.elementIsEnabled(acceptButton), 5000);

    await acceptButton.click();
    await driver.sleep(2000);
    await driver.navigate().refresh();
}

test();