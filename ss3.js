const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('http://localhost:5180', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: '/tmp/final-desktop.png', fullPage: true });
  
  await page.setViewport({ width: 375, height: 812 });
  await page.goto('http://localhost:5180', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: '/tmp/final-mobile.png', fullPage: true });
  
  await browser.close();
  console.log('Final screenshots saved');
})();
