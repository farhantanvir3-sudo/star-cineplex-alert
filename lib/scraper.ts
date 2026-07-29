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
    
    await page.goto('https://ticket.cineplexbd.com/login', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // 1. Click GUEST LOGIN
    const buttons = await page.$$('button');
    for(let btn of buttons){
        const text = await page.evaluate(el => el.innerText, btn);
        if (text && text.includes('GUEST LOGIN')) {
            await btn.click();
            break;
        }
    }
    
    // Wait for the home page to load
    await new Promise(r => setTimeout(r, 4000));
    
    // 2. Select Location
    await page.evaluate(() => {
        const divs = document.querySelectorAll('div');
        for (let d of divs) {
            if (d.innerText === 'Location') {
                d.click();
                break;
            }
        }
    });
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Click SKS Tower
    await page.evaluate(() => {
        const pTags = document.querySelectorAll('p');
        for (let p of pTags) {
            if (p.innerText.includes('SKS Tower')) {
                p.click();
                break;
            }
        }
    });
    
    await new Promise(r => setTimeout(r, 4000));

    // Format the date to match how it might appear on the website.
    const parsedDate = parseISO(targetDate);
    const shortFormat = format(parsedDate, 'dd MMM'); // "31 Jul"
    const longFormat = format(parsedDate, 'dd MMMM'); // "31 July"
    
    // 3. Click the target date
    await page.evaluate((shortF, longF) => {
        const pTags = document.querySelectorAll('p');
        for (let p of pTags) {
            if (p.innerText.includes(shortF) || p.innerText.includes(longF)) {
                if (p.parentElement) {
                    p.parentElement.click();
                }
                break;
            }
        }
    }, shortFormat, longFormat);
    
    await new Promise(r => setTimeout(r, 3000));

    // Extract all the text content from the rendered page
    const pageText = await page.evaluate(() => {
      return document.body.innerText || "";
    });
    
    // 4. Check if movies are available
    // If it says "Select Movie (0)" or "No Movie Available", tickets are not out yet.
    const hasMovies = !pageText.includes('Select Movie (0)') && !pageText.includes('No Movie Available');
    const isAvailable = hasMovies && pageText.includes('Select Movie');

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
