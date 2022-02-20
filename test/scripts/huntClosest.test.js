// @ts-nocheck
const {
	createVec,
	angleBetween,
	turnTo
} = require('../../scripts/huntClosest')

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