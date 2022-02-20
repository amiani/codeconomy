import admin from 'firebase-admin'
import server from './server'
import geckos, { iceServers } from "@geckos.io/server"

async function authenticate(token: string | undefined) {
  if (!token) {
    return false
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token)
    return { uid: decodedToken.uid }
  } catch (error) {
    console.error(error)
    return false
  }
}

const io = geckos({
  authorization: authenticate,
  cors: { allowAuthorization: true, origin: '*' },
  portRange: {
    min: 7000,
    max: 8000
  },
  iceServers
})
io.addServer(server)
	//io.listen(8080)
export default io