function createVec(x, y) { return { x, y } }
function vecToString(vec) { return `[${vec.x}, ${vec.y}]` }

const createCommand = () => ({
	throttle: 100,
	yaw: 0,
	fire: false
});

const getDistance = (a, b) =>
	Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))

function getClosest(position, enemies) {
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

const cross = (a, b) => a.x * b.y - a.y * b.x
const dot = (a, b) => a.x * b.x + a.y * b.y

const angleBetween = (a, b) => Math.atan2(cross(a, b), dot(a, b))

const kp = 50
const kv = -10
function aimAt({ position, rotation, angularVelocity }, targetPosition) {
	const unit = { x: Math.cos(rotation), y: Math.sin(rotation) }
	const targetLocal = { x: targetPosition.x - position.x, y: targetPosition.y - position.y }
	const error = angleBetween(unit, targetLocal)
	return kp * error + kv * angularVelocity
}

let target
const run = ({ state, allies, enemies }) => {
	const command = createCommand()
	if (target) {
		target = getClosest(target.position, enemies)
	} else {
		target = getClosest(state.position, enemies)
	}
	if (target) {
		command.yaw = aimAt(state, target.position)
	}
	command.fire = true

	return command
}
export default run