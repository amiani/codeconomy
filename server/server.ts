import fs from 'fs'
import https from 'https'
import http from 'http'

const server = process.env.NODE_ENV === 'production'
	? https.createServer({
		cert: fs.readFileSync('/etc/letsencrypt/live/outer.space.buns.run/fullchain.pem'),
		key: fs.readFileSync('/etc/letsencrypt/live/outer.space.buns.run/privkey.pem'),
	})
	: http.createServer()
server.listen(8001)
export default server