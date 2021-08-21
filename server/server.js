const fs = require('fs');
const https = require('https');
const http = require('http')

let server
if (process.env.NODE_ENV === 'production') {
	server = https.createServer({
		cert: fs.readFileSync('/etc/letsencrypt/live/outer.space.buns.run/fullchain.pem'),
		key: fs.readFileSync('/etc/letsencrypt/live/outer.space.buns.run/privkey.pem'),
	});
} else {
	server = http.createServer();
}
server.listen(8001)
module.exports = { server }