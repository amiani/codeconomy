import { World } from '@javelin/ecs';
//@ts-ignore
import * as Pizzicato from 'pizzicato'
import laserTopic from '../laserTopic';
import highZap from '../../../assets/sounds/highzap.wav'

const laserZap = new Pizzicato.Sound({
	source: 'file',
	options: {
		path: highZap,
		volume: .1,
		release: 0.1
	}
})

export default function soundSystem(world: World) {
	for (const event of laserTopic) {
		laserZap.play()
	}
}