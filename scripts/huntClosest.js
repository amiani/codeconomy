const createVec = (x, y) => ({ x, y })
const createAction = () => ({
	throttle: 50,
	rotate: 0,
	fire: false
})

const getDistance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))

const getClosest = (position, enemies) => {
	let closest = enemies[0]
	let minDistance = Number.MAX_VALUE
	for (const enemy of enemies) {
		const distance = getDistance(position, enemy.position)
		if (distance < minDistance) {
			closest = enemy
			minDistance = distance
		}
	}
	return closest
}

const vecToString = (vec) => `[${vec.x}, ${vec.y}]`

const cross = (a, b) => a.x * b.y - a.y * b.x
const dot = (a, b) => a.x * b.x + a.y * b.y

const angleBetween = (a, b) => Math.atan2(cross(a, b), dot(a, b))

const turnTo = (position, rotation, angularVelocity, targetPosition) => {
	const unit = { x: Math.cos(rotation), y: Math.sin(rotation) }
	const targetLocal = { x: targetPosition.x - position.x, y: targetPosition.y - position.y }
	const error = angleBetween(unit, targetLocal)
	const kp = 28
	const kv = -8
	return kp * error + kv * angularVelocity
}


let target
const run = (state) => {
	const { position, rotation, angularVelocity, enemies } = state
	const action = createAction()
	if (target) {
		target = getClosest(target.position, enemies)
	} else {
		target = getClosest(position, enemies)
	}
	if (target) {
		action.rotate = turnTo(position, rotation, angularVelocity, target.position)
	}
	action.fire = true

	return action
}

module.exports = {
	createVec,
	angleBetween,
	turnTo
}