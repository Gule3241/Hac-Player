const data = null;

const xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener('readystatechange', function () {
	if (this.readyState === this.DONE) {
		console.log(this.responseText);
	}
});

xhr.open('GET', 'https://deezerdevs-deezer.p.rapidapi.com/search?q={sad}');
xhr.setRequestHeader('X-RapidAPI-Key', '53d33aeb5fmshdcc71296568aec1p1bf2f7jsnfbd9fe07b500');
xhr.setRequestHeader('X-RapidAPI-Host', 'deezerdevs-deezer.p.rapidapi.com');

xhr.send(data);