document.getElementById('predictBtn').addEventListener('click', () => {
    const city = document.getElementById('city').value;
    const setlistElement = document.getElementById('setlist');
  
    // Simulação: lista fixa de músicas da turnê
    const allSongs = [
      "Game Over",
      "Mattel",
      "Afterlife",
      "Hail to the King",
      "Nightmare",
      "Nobody",
      "Bat Country",
      "Unholy Confessions",
      "So Far Away",
      "Buried Alive",
      "Shepherd of Fire",
      "G",
      "We Love You",
      "A Little Piece of Heaven",
      "Beast and the Harlot"
    ];
  
    // Embaralhar e pegar as 10 primeiras músicas
    const shuffled = allSongs.sort(() => 0.5 - Math.random());
    const predictedSetlist = shuffled.slice(0, 14);
  
    // Limpar lista anterior
    setlistElement.innerHTML = '';
  
    // Criar os <li> com as músicas
    predictedSetlist.forEach((song, index) => {
      const li = document.createElement('li');
      li.textContent = `${index + 1}. ${song}`;
      setlistElement.appendChild(li);
    });
  });
  