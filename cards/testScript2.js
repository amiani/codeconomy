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

const aimAt = (position, rotation, targetPosition) => {
	const angle = Math.atan2(cross(position, targetPosition), dot(position, targetPosition))
    //log(`self: ${vecToString(position)}, target: ${vecToString(targetPosition)}, angle: ${angle}`)
    log(`rotation: ${rotation}, angle: ${angle}`)
	return (angle - rotation) * 10
}

let target
const run = (state) => {
	const { position, rotation, enemies } = state
	const action = createAction()
	if (target) {
		action.rotate = aimAt(position, rotation, target.position)
		action.fire = true
	} else {
		target = getClosest(position, enemies)
	}

	return action
}