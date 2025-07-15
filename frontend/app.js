document.addEventListener('DOMContentLoaded', function () {
  const btnGetSetlist = document.getElementById('get-setlist');
  const setlistContainer = document.getElementById('setlist-container');

  async function fetchSetlist() {
    const artist = document.getElementById('artist').value.trim();

    if (!artist) {
      alert("Por favor, insira um nome de artista.");
      return;
    }

    try {
      const response = await fetch(`https://setlist-predictor-production.up.railway.app/setlist/${encodeURIComponent(artist)}`);
      if (!response.ok) throw new Error('Erro ao buscar setlist');

      const setlist = await response.json();

      if (Array.isArray(setlist) && setlist.length > 0) {
        setlistContainer.innerHTML = '<h2>Setlist Previsto:</h2><ol>';
        setlist.forEach(song => {
          setlistContainer.innerHTML += `<li>${song}</li>`;
        });
        setlistContainer.innerHTML += '</ol>';
      } else {
        setlistContainer.innerHTML = '<p>Nenhum setlist encontrado para esse artista.</p>';
      }
    } catch (err) {
      console.error('Erro ao buscar setlist:', err);
      setlistContainer.innerHTML = '<p>Erro ao buscar setlist. Tente novamente mais tarde.</p>';
    }
  }

  btnGetSetlist.addEventListener('click', fetchSetlist);
}); 