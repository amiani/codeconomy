const {
	createVec,
	getTargetAngle,
	angleBetween,
	turnTo
} = require('../../scripts/huntClosest')

test('angle between right angles is pi/2', () => {
	const shipPos = { x: 1, y: 0 }
	const targetPos = { x: 1, y: -1 }
	expect(getTargetAngle(shipPos, targetPos)).toBe(-Math.PI / 2)
})

test('angle between dependant vectors is 0', () => {
	const shipPos = { x: 1, y: 0 }
	const targetPos = { x: 2, y: 0 }
	expect(getTargetAngle(shipPos, targetPos)).toBeCloseTo(0, 1)
})

test('angle between (15,5) and (18,-4) is ~1.249', () => {
	const shipPos = { x: 15, y: 5 }
	const targetPos = { x: 18, y: -4 }
	expect(getTargetAngle(shipPos, targetPos)).toBeCloseTo(-Math.atan(3), 3)
})

test('angle to (-sqrt(2)/2,sqrt(2)/2) is 3pi/4', () => {
	const shipPos = { x: 0, y: 0 }
	const targetPos = { x: -Math.sqrt(2) / 2, y: Math.sqrt(2) / 2 }
	expect(getTargetAngle(shipPos, targetPos)).toBeCloseTo(Math.PI * 3/4, 3)
})

//angleBetween

test('angle between (0, 1) and (-sqrt(2)/2, -sqrt(2)/2) is -3pi/4', () => {
	const a = createVec(0, 1)
	const b = createVec(-Math.sqrt(2) / 2, -Math.sqrt(2) / 2)
	expect(angleBetween(a, b)).toBe(Math.PI*3/4)
})

test('angle between (0, 1) and (sqrt(2)/2, -sqrt(2)/2) is 3pi/4', () => {
	const a = createVec(0, 1)
	const b = createVec(Math.sqrt(2) / 2, -Math.sqrt(2) / 2)
	expect(angleBetween(a, b)).toBe(-Math.PI*3/4)
})

//turnTo

test('turn from (1.842,-81.790) -1.830 to (1,1) is ~-2.872', () => {
	const shipPos = { x: 1.842, y: -81.790 }
	const rotation = -1.830
	const targetPos = { x: 1, y: 1 }
	expect(turnTo(shipPos, rotation, targetPos)).toBeCloseTo(-2.872219, 3)
})