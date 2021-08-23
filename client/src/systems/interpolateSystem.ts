import { component, ComponentOf, createQuery, useMonitor, World } from "@javelin/ecs"
import { Interpolate, Transform } from "../../../server/components"
import { laserTopic } from "../topics"
import { useNet } from "../effects"

const transforms = createQuery(Transform)
const interpolatesQuery = createQuery(Transform, Interpolate)

export default function interpolateSystem(world: World) {
  const { updated } = useNet()

  useMonitor(transforms, (e, [{ x, y, rotation }]) => {
    world.attach(e, component(Interpolate, {
      start: { x, y, rotation, time: performance.now() },
      end: { x, y, rotation, time: performance.now() },
    }))
    laserTopic.push({ position: { x, y } })
  })

  for (const [entities, [transforms, interpolates]] of interpolatesQuery) {
    for (let i = 0, n = entities.length; i < n; ++i) {
      if (updated.has(entities[i])) {
        interpolates[i].start = interpolates[i].end
        interpolates[i].end = { ...transforms[i], time: performance.now() }
      }
    }
  }
}