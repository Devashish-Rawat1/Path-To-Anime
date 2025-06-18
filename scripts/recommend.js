document.getElementById('goback').addEventListener('click', () => {
    window.location.href = 'popup.html';
});

document.addEventListener('DOMContentLoaded', function () {
    // Check if we're on the recommendation page
    const recommendBtn = document.getElementById('recommendBtn');

    // Only add event listeners if elements exist
    if (recommendBtn) {
        recommendBtn.addEventListener('click', function () {
            const genre = document.getElementById('genreSelect').value;
            const minRating = parseFloat(document.getElementById('minRating').value) || 0;
            const maxEpisodes = parseInt(document.getElementById('maxEpisodes').value) || Infinity;
            const animeType = document.getElementById('animeType').value;
            const sortBy = document.getElementById('sortBy').value;

            const filteredAnimes = filterAnimes(genre, minRating, maxEpisodes, animeType);

            // Store results in localStorage and redirect
            localStorage.setItem('filteredAnimes', JSON.stringify(filteredAnimes));
            localStorage.setItem('sortBy', sortBy);
            window.location.href = 'recommended_animes.html';
        });
    }


    // Check if we're on the results page
    const resultsContainer = document.getElementById('results');
    if (resultsContainer && !recommendBtn) {
        // Display results when page loads
        const filteredAnimes = JSON.parse(localStorage.getItem('filteredAnimes'));
        const sortBy = localStorage.getItem('sortBy');

        if (filteredAnimes && filteredAnimes.length > 0) {
            displayResults(filteredAnimes, sortBy);
        } else {
            resultsContainer.innerHTML = '<p>No animes match your criteria.</p>';
        }
    }
});


function filterAnimes(genre, minRating, maxEpisodes, animeType) {
    // First filter by genre if specified
    let filtered = genre ?
        animeData.filter(anime => anime.genres.includes(genre)) :
        [...animeData];

    // Then filter by other criteria
    filtered = filtered.filter(anime => {
        const matchesRating = anime.rating >= minRating;
        const matchesEpisodes = anime.episodes <= maxEpisodes;
        const matchesType = !animeType || anime.anime_type === animeType;

        return matchesRating && matchesEpisodes && matchesType;
    });

    // If we have genre specified but no matches, fall back to non-genre matches
    if (genre && filtered.length === 0) {
        filtered = animeData.filter(anime => {
            const matchesRating = anime.rating >= minRating;
            const matchesEpisodes = anime.episodes <= maxEpisodes;
            const matchesType = !animeType || anime.anime_type === animeType;

            return matchesRating && matchesEpisodes && matchesType;
        });
    }

    return filtered;
}

function displayResults(animes, sortBy) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    if (animes.length === 0) {
        resultsContainer.innerHTML = '<p>No animes match your criteria.</p>';
        return;
    }

    // Sort the animes based on the selected option
    let sortedAnimes = [...animes];
    switch (sortBy) {
        case 'rating':
            sortedAnimes.sort((a, b) => b.rating - a.rating);
            break;
        case 'popularity':
            sortedAnimes.sort((a, b) => b.popularity - a.popularity);
            break;
        case 'year':
            sortedAnimes.sort((a, b) => b.year - a.year);
            break;
        case 'episodes':
            sortedAnimes.sort((a, b) => a.episodes - b.episodes);
            break;
    }

    sortedAnimes.forEach(anime => {
        const animeCard = document.createElement('div');
        animeCard.className = 'anime-card';
        
        // Create a safe string for the data attribute
        const animeDataStr = JSON.stringify(anime)
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');

        animeCard.innerHTML = `
            <img src="${anime.poster}" alt="${anime.title}" class="anime-poster" height="350px">
            <div class="anime-content">
                <div class="anime-header">
                    <h3 class="anime-title">${anime.title}</h3>
                </div>
                <div class="anime-meta">
                    <span class="anime-meta-item">&starf; ${anime.rating}</span>
                    <span class="anime-meta-item"> ${anime.episodes} eps</span>
                    <span class="anime-meta-item"> ${anime.year}</span>
                </div>
                <div class="anime-genres">
                  ${anime.genres.slice(0, 5).map(genre =>
                 `<span class="genre-tag">${escapeHTML(genre)}</span>`
                  ).join('')}
                  ${anime.genres.length > 5 ? '<span class="genre-tag">+ more</span>' : ''}
                </div>
                <p class="anime-synopsis">${anime.synopsis}</p>
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
        `;

        resultsContainer.appendChild(animeCard);
    });

    resultsContainer.addEventListener('click', (e) => {
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
  // Share function
  function shareAnime(title, poster, url) {
    if (navigator.share) {
      // Use Web Share API if available
      navigator.share({
        title: `Check out this anime: ${title}`,
        text: `I found this anime and thought you might like it!`,
        url: url
      }).catch(err => {
        //console.error('Error sharing:', err);
        //fallbackShare(title, url);
      });
    } else {
      // Fallback for browsers without Web Share API
      fallbackShare(title, url);
    }
  }

//   // Fallback share method
//   function fallbackShare(title, url) {
//     const shareText = `Check out this anime: ${title}\nWatch it here: ${url}`;

//     // Copy to clipboard
//     navigator.clipboard.writeText(shareText).then(() => {
//       alert('Link copied to clipboard!');
//     }).catch(err => {
//       console.error('Failed to copy:', err);
//       prompt('Copy this link to share:', url);
//     });
//   }
}

  
//${Object.entries(anime.available_on).length > 2 ? '...' : ''}