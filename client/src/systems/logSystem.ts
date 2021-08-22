import { createQuery, World } from "@javelin/ecs";
import { Log } from "../../../server/components";
import { useNet } from "../effects";

const logs = createQuery(Log)

export default function logSystem(world: World) {
	const net = useNet()

	logs((e, [log]) => {
		if (net.updated.has(e) && log.logs.length) {
			console.log(log.logs)
		}
	})
}
