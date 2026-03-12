const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const COMLINK = 'https://swgoh-app.onrender.com';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Test Comlink connectivity
app.get('/api/test', async (req, res) => {
  try {
    const response = await fetch(`${COMLINK}/metadata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    });
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
    const response = await fetch(`${COMLINK}/player`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    console.log('Comlink status:', response.status);
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
