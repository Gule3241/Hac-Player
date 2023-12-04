var client_ID = '';
var secret_ID = '';
var access_token = null;
var refresh_token = null;
var currentPlaylist = '';
var radioButtons = [];

const AUTHORIZE = 'https://accounts.spotify.com/authorize';
const TOKEN = 'https://accounts.spotify.com/api/token';
const PLAYLISTS = 'https://api.spotify.com/v1/me/playlists';
const DEVICES = 'https://api.spotify.com/v1/me/player/devices';
const PLAY = 'https://api.spotify.com/v1/me/player/play';
const PAUSE = 'https://api.spotify.com/v1/me/player/pause';
const NEXT = 'https://api.spotify.com/v1/me/player/next';
const PREVIOUS = 'https://api.spotify.com/v1/me/player/previous';
const PLAYER = 'https://api.spotify.com/v1/me/player';
const TRACKS = 'https://api.spotify.com/v1/playlists/{{PlaylistId}}/tracks';
const CURRENTLYPLAYING = 'https://api.spotify.com/v1/me/player/currently-playing';
const SHUFFLE = 'https://api.spotify.com/v1/me/player/shuffle';
const NEW_RELEASES = 'https://api.spotify.com/v1/browse/new-releases';
const NEW_SONGS = 'https://api.spotify.com/v1/albums/{id}/tracks';

const redirect_uri = 'http://127.0.0.1:5500/online.html'; // Update this to your actual redirect URI
const scope =
  'user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private';

function onPageLoad() {
  client_ID = localStorage.getItem('client_ID');
  secret_ID = localStorage.getItem('secret_ID');
  document.getElementById('button-text').innerText = 'Login';
  document.getElementById('intro-content').setAttribute('href', 'login.html');
  document.getElementById('tokenSection').style.display = 'block';

  document.getElementById('connect-link').addEventListener('click', function () {
    window.location.href = authUrl;
  });

  if (window.location.search.length > 0) {
    handleRedirect();
  } else {
    access_token = localStorage.getItem('access_token');
    if (access_token == null) {
      document.getElementById('button-text').innerText = 'Login with Spotify';
      document.getElementById('intro-content').setAttribute('href', 'login.html');
      document.getElementById('tokenSection').style.display = 'block';
    } else {
      document.getElementById('button-text').innerText = 'Logged In As : ' + localStorage.getItem('client_ID');
      document.getElementById('deviceSection').style.display = 'block';
      refreshDevices();
      refreshPlaylists();
      currentlyPlaying();
      refreshNewReleases();
    }
  }
  refreshRadioButtons();
}

function handleRedirect() {
  const params = getHashParams();
  const access_token = params.access_token;
  const state = params.state;

  if (state === null || state !== localStorage.getItem('spotify_auth_state')) {
    alert('State mismatch. Possible CSRF attack.');
  } else {
    localStorage.setItem('access_token', access_token);
    onPageLoad();
  }
}

function getHashParams() {
  const hashParams = {};
  const hash = window.location.hash.substring(1);
  const params = hash.split('&');
  for (let i = 0; i < params.length; i++) {
    const param = params[i].split('=');
    hashParams[param[0]] = decodeURIComponent(param[1]);
  }
  return hashParams;
}


function getCode(){
    let code = null;
    const queryString = window.location.search;
    if ( queryString.length > 0 ){
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code')
    }
    return code; 
}

function refreshAccessToken(){
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_ID;
    callAuthorizationApi(body);
}

function requestAuthorisation(){
    client_ID = document.getElementById('username').value;
    secret_ID = document.getElementById('password').value;
    localStorage.setItem("client_ID", client_ID);
    localStorage.setItem("secret_ID", secret_ID); // In a real app you should not expose your client_secret to the user

    let url = AUTHORIZE;
    url += "?client_id=" + client_ID;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";
    window.location.href = url;
}

function fetchAccessToken( code ){
    let body = "grant_type=authorization_code";
    body += "&code=" + code; 
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_ida=" + client_ID;
    body += "&client_secret=" + secret_ID;
    callAuthorizationApi(body);
}

function callAuthorizationApi(body){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_ID + ":" + secret_ID));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        var data = JSON.parse(this.responseText);
        if ( data.access_token != undefined ){
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        if ( data.refresh_token  != undefined ){
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        onPageLoad();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}


function refreshAccessToken(){
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_ID;
    callAuthorizationApi(body);
}

function callAuthorizationApi(body){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_ID + ":" + secret_ID));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        var data = JSON.parse(this.responseText);
        if ( data.access_token != undefined ){
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        if ( data.refresh_token  != undefined ){
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        onPageLoad();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}
function generatePlaylist() {
    const mood = document.getElementById('mood').value;
    const playlistName = `Mood Playlist - ${mood}`;

    authenticateSpotify()
        .then(() => createPlaylist(playlistName))
        .then(playlistId => addTracksToPlaylist(playlistId, mood))
        .then(() => displaySuccess(playlistName))
        .catch(error => console.error(error));
}

function authenticateSpotify() {
    return new Promise((resolve, reject) => {
        const url = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
        window.location.href = url;
    });
}

function createPlaylist(playlistName) {
    return fetch('https://api.spotify.com/v1/me/playlists', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: playlistName,
            public: true
        })
    })
    .then(response => response.json())
    .then(data => data.id);
}

function addTracksToPlaylist(playlistId, mood) {
    // You can customize this part to fetch tracks based on the mood
    // For simplicity, let's add a sample track
    const trackUri = 'spotify:track:3tjFYV6RSFtuktYl3ZtYcq';

    return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?uris=${encodeURIComponent(trackUri)}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });
}

function displaySuccess(playlistName) {
    const playlistDetails = document.getElementById('playlist-details');
    playlistDetails.innerHTML = `<p>Playlist "${playlistName}" has been generated and added to your Spotify account!</p>`;
}

function refreshNewReleases(){
    callApi("GET", NEW_RELEASES, null, handleNewRealeasesResponse);
}

function handleNewRealeasesResponse(){
    if(this.status == 200){
        var data = JSON.parse(this.responseText);
        console.log(data);
        data.albums.items.forEach(item=>addNewSong(item));
    }else if(this.status == 401){
        refreshAccessToken();
    }else{
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function addNewSong(item){
    let node = document.createElement("option");
    node.value = item.id;
    node.innerHTML = item.name;
    document.getElementById("newSong").appendChild(node);
}


function refreshDevices(){
    callApi( "GET", DEVICES, null, handleDevicesResponse );
}


function handleDevicesResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        removeAllItems( "devices" );
        data.devices.forEach(item => addDevice(item));
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function addDevice(item){
    let node = document.createElement("option");
    node.value = item.id;
    node.innerHTML = item.name;
    document.getElementById("devices").appendChild(node); 
}

function fetchSongs(){
    let album_id = document.getElementById("newSong").value;
    if(album_id.length > 0){
        url = NEW_SONGS.replace("{id}", album_id);
        callApi("GET", url, null, handleNewSongsResponse);
    }
}

function handleNewSongsResponse(){
    if(this.status == 200){
        var data = JSON.parse(this.responseText);
        console.log(this.responseText);
        data.items.forEach((item, index)=>addSongInList(item, index));
    }else if(this.status == 401){
        refreshAccessToken();
    }else{
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function addSongInList(item,index){
    let html3 = `
    <div>
    <h6 style="margin-bottom: 0px;">${item.name}</h6>
    <p style="margin: 0px;padding: 0px;">${item.artists[0].name}</p>
    </div>
    `;
    document.getElementById('newSongs').innerHTML = html3;
}

function callApi(method, url, body, callback){
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.send(body);
    xhr.onload = callback;
}

function refreshPlaylists(){
    callApi( "GET", PLAYLISTS, null, handlePlaylistsResponse );
}

function handlePlaylistsResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        removeAllItems( "playlists" );
        data.items.forEach(item => addPlaylist(item));
        document.getElementById('playlists').value=currentPlaylist;
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function addPlaylist(item){
    let node = document.createElement("option");
    node.value = item.id;
    node.innerHTML = item.name + " (" + item.tracks.total + ")";
    document.getElementById("playlists").appendChild(node); 
}

function removeAllItems( elementId ){
    let node = document.getElementById(elementId);
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function play(){
    let playlist_id = document.getElementById("playlists").value;
    let trackindex = document.getElementById("tracks").value;
    let album = document.getElementById("album").value;
    let body = {};
    if ( album.length > 0 ){
        body.context_uri = album;
    }
    else{
        body.context_uri = "spotify:playlist:" + playlist_id;
    }
    body.offset = {};
    body.offset.position = trackindex.length > 0 ? Number(trackindex) : 0;
    body.offset.position_ms = 0;
    callApi( "PUT", PLAY + "?device_id=" + deviceId(), JSON.stringify(body), handleApiResponse );
}

function shuffle(){
    callApi( "PUT", SHUFFLE + "?state=true&device_id=" + deviceId(), null, handleApiResponse );
    play(); 
}

function pause(){
    callApi( "PUT", PAUSE + "?device_id=" + deviceId(), null, handleApiResponse );
}

function next(){
    callApi( "POST", NEXT + "?device_id=" + deviceId(), null, handleApiResponse );
}

function previous(){
    callApi( "POST", PREVIOUS + "?device_id=" + deviceId(), null, handleApiResponse );
}

function transfer(){
    let body = {};
    body.device_ids = [];
    body.device_ids.push(deviceId())
    callApi( "PUT", PLAYER, JSON.stringify(body), handleApiResponse );
}

function handleApiResponse(){
    if ( this.status == 200){
        console.log(this.responseText);
        setTimeout(currentlyPlaying, 2000);
    }
    else if ( this.status == 204 ){
        setTimeout(currentlyPlaying, 2000);
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }    
}

function deviceId(){
    return document.getElementById("devices").value;
}

function fetchTracks(){
    let playlist_id = document.getElementById("playlists").value;
    if ( playlist_id.length > 0 ){
        url = TRACKS.replace("{{PlaylistId}}", playlist_id);
        callApi( "GET", url, null, handleTracksResponse );
    }
}

function handleTracksResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        removeAllItems( "tracks" );
        data.items.forEach( (item, index) => addTrack(item, index));
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function addTrack(item, index){
    let node = document.createElement("option");
    node.value = index;
    node.innerHTML = item.track.name + " (" + item.track.artists[0].name + ")";
    document.getElementById("tracks").appendChild(node); 
}

function currentlyPlaying(){
    callApi( "GET", PLAYER + "?market=US", null, handleCurrentlyPlayingResponse );
}

function handleCurrentlyPlayingResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        if ( data.item != null ){
            document.getElementById("albumImage").src = data.item.album.images[0].url;
            document.getElementById("trackTitle").innerHTML = data.item.name;
            document.getElementById("trackArtist").innerHTML = data.item.artists[0].name;
        }


        if ( data.device != null ){
            // select device
            currentDevice = data.device.id;
            document.getElementById('devices').value=currentDevice;
        }

        if ( data.context != null ){
            // select playlist
            currentPlaylist = data.context.uri;
            currentPlaylist = currentPlaylist.substring( currentPlaylist.lastIndexOf(":") + 1,  currentPlaylist.length );
            document.getElementById('playlists').value=currentPlaylist;
        }
    }
    else if ( this.status == 204 ){

    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function saveNewRadioButton(){
    let item = {};
    item.deviceId = deviceId();
    item.playlistId = document.getElementById("playlists").value;
    radioButtons.push(item);
    localStorage.setItem("radio_button", JSON.stringify(radioButtons));
    refreshRadioButtons();
}

function refreshRadioButtons(){
    let data = localStorage.getItem("radio_button");
    if ( data != null){
        radioButtons = JSON.parse(data);
        if ( Array.isArray(radioButtons) ){
            removeAllItems("radioButtons");
            radioButtons.forEach( (item, index) => addRadioButton(item, index));
        }
    }
}

function onRadioButton( deviceId, playlistId ){
    let body = {};
    body.context_uri = "spotify:playlist:" + playlistId;
    body.offset = {};
    body.offset.position = 0;
    body.offset.position_ms = 0;
    callApi( "PUT", PLAY + "?device_id=" + deviceId, JSON.stringify(body), handleApiResponse );
    //callApi( "PUT", SHUFFLE + "?state=true&device_id=" + deviceId, null, handleApiResponse );
}

function addRadioButton(item, index){
    let node = document.createElement("button");
    node.className = "btn btn-primary m-2";
    node.innerText = index;
    node.onclick = function() { onRadioButton( item.deviceId, item.playlistId ) };
    document.getElementById("radioButtons").appendChild(node);
}
