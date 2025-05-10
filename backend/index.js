require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

// Função para pegar os 10 últimos setlists
const getRecentSetlists = async (artist) => {
  try {
    const response = await axios.get(`https://api.setlist.fm/rest/1.0/search/setlists`, {
      headers: {
        'x-api-key': process.env.SETLIST_API_KEY,
        'Accept': 'application/json',
        'User-Agent': 'SetlistPredictor/1.0 (seuemail@exemplo.com)', // Altere para seu email ou um contato válido
      },
      params: {
        artistName: artist,
        limit: 10, // Pegando os 10 últimos setlists
      },
    });

    console.log('Resposta da API:', JSON.stringify(response.data, null, 2)); // Exibe a resposta com formatação

    return response.data.setlist || []; // Garantir que sempre retornamos um array vazio se não houver setlists
  } catch (error) {
    console.error('Erro ao buscar setlists:', error.response?.data || error.message);
    return []; // Retorna um array vazio em caso de erro
  }
};

// Função para prever o setlist com base nos últimos 10 shows
const predictSetlist = async (artist) => {
  const recentSetlists = await getRecentSetlists(artist);

  if (recentSetlists.length === 0) {
    return []; // Se não encontrar setlists, retorna um array vazio
  }

  // Criando um objeto para contar a frequência de cada música
  const songCounts = {};
  let totalSongs = 0;

  // Criando uma lista de músicas ordenadas pela sequência dos shows
  const orderedSongs = [];

  // Iterando pelos últimos 10 setlists para contar as músicas
  recentSetlists.forEach(setlist => {
    console.log('Setlist:', setlist); // Log para verificar o setlist

    // Verificando se o campo 'sets.set' existe e se é um array
    if (setlist.sets && Array.isArray(setlist.sets.set)) {
      // Iterando sobre cada set dentro de 'sets.set'
      setlist.sets.set.forEach(set => {
        // Cada set contém músicas em 'song'
        if (set.song && Array.isArray(set.song)) {
          set.song.forEach(song => {
            if (song.name) {
              // Adicionando a música à lista de músicas ordenadas
              if (!orderedSongs.includes(song.name)) {
                orderedSongs.push(song.name);
              }

              // Contabilizando a frequência da música
              songCounts[song.name] = (songCounts[song.name] || 0) + 1;
              totalSongs++;
            }
          });
        }
      });
    }
  });

  // Calculando a média de músicas por show
  const avgSongsPerShow = totalSongs / recentSetlists.length;
  console.log('Média de músicas por show:', avgSongsPerShow); // Log para verificar a média

  // Selecionando o número de músicas baseadas na média calculada
  const songsForSetlist = orderedSongs.slice(0, Math.round(avgSongsPerShow)); // Retorna as músicas em ordem com base na média

  return songsForSetlist; // Retorna as músicas mais tocadas em ordem
};

// Rota para pegar o setlist previsto para um artista
app.get('/setlist/:artist', async (req, res) => {
  const artist = req.params.artist;
  const setlist = await predictSetlist(artist);

  if (setlist.length > 0) {
    res.json(setlist); // Retorna o setlist com as músicas em ordem
  } else {
    res.status(404).json({ error: 'Nenhum setlist encontrado ou erro ao buscar setlists.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
