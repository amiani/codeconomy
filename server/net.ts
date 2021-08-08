import { Server } from "@web-udp/server"
import { createServer } from "http"
import * as admin from 'firebase-admin'
import scriptTopic from './scriptTopic'
import Fastify from 'fastify'

const authenticate = async (key: any, req: any) => {
	console.log(key)
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
	})
})

export const udp = new Server({ server: fastify.server })
