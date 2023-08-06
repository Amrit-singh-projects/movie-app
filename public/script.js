const apiUrl = 'https://www.omdbapi.com/';
const apiKey = '214dbaf0'; 



// For seraching Movies
function searchMovies() {

    const searchInput = document.getElementById('searchInput').value;
    if (searchInput.trim() === '') return;

    const url = `${apiUrl}?s=${searchInput}&apikey=${apiKey}`;
    fetch(url)
        .then((response) => response.json())
        .then((data) => displayResults(data.Search));

}

// For Displaying Movies
function displayResults(movies) {

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (!movies) {
        resultsDiv.innerHTML = '<p>No movies found.</p>';
        return;
    }

    const ul = document.createElement('ul');
    movies.forEach((movie) => {

        const li = document.createElement('li');
        const img = document.createElement('img');
        img.src = movie.Poster === 'N/A' ? 'placeholder.png' : movie.Poster;
        img.alt = movie.Title;
        img.width = 100;

        const movieInfoDiv = document.createElement('div');
        movieInfoDiv.classList.add('movie-info');

        const titleSpan = document.createElement('span');
        titleSpan.innerText = `${movie.Title} (${movie.Year})`;

        movieInfoDiv.appendChild(img);
        movieInfoDiv.appendChild(titleSpan);
        li.appendChild(movieInfoDiv);
        ul.appendChild(li);

        // Add a click event listener to each movie element
        li.addEventListener('click', () => {
            showMovieDetails(movie.imdbID);
        });
    });

    resultsDiv.appendChild(ul);
}

// Showing Movie Details when user clicks on the movie.
function showMovieDetails(imdbID) {

    const url = `${apiUrl}?i=${imdbID}&apikey=${apiKey}`;
    fetch(url)
        .then((response) => response.json())
        .then((movie) => {

          // console.log(movie)

            // Create a modal to show the movie details
            const modal = document.createElement('div');
            modal.classList.add('modal');

            const modalContent = document.createElement('div');
            modalContent.classList.add('modal-content');

            // Create elements to display movie details
            const poster = document.createElement('img');
            poster.src = movie.Poster === 'N/A' ? 'placeholder.png' : movie.Poster;
            poster.alt = movie.Title;
            poster.width = 200;

            const title = document.createElement('h2');
            title.innerText = `${movie.Title} (${movie.Year})`;

            const plot = document.createElement('p');
            plot.innerText = movie.Plot;

            modalContent.appendChild(poster);
            modalContent.appendChild(title);
            modalContent.appendChild(plot);
            modal.appendChild(modalContent);

            // Add the modal to the document body
            document.body.appendChild(modal);

            // Add a click event listener to close the modal when clicked outside
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.remove();
                }
            });

            // Create the close button
            const closeButton = document.createElement('span');
            closeButton.classList.add('close-button');
            closeButton.innerHTML = '&times;';
            modalContent.appendChild(closeButton);

            // Add click event listeners to the close button 
            closeButton.addEventListener('click', () => {
                modal.remove();
            });
        })
        .catch((error) => console.error('Error fetching movie details:', error));
}


//CREATE PLaylist

const playlistForm = document.getElementById('playlistForm');
const playlistName = document.getElementById('playlistName');
const movieInput = document.getElementById('movieInput');
const addMovieBtn = document.getElementById('addMovieBtn');
const isPublic = document.getElementById('isPublic');
const playlistList = document.getElementById('playlistList');
const playlists = [];

playlistForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = playlistName.value.trim();
  if (name === '') {
    alert('Please enter a playlist name.');
    return;
  }

  const playlist = {
    name,
    public: isPublic.checked,
    movies: [] 
  };
  playlists.push(playlist);
  displayPlaylists();
  playlistName.value = '';
  isPublic.checked = false;
});

addMovieBtn.addEventListener('click', async () => {
  const movieName = movieInput.value.trim();
  if (movieName === '') {
    alert('Please enter a movie name.');
    return;
  }

  try {
    const response = await fetch(`${apiUrl}?t=${encodeURIComponent(movieName)}&apikey=${apiKey}`);
    const movieData = await response.json();
    if (movieData.Response === 'True') {
      const movie = {
        imdbID: movieData.imdbID,
        Title: movieData.Title,
        Year: movieData.Year,
        Poster:movieData.Poster
      };

      // Check if a playlist already exists
      if (playlists.length === 0) {
        const playlistName = prompt('Enter a playlist name:');
        if (!playlistName) {
          alert('Please enter a valid playlist name.');
          return;
        }
        const playlist = {
          name: playlistName,
          public: false,
          movies: [movie]
        };
        playlists.push(playlist);
      } else {
        // Add the movie to the last playlist
        playlists[playlists.length - 1].movies.push(movie);
      }

      displayPlaylists();
      movieInput.value = '';
    } else {
      alert('Invalid movie name. Please enter a valid movie.');
    }
  } catch (error) {
    console.error('Error validating movie:', error);
    alert('Failed to validate movie. Please try again later.');
  }
});

// For Showing Playlist
  function displayPlaylists() {
    playlistList.innerHTML = '';
    playlists.forEach((playlist, index) => {
      const playlistHTML = `
        <li class="playlist-item">
          <h3 class="playlist-name">${playlist.name}</h3>
          <p>type: ${playlist.public ? 'public' : 'private'}</p>
          <ul class="movies-list">
            ${playlist.movies.map((movie, movieIndex) => `
            <li class="movie-item" onclick="showMovieDetails('${movie.imdbID}')">
              <img class="movie-poster" src="${movie.Poster !== 'N/A' ? movie.Poster : 'placeholder.png'}" alt="${movie.Title}">
                <span>${movie.Title} (${movie.Year})</span>
                <button onclick="removeMovieFromPlaylist(${index}, ${movieIndex})">Remove</button>
              </li>
            `
            ).join('')}
          </ul>
          ${playlist.public ? `<button id="share" onclick="sharePlaylist(${index})">Share</button>` : ''}
        </li>
      `;
      playlistList.innerHTML += playlistHTML;
    });
  }
  

// For removing movie from playlist
function removeMovieFromPlaylist(playlistIndex, movieIndex) {
  playlists[playlistIndex].movies.splice(movieIndex, 1);
  displayPlaylists();
  event.stopPropagation();
}


// When Playlist is public, user can share the playlist.
function sharePlaylist(playlistIndex) {
const playlist = playlists[playlistIndex];
if (playlist.public) {

  const shareLink = window.location.href.split('?')[0] + `?playlist=${playlistIndex}`;
    
    // Create a temporary input element to copy the link to the clipboard
    const tempInput = document.createElement('input');
    document.body.appendChild(tempInput);
    tempInput.value = shareLink;
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
  alert(`Share this link with others: ${shareLink}`);
} else {
  alert('This playlist is private and cannot be shared.');
}
}




