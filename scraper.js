const axios = require('axios');
const cheerio = require('cheerio');

// Helper function to scrape reviews with more robust selectors
async function scrapeReviews($) {
    console.log('Starting review extraction...');
    
    // // First, try to find review containers that might hold our target divs
    // const containerSelectors = [
    //     'div.review-container',
    //     'div[data-review-id]',
    //     'div.lister-item',
    //     'div.review-list-item'
    // ];
    
    // Direct selector for the content, regardless of nesting
    const contentSelector = 'div.ipc-html-content-inner-div[role="presentation"]';
    
    let reviews = [];
    
    // Method 1: Try finding the content divs directly, regardless of nesting
    console.log('Trying direct content selection...');
    const directContentDivs = $(contentSelector);
    console.log(`Found ${directContentDivs.length} direct content divs`);
    
    if (directContentDivs.length > 0) {
        directContentDivs.each((_, div) => {
            const text = $(div).text().trim();
            if (text) {
                console.log(`Found review text (${text.length} chars)`);
                reviews.push(text);
            }
        });
    }
    
    // // Method 2: If direct selection didn't work, try container-based approach
    // if (reviews.length === 0) {
    //     console.log('Trying container-based selection...');
    //     for (const containerSelector of containerSelectors) {
    //         const containers = $(containerSelector);
    //         console.log(`Found ${containers.length} containers with selector: ${containerSelector}`);
            
    //         containers.each((_, container) => {
    //             const $container = $(container);
    //             const contentDiv = $container.find(contentSelector);
                
    //             if (contentDiv.length > 0) {
    //                 const text = contentDiv.text().trim();
    //                 if (text) {
    //                     console.log(`Found review text in container (${text.length} chars)`);
    //                     reviews.push(text);
    //                 }
    //             }
    //         });
            
    //         if (reviews.length > 0) break;
    //     }
    // }
    
    return reviews;
}

// Modified scrap function with better error handling and debugging
async function scrap(movieUrl, imdbId, limit, allReviews = []) {
    try {
        console.log(`Fetching reviews from: ${movieUrl}`);
        
        const response = await axios.get(movieUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Connection': 'keep-alive',
                'Cookie': 'lc-main=en_US' // Add language cookie to ensure English content
            },
            timeout: 10000 // 10 second timeout
        });

        // Debug log for response
        console.log(`Response status: ${response.status}`);
        console.log(`Response content length: ${response.data.length}`);

        const $ = cheerio.load(response.data);

        // // Save the text content of first few divs that might be reviews
        // console.log('\nSampling potential review content:');
        // $('div').slice(0, 5).each((i, el) => {
        //     const text = $(el).text().trim();
        //     if (text.length > 100) {  // Only log reasonably long text
        //         console.log(`\nPotential content #${i + 1} (${text.length} chars):`);
        //         console.log(text.substring(0, 150) + '...');
        //     }
        // });

        const pageReviews = await scrapeReviews($);
        console.log(`Found ${pageReviews.length} reviews on this page`);
        
        allReviews.push(...pageReviews);

        // Check if we've reached the limit
        if (limit && allReviews.length >= limit) {
            return allReviews.slice(0, limit);
        }

        // Look for pagination using multiple possible selectors
        const paginationSelectors = [
            'div.load-more-data',
            'div.paginationKey',
            'a.load-more-data[data-key]'
        ];
        
        let paginationKey = null;
        for (const selector of paginationSelectors) {
            const element = $(selector);
            if (element.length) {
                paginationKey = element.attr('data-key');
                if (paginationKey) break;
            }
        }

        if (paginationKey) {
            const nextUrl = `https://www.imdb.com/title/${imdbId}/reviews/_ajax?paginationKey=${paginationKey}`;
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
            return scrap(nextUrl, imdbId, limit, allReviews);
        }

        return allReviews;
    } catch (error) {
        console.error('Detailed scraping error:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            headers: error.response?.headers,
            url: movieUrl
        });
        
        // If we already have some reviews, return them instead of failing
        if (allReviews.length > 0) {
            console.log(`Returning ${allReviews.length} reviews despite error`);
            return allReviews;
        }
        throw error;
    }
}

async function scrapeImdbReviews(imdbId, limit = null) {
    // Validate IMDB ID format
    if (!imdbId.match(/^tt\d+$/)) {
        throw new Error('Invalid IMDB ID format. Must start with "tt" followed by numbers.');
    }

    const initialUrl = `https://www.imdb.com/title/${imdbId}/reviews`;
    const reviews = await scrap(initialUrl, imdbId, limit);
    
    if (reviews.length === 0) {
        throw new Error(`No reviews found for IMDb ID: ${imdbId}. Please verify the ID is correct and the movie has reviews.`);
    }
    
    return reviews;
}

module.exports = {
    scrapeImdbReviews
};