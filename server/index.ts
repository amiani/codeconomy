import { createHrtimeLoop } from "@javelin/hrtime-loop"
import { TICK_RATE } from "./env"
import { world } from "./world"
import admin from 'firebase-admin'

admin.initializeApp()

createHrtimeLoop(clock => world.step(clock), (1 / TICK_RATE) * 1000).start()