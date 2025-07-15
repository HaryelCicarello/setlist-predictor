require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());

const PORT = process.env.PORT || 3000;

// Função para pegar os 10 últimos setlists
const getRecentSetlists = async (artist) => {
  try {
    const response = await axios.get(`https://api.setlist.fm/rest/1.0/search/setlists`, {
      headers: {
        'x-api-key': process.env.SETLIST_API_KEY,
        'Accept': 'application/json',
        'User-Agent': 'SetlistPredictor/1.0',
      },
      params: {
        artistName: artist,
        limit: 10,
      },
    });

    console.log('Resposta da API:', JSON.stringify(response.data, null, 2));
    return response.data.setlist || [];
  } catch (error) {
    console.error('Erro ao buscar setlists:', error.response?.data || error.message);
    return [];
  }
};

// Função para prever o setlist com base nos últimos 10 shows
const predictSetlist = async (artist) => {
  const recentSetlists = await getRecentSetlists(artist);

  if (recentSetlists.length === 0) return [];

  const songCounts = {};
  const orderedSongs = [];
  let totalSongs = 0;

  recentSetlists.forEach(setlist => {
    if (setlist.sets && Array.isArray(setlist.sets.set)) {
      setlist.sets.set.forEach(set => {
        if (set.song && Array.isArray(set.song)) {
          set.song.forEach(song => {
            if (song.name) {
              if (!orderedSongs.includes(song.name)) {
                orderedSongs.push(song.name);
              }
              songCounts[song.name] = (songCounts[song.name] || 0) + 1;
              totalSongs++;
            }
          });
        }
      });
    }
  });

  const avgSongsPerShow = totalSongs / recentSetlists.length;
  console.log('Média de músicas por show:', avgSongsPerShow);

  return orderedSongs.slice(0, Math.round(avgSongsPerShow));
};

// Rota para retornar o setlist previsto
app.get('/setlist/:artist', async (req, res) => {
  const artist = req.params.artist;
  const setlist = await predictSetlist(artist);

  if (setlist.length > 0) {
    res.json(setlist);
  } else {
    res.status(404).json({ error: 'Nenhum setlist encontrado ou erro ao buscar setlists.' });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});