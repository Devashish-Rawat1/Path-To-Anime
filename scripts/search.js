document.getElementById('goback').addEventListener('click', () => {
  window.location.href = 'popup.html';
});

document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('input');
  const searchBtn = document.getElementById('searchBtn');
  const resultsDiv = document.getElementById('results');

  // Search functionality
  searchBtn.addEventListener('click', function () {
    const query = searchInput.value.toLowerCase();
    if (!query) return;

    const results = animeData.filter(anime =>
      anime.title.toLowerCase().includes(query) ||
      anime.synopsis.toLowerCase().includes(query)
    );

    displayResults(results);
  });

  searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });

  // Display results
  function displayResults(animes) {
    resultsDiv.innerHTML = '';

    if (animes.length === 0) {
      resultsDiv.innerHTML = '<p>No results found.</p>';
      return;
    }

    animes.forEach(anime => {
      const card = document.createElement('div');
      card.className = 'anime-card';

      // Create a safe string for the data attribute
      const animeDataStr = JSON.stringify(anime)
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      card.innerHTML = `
        <div class="anime-content">
          <div class="anime-header">
            <h3 class="anime-title">${escapeHTML(anime.title)} (${anime.year})</h3>
          </div>
          
          <div class="anime-meta">
            <span class="anime-meta-item">&starf; ${anime.rating}/10</span>
            <span class="anime-meta-item">${escapeHTML(anime.anime_type)}</span>
            <span class="anime-meta-item">${anime.episodes} eps</span>
          </div>
          
          <div class="anime-genres">
            ${anime.genres.slice(0, 5).map(genre =>
            `<span class="genre-tag">${escapeHTML(genre)}</span>`
             ).join('')}
            ${anime.genres.length > 5 ? '<span class="genre-tag">+ more</span>' : ''}
          </div>
          
          <p class="anime-synopsis">${escapeHTML(anime.synopsis)}</p>
          <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 5px; margin-top: 10px;">
            <strong>Watch here: </strong>
            ${Object.entries(anime.available_on).slice(0, 2).map(([platform, url]) => `
               <a href="${escapeHTML(url)}" target="_blank">${escapeHTML(platform)}</a>
            `).join(', ')}
          </div>
          <div style="display: flex; align-items: center; flex-wrap: wrap;"> 
            <button class="share-btn" data-title="${escapeHTML(anime.title)}" data-poster="${escapeHTML(anime.poster)}" data-url="${escapeHTML(Object.values(anime.available_on)[0] || '#')}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5z"/>
              </svg>
              Share
            </button>
            
            <button class="details-btn" data-anime="${animeDataStr}">
              More Details
            </button>
          </div>
        </div>
        
        <img class="anime-poster" src="${escapeHTML(anime.poster)}" alt="${escapeHTML(anime.title)} poster">
      `;

      resultsDiv.appendChild(card);
    });
  }

  // Helper function to escape HTML special characters
  function escapeHTML(str) {
    if (!str) return '';
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Handle share button clicks
  resultsDiv.addEventListener('click', (e) => {
    if (e.target.closest('.share-btn')) {
      const btn = e.target.closest('.share-btn');
      const title = btn.getAttribute('data-title');
      const poster = btn.getAttribute('data-poster');
      const url = btn.getAttribute('data-url');

      shareAnime(title, poster, url);
    }

    if (e.target.closest('.details-btn')) {
      const btn = e.target.closest('.details-btn');
      const animeDataStr = btn.getAttribute('data-anime');
      
      try {
        const animeData = JSON.parse(animeDataStr);
        localStorage.setItem('currentAnime', JSON.stringify(animeData));
        window.location.href = 'aboutAnime.html';
      } catch (error) {
        console.error('Error parsing anime data:', error);
        alert('Error loading anime details. Please try again.');
      }
    }
  });

  // Share function
  function shareAnime(title, poster, url) {
    if (navigator.share) {
      navigator.share({
        title: `Check out this anime: ${title}`,
        text: `I found this anime and thought you might like it!`,
        url: url
      }).catch(err => {
        console.error('Error sharing:', err);
        fallbackShare(title, url);
      });
    } else {
      fallbackShare(title, url);
    }
  }

  // Fallback share method
  function fallbackShare(title, url) {
    const shareText = `Check out this anime: ${title}\nWatch it here: ${url}`;

    navigator.clipboard.writeText(shareText).then(() => {
      alert('Link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
      prompt('Copy this link to share:', url);
    });
  }
});

