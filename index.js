// Grab the modules we'll be using
var http = require('http');
var fs = require('fs');
var io = require('socket.io');

// Sends the client html file
// The file is cached after the first time it's been read
function sendClientHtml(response) {
	if (sendClientHtml.cachedHtml) {
		response.writeHead(200, {'Content-Type': 'text/html', 'Transfer-Encoding': 'chunked'});
		response.write(sendClientHtml.cachedHtml);
		response.end();
	} else {
		fs.readFile('client.html', function(err, data) {
			sendClientHtml.cachedHtml = data;
			sendClientHtml(response);
		});
	}
}

// Create the server
var app = http.createServer(function(request, response) {
	if (request.url == '/') {
		sendClientHtml(response);
	}
});

// Listen for Socket.IO events
var ioApp = io.listen(app);
ioApp
	.of('/listen')
	.on('connection', function(socket) {
		console.log('connection made');
		socket.on('set name', function(userName) {
			socket.set('userName', userName, function() {
				console.log('username: ' + userName);
				socket.emit('begin chat');
			});
		});
	});


ioApp
	.of('/addText')
	.on('connection', function(socket) {
		socket.on('add text', function(data) {
			console.log(data.user + ": " + data.text);
			socket.broadcast.emit('msg received', data.user, data.text);
			socket.emit('msg received', data.user, data.text);
		})
	});

app.listen(3000, "http://chatting-app.herokuapp.com/");



