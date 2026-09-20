export async function fetchSpotifyPlaylist() {
  const url = './playlist.json';

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro do servidor: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data.items;
  } catch (err) {
    throw new Error(`Falha ao buscar playlist: ${err.message}`);
  }
}

export async function renderSpotifyPlaylist(container) {
  if (!container) return;
  container.innerHTML = '';
  container.classList.add('loading');

  try {
    const allItems = await fetchSpotifyPlaylist();

    allItems.forEach(item => {
      const track = item.track;
      if (!track || !track.artists.length) return;
      
      const artist = track.artists[0].name;
      const songTitle = track.name;
      const coverUrl = track.album.images[0]?.url || '';
      const spotifyUrl = track.external_urls.spotify;

      const div = document.createElement('div');
      div.className = 'track';
      div.dataset.artist = artist;
      div.dataset.track = songTitle;

      div.innerHTML = `
        <div class="track-cover">
          ${coverUrl ? `<img src="${coverUrl}" alt="Capa de ${songTitle} -${artist}" loading="lazy">` : ''}
        </div>
        <div class="track-info">
          <h2 class="track-title">${songTitle}</h2>
          <p class="track-meta">${artist}</p>
        </div>
        <div class="track-actions">
          <a class="play-button" href="${spotifyUrl}" target="_blank" rel="noopener noreferrer" aria-label="Abrir no Spotify">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <polygon points="5,3 19,12 5,21"></polygon>
            </svg>
          </a>
        </div>
      `;
      container.appendChild(div);
    });

  } catch (err) {
    console.error('Erro ao renderizar playlist:', err);
    if (container) {
      container.innerHTML = `<p class="error-message">Não foi possível carregar a playlist: ${err.message}</p>`;
    }
  } finally {
    container.classList.remove('loading');
  }
}
      div.className = 'track';
      div.dataset.artist = artist;
      div.dataset.track = songTitle;

      div.innerHTML = `
        <div class="track-cover">
          ${coverUrl ? `<img src="${coverUrl}" alt="Capa de ${songTitle} -${artist}" loading="lazy">` : ''}
        </div>
        <div class="track-info">
          <h2 class="track-title">${songTitle}</h2>
          <p class="track-meta">${artist}</p>
        </div>
        <div class="track-actions">
          <a class="play-button" href="${spotifyUrl}" target="_blank" rel="noopener noreferrer" aria-label="Abrir no Spotify">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <polygon points="5,3 19,12 5,21"></polygon>
            </svg>
          </a>
        </div>
      `;
      container.appendChild(div);
    });

  } catch (err) {
    console.error('Erro ao renderizar playlist:', err);
    if(container) container.innerHTML = `<p class="error-message">Não foi possível carregar a playlist: ${err.message}</p>`;
  } finally {
    container.classList.remove('loading');
  }
}
    const allItems = await fetchSpotifyPlaylist();

    allItems.forEach(item => {
      const track = item.track;
      if (!track || !track.artists.length) return;
      
      const artist = track.artists[0].name;
      const songTitle = track.name;
      const coverUrl = track.album.images[0]?.url || '';
      const spotifyUrl = track.external_urls.spotify;

      const div = document.createElement('div');
      div.className = 'track';
      div.dataset.artist = artist;
      div.dataset.track = songTitle;

      div.innerHTML = `
        <div class="track-cover">
          ${coverUrl ? `<img src="${coverUrl}" alt="Capa de ${songTitle} - ${artist}" loading="lazy">` : ''}
        </div>
        <div class="track-info">
          <h2 class="track-title">${songTitle}</h2>
          <p class="track-meta">${artist}</p>
        </div>
        <div class="track-actions">
          <a class="play-button" href="${spotifyUrl}" target="_blank" rel="noopener noreferrer" aria-label="Abrir no Spotify">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <polygon points="5,3 19,12 5,21"></polygon>
            </svg>
          </a>
        </div>
      `;
      container.appendChild(div);
    });

  } catch (err) {
    console.error('Erro ao renderizar playlist:', err);
    if(container) container.innerHTML = `<p class="error-message">Não foi possível carregar a playlist: ${err.message}</p>`;
  } finally {
    container.classList.remove('loading'); // Remove a classe de carregamento
  }
}
