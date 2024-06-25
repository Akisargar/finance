// pages/api/fetchData.js
import puppeteer from 'puppeteer';

async function fetchDataWithPuppeteer(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    const data = await page.evaluate(() => {
        const paragraphs = Array.from(document.querySelectorAll('p')).map(p => p.textContent);
        return paragraphs;
    });

    await browser.close();
    return data;
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const url = req.query.url;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const data = await fetchDataWithPuppeteer(url);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
}
