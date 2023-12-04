let accessToken = null;

function authorizeSpotify() {
    window.location = "https://accounts.spotify.com/authorize?client_id=896903d63c8649ff99676c7c3bb9d470&redirect_uri=http://127.0.0.1:5500/online.html&scope=user-read-private%20user-read-email%20playlist-modify-public&response_type=token";
}

function extractAccessToken() {
    accessToken = new URLSearchParams(window.location.hash.substr(1)).get("access_token");
    if (accessToken) {
        document.getElementById("login").style.display = "none";
        document.getElementById("moodSelector").style.display = "block";
    }
}

function createPlaylist() {
    const mood = document.getElementById("mood").value;

    fetch('https://api.spotify.com/v1/me/playlists', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: `Mood Playlist - ${mood}`,
            description: `Playlist created based on user mood: ${mood}`,
            public: true,
        }),
    })
    .then(response => response.json())
    .then(data => {
        alert(`Playlist "${data.name}" created successfully!`);
    })
    .catch(error => console.error('Error creating playlist:', error));
}

// Call extractAccessToken when the page loads to check for the access token in the URL
window.onload = extractAccessToken;
