import { createHrtimeLoop } from "@javelin/hrtime-loop"
import { PORT, TICK_RATE } from "./env"
import { server } from "./net"
import { world } from "./world"
import * as admin from 'firebase-admin'

createHrtimeLoop(world.step, (1 / TICK_RATE) * 1000).start()
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
})
server.listen(PORT)
