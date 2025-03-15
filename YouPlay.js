let player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '360',
        width: '640',
        videoId: '',
        playerVars: { 'autoplay': 1, 'controls': 1 },
    });
}

// Google Login
function renderGoogleSignInButton() {
    gapi.signin2.render('google-signin-button', {
        scope: 'profile email',
        width: 200,
        height: 50,
        longtitle: true,
        theme: 'dark',
        onsuccess: onSignIn,
        onfailure: (error) => console.log('Login Failed', error)
    });
}

function onSignIn(googleUser) {
    const profile = googleUser.getBasicProfile();
    document.getElementById('user').innerText = `Welcome, ${profile.getName()}`;
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
}

function signOut() {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(() => {
        document.getElementById('user').innerText = '';
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('app-container').style.display = 'none';
    });
}

async function searchSong() {
    const query = document.getElementById('search').value;
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${query}&key=AIzaSyAblCId8aZ7QzPcQqVuKHkQm9BIrCx2Fi4`);
    const data = await response.json();
    displayResults(data.items);
}

function displayResults(videos) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    videos.forEach(video => {
        const div = document.createElement('div');
        div.innerHTML = `<p>${video.snippet.title}</p><button onclick="playSong('${video.id.videoId}')">Play</button><button onclick="addToPlaylist('${video.id.videoId}', '${video.snippet.title}')">Add to Playlist</button><button onclick="downloadSong('${video.id.videoId}', '${video.snippet.title}')">Download</button>`;
        resultsDiv.appendChild(div);
    });
}

function playSong(videoId) {
    player.loadVideoById(videoId);
    addToHistory(videoId);
}

function addToHistory(videoId) {
    const historyList = document.getElementById('history');
    const li = document.createElement('li');
    li.innerHTML = `<a href="https://www.youtube.com/watch?v=${videoId}" target="_blank">Watch Again</a>`;
    historyList.appendChild(li);
}

function addToPlaylist(videoId, title) {
    const playlist = document.getElementById('playlist');
    const li = document.createElement('li');
    li.innerHTML = `<p>${title}</p><button onclick="playSong('${videoId}')">Play</button><button class='remove-button' onclick="removeFromPlaylist(this)">Remove</button>`;
    playlist.appendChild(li);
}

function removeFromPlaylist(button) {
    button.parentElement.remove();
}

function downloadSong(videoId, title) {
    const downloads = document.getElementById('downloads');
    const li = document.createElement('li');
    li.innerHTML = `<p>${title}</p><button class='delete-button' onclick="removeFromDownloads(this)">Delete</button>`;
    downloads.appendChild(li);
    saveToLocalStorage(title);
}

function removeFromDownloads(button) {
    button.parentElement.remove();
    removeFromLocalStorage(button.parentElement.innerText);
}

function saveToLocalStorage(song) {
    let savedSongs = JSON.parse(localStorage.getItem('downloadedSongs')) || [];
    savedSongs.push(song);
    localStorage.setItem('downloadedSongs', JSON.stringify(savedSongs));
    updateDownloadedSongsSection();
}

function removeFromLocalStorage(song) {
    let savedSongs = JSON.parse(localStorage.getItem('downloadedSongs')) || [];
    savedSongs = savedSongs.filter(s => s !== song);
    localStorage.setItem('downloadedSongs', JSON.stringify(savedSongs));
    updateDownloadedSongsSection();
}

function updateDownloadedSongsSection() {
    const downloads = document.getElementById('downloads');
    downloads.innerHTML = '';
    let savedSongs = JSON.parse(localStorage.getItem('downloadedSongs')) || [];
    savedSongs.forEach(song => {
        const li = document.createElement('li');
        li.innerHTML = `<p>${song}</p><button class='delete-button' onclick="removeFromDownloads(this)">Delete</button>`;
        downloads.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', updateDownloadedSongsSection);
