import { World } from '@javelin/ecs';
//@ts-ignore
import * as Pizzicato from 'pizzicato'
import { laserTopic } from '../topics'
import highZap from '../../../assets/sounds/highzap.wav'
import { useViewport } from '../effects'

const laserZap = new Pizzicato.Sound({
	source: 'file',
	options: {
		path: highZap,
		volume: .1,
		release: 0.1
	}
})

export default function soundSystem(world: World) {
	const viewport = useViewport()
	const visibleBounds = viewport.getVisibleBounds()
	for (const event of laserTopic) {
		if (visibleBounds.contains(event.position.x, -event.position.y)) {
			laserZap.play()
		}
	}
}