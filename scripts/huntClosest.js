function createVec(x, y) { return { x, y } }
function createCommand() {
	return {
		throttle: 100,
		yaw: 0,
		fire: false
	}
}

function getDistance(a, b) {
	return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}

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

function vecToString(vec) { return `[${vec.x}, ${vec.y}]` }

function cross(a, b) { return a.x * b.y - a.y * b.x }
function dot(a, b) { return a.x * b.x + a.y * b.y }

function angleBetween(a, b) { return Math.atan2(cross(a, b), dot(a, b)) }

const kp = 50
const kv = -10
function aimAt({ position, rotation, angularVelocity }, targetPosition) {
	const unit = { x: Math.cos(rotation), y: Math.sin(rotation) }
	const targetLocal = { x: targetPosition.x - position.x, y: targetPosition.y - position.y }
	const error = angleBetween(unit, targetLocal)
	return kp * error + kv * angularVelocity
}


let target
export default function run({ state, allies, enemies }) {
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