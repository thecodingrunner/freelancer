import puppeteer from 'puppeteer';

async function scrapeGoogleForBusinesses(searchQuery, location) {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }); // Set to true for production
  const page = await browser.newPage();
  
  // Construct the Google search URL
  const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}+in+${encodeURIComponent(location)}`;
  
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    const rejectButton = await page.$('div.GzLjMd button.tHlp8d');
    if (rejectButton) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
        rejectButton.click()
      ]);
    }

    const expandButton = await page.$('a.jRKCUd');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
      expandButton.click()
    ]);
    
    // Wait for the search results to load
    await page.waitForSelector('.rllt__details', { timeout: 10000 });

    const businesses = [];
    const elements = await page.$$('.rllt__link');
    
    for (let element of elements) {
      try {
        const name = await element.$eval('.OSrXXb', el => el.textContent.trim());
        const address = await element.$eval('.rllt__details div:nth-child(3)', el => el.textContent.trim());
        
        // Click on the element to open the business details
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
          element.click(),
        ]);
        
        // Try to get the website URL
        let website = null;
        try {
          await page.waitForSelector('a.GFNUx', { timeout: 5000 });
          website = await page.$eval('a.GFNUx', el => el.href);
          console.log('Website found:', website);
        } catch (error) {
          console.log('Website not found for this business');
        }
        
        businesses.push({ name, address, website });
        
        // Go back to the search results
        // await page.goBack({ waitUntil: 'networkidle0', timeout: 30000 });
        // await page.waitForSelector('.rllt__details', { timeout: 10000 });
      } catch (error) {
        console.error('Error processing business:', error);
      }
    }
    
    return businesses;
  } catch (error) {
    console.error('Scraping error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Usage example
scrapeGoogleForBusinesses('restaurants', 'Sheffield')
  .then(results => console.log(results))
  .catch(error => console.error(error));

