import puppeteer from 'puppeteer';
import { format, parseISO } from 'date-fns';

export const checkTicketAvailability = async (targetDate: string): Promise<{ isAvailable: boolean }> => {
  let browser;
  try {
    console.log(`Starting headless browser check for tickets on ${targetDate}...`);
    
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process', 
      ],
    });

    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    
    // SKS Tower location is 3
    await page.goto('https://www.cineplexbd.com/showtimes?location=3', {
      waitUntil: 'networkidle2', // Wait until no more than 2 network connections for at least 500ms
      timeout: 30000,
    });

    // Extract all the text content from the rendered page
    const pageText = await page.evaluate(() => {
      return document.body.innerText || "";
    });

    // Format the date to match how it might appear on the website.
    // E.g., targetDate is "2026-07-31" -> "31 Jul" or "31 July"
    const parsedDate = parseISO(targetDate);
    const shortFormat = format(parsedDate, 'dd MMM'); // "31 Jul"
    const longFormat = format(parsedDate, 'dd MMMM'); // "31 July"
    
    // Check if the date string is found anywhere on the page
    // Also checking for the exact targetDate in case it's in a hidden value attribute (e.g. 2026-07-31)
    const isAvailable = pageText.includes(shortFormat) || 
                        pageText.includes(longFormat) || 
                        pageText.includes(targetDate);

    console.log(`Scrape finished. Found tickets for ${targetDate}? ${isAvailable}`);

    return { isAvailable };
  } catch (error) {
    console.error('Error checking ticket availability via Puppeteer:', error);
    return { isAvailable: false };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
