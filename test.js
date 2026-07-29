const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    await page.goto('https://ticket.cineplexbd.com/login', {waitUntil: 'networkidle2'});
    
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
    // Click the location dropdown to open it
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
    
    // 3. Click the target date (e.g. 1 Aug)
    await page.evaluate(() => {
        const pTags = document.querySelectorAll('p');
        for (let p of pTags) {
            if (p.innerText.includes('1 Aug')) {
                // Usually the parent is the clickable box
                p.parentElement.click();
                break;
            }
        }
    });
    
    await new Promise(r => setTimeout(r, 2000));
    
    // 4. Check if movies are available
    const pageText = await page.evaluate(() => document.body.innerText);
    const hasNoMovies = pageText.includes('No Movie Available');
    const isAvailable = !hasNoMovies;
    
    console.log('Tickets Available for 31 Jul?', isAvailable);
    
    await browser.close();
})();
