// Express server with Supabase integration for CRUD

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// CRUD for favorite songs

// Favorites endpoints
app.get('/favorites', async (req, res) => {
  const { data, error } = await supabase.from('favorites').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/favorites', async (req, res) => {
  const { user_id, song_id } = req.body;
  const { data, error } = await supabase.from('favorites').insert([{ user_id, song_id }]);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.delete('/favorites/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('favorites').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Flagged songs endpoints
// Queue endpoints
app.get('/queue', async (req, res) => {
  const { user_id } = req.query;
  const { data, error } = await supabase.from('queue').select('*').eq('user_id', user_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/queue', async (req, res) => {
  const { user_id, queue } = req.body;
  const { data, error } = await supabase.from('queue').upsert([{ user_id, queue }], { onConflict: ['user_id'] });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Theme endpoints
app.get('/theme', async (req, res) => {
  const { user_id } = req.query;
  const { data, error } = await supabase.from('theme').select('*').eq('user_id', user_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/theme', async (req, res) => {
  const { user_id, theme } = req.body;
  const { data, error } = await supabase.from('theme').upsert([{ user_id, theme }], { onConflict: ['user_id'] });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Volume endpoints
app.get('/volume', async (req, res) => {
  const { user_id } = req.query;
  const { data, error } = await supabase.from('volume').select('*').eq('user_id', user_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/volume', async (req, res) => {
  const { user_id, volume } = req.body;
  const { data, error } = await supabase.from('volume').upsert([{ user_id, volume }], { onConflict: ['user_id'] });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Repeat endpoints
app.get('/repeat', async (req, res) => {
  const { user_id } = req.query;
  const { data, error } = await supabase.from('repeat').select('*').eq('user_id', user_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/repeat', async (req, res) => {
  const { user_id, repeat } = req.body;
  const { data, error } = await supabase.from('repeat').upsert([{ user_id, repeat }], { onConflict: ['user_id'] });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Last song endpoints
app.get('/lastsong', async (req, res) => {
  const { user_id } = req.query;
  const { data, error } = await supabase.from('lastsong').select('*').eq('user_id', user_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/lastsong', async (req, res) => {
  const { user_id, songIndex } = req.body;
  const { data, error } = await supabase.from('lastsong').upsert([{ user_id, songIndex }], { onConflict: ['user_id'] });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Favorite parts endpoints
app.get('/favparts', async (req, res) => {
  const { user_id } = req.query;
  const { data, error } = await supabase.from('favparts').select('*').eq('user_id', user_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/favparts', async (req, res) => {
  const { user_id, songIndex, start, end, name } = req.body;
  const { data, error } = await supabase.from('favparts').insert([{ user_id, songIndex, start, end, name }]);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.delete('/favparts/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('favparts').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});
app.get('/flagged', async (req, res) => {
  const { data, error } = await supabase.from('flagged').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/flagged', async (req, res) => {
  const { user_id, song_id, reason } = req.body;
  const { data, error } = await supabase.from('flagged').insert([{ user_id, song_id, reason }]);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.delete('/flagged/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('flagged').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Health check
app.get('/', (req, res) => {
  res.send('Supabase Express API running');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Countries proxy endpoint (uses restcountries API)
app.get('/countries', async (req, res) => {
  try {
    const fetch = require('node-fetch');
    const url = 'https://restcountries.com/v3.1/all?fields=name,cca2,cca3,region';
    const resp = await fetch(url);
    if (!resp.ok) {
      console.error('Failed to fetch countries:', resp.status, resp.statusText);
      return res.status(500).json({ error: 'Failed to fetch countries', status: resp.status });
    }
    const json = await resp.json();
    if (!Array.isArray(json)) {
      console.error('Unexpected response from countries API:', json);
      return res.status(500).json({ error: 'Unexpected response from countries API' });
    }
    const list = json.map((c) => ({
      name: c.name && c.name.common ? c.name.common : c.name,
      cca2: c.cca2 || null,
      cca3: c.cca3 || null,
      region: c.region || null,
    }));
    res.json(list.sort((a, b) => a.name.localeCompare(b.name)));
  } catch (err) {
    console.error('Error in /countries:', err);
    res.status(500).json({ error: err.message });
  }
});

// User profile endpoints
app.get('/profiles', async (req, res) => {
  const { user_id } = req.query;
  try {
    const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', user_id);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/profiles', async (req, res) => {
  const { user_id, country_code, country_name, metadata } = req.body;
  try {
    const payload = { user_id, country_code, country_name, metadata: metadata || {} };
    const { data, error } = await supabase.from('user_profiles').upsert([payload], { onConflict: ['user_id'] });
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
