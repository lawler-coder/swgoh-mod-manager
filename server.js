const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const COMLINK = 'https://swgoh-app.onrender.com';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Fetch with retry - Comlink on Render free tier can take 30-60s to wake up
async function fetchWithRetry(url, options, retries = 6, delayMs = 10000) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1}/${retries}: ${url}`);
      const res = await fetch(url, options);
      if (res.status === 502 || res.status === 503) {
        console.log(`Got ${res.status}, Comlink waking up... waiting ${delayMs}ms`);
        if (i < retries - 1) await new Promise(r => setTimeout(r, delayMs));
        continue;
      }
      return res;
    } catch (err) {
      console.log(`Attempt ${i + 1} failed: ${err.message}`);
      if (i < retries - 1) await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw new Error('Comlink did not respond after multiple attempts. Try again in a minute.');
}

// Test Comlink connectivity
app.get('/api/test', async (req, res) => {
  try {
    const response = await fetchWithRetry(`${COMLINK}/metadata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    }, 3, 5000);
    const text = await response.text();
    res.json({ ok: true, status: response.status, comlink: COMLINK, preview: text.slice(0, 300) });
  } catch (err) {
    res.json({ ok: false, error: err.message, comlink: COMLINK });
  }
});

// Proxy player roster from Comlink
app.post('/api/player', async (req, res) => {
  console.log('Player request body:', JSON.stringify(req.body));
  try {
    const response = await fetchWithRetry(`${COMLINK}/player`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const text = await response.text();
    if (!response.ok) {
      console.error('Comlink error:', text.slice(0, 500));
      return res.status(502).json({ error: `Comlink error ${response.status}: ${text.slice(0, 200)}` });
    }
    const data = JSON.parse(text);
    console.log('Units returned:', (data.rosterUnit || []).length);
    res.json(data);
  } catch (err) {
    console.error('Player proxy error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Proxy Claude API
app.post('/api/analyze', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': process.env.ANTHROPIC_API_KEY || ''
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`SWGOH app running on port ${PORT}`));
