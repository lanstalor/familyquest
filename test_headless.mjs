import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:5177/');
  
  await page.waitForTimeout(1000);
  
  const beginBtn = await page.$('button:has-text("BEGIN QUEST")');
  if (beginBtn) await beginBtn.click();
  
  await page.waitForTimeout(1000);
  const revealBtn = await page.$('button:has-text("Reveal this room")');
  if (revealBtn) await revealBtn.click();
  
  await page.waitForTimeout(5000);
  await browser.close();
})();
