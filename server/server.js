const fs = require('fs');
const https = require('https');

const server = https.createServer({
	cert: fs.readFileSync('/etc/letsencrypt/live/outer.space.buns.run/fullchain.pem'),
	key: fs.readFileSync('/etc/letsencrypt/live/outer.space.buns.run/privkey.pem'),
});
server.listen(8001)
module.exports = { server }