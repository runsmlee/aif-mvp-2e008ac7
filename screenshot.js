const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: '/tmp/before-desktop.png', fullPage: true });
  
  // Mobile viewport
  await page.setViewport({ width: 375, height: 812 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: '/tmp/before-mobile.png', fullPage: true });
  
  await browser.close();
  console.log('Screenshots saved');
})();
