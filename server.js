const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const COMLINK = 'https://swgoh-app.onrender.com';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Proxy player roster from Comlink
app.post('/api/player', async (req, res) => {
  console.log('Player request received:', JSON.stringify(req.body));
  console.log('Calling Comlink at:', `${COMLINK}/player`);
  try {
    const response = await fetch(`${COMLINK}/player`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    console.log('Comlink response status:', response.status);
    if (!response.ok) {
      const text = await response.text();
      console.log('Comlink error body:', text);
      throw new Error(`Comlink returned ${response.status}: ${text}`);
    }
    const data = await response.json();
    console.log('Comlink returned units:', (data.rosterUnit||[]).length);
    res.json(data);
  } catch (err) {
    console.error('Player proxy error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Proxy Claude API (keeps API key off the client — add yours here or use env var)
app.post('/api/analyze', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`SWGOH app running on port ${PORT}`));
