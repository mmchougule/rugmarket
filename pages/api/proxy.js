import fetch from 'node-fetch';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 60 }); // Cache for 60 seconds

const baseUrl = 'https://frontend-api.pump.fun/';

export default async function handler(req, res) {
  const path = req.query.path;
  const url = `${baseUrl}${path}`;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  // Check cache first
  const cachedData = cache.get(url);
  if (cachedData) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    return res.status(200).json(cachedData);
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Store in cache
    cache.set(url, data);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'An error occurred while fetching data', details: error.message });
  }
}
