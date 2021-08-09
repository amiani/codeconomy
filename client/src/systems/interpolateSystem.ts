import { component, ComponentOf, createQuery, useMonitor, World } from "@javelin/ecs"
import { Interpolate, Transform } from "../../../server/components"
import { createStackPool } from "../pool"
import { useNet } from "./clientSystem"

const transforms = createQuery(Transform)
const interpolates = createQuery(Transform, Interpolate)

const interpBufferPool = createStackPool<number[]>(
	() => [],
	i => {
	  i.length = 0
	  return i
	},
	10000,
)
  
const interpBufferInsert = (
	x: number,
	y: number,
	rotation: number,
	ip: ComponentOf<typeof Interpolate>,
) => {
	const item = interpBufferPool.retain()
	item[0] = performance.now()
	item[1] = x
	item[2] = y
	item[3] = rotation
	ip.buffer.push(item)
	return item
}

export default function interpolateSystem(world: World) {
  const { updated } = useNet()
  const now = performance.now()
  const bufferTime = now - 1000

  useMonitor(transforms, (e, [{ x, y, rotation }]) =>
    world.attach(e, component(Interpolate, { x, y, rotation })),
  )

  interpolates((e, [transform, interpolate]) => {
    const { buffer } = interpolate

    if (updated.has(e)) {
      interpBufferInsert(
		  transform.x,
		  transform.y,
		  transform.rotation,
		  interpolate
		)
      interpolate.adaptiveSendRate = (now - bufferTime) / 1000
    }
    const renderTime = bufferTime / interpolate.adaptiveSendRate

    while (buffer.length >= 2 && buffer[1][0] <= renderTime) {
      const item = buffer.shift()
      if (item) {
        interpBufferPool.release(item)
      }
    }

    if (
      buffer.length >= 2 &&
      buffer[0][0] <= renderTime &&
      renderTime <= buffer[1][0]
    ) {
      const [[t0, x0, y0, r0], [t1, x1, y1, r1]] = buffer
      interpolate.x = x0 + ((x1 - x0) * (renderTime - t0)) / (t1 - t0)
      interpolate.y = y0 + ((y1 - y0) * (renderTime - t0)) / (t1 - t0)
	  interpolate.rotation = r0 + ((r1 - r0) * (renderTime - t0)) / (t1 - t0)
    }
  })
}