import { Server } from "@web-udp/server"
import { createServer } from "http"

export const server = createServer((req, res) => {
	console.log('got request', req.method)
	if (req.method === 'POST') {
		if (req.headers['content-type'] === 'text/plain') {
			let body = ''
			req.on('data', (data) => {
				body += data
			})
			req.on('end', () => {
				console.log(body)
				res.writeHead(200, { 'content-type': 'text/plain' })
				res.end('script received')
			})
		}
	}
})
export const udp = new Server({ server })
