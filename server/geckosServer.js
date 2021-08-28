const admin = require("firebase-admin")
const { server } = require('./server')

async function authenticate(token, req, res) {
  if (token) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token)
      const uid = decodedToken.uid
      return { uid }
    } catch (error) {
      console.log(error)
      return false
    }
  }
  return false
}

const getServer = import("@geckos.io/server").then(({ geckos, iceServers }) => {
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
	return io
})

module.exports = { getServer }