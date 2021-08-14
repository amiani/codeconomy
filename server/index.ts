import { createHrtimeLoop } from "@javelin/hrtime-loop"
import { PORT, TICK_RATE, INTERFACE } from "./env"
import { fastify } from "./net"
import { world } from "./world"
import * as admin from 'firebase-admin'
//@ts-ignore
import geckos from './geckosServer'

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
})
createHrtimeLoop(world.step, (1 / TICK_RATE) * 1000).start()
/*
fastify.listen(PORT, INTERFACE, function (err, address) {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
    console.log(`server listening on ${address}`)
})
*/