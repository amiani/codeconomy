import { Server } from "@web-udp/server"
import * as admin from 'firebase-admin'
import scriptTopic from './topics/scriptTopic'
import Fastify from 'fastify'

const authenticate = async (key: any, req: any) => {
	try {
		const decodedToken = await admin.auth().verifyIdToken(key)
		return true
	} catch (error) {
		console.error(error)
		return false
	}
}

export const fastify = Fastify()
fastify
	.register(require('fastify-cors'), {
		allowedHeaders: ['authorization', 'content-type'],
	})
	.register(require('fastify-bearer-auth'), {
		keys: new Set(),
		auth: authenticate
	})

fastify.after(() => {
	fastify.post('/upload', async (req, reply) => {
		const key = req.headers.authorization
		if (key) {
			const token = key.substr(7)
			const decodedToken = await admin.auth().verifyIdToken(token)
			scriptTopic.push({
				uid: decodedToken.uid,
				code: req.body as string
			})
			reply.code(200).send()
		}
	})
})

export const udp = new Server({ server: fastify.server })
