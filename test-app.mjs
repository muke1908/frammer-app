import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen for console messages
  page.on('console', msg => console.log('BROWSER:', msg.text()));

  // Listen for errors
  page.on('pageerror', error => console.error('PAGE ERROR:', error.message));

  try {
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 10000 });

    console.log('Page loaded. Taking screenshot...');
    await page.screenshot({ path: 'screenshot.png', fullPage: true });

    // Get page title and HTML
    const title = await page.title();
    console.log('Page title:', title);

    // Check for errors in the page
    const bodyText = await page.locator('body').innerText();
    console.log('Page content preview:', bodyText.substring(0, 200));

    // Check if our app loaded
    const header = await page.locator('header').count();
    console.log('Headers found:', header);

    const uploadZone = await page.locator('.upload-zone').count();
    console.log('Upload zones found:', uploadZone);

    console.log('✓ Screenshot saved to screenshot.png');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
