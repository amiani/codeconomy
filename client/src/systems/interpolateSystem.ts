import { component, ComponentOf, createQuery, useMonitor, World } from "@javelin/ecs"
import { Interpolate, Transform } from "../../../server/components"
import laserTopic from "../laserTopic"
import { useNet } from "./clientSystem"

const transforms = createQuery(Transform)
const interpolates = createQuery(Transform, Interpolate)

export default function interpolateSystem(world: World) {
  const { updated } = useNet()

  useMonitor(transforms, (e, [{ x, y, rotation }]) => {
    world.attach(e, component(Interpolate, {
      start: { x, y, rotation, time: performance.now() },
      end: { x, y, rotation, time: performance.now() },
    }))
    laserTopic.push({ position: { x, y } })
  })

  interpolates((e, [transform, interpolate]) => {
    if (updated.has(e)) {
      interpolate.start = interpolate.end
      interpolate.end = { ...transform, time: performance.now() }
    }
  })
}