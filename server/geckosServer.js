const admin = require("firebase-admin")

const authenticate = async (token, req, res) => {
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
	io.listen(8000)
	return io
})

module.exports = { getServer }