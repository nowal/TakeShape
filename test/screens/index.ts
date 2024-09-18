import { TEST_SCREENS_SIZES } from '@/test/screens/constants';
import { resolvePwd } from '@/test/screens/pwd';
import puppeteer from 'puppeteer';

const pwd = resolvePwd();

export const TEST_SCREENS_DIR = `${pwd}/test/screens/prev`;

const init = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for await (const size of TEST_SCREENS_SIZES) {
    await page.setViewport(size);

    const website_url = 'http://localhost:3000/dashboard';
    await page.goto(website_url, {
      waitUntil: ['load', 'networkidle0'],
    });
    setTimeout(async () => {
      await page.screenshot({
        path: `${TEST_SCREENS_DIR}/_${size.width}x${size.height}.jpg`,
      });
    }, 1000);
  }

  await browser.close();
};

init();
