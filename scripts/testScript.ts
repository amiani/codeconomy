export default `export default function(observation) {
  const { self, allies, enemies } = observation
  return {
    throttle: 50,
    yaw: 0,
    fire: false
  }
}`