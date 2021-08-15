import { createHrtimeLoop } from "@javelin/hrtime-loop"
import { PORT, TICK_RATE, INTERFACE } from "./env"
import { world } from "./world"
import * as admin from 'firebase-admin'
//@ts-ignore
import geckos from './geckosServer'
const AgonesSDK = require('@google-cloud/agones-sdk')

const agonesSDK = new AgonesSDK()

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});

(async () => {
  if (process.env.NODE_ENV === 'production') {
    await agonesSDK.connect()
    const result = await agonesSDK.ready()
    const healthInterval = setInterval(() => {
      agonesSDK.health();
      console.log('Health ping sent');
    }, 20000);
  }
  createHrtimeLoop(world.step, (1 / TICK_RATE) * 1000).start()
})()


/*
fastify.listen(PORT, INTERFACE, function (err, address) {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
    console.log(`server listening on ${address}`)
})
*/